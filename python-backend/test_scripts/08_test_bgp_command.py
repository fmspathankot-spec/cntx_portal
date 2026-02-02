"""
Test Script 8: Test BGP Command
Yeh script router par BGP command execute karke output dikhata hai

Expected Output:
✅ BGP command executed
Router ID: 10.125.0.xxx
Local AS: xxxxx
Established: 36/40
"""

import paramiko
import time
import re

# ============================================
# ROUTER CONFIGURATION
# ============================================
ROUTER_CONFIG = {
    'host': '10.125.1.1',        # <-- Router IP
    'port': 22,
    'username': 'admin',          # <-- Username
    'password': 'your_password',  # <-- Password
}

# BGP command
BGP_COMMAND = 'sh ip bgp summary sorted'

def execute_command(chan, command, wait_time=3):
    """Command execute karta hai"""
    chan.send(f"{command}\n")
    time.sleep(wait_time)
    
    resp = b""
    while chan.recv_ready():
        resp += chan.recv(9999)
    
    return resp.decode('ascii', errors='ignore')

def parse_bgp_summary(output):
    """
    BGP output ko parse karta hai
    
    Returns:
        Dictionary with BGP info
    """
    result = {}
    
    # Router ID nikalo
    router_id_match = re.search(r'BGP router identifier is ([\d.]+)', output)
    if router_id_match:
        result['router_id'] = router_id_match.group(1)
    
    # Local AS nikalo
    local_as_match = re.search(r'Local AS number (\d+)', output)
    if local_as_match:
        result['local_as'] = local_as_match.group(1)
    
    # Established count nikalo
    established_match = re.search(r'Established Count\s*:\s*(\d+)', output)
    if established_match:
        result['established_count'] = established_match.group(1)
    
    # Configured count nikalo
    configured_match = re.search(r'Configured count\s*:\s*(\d+)', output)
    if configured_match:
        result['configured_count'] = configured_match.group(1)
    
    # Forwarding state nikalo
    forwarding_match = re.search(r'Forwarding State is (\w+)', output)
    if forwarding_match:
        result['forwarding_state'] = forwarding_match.group(1)
    
    return result

def test_bgp_command():
    """BGP command test karta hai"""
    print("\n" + "="*60)
    print("🔍 Testing BGP Command...")
    print("="*60 + "\n")
    
    try:
        # SSH connection
        print(f"🔄 Connecting to {ROUTER_CONFIG['host']}...")
        ssh = paramiko.SSHClient()
        ssh.load_system_host_keys()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            ROUTER_CONFIG['host'],
            ROUTER_CONFIG['port'],
            ROUTER_CONFIG['username'],
            ROUTER_CONFIG['password'],
            look_for_keys=False,
            allow_agent=False,
            timeout=10
        )
        
        print("✅ Connected!\n")
        
        # Shell open karo
        chan = ssh.invoke_shell()
        time.sleep(1)
        
        if chan.recv_ready():
            chan.recv(9999)
        
        # BGP command execute karo
        print(f"🔄 Executing: {BGP_COMMAND}")
        output = execute_command(chan, BGP_COMMAND, 3)
        
        print("✅ Command executed!\n")
        
        # Raw output dikhao (first 1000 chars)
        print("📄 Raw Output (first 1000 chars):")
        print("-" * 60)
        print(output[:1000])
        if len(output) > 1000:
            print(f"\n... (total {len(output)} characters)")
        print("-" * 60)
        
        # Parse karo
        print("\n🔍 Parsing BGP Summary...")
        bgp_data = parse_bgp_summary(output)
        
        if bgp_data:
            print("\n✅ BGP Summary:\n")
            print(f"   Router ID: {bgp_data.get('router_id', 'N/A')}")
            print(f"   Local AS: {bgp_data.get('local_as', 'N/A')}")
            print(f"   Established: {bgp_data.get('established_count', 'N/A')}")
            print(f"   Configured: {bgp_data.get('configured_count', 'N/A')}")
            print(f"   Forwarding State: {bgp_data.get('forwarding_state', 'N/A')}")
        else:
            print("\n⚠️  Could not parse BGP data!")
        
        # Close connection
        ssh.close()
        
        print("\n✅ Test Passed! BGP command working!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_bgp_command()
    input("\nPress Enter to exit...")
