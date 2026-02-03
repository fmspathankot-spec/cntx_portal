"""
Tejas Router Monitoring Script v2 - FIXED
With Centralized Credentials Support
"""

import paramiko
import time
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import logging
import json
import os

# Create logs directory if not exists
if not os.path.exists('logs'):
    os.makedirs('logs')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'logs/tejas_monitor_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'cntx_portal',
    'user': 'postgres',
    'password': 'your_password'  # <-- CHANGE THIS
}

class TejasCommandParser:
    """Parse Tejas router command outputs"""
    
    @staticmethod
    def parse_ospf_neighbors(output):
        """Parse OSPF neighbor output"""
        neighbors = []
        lines = output.split('\n')
        in_table = False
        
        for line in lines:
            if '---' in line and 'Neighbor-ID' in output[:output.index(line)] if line in output else False:
                in_table = True
                continue
            
            if in_table and line.strip():
                parts = line.split()
                if len(parts) >= 11 and re.match(r'^\d+\.\d+\.\d+\.\d+$', parts[0]):
                    neighbor = {
                        'neighbor_id': parts[0],
                        'priority': parts[1],
                        'state': parts[2],
                        'dead_time': parts[3],
                        'neighbor_address': parts[4],
                        'interface': parts[5],
                        'helper_status': parts[6],
                        'helper_age': parts[7],
                        'helper_er': parts[8],
                        'bfd_status': parts[9],
                        'area_id': parts[10]
                    }
                    neighbors.append(neighbor)
        
        return {
            'neighbor_count': len(neighbors),
            'neighbors': neighbors
        }
    
    @staticmethod
    def parse_bgp_summary(output):
        """Parse BGP summary output"""
        result = {}
        
        router_id_match = re.search(r'BGP router identifier is ([\d.]+)', output)
        if router_id_match:
            result['router_id'] = router_id_match.group(1)
        
        local_as_match = re.search(r'Local AS number (\d+)', output)
        if local_as_match:
            result['local_as'] = local_as_match.group(1)
        
        established_match = re.search(r'Established Count\s*:\s*(\d+)', output)
        if established_match:
            result['established_count'] = established_match.group(1)
        
        configured_match = re.search(r'Configured count\s*:\s*(\d+)', output)
        if configured_match:
            result['configured_count'] = configured_match.group(1)
        
        forwarding_match = re.search(r'Forwarding State is (\w+)', output)
        if forwarding_match:
            result['forwarding_state'] = forwarding_match.group(1)
        
        return result
    
    @staticmethod
    def parse_sfp_100g_info(output):
        """Parse SFP 100G info output"""
        result = {}
        
        fields = {
            'laser_status': r'MSA Laser Status\s*:\s*(\w+)',
            'operational_status': r'Operational Status\s*:\s*(\w+)',
            'laser_type': r'Laser Type\s*:\s*(.+)',
            'rx_power': r'RxPower\s*:\s*([-\d.]+)',
            'tx_power': r'TxPower\s*:\s*([-\d.]+)',
            'module_temperature': r'Module Temperature.*?:\s*([-\d.]+)',
            'module_voltage': r'Module Voltage.*?:\s*([-\d.]+)',
            'serial_number': r'Serial Number\s*:\s*(.+)',
            'vendor_name': r'Vendor Name\s*:\s*(.+)'
        }
        
        for field, pattern in fields.items():
            match = re.search(pattern, output)
            if match:
                result[field] = match.group(1).strip()
            else:
                result[field] = 'N/A'
        
        return result
    
    @staticmethod
    def parse_sfp_100g_stats(output):
        """Parse SFP 100G stats output"""
        result = {}
        
        rx_power_match = re.search(r'Received Power.*?0=([-\d.]+);1=([-\d.]+);2=([-\d.]+);3=([-\d.]+)', output)
        if rx_power_match:
            result['rx_power_lane0'] = rx_power_match.group(1)
            result['rx_power_lane1'] = rx_power_match.group(2)
            result['rx_power_lane2'] = rx_power_match.group(3)
            result['rx_power_lane3'] = rx_power_match.group(4)
            
            rx_powers = [float(rx_power_match.group(i)) for i in range(1, 5)]
            result['rx_power_avg'] = str(round(sum(rx_powers) / len(rx_powers), 4))
        
        tx_power_match = re.search(r'Transmit Power.*?0=([-\d.]+);1=([-\d.]+);2=([-\d.]+);3=([-\d.]+)', output)
        if tx_power_match:
            result['tx_power_lane0'] = tx_power_match.group(1)
            result['tx_power_lane1'] = tx_power_match.group(2)
            result['tx_power_lane2'] = tx_power_match.group(3)
            result['tx_power_lane3'] = tx_power_match.group(4)
            
            tx_powers = [float(tx_power_match.group(i)) for i in range(1, 5)]
            result['tx_power_avg'] = str(round(sum(tx_powers) / len(tx_powers), 4))
        
        return result

class DatabaseManager:
    """Database operations"""
    
    def __init__(self, config):
        self.config = config
        self.conn = None
    
    def connect(self):
        try:
            self.conn = psycopg2.connect(**self.config)
            logger.info("✅ Database connected")
            return self.conn
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    def close(self):
        if self.conn:
            self.conn.close()
    
    def get_tejas_routers(self):
        """Get all Tejas routers"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT * FROM v_routers_with_credentials
                WHERE device_type = 'tejas' AND is_active = true
                ORDER BY hostname
            """
            
            cursor.execute(query)
            routers = cursor.fetchall()
            cursor.close()
            
            logger.info(f"📊 Found {len(routers)} Tejas routers")
            return routers
        
        except Exception as e:
            logger.error(f"❌ Error fetching routers: {e}")
            return []
    
    def get_router_interfaces(self, router_id):
        """Get interfaces for router"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT id, interface_name, interface_label, interface_type
                FROM router_interfaces
                WHERE router_id = %s AND is_monitored = true
                ORDER BY interface_name
            """
            
            cursor.execute(query, (router_id,))
            interfaces = cursor.fetchall()
            cursor.close()
            
            return interfaces
        
        except Exception as e:
            logger.error(f"❌ Error fetching interfaces: {e}")
            return []
    
    def save_reading(self, router_id, interface_id, parameter_name, reading_data, raw_output):
        """Save parameter reading"""
        try:
            cursor = self.conn.cursor()
            
            cursor.execute(
                "SELECT id FROM monitoring_parameters WHERE parameter_name = %s",
                (parameter_name,)
            )
            result = cursor.fetchone()
            
            if not result:
                logger.warning(f"⚠️  Parameter {parameter_name} not found")
                return
            
            parameter_id = result[0]
            
            query = """
                INSERT INTO parameter_readings 
                (router_id, interface_id, parameter_id, reading_data, raw_output, reading_time)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            cursor.execute(query, (
                router_id,
                interface_id,
                parameter_id,
                json.dumps(reading_data),
                raw_output,
                datetime.now()
            ))
            
            self.conn.commit()
            cursor.close()
            
        except Exception as e:
            logger.error(f"❌ Error saving reading: {e}")
            self.conn.rollback()

class TejasRouterMonitor:
    """Monitor Tejas routers"""
    
    @staticmethod
    def execute_command(chan, command, wait_time=2):
        """Execute command and return output"""
        chan.send(f"{command}\n")
        time.sleep(wait_time)
        
        resp = b""
        while chan.recv_ready():
            resp += chan.recv(9999)
        
        return resp.decode('ascii', errors='ignore')
    
    @staticmethod
    def monitor_router(router, interfaces, db_manager):
        """Monitor single router"""
        host = router['ip_address']
        hostname = router['hostname']
        port = router['ssh_port']
        username = router['username']
        password = router['password']
        router_id = router['id']
        
        logger.info(f"🔐 Using credentials: {username} (from {router.get('credential_name', 'direct')})")
        
        results = {
            'router': hostname,
            'ospf': None,
            'bgp': None,
            'interfaces': {}
        }
        
        try:
            logger.info(f"🔄 Connecting to {hostname} ({host})...")
            
            ssh = paramiko.SSHClient()
            ssh.load_system_host_keys()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(host, port, username, password, 
                       look_for_keys=False, allow_agent=False, timeout=10)
            
            chan = ssh.invoke_shell()
            time.sleep(1)
            
            # Clear initial output
            if chan.recv_ready():
                chan.recv(9999)
            
            # Disable pagination
            chan.send('conf t\n')
            time.sleep(1)
            chan.send('set cli pagination off\n')
            time.sleep(1)
            chan.send('end\n')
            time.sleep(1)
            
            # Monitor OSPF
            logger.info(f"  🔍 Checking OSPF neighbors...")
            ospf_output = TejasRouterMonitor.execute_command(chan, 'sh ip ospf ne')
            ospf_data = TejasCommandParser.parse_ospf_neighbors(ospf_output)
            results['ospf'] = ospf_data
            db_manager.save_reading(router_id, None, 'TEJAS_OSPF_NEIGHBORS', 
                                   ospf_data, ospf_output)
            
            # Monitor BGP
            logger.info(f"  🔍 Checking BGP summary...")
            bgp_output = TejasRouterMonitor.execute_command(chan, 'sh ip bgp summary sorted', 3)
            bgp_data = TejasCommandParser.parse_bgp_summary(bgp_output)
            results['bgp'] = bgp_data
            db_manager.save_reading(router_id, None, 'TEJAS_BGP_SUMMARY', 
                                   bgp_data, bgp_output)
            
            # Monitor SFP
            for interface in interfaces:
                interface_name = interface['interface_name']
                interface_label = interface['interface_label']
                interface_id = interface['id']
                
                logger.info(f"  📡 Monitoring {interface_label} ({interface_name})...")
                
                results['interfaces'][interface_name] = {
                    'label': interface_label,
                    'sfp_info': None,
                    'sfp_stats': None
                }
                
                # SFP Info
                sfp_info_output = TejasRouterMonitor.execute_command(
                    chan, f'sh sfp 100g {interface_name}', 2
                )
                sfp_info_data = TejasCommandParser.parse_sfp_100g_info(sfp_info_output)
                results['interfaces'][interface_name]['sfp_info'] = sfp_info_data
                db_manager.save_reading(router_id, interface_id, 'TEJAS_SFP_100G_INFO',
                                       sfp_info_data, sfp_info_output)
                
                # SFP Stats
                sfp_stats_output = TejasRouterMonitor.execute_command(
                    chan, f'sh sfp stats 100g {interface_name}', 2
                )
                sfp_stats_data = TejasCommandParser.parse_sfp_100g_stats(sfp_stats_output)
                results['interfaces'][interface_name]['sfp_stats'] = sfp_stats_data
                db_manager.save_reading(router_id, interface_id, 'TEJAS_SFP_100G_STATS',
                                       sfp_stats_data, sfp_stats_output)
            
            ssh.close()
            logger.info(f"✅ Completed monitoring {hostname}")
            
        except Exception as e:
            logger.error(f"❌ Error monitoring {hostname}: {e}")
        
        return results  # <-- FIXED: Correct indentation
    
    @staticmethod
    def monitor_all_routers(db_manager):
        """Monitor all Tejas routers"""
        routers = db_manager.get_tejas_routers()
        
        if not routers:
            logger.warning("⚠️  No Tejas routers found")
            return {}
        
        all_results = {}
        
        for router in routers:
            interfaces = db_manager.get_router_interfaces(router['id'])
            result = TejasRouterMonitor.monitor_router(router, interfaces, db_manager)
            all_results[result['router']] = result
        
        return all_results

def display_results(all_results):
    """Display monitoring results"""
    print("\n" + "="*100)
    print("📊 TEJAS ROUTER MONITORING RESULTS")
    print("="*100 + "\n")
    
    for router_name, results in all_results.items():
        print(f"\n🌐 Router: {router_name}")
        print("-" * 100)
        
        if results['ospf']:
            print(f"\n  🔄 OSPF Neighbors: {results['ospf']['neighbor_count']}")
            for neighbor in results['ospf'].get('neighbors', []):
                print(f"    - {neighbor['neighbor_id']} ({neighbor['state']}) via {neighbor['interface']}")
        
        if results['bgp']:
            print(f"\n  🔄 BGP Summary:")
            print(f"    Router ID: {results['bgp'].get('router_id', 'N/A')}")
            print(f"    Local AS: {results['bgp'].get('local_as', 'N/A')}")
            print(f"    Established: {results['bgp'].get('established_count', 'N/A')}/{results['bgp'].get('configured_count', 'N/A')}")
        
        if results['interfaces']:
            print(f"\n  📡 Interface SFP Monitoring:")
            for interface_name, interface_data in results['interfaces'].items():
                label = interface_data['label']
                print(f"\n    🔌 {label} ({interface_name}):")
                
                if interface_data['sfp_info']:
                    info = interface_data['sfp_info']
                    print(f"      RxPower: {info.get('rx_power', 'N/A')} dBm")
                    print(f"      TxPower: {info.get('tx_power', 'N/A')} dBm")
        
        print()
    
    print("="*100)

def main():
    """Main execution"""
    logger.info("🚀 Starting Tejas Router Monitoring v2")
    
    db_manager = DatabaseManager(DB_CONFIG)
    
    try:
        db_manager.connect()
        
        all_results = TejasRouterMonitor.monitor_all_routers(db_manager)
        
        display_results(all_results)
        
        logger.info("✅ Monitoring completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Error in main execution: {e}")
    
    finally:
        db_manager.close()
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
