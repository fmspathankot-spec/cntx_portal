"""
Test Script 9: Test SFP Command
Yeh script router par SFP command execute karke output dikhata hai

Expected Output:
✅ SFP command executed
RxPower: -16.3492 dBm
TxPower: 9.842 dBm
Temperature: 39.9844 C
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

# SFP command (change interface as needed)
INTERFACE = '1/1/1'  # <-- Apna interface daalo
SFP_COMMAND = f'sh sfp 100g {INTERFACE}'

def execute_command(chan, command, wait_time=2):
    """Command execute karta hai"""
    chan.send(f"{command}\n")
    time.sleep(wait_time)
    
    resp = b""
    while chan.recv_ready():
        resp += chan.recv(9999)
    
    return resp.decode('ascii', errors='ignore')

def parse_sfp_info(output):
    """
    SFP output ko parse karta hai
    
    Returns:
        Dictionary with SFP info
    """
    result = {}
    
    # Fields aur unke regex patterns
    fields = {
        'operational_status': r'Operational Status\s*:\s*(\w+)',
        'laser_status': r'MSA Laser Status\s*:\s*(\w+)',
        'laser_type': r'Laser Type\s*:\s*(.+)',
        'rx_power': r'RxPower\s*:\s*([-\d.]+)',
        'tx_power': r'TxPower\s*:\s*([-\d.]+)',
        'temperature': r'Module Temperature.*?:\s*([-\d.]+)',
        'voltage': r'Module Voltage.*?:\s*([-\d.]+)',
        'vendor': r'Vendor Name\s*:\s*(.+)',
        'serial_number': r'Serial Number\s*:\s*(.+)',
    }
    
    # Har field ko extract karo
    for field, pattern in fields.items():
        match = re.search(pattern, output)
        if match:
            result[field] = match.group(1).strip()
        else:
            result[field] = 'N/A'
    
    return result

def test_sfp_command():
    """SFP command test karta hai"""
    print("\n" + "="*60)
    print("🔍 Testing SFP Command...")
    print("="*60 + "\n")
    
    print(f"Interface: {INTERFACE}\n")
    
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
        
        # SFP command execute karo
        print(f"🔄 Executing: {SFP_COMMAND}")
        output = execute_command(chan, SFP_COMMAND)
        
        print("✅ Command executed!\n")
        
        # Raw output dikhao
        print("📄 Raw Output:")
        print("-" * 60)
        print(output)
        print("-" * 60)
        
        # Parse karo
        print("\n🔍 Parsing SFP Info...")
        sfp_data = parse_sfp_info(output)
        
        if sfp_data:
            print("\n✅ SFP Information:\n")
            print(f"   Status: {sfp_data.get('operational_status', 'N/A')}")
            print(f"   Laser Status: {sfp_data.get('laser_status', 'N/A')}")
            print(f"   Laser Type: {sfp_data.get('laser_type', 'N/A')}")
            print(f"   RxPower: {sfp_data.get('rx_power', 'N/A')} dBm")
            print(f"   TxPower: {sfp_data.get('tx_power', 'N/A')} dBm")
            print(f"   Temperature: {sfp_data.get('temperature', 'N/A')} C")
            print(f"   Voltage: {sfp_data.get('voltage', 'N/A')} V")
            print(f"   Vendor: {sfp_data.get('vendor', 'N/A')}")
            print(f"   Serial: {sfp_data.get('serial_number', 'N/A')}")
        else:
            print("\n⚠️  Could not parse SFP data!")
        
        # Close connection
        ssh.close()
        
        print("\n✅ Test Passed! SFP command working!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
    
    print("\n" + "="*60)
    return True

if __name__ == "__main__":
    test_sfp_command()
    input("\nPress Enter to exit...")
