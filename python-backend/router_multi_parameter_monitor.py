"""
Multi-Parameter Router Monitoring System
Monitors ANY router parameters - SFP, CPU, Memory, Temperature, Alarms, etc.
Fully configurable via database
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
        """Fetch all active routers"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    id, hostname, ip_address as host, ssh_port as port,
                    username, password, device_type, is_active
                FROM routers
                WHERE is_active = true
                ORDER BY hostname
            """
            
            cursor.execute(query)
            routers = cursor.fetchall()
            cursor.close()
            
            logger.info(f"📊 Fetched {len(routers)} active routers")
            return routers
        
        except Exception as e:
            logger.error(f"❌ Error fetching routers: {e}")
            return []
    
    def get_router_interfaces(self, router_id):
        """Fetch interfaces for a router"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT id, interface_name, interface_label, interface_type, is_monitored
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
    
    def get_monitoring_parameters(self, applies_to=None):
        """Fetch monitoring parameters"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            if applies_to:
                query = """
                    SELECT id, parameter_name, parameter_category, command_template, applies_to
                    FROM monitoring_parameters
                    WHERE is_active = true AND (applies_to = %s OR applies_to = 'BOTH')
                    ORDER BY parameter_category, parameter_name
                """
                cursor.execute(query, (applies_to,))
            else:
                query = """
                    SELECT id, parameter_name, parameter_category, command_template, applies_to
                    FROM monitoring_parameters
                    WHERE is_active = true
                    ORDER BY parameter_category, parameter_name
                """
                cursor.execute(query)
            
            parameters = cursor.fetchall()
            cursor.close()
            
            return parameters
        
        except Exception as e:
            logger.error(f"❌ Error fetching parameters: {e}")
            return []
    
    def get_parameter_parsers(self, parameter_id):
        """Fetch regex parsers for a parameter"""
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT field_name, regex_pattern, data_type, unit
                FROM parameter_parsers
                WHERE parameter_id = %s
                ORDER BY display_order
            """
            
            cursor.execute(query, (parameter_id,))
            parsers = cursor.fetchall()
            cursor.close()
            
            return parsers
        
        except Exception as e:
            logger.error(f"❌ Error fetching parsers: {e}")
            return []
    
    def save_parameter_reading(self, router_id, interface_id, parameter_id, reading_data, raw_output):
        """Save parameter reading to database"""
        try:
            cursor = self.conn.cursor()
            
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

class ParameterParser:
    """Parse command output using regex patterns"""
    
    @staticmethod
    def parse_output(output, parsers):
        """Parse output using provided regex patterns"""
        result = {}
        
        for parser in parsers:
            field_name = parser['field_name']
            regex_pattern = parser['regex_pattern']
            data_type = parser['data_type']
            
            try:
                match = re.search(regex_pattern, output, re.IGNORECASE)
                
                if match:
                    value = match.group(1).strip()
                    
                    # Convert data type
                    if data_type == 'number':
                        try:
                            value = float(value.replace(',', ''))
                        except:
                            pass
                    elif data_type == 'boolean':
                        value = value.lower() in ['true', 'yes', 'up', 'active', 'enabled']
                    
                    result[field_name] = value
                else:
                    result[field_name] = "N/A"
            
            except Exception as e:
                logger.error(f"❌ Error parsing {field_name}: {e}")
                result[field_name] = "N/A"
        
        return result

class RouterMonitor:
    """Monitor router parameters"""
    
    @staticmethod
    def connect_and_monitor(router, interfaces, parameters, db_manager):
        """Connect to router and monitor all parameters"""
        host = router['host']
        hostname = router['hostname']
        port = router['port']
        username = router['username']
        password = router['password']
        router_id = router['id']
        
        results = {
            'router': hostname,
            'interface_readings': {},
            'router_readings': {}
        }
        
        try:
            logger.info(f"🔄 Connecting to {hostname} ({host})...")
            
            # SSH connection
            ssh = paramiko.SSHClient()
            ssh.load_system_host_keys()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                host, port, username, password,
                look_for_keys=False, allow_agent=False, timeout=10
            )
            
            chan = ssh.invoke_shell()
            
            # Disable pagination
            chan.send('conf t\n')
            time.sleep(1)
            chan.send('set cli pagination off\n')
            time.sleep(1)
            chan.send('end\n')
            time.sleep(1)
            
            # Monitor INTERFACE-level parameters
            interface_params = [p for p in parameters if p['applies_to'] in ['INTERFACE', 'BOTH']]
            
            for interface in interfaces:
                interface_name = interface['interface_name']
                interface_label = interface['interface_label']
                interface_id = interface['id']
                
                logger.info(f"  📡 Monitoring {interface_label} ({interface_name})...")
                
                results['interface_readings'][interface_name] = {
                    'label': interface_label,
                    'parameters': {}
                }
                
                for param in interface_params:
                    param_name = param['parameter_name']
                    param_id = param['id']
                    command_template = param['command_template']
                    
                    # Replace {interface} placeholder
                    command = command_template.replace('{interface}', interface_name)
                    
                    logger.info(f"    🔍 Checking {param_name}...")
                    
                    # Execute command
                    chan.send(f"{command}\n")
                    time.sleep(2)
                    
                    # Read response
                    resp = b""
                    while chan.recv_ready():
                        resp += chan.recv(9999)
                    
                    output = resp.decode('ascii', errors='ignore')
                    
                    # Get parsers for this parameter
                    parsers = db_manager.get_parameter_parsers(param_id)
                    
                    # Parse output
                    parsed_data = ParameterParser.parse_output(output, parsers)
                    
                    # Store results
                    results['interface_readings'][interface_name]['parameters'][param_name] = parsed_data
                    
                    # Save to database
                    db_manager.save_parameter_reading(
                        router_id, interface_id, param_id, parsed_data, output
                    )
                    
                    time.sleep(1)
            
            # Monitor ROUTER-level parameters
            router_params = [p for p in parameters if p['applies_to'] in ['ROUTER', 'BOTH']]
            
            if router_params:
                logger.info(f"  🖥️  Monitoring router-level parameters...")
                
                for param in router_params:
                    param_name = param['parameter_name']
                    param_id = param['id']
                    command = param['command_template']
                    
                    logger.info(f"    🔍 Checking {param_name}...")
                    
                    # Execute command
                    chan.send(f"{command}\n")
                    time.sleep(2)
                    
                    # Read response
                    resp = b""
                    while chan.recv_ready():
                        resp += chan.recv(9999)
                    
                    output = resp.decode('ascii', errors='ignore')
                    
                    # Get parsers
                    parsers = db_manager.get_parameter_parsers(param_id)
                    
                    # Parse output
                    parsed_data = ParameterParser.parse_output(output, parsers)
                    
                    # Store results
                    results['router_readings'][param_name] = parsed_data
                    
                    # Save to database (no interface_id for router-level)
                    db_manager.save_parameter_reading(
                        router_id, None, param_id, parsed_data, output
                    )
                    
                    time.sleep(1)
            
            ssh.close()
            logger.info(f"✅ Completed monitoring {hostname}")
            
        except Exception as e:
            logger.error(f"❌ Error monitoring {hostname}: {e}")
        
        return results
    
    @staticmethod
    def monitor_all_routers(db_manager):
        """Monitor all routers in parallel"""
        # Get routers
        routers = db_manager.get_routers()
        
        if not routers:
            logger.warning("⚠️  No active routers found")
            return {}
        
        # Get monitoring parameters
        parameters = db_manager.get_monitoring_parameters()
        
        if not parameters:
            logger.warning("⚠️  No monitoring parameters configured")
            return {}
        
        logger.info(f"📊 Monitoring {len(parameters)} parameters")
        
        # Prepare router data
        router_data = []
        for router in routers:
            interfaces = db_manager.get_router_interfaces(router['id'])
            router_data.append((router, interfaces, parameters))
        
        # Monitor in parallel
        all_results = {}
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(
                    RouterMonitor.connect_and_monitor,
                    router, interfaces, parameters, db_manager
                )
                for router, interfaces, parameters in router_data
            ]
            
            for future in futures:
                try:
                    result = future.result()
                    all_results[result['router']] = result
                except Exception as e:
                    logger.error(f"❌ Error in parallel execution: {e}")
        
        return all_results

def display_results(all_results):
    """Display monitoring results"""
    print("\n" + "="*100)
    print("📊 MULTI-PARAMETER MONITORING RESULTS")
    print("="*100 + "\n")
    
    for router_name, results in all_results.items():
        print(f"\n🌐 Router: {router_name}")
        print("-" * 100)
        
        # Display router-level parameters
        if results['router_readings']:
            print("\n  🖥️  Router Parameters:")
            for param_name, data in results['router_readings'].items():
                print(f"\n    📌 {param_name}:")
                for field, value in data.items():
                    print(f"       {field}: {value}")
        
        # Display interface-level parameters
        if results['interface_readings']:
            print("\n  📡 Interface Parameters:")
            for interface, interface_data in results['interface_readings'].items():
                label = interface_data['label']
                print(f"\n    🔌 {label} ({interface}):")
                
                for param_name, data in interface_data['parameters'].items():
                    print(f"\n      📌 {param_name}:")
                    for field, value in data.items():
                        print(f"         {field}: {value}")
        
        print()
    
    print("="*100)

def main():
    """Main execution"""
    logger.info("🚀 Starting Multi-Parameter Monitoring System")
    
    db_manager = DatabaseManager(DB_CONFIG)
    
    try:
        # Connect to database
        db_manager.connect()
        
        # Monitor all routers
        all_results = RouterMonitor.monitor_all_routers(db_manager)
        
        # Display results
        display_results(all_results)
        
        logger.info("✅ Monitoring completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Error in main execution: {e}")
    
    finally:
        db_manager.close()
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
