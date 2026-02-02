"""
Router SFP Monitoring with PostgreSQL Integration
Fetches router details from database and monitors SFP power levels
"""

import paramiko
import time
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'cntx_portal',
    'user': 'postgres',
    'password': 'your_password'
}

class DatabaseManager:
    """Manage database connections and queries"""
    
    def __init__(self, config):
        self.config = config
        self.conn = None
    
    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.conn = psycopg2.connect(**self.config)
            logger.info("✅ Database connected successfully")
            return self.conn
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def get_routers(self):
        """Fetch all active routers from database"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    id,
                    hostname,
                    ip_address as host,
                    ssh_port as port,
                    username,
                    password,
                    device_type,
                    is_active
                FROM routers
                WHERE is_active = true
                ORDER BY hostname
            """
            
            cursor.execute(query)
            routers = cursor.fetchall()
            cursor.close()
            
            logger.info(f"📊 Fetched {len(routers)} active routers from database")
            return routers
        
        except Exception as e:
            logger.error(f"❌ Error fetching routers: {e}")
            return []
    
    def get_router_interfaces(self, router_id):
        """Fetch interfaces for a specific router"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    id,
                    interface_name,
                    interface_label,
                    sfp_command,
                    is_monitored
                FROM router_interfaces
                WHERE router_id = %s AND is_monitored = true
                ORDER BY interface_name
            """
            
            cursor.execute(query, (router_id,))
            interfaces = cursor.fetchall()
            cursor.close()
            
            logger.info(f"📊 Fetched {len(interfaces)} interfaces for router {router_id}")
            return interfaces
        
        except Exception as e:
            logger.error(f"❌ Error fetching interfaces: {e}")
            return []
    
    def save_sfp_reading(self, router_id, interface_id, rx_power, tx_power, laser_type):
        """Save SFP reading to database"""
        try:
            cursor = self.conn.cursor()
            
            query = """
                INSERT INTO sfp_readings 
                (router_id, interface_id, rx_power, tx_power, laser_type, reading_time)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(query, (
                router_id,
                interface_id,
                rx_power,
                tx_power,
                laser_type,
                datetime.now()
            ))
            
            self.conn.commit()
            cursor.close()
            
        except Exception as e:
            logger.error(f"❌ Error saving SFP reading: {e}")
            self.conn.rollback()

class RouterSFPMonitor:
    """Monitor SFP power levels on routers"""
    
    @staticmethod
    def extract_fields(output):
        """Extract RxPower, TxPower, and LaserType from command output"""
        rx_match = re.search(r'RxPower\s*:\s*([-\d.]+)', output)
        tx_match = re.search(r'TxPower\s*:\s*([-\d.]+)', output)
        laser_type_match = re.search(r'Laser Type\s*:\s*([^\n\r]+)', output)
        
        rx = rx_match.group(1) if rx_match else "N/A"
        tx = tx_match.group(1) if tx_match else "N/A"
        laser_type = laser_type_match.group(1).strip() if laser_type_match else "N/A"
        
        return rx, tx, laser_type
    
    @staticmethod
    def connect_and_monitor(router, interfaces, db_manager):
        """Connect to router and monitor SFP interfaces"""
        host = router['host']
        hostname = router['hostname']
        port = router['port']
        username = router['username']
        password = router['password']
        router_id = router['id']
        
        router_interface_outputs = {}
        
        try:
            logger.info(f"🔄 Connecting to {hostname} ({host})...")
            
            # SSH connection
            ssh = paramiko.SSHClient()
            ssh.load_system_host_keys()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                host, 
                port, 
                username, 
                password, 
                look_for_keys=False, 
                allow_agent=False,
                timeout=10
            )
            
            # Invoke shell
            chan = ssh.invoke_shell()
            
            # Disable pagination
            chan.send('conf t\n')
            time.sleep(1)
            chan.send('set cli pagination off\n')
            time.sleep(1)
            chan.send('end\n')
            time.sleep(1)
            
            # Monitor each interface
            for interface in interfaces:
                interface_name = interface['interface_name']
                interface_label = interface['interface_label']
                sfp_command = interface['sfp_command'] or 'show sfp 100g'
                interface_id = interface['id']
                
                logger.info(f"  📡 Checking {interface_label} ({interface_name})...")
                
                # Execute command
                chan.send(f"{sfp_command} {interface_name}\n")
                time.sleep(2)
                
                # Read response
                resp = b""
                while chan.recv_ready():
                    resp += chan.recv(9999)
                
                output = resp.decode('ascii', errors='ignore')
                
                # Extract fields
                rx_power, tx_power, laser_type = RouterSFPMonitor.extract_fields(output)
                
                # Store results
                router_interface_outputs[interface_name] = {
                    'label': interface_label,
                    'RxPower': rx_power,
                    'TxPower': tx_power,
                    'LaserType': laser_type
                }
                
                # Save to database
                db_manager.save_sfp_reading(
                    router_id,
                    interface_id,
                    rx_power,
                    tx_power,
                    laser_type
                )
                
                time.sleep(2)
            
            ssh.close()
            logger.info(f"✅ Completed monitoring {hostname}")
            
        except Exception as e:
            logger.error(f"❌ Error connecting to {hostname} ({host}): {e}")
        
        router_label = f"{host}:{hostname}"
        return (router_label, router_interface_outputs)
    
    @staticmethod
    def monitor_all_routers(db_manager):
        """Monitor all routers in parallel"""
        # Get routers from database
        routers = db_manager.get_routers()
        
        if not routers:
            logger.warning("⚠️  No active routers found in database")
            return {}
        
        # Prepare router data with interfaces
        router_data = []
        for router in routers:
            interfaces = db_manager.get_router_interfaces(router['id'])
            if interfaces:
                router_data.append((router, interfaces))
        
        # Monitor routers in parallel
        router_outputs = {}
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(
                    RouterSFPMonitor.connect_and_monitor,
                    router,
                    interfaces,
                    db_manager
                )
                for router, interfaces in router_data
            ]
            
            for future in futures:
                try:
                    router_label, router_interface_outputs = future.result()
                    router_outputs[router_label] = router_interface_outputs
                except Exception as e:
                    logger.error(f"❌ Error in parallel execution: {e}")
        
        return router_outputs

def display_results(router_outputs):
    """Display monitoring results"""
    print("\n" + "="*80)
    print("📊 SFP MONITORING RESULTS")
    print("="*80 + "\n")
    
    for router_label, interfaces in router_outputs.items():
        print(f"\n🌐 Router: {router_label}")
        print("-" * 80)
        
        for interface, fields in interfaces.items():
            label = fields['label']
            rx = fields['RxPower']
            tx = fields['TxPower']
            laser = fields['LaserType']
            
            print(f"  📡 {label} ({interface}):")
            print(f"      RxPower: {rx} dBm")
            print(f"      TxPower: {tx} dBm")
            print(f"      LaserType: {laser}")
            print()
    
    print("="*80)

def main():
    """Main execution function"""
    logger.info("🚀 Starting SFP Monitoring System")
    
    # Initialize database manager
    db_manager = DatabaseManager(DB_CONFIG)
    
    try:
        # Connect to database
        db_manager.connect()
        
        # Monitor all routers
        router_outputs = RouterSFPMonitor.monitor_all_routers(db_manager)
        
        # Display results
        display_results(router_outputs)
        
        logger.info("✅ Monitoring completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Error in main execution: {e}")
    
    finally:
        # Close database connection
        db_manager.close()
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
