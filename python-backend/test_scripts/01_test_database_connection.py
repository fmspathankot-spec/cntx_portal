"""
Test Script 1: Database Connection Test
Yeh script database se connection check karta hai

Expected Output:
✅ Database connected successfully
Database: cntx_portal
User: postgres
"""

import psycopg2
from psycopg2.extras import RealDictCursor

# ============================================
# DATABASE CONFIGURATION
# Yahan apna password daalo
# ============================================
DB_CONFIG = {
    'host': 'localhost',      # Database server address
    'port': 5432,             # PostgreSQL port
    'database': 'cntx_portal', # Database name
    'user': 'postgres',       # Username
    'password': 'your_password'  # <-- YAHAN APNA PASSWORD DAALO!
}

def test_database_connection():
    """
    Database se connection test karta hai
    """
    print("\n" + "="*60)
    print("🔍 Testing Database Connection...")
    print("="*60 + "\n")
    
    try:
        # Database se connect karo
        print("📡 Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        
        print("✅ Database connected successfully!\n")
        
        # Database info print karo
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        
        print(f"📊 Database Info:")
        print(f"   Database: {DB_CONFIG['database']}")
        print(f"   User: {DB_CONFIG['user']}")
        print(f"   Host: {DB_CONFIG['host']}")
        print(f"   Port: {DB_CONFIG['port']}")
        print(f"\n   PostgreSQL Version:")
        print(f"   {version[:80]}...")
        
        # Connection close karo
        cursor.close()
        conn.close()
        
        print("\n✅ Test Passed! Database connection working perfectly!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Solutions:")
        print("   1. Check if PostgreSQL is running")
        print("   2. Verify password in DB_CONFIG")
        print("   3. Check if database 'cntx_portal' exists")
        print("   4. Run: psql -U postgres -c 'CREATE DATABASE cntx_portal'")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_database_connection()
    input("\nPress Enter to exit...")
