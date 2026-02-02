"""
Test Script 5: Check Interfaces
Yeh script check karta hai ki router interfaces table mein data hai ya nahi

Expected Output:
✅ Found X interfaces
Router: ROUTER-1
  - 1/1/1 (Interface 1/1/1) - 100G
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

def test_interfaces():
    """
    Router interfaces check karta hai
    """
    print("\n" + "="*60)
    print("🔍 Checking Router Interfaces...")
    print("="*60 + "\n")
    
    try:
        # Database se connect karo
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Interfaces fetch karo
        query = """
            SELECT 
                r.hostname,
                ri.interface_name,
                ri.interface_label,
                ri.interface_type,
                ri.is_monitored
            FROM router_interfaces ri
            JOIN routers r ON ri.router_id = r.id
            ORDER BY r.hostname, ri.interface_name
        """
        
        cursor.execute(query)
        interfaces = cursor.fetchall()
        
        if not interfaces:
            print("⚠️  No interfaces found in database!\n")
            print("💡 Add interfaces using:")
            print("   psql -U postgres -d cntx_portal")
            print("   INSERT INTO router_interfaces (router_id, interface_name, interface_label, interface_type)")
            print("   SELECT id, '1/1/1', 'Interface 1/1/1', '100G'")
            print("   FROM routers WHERE hostname = 'ROUTER-1';")
            return False
        
        print(f"📊 Found {len(interfaces)} interface(s):\n")
        
        # Group by router
        current_router = None
        for iface in interfaces:
            if current_router != iface['hostname']:
                current_router = iface['hostname']
                print(f"   🌐 Router: {current_router}")
            
            status = "✅ Monitored" if iface['is_monitored'] else "❌ Not Monitored"
            print(f"      📡 {iface['interface_name']} ({iface['interface_label']})")
            print(f"         Type: {iface['interface_type']}")
            print(f"         Status: {status}")
        
        print()
        
        cursor.close()
        conn.close()
        
        print("✅ Test Passed! Interfaces found in database!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_interfaces()
    input("\nPress Enter to exit...")
