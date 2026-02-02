"""
Test Script 3: Check Credentials
Yeh script check karta hai ki credentials table mein data hai ya nahi

Expected Output:
✅ Found 3 credentials
- default_admin
- backup_admin
- readonly_user
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

def test_credentials():
    """
    Credentials table mein data check karta hai
    """
    print("\n" + "="*60)
    print("🔍 Checking Router Credentials...")
    print("="*60 + "\n")
    
    try:
        # Database se connect karo
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Credentials fetch karo
        query = """
            SELECT 
                credential_name,
                username,
                description,
                is_active
            FROM router_credentials
            ORDER BY credential_name
        """
        
        cursor.execute(query)
        credentials = cursor.fetchall()
        
        if not credentials:
            print("⚠️  No credentials found in database!\n")
            print("💡 Add credentials using:")
            print("   psql -U postgres -d cntx_portal")
            print("   INSERT INTO router_credentials (credential_name, username, password, description)")
            print("   VALUES ('my_admin', 'admin', 'your_password', 'Common admin');")
            return False
        
        print(f"📊 Found {len(credentials)} credential(s):\n")
        
        for cred in credentials:
            status = "✅ Active" if cred['is_active'] else "❌ Inactive"
            print(f"   🔐 {cred['credential_name']}")
            print(f"      Username: {cred['username']}")
            print(f"      Description: {cred['description']}")
            print(f"      Status: {status}")
            print()
        
        cursor.close()
        conn.close()
        
        print("✅ Test Passed! Credentials found in database!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_credentials()
    input("\nPress Enter to exit...")
