"""
Tejas Router Monitoring Script - DRY RUN MODE
Safe testing WITHOUT connecting to actual routers
Uses sample data to test complete flow
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import logging
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create logs directory
if not os.path.exists('logs'):
    os.makedirs('logs')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'logs/tejas_monitor_dryrun_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'database': os.getenv('DB_NAME', 'cntx_portal'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD')
}

# Validate password
if not DB_CONFIG['password']:
    logger.error("❌ DB_PASSWORD not set in .env file!")
    exit(1)

# ============================================
# SAMPLE DATA (Router se nahi, yahan se aayega)
# ============================================

SAMPLE_OSPF_DATA = {
    'neighbor_count': 2,
    'neighbors': [
        {
            'neighbor_id': '10.125.0.1',
            'priority': '1',
            'state': 'FULL/PTOP',
            'dead_time': '00:00:35',
            'neighbor_address': '10.125.0.1',
            'interface': 'vlan50',
            'helper_status': 'None',
            'helper_age': '00:00:00',
            'helper_er': 'None',
            'bfd_status': 'Enabled',
            'area_id': '0.0.0.0'
        },
        {
            'neighbor_id': '10.125.0.2',
            'priority': '1',
            'state': 'FULL/PTOP',
            'dead_time': '00:00:38',
            'neighbor_address': '10.125.0.2',
            'interface': 'vlan20',
            'helper_status': 'None',
            'helper_age': '00:00:00',
            'helper_er': 'None',
            'bfd_status': 'Enabled',
            'area_id': '0.0.0.0'
        }
    ]
}

SAMPLE_BGP_DATA = {
    'router_id': '10.125.0.1',
    'local_as': '65001',
    'established_count': '2',
    'configured_count': '2',
    'forwarding_state': 'Active'
}

SAMPLE_SFP_INFO = {
    'laser_status': 'ON',
    'operational_status': 'UP',
    'laser_type': 'QSFP28',
    'rx_power': '-5.23',
    'tx_power': '-2.45',
    'module_temperature': '45.5',
    'module_voltage': '3.3',
    'serial_number': 'ABC123456',
    'vendor_name': 'ACME Corp'
}

SAMPLE_SFP_STATS = {
    'rx_power_lane0': '-5.20',
    'rx_power_lane1': '-5.25',
    'rx_power_lane2': '-5.22',
    'rx_power_lane3': '-5.24',
    'rx_power_avg': '-5.2275',
    'tx_power_lane0': '-2.40',
    'tx_power_lane1': '-2.45',
    'tx_power_lane2': '-2.42',
    'tx_power_lane3': '-2.48',
    'tx_power_avg': '-2.4375',
    'module_voltage': '3.30',
    'module_temperature': '45.5'
}

SAMPLE_RAW_OUTPUT = """
[DRY RUN MODE - Sample Output]
This is simulated router output.
No actual router was contacted.
"""

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
            
            logger.info(f"✅ Saved reading: {parameter_name}")
            
        except Exception as e:
            logger.error(f"❌ Error saving reading: {e}")
            self.conn.rollback()

def simulate_router_monitoring(router, interfaces, db_manager):
    """
    DRY RUN: Simulate router monitoring WITHOUT connecting
    Uses sample data instead of real router commands
    """
    hostname = router['hostname']
    router_id = router['id']
    
    logger.info(f"\n{'='*80}")
    logger.info(f"🧪 DRY RUN: Simulating monitoring for {hostname}")
    logger.info(f"{'='*80}")
    
    results = {
        'router': hostname,
        'ospf': None,
        'bgp': None,
        'interfaces': {}
    }
    
    try:
        # Simulate OSPF monitoring
        logger.info(f"  🔍 [SIMULATED] Checking OSPF neighbors...")
        logger.info(f"     ℹ️  Would execute: 'sh ip ospf ne'")
        logger.info(f"     ✅ Using sample OSPF data")
        
        results['ospf'] = SAMPLE_OSPF_DATA
        db_manager.save_reading(
            router_id, None, 'TEJAS_OSPF_NEIGHBORS',
            SAMPLE_OSPF_DATA, SAMPLE_RAW_OUTPUT
        )
        
        # Simulate BGP monitoring
        logger.info(f"  🔍 [SIMULATED] Checking BGP summary...")
        logger.info(f"     ℹ️  Would execute: 'sh ip bgp summary sorted'")
        logger.info(f"     ✅ Using sample BGP data")
        
        results['bgp'] = SAMPLE_BGP_DATA
        db_manager.save_reading(
            router_id, None, 'TEJAS_BGP_SUMMARY',
            SAMPLE_BGP_DATA, SAMPLE_RAW_OUTPUT
        )
        
        # Simulate SFP monitoring
        for interface in interfaces:
            interface_name = interface['interface_name']
            interface_label = interface['interface_label']
            interface_id = interface['id']
            
            logger.info(f"  📡 [SIMULATED] Monitoring {interface_label} ({interface_name})...")
            logger.info(f"     ℹ️  Would execute: 'sh sfp 100g {interface_name}'")
            logger.info(f"     ✅ Using sample SFP data")
            
            results['interfaces'][interface_name] = {
                'label': interface_label,
                'sfp_info': SAMPLE_SFP_INFO,
                'sfp_stats': SAMPLE_SFP_STATS
            }
            
            # Save SFP info
            db_manager.save_reading(
                router_id, interface_id, 'TEJAS_SFP_100G_INFO',
                SAMPLE_SFP_INFO, SAMPLE_RAW_OUTPUT
            )
            
            # Save SFP stats
            db_manager.save_reading(
                router_id, interface_id, 'TEJAS_SFP_100G_STATS',
                SAMPLE_SFP_STATS, SAMPLE_RAW_OUTPUT
            )
        
        logger.info(f"\n✅ [DRY RUN] Completed simulation for {hostname}")
        logger.info(f"   ⚠️  NO ACTUAL ROUTER WAS CONTACTED")
        
    except Exception as e:
        logger.error(f"❌ Error in simulation: {e}")
    
    return results

def display_results(all_results):
    """Display monitoring results"""
    print("\n" + "="*100)
    print("🧪 DRY RUN MODE - SIMULATED RESULTS (NO ROUTERS CONTACTED)")
    print("="*100 + "\n")
    
    for router_name, results in all_results.items():
        print(f"\n🌐 Router: {router_name} [SIMULATED]")
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
                    print(f"      Temperature: {info.get('module_temperature', 'N/A')} C")
        
        print()
    
    print("="*100)
    print("⚠️  REMINDER: This was a DRY RUN - No actual routers were contacted")
    print("="*100)

def main():
    """Main execution - DRY RUN MODE"""
    print("\n" + "🧪"*50)
    print("DRY RUN MODE - SAFE TESTING")
    print("No actual routers will be contacted")
    print("Sample data will be used to test the complete flow")
    print("🧪"*50 + "\n")
    
    logger.info("🚀 Starting Tejas Router Monitoring - DRY RUN MODE")
    logger.info(f"📊 Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}")
    
    db_manager = DatabaseManager(DB_CONFIG)
    
    try:
        db_manager.connect()
        
        routers = db_manager.get_tejas_routers()
        
        if not routers:
            logger.warning("⚠️  No Tejas routers found in database")
            logger.info("💡 Add a test router first:")
            logger.info("   psql -U postgres -d cntx_portal")
            logger.info("   SELECT add_router_with_credential('TEST-ROUTER', '10.1.1.1', 'test_admin', 'tejas', 'Test');")
            return
        
        all_results = {}
        
        for router in routers:
            interfaces = db_manager.get_router_interfaces(router['id'])
            result = simulate_router_monitoring(router, interfaces, db_manager)
            all_results[result['router']] = result
        
        display_results(all_results)
        
        logger.info("\n✅ DRY RUN completed successfully")
        logger.info("⚠️  Remember: No actual routers were contacted")
        logger.info("💡 Check database to verify data was saved:")
        logger.info("   psql -U postgres -d cntx_portal")
        logger.info("   SELECT * FROM parameter_readings ORDER BY reading_time DESC LIMIT 5;")
        
    except Exception as e:
        logger.error(f"❌ Error in dry run: {e}")
    
    finally:
        db_manager.close()
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
