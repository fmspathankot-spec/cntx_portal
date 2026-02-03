"""
Test Script 10: Test Save to Database
Yeh script data ko database mein save karta hai
Automatically router create karta hai agar nahi hai

Expected Output:
✅ Data saved to database
✅ Can retrieve saved data
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'cntx_portal',
    'user': 'postgres',
    'password': 'your_password'  # <-- YAHAN APNA PASSWORD DAALO!
}

def get_or_create_test_router(conn):
    """
    Test router ko fetch karta hai ya create karta hai
    
    Returns:
        router_id (int)
    """
    try:
        cursor = conn.cursor()
        
        # Check if any router exists
        cursor.execute("SELECT id, hostname FROM routers LIMIT 1")
        result = cursor.fetchone()
        
        if result:
            router_id = result[0]
            hostname = result[1]
            print(f"✅ Found existing router: {hostname} (ID: {router_id})")
            cursor.close()
            return router_id
        
        # No router found, create test router
        print("⚠️  No routers found! Creating test router...")
        
        # Create credential if not exists
        cursor.execute("""
            INSERT INTO router_credentials (credential_name, username, password, description)
            VALUES ('test_admin', 'admin', 'test123', 'Test credentials for script')
            ON CONFLICT (credential_name) DO NOTHING
        """)
        
        # Create test router
        cursor.execute("""
            SELECT add_router_with_credential(
                'TEST-ROUTER-1',
                '10.125.1.1',
                'test_admin',
                'tejas',
                'Test Location'
            )
        """)
        
        router_id = cursor.fetchone()[0]
        conn.commit()
        
        print(f"✅ Test router created with ID: {router_id}")
        
        cursor.close()
        return router_id
        
    except Exception as e:
        print(f"❌ Error getting/creating router: {e}")
        conn.rollback()
        return None

def save_reading(conn, router_id, parameter_name, reading_data, raw_output):
    """
    Database mein reading save karta hai
    
    Args:
        conn: Database connection
        router_id: Router ka ID
        parameter_name: Parameter ka naam
        reading_data: Reading ka data (dict)
        raw_output: Raw command output
    
    Returns:
        True if successful
    """
    try:
        cursor = conn.cursor()
        
        # Parameter ID nikalo
        cursor.execute(
            "SELECT id FROM monitoring_parameters WHERE parameter_name = %s",
            (parameter_name,)
        )
        result = cursor.fetchone()
        
        if not result:
            print(f"⚠️  Parameter '{parameter_name}' not found in database!")
            print(f"💡 Creating parameter...")
            
            # Create parameter
            cursor.execute("""
                INSERT INTO monitoring_parameters 
                (parameter_name, parameter_category, command_template, applies_to)
                VALUES (%s, 'NETWORK', 'test command', 'ROUTER')
                RETURNING id
            """, (parameter_name,))
            
            parameter_id = cursor.fetchone()[0]
            conn.commit()
            print(f"✅ Parameter created with ID: {parameter_id}")
        else:
            parameter_id = result[0]
        
        # Reading save karo
        query = """
            INSERT INTO parameter_readings 
            (router_id, interface_id, parameter_id, reading_data, raw_output, reading_time)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        cursor.execute(query, (
            router_id,
            None,  # No interface for OSPF
            parameter_id,
            json.dumps(reading_data),
            raw_output,
            datetime.now()
        ))
        
        reading_id = cursor.fetchone()[0]
        
        conn.commit()
        cursor.close()
        
        print(f"✅ Reading saved with ID: {reading_id}")
        return reading_id
        
    except Exception as e:
        print(f"❌ Error saving reading: {e}")
        conn.rollback()
        return False

def retrieve_reading(conn, reading_id):
    """
    Database se reading retrieve karta hai
    
    Args:
        conn: Database connection
        reading_id: Reading ka ID
    
    Returns:
        Reading data (dict)
    """
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT 
                pr.id,
                r.hostname,
                mp.parameter_name,
                pr.reading_data,
                pr.reading_time
            FROM parameter_readings pr
            JOIN routers r ON pr.router_id = r.id
            JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
            WHERE pr.id = %s
        """
        
        cursor.execute(query, (reading_id,))
        reading = cursor.fetchone()
        cursor.close()
        
        return reading
        
    except Exception as e:
        print(f"❌ Error retrieving reading: {e}")
        return None

def test_save_to_database():
    """Database save/retrieve test karta hai"""
    print("\n" + "="*60)
    print("🔍 Testing Save to Database...")
    print("="*60 + "\n")
    
    try:
        # Database se connect karo
        print("🔄 Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected!\n")
        
        # Get or create test router
        router_id = get_or_create_test_router(conn)
        
        if not router_id:
            print("\n❌ Failed to get/create router!")
            return False
        
        print()
        
        # Test data
        test_data = {
            'neighbor_count': 2,
            'neighbors': [
                {
                    'neighbor_id': '10.125.0.1',
                    'state': 'FULL/PTOP',
                    'interface': 'vlan50',
                    'bfd_status': 'Enabled'
                },
                {
                    'neighbor_id': '10.125.0.2',
                    'state': 'FULL/PTOP',
                    'interface': 'vlan20',
                    'bfd_status': 'Enabled'
                }
            ]
        }
        
        # Test data save karo
        print("🔄 Saving test data...")
        print(f"   Router ID: {router_id}")
        print(f"   Parameter: TEJAS_OSPF_NEIGHBORS")
        print(f"   Data: {test_data['neighbor_count']} neighbors")
        print()
        
        reading_id = save_reading(
            conn,
            router_id,
            'TEJAS_OSPF_NEIGHBORS',
            test_data,
            'Test OSPF output...'
        )
        
        if not reading_id:
            print("\n❌ Failed to save data!")
            return False
        
        print()
        
        # Saved data retrieve karo
        print("🔄 Retrieving saved data...")
        reading = retrieve_reading(conn, reading_id)
        
        if reading:
            print("✅ Data retrieved successfully!\n")
            print("📄 Retrieved Data:")
            print(f"   ID: {reading['id']}")
            print(f"   Router: {reading['hostname']}")
            print(f"   Parameter: {reading['parameter_name']}")
            print(f"   Reading Time: {reading['reading_time']}")
            print(f"   Neighbor Count: {reading['reading_data']['neighbor_count']}")
        else:
            print("\n❌ Failed to retrieve data!")
            return False
        
        # Connection close karo
        conn.close()
        
        print("\n✅ Test Passed! Database save/retrieve working!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Solutions:")
        print("   1. Check if PostgreSQL is running")
        print("   2. Verify password in DB_CONFIG")
        print("   3. Check if database 'cntx_portal' exists")
        print("   4. Run schema files if tables missing")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_save_to_database()
    input("\nPress Enter to exit...")
