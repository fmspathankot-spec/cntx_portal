"""
Test Script 2: Check Tables Exist
Yeh script check karta hai ki saare required tables bane hain ya nahi

Expected Output:
✅ All 7 tables found
- routers
- router_credentials
- router_interfaces
- monitoring_parameters
- parameter_parsers
- parameter_readings
- router_credential_mappings
"""

import psycopg2
from psycopg2.extras import RealDictCursor

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

# Required tables ki list
REQUIRED_TABLES = [
    'routers',
    'router_credentials',
    'router_interfaces',
    'monitoring_parameters',
    'parameter_parsers',
    'parameter_readings',
    'router_credential_mappings'
]

def test_tables_exist():
    """
    Check karta hai ki saare tables exist karte hain
    """
    print("\n" + "="*60)
    print("🔍 Checking if Required Tables Exist...")
    print("="*60 + "\n")
    
    try:
        # Database se connect karo
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Saare tables ki list fetch karo
        query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        """
        
        cursor.execute(query)
        existing_tables = [row['table_name'] for row in cursor.fetchall()]
        
        print(f"📊 Found {len(existing_tables)} tables in database:\n")
        
        # Check each required table
        all_found = True
        for table in REQUIRED_TABLES:
            if table in existing_tables:
                print(f"   ✅ {table}")
            else:
                print(f"   ❌ {table} - MISSING!")
                all_found = False
        
        # Extra tables bhi dikhao
        extra_tables = [t for t in existing_tables if t not in REQUIRED_TABLES]
        if extra_tables:
            print(f"\n📋 Additional tables found:")
            for table in extra_tables:
                print(f"   ℹ️  {table}")
        
        cursor.close()
        conn.close()
        
        if all_found:
            print("\n✅ Test Passed! All required tables exist!")
        else:
            print("\n❌ Test Failed! Some tables are missing!")
            print("\n💡 Solution:")
            print("   Run the schema files:")
            print("   psql -U postgres -d cntx_portal -f python-backend/database/schema_multi_parameter.sql")
            print("   psql -U postgres -d cntx_portal -f python-backend/database/tejas_commands_schema.sql")
            print("   psql -U postgres -d cntx_portal -f python-backend/database/credentials_system.sql")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_tables_exist()
    input("\nPress Enter to exit...")
