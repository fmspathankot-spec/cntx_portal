"""
Test Script 10: Test Save to Database
Yeh script data ko database mein save karta hai

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

# Test data
TEST_DATA = {
    'router_id': 1,  # First router
    'parameter_name': 'TEJAS_OSPF_NEIGHBORS',
    'reading_data': {
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
    },
    'raw_output': 'Test OSPF output...'
}

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
            return False
        
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
        
        # Test data save karo
        print("🔄 Saving test data...")
        print(f"   Router ID: {TEST_DATA['router_id']}")
        print(f"   Parameter: {TEST_DATA['parameter_name']}")
        print(f"   Data: {len(TEST_DATA['reading_data']['neighbors'])} neighbors")
        print()
        
        reading_id = save_reading(
            conn,
            TEST_DATA['router_id'],
            TEST_DATA['parameter_name'],
            TEST_DATA['reading_data'],
            TEST_DATA['raw_output']
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
            print(f"   Data: {reading['reading_data']}")
        else:
            print("\n❌ Failed to retrieve data!")
            return False
        
        # Connection close karo
        conn.close()
        
        print("\n✅ Test Passed! Database save/retrieve working!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_save_to_database()
    input("\nPress Enter to exit...")
