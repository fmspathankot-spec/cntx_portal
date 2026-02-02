"""
Test Script 4: Check Routers
Yeh script check karta hai ki routers table mein data hai ya nahi

Expected Output:
✅ Found X routers
- ROUTER-1 (10.125.1.1) - Using: my_admin
- ROUTER-2 (10.125.1.2) - Using: my_admin
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

def test_routers():
    """
    Routers table mein data check karta hai
    """
    print("\n" + "="*60)
    print("🔍 Checking Routers in Database...")
    print("="*60 + "\n")
    
    try:
        # Database se connect karo
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Routers fetch karo (with credentials)
        query = """
            SELECT * FROM v_routers_with_credentials
            ORDER BY hostname
        """
        
        cursor.execute(query)
        routers = cursor.fetchall()
        
        if not routers:
            print("⚠️  No routers found in database!\n")
            print("💡 Add routers using:")
            print("   psql -U postgres -d cntx_portal")
            print("   SELECT add_router_with_credential(")
            print("       'ROUTER-1',")
            print("       '10.125.1.1',")
            print("       'my_admin',")
            print("       'tejas',")
            print("       'Location 1'")
            print("   );")
            return False
        
        print(f"📊 Found {len(routers)} router(s):\n")
        
        for router in routers:
            status = "✅ Active" if router['is_active'] else "❌ Inactive"
            print(f"   🌐 {router['hostname']}")
            print(f"      IP Address: {router['ip_address']}")
            print(f"      Username: {router['username']}")
            print(f"      Credential: {router['credential_name']}")
            print(f"      Device Type: {router['device_type']}")
            print(f"      Location: {router['location']}")
            print(f"      Status: {status}")
            print()
        
        cursor.close()
        conn.close()
        
        print("✅ Test Passed! Routers found in database!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_routers()
    input("\nPress Enter to exit...")
