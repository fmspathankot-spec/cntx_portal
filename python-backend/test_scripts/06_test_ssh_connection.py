"""
Test Script 6: Test SSH Connection to Router
Yeh script router se SSH connection test karta hai

Expected Output:
✅ SSH connection successful
✅ Command executed successfully
Output: [router output]
"""

import paramiko
import time

# ============================================
# ROUTER CONFIGURATION
# Yahan apne router ki details daalo
# ============================================
ROUTER_CONFIG = {
    'host': '10.125.1.1',        # <-- Router IP address
    'port': 22,                   # SSH port
    'username': 'admin',          # <-- Router username
    'password': 'your_password',  # <-- Router password
    'device_type': 'tejas'
}

# Test command
TEST_COMMAND = 'show version'  # Simple command to test

def test_ssh_connection():
    """
    Router se SSH connection test karta hai
    """
    print("\n" + "="*60)
    print("🔍 Testing SSH Connection to Router...")
    print("="*60 + "\n")
    
    print(f"📡 Router Details:")
    print(f"   Host: {ROUTER_CONFIG['host']}")
    print(f"   Port: {ROUTER_CONFIG['port']}")
    print(f"   Username: {ROUTER_CONFIG['username']}")
    print(f"   Device Type: {ROUTER_CONFIG['device_type']}")
    print()
    
    try:
        # SSH client banao
        print("🔄 Creating SSH client...")
        ssh = paramiko.SSHClient()
        ssh.load_system_host_keys()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Connect karo
        print(f"🔄 Connecting to {ROUTER_CONFIG['host']}...")
        ssh.connect(
            ROUTER_CONFIG['host'],
            ROUTER_CONFIG['port'],
            ROUTER_CONFIG['username'],
            ROUTER_CONFIG['password'],
            look_for_keys=False,
            allow_agent=False,
            timeout=10
        )
        
        print("✅ SSH connection successful!\n")
        
        # Interactive shell open karo
        print("🔄 Opening interactive shell...")
        chan = ssh.invoke_shell()
        time.sleep(1)
        
        # Initial output clear karo
        if chan.recv_ready():
            chan.recv(9999)
        
        # Test command bhejo
        print(f"🔄 Executing command: {TEST_COMMAND}")
        chan.send(f"{TEST_COMMAND}\n")
        time.sleep(2)
        
        # Response padho
        resp = b""
        while chan.recv_ready():
            resp += chan.recv(9999)
        
        output = resp.decode('ascii', errors='ignore')
        
        print("✅ Command executed successfully!\n")
        print("📄 Output:")
        print("-" * 60)
        print(output[:500])  # First 500 characters
        if len(output) > 500:
            print(f"\n... (total {len(output)} characters)")
        print("-" * 60)
        
        # Connection close karo
        ssh.close()
        print("\n✅ Test Passed! SSH connection working!")
        
    except paramiko.AuthenticationException:
        print("\n❌ Authentication Failed!")
        print("💡 Solutions:")
        print("   1. Check username and password")
        print("   2. Verify router credentials")
        return False
        
    except paramiko.SSHException as e:
        print(f"\n❌ SSH Error: {e}")
        print("💡 Solutions:")
        print("   1. Check if SSH is enabled on router")
        print("   2. Verify SSH port (default: 22)")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("💡 Solutions:")
        print("   1. Check router IP address")
        print("   2. Check network connectivity")
        print("   3. Ping router: ping", ROUTER_CONFIG['host'])
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_ssh_connection()
    input("\nPress Enter to exit...")
