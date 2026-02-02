"""
Test Script 7: Test OSPF Command
Yeh script router par OSPF command execute karke output dikhata hai

Expected Output:
✅ OSPF command executed
Neighbor-ID     Pri   State          DeadTime   Address         Interface
10.125.0.xxx    1     FULL/PTOP      1728       10.130.0.xxx    vlan50
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

# OSPF command
OSPF_COMMAND = 'sh ip ospf ne'

def execute_command(chan, command, wait_time=2):
    """
    Command execute karta hai aur output return karta hai
    
    Args:
        chan: SSH channel
        command: Execute karne wala command
        wait_time: Kitni der wait karna hai (seconds)
    
    Returns:
        Command ka output (string)
    """
    # Command bhejo
    chan.send(f"{command}\n")
    time.sleep(wait_time)
    
    # Response padho
    resp = b""
    while chan.recv_ready():
        resp += chan.recv(9999)
    
    # Bytes ko string mein convert karo
    return resp.decode('ascii', errors='ignore')

def parse_ospf_neighbors(output):
    """
    OSPF output ko parse karta hai
    
    Args:
        output: Command ka output
    
    Returns:
        List of neighbors (dict)
    """
    neighbors = []
    lines = output.split('\n')
    in_table = False
    
    for line in lines:
        # Table start hone ka check karo
        if '---' in line and 'Neighbor-ID' in output[:output.index(line)]:
            in_table = True
            continue
        
        # Agar table mein hain
        if in_table and line.strip():
            parts = line.split()
            # Check if valid neighbor line (IP address se start hota hai)
            if len(parts) >= 11 and re.match(r'^\d+\.\d+\.\d+\.\d+$', parts[0]):
                neighbor = {
                    'neighbor_id': parts[0],
                    'priority': parts[1],
                    'state': parts[2],
                    'dead_time': parts[3],
                    'neighbor_address': parts[4],
                    'interface': parts[5],
                    'bfd_status': parts[9],
                    'area_id': parts[10]
                }
                neighbors.append(neighbor)
    
    return neighbors

def test_ospf_command():
    """
    OSPF command test karta hai
    """
    print("\n" + "="*60)
    print("🔍 Testing OSPF Command...")
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
        
        # Initial output clear karo
        if chan.recv_ready():
            chan.recv(9999)
        
        # OSPF command execute karo
        print(f"🔄 Executing: {OSPF_COMMAND}")
        output = execute_command(chan, OSPF_COMMAND)
        
        print("✅ Command executed!\n")
        
        # Raw output dikhao
        print("📄 Raw Output:")
        print("-" * 60)
        print(output)
        print("-" * 60)
        
        # Parse karo
        print("\n🔍 Parsing OSPF Neighbors...")
        neighbors = parse_ospf_neighbors(output)
        
        if neighbors:
            print(f"\n✅ Found {len(neighbors)} OSPF neighbor(s):\n")
            
            for i, neighbor in enumerate(neighbors, 1):
                print(f"   Neighbor {i}:")
                print(f"      Neighbor ID: {neighbor['neighbor_id']}")
                print(f"      State: {neighbor['state']}")
                print(f"      Interface: {neighbor['interface']}")
                print(f"      BFD Status: {neighbor['bfd_status']}")
                print(f"      Area ID: {neighbor['area_id']}")
                print()
        else:
            print("\n⚠️  No OSPF neighbors found!")
        
        # Close connection
        ssh.close()
        
        print("✅ Test Passed! OSPF command working!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_ospf_command()
    input("\nPress Enter to exit...")
