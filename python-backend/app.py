"""
Flask Backend for Tejas Router Monitoring
Handles SSH operations for OSPF, BGP, and SFP monitoring

Single SSH session approach for better performance
Interfaces fetched dynamically from database
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import paramiko
import time
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'cntx_portal'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'python##1313')
}

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def get_router_details(router_id):
    """Fetch router details from database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            r.id, r.hostname, r.ip_address, r.ssh_port, r.device_type,
            rc.username, rc.password
        FROM routers r
        LEFT JOIN router_credentials rc ON r.credential_id = rc.id
        WHERE r.id = %s
    """
    
    cursor.execute(query, (router_id,))
    router = cursor.fetchone()
    
    cursor.close()
    conn.close()
    
    return router

def get_router_interfaces(router_id):
    """Fetch active interfaces for a router from database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
        SELECT 
            id, interface_name, interface_type, description
        FROM router_interfaces
        WHERE router_id = %s AND is_active = true
        ORDER BY interface_name
    """
    
    cursor.execute(query, (router_id,))
    interfaces = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    print(f"[DB] Found {len(interfaces)} active interfaces for router {router_id}")
    for iface in interfaces:
        print(f"[DB]   - {iface['interface_name']} ({iface['interface_type']})")
    
    return interfaces

def execute_ssh_commands(router, commands):
    """
    Execute multiple SSH commands in single session
    Returns dict with command outputs
    """
    try:
        print(f"\n{'='*60}")
        print(f"[SSH] Connecting to {router['hostname']} ({router['ip_address']})")
        print(f"{'='*60}")
        
        # Create SSH client
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Connect
        ssh.connect(
            hostname=router['ip_address'],
            port=router['ssh_port'] or 22,
            username=router['username'],
            password=router['password'],
            timeout=30,
            look_for_keys=False,
            allow_agent=False
        )
        
        print(f"[SSH] ✅ Connected successfully!")
        
        # Get shell
        shell = ssh.invoke_shell()
        time.sleep(1)
        
        # Clear initial output
        initial_output = shell.recv(65535).decode('utf-8', errors='ignore')
        print(f"[SSH] Initial prompt: {initial_output[:100]}...")
        
        # Configure terminal
        print(f"[SSH] Configuring terminal...")
        shell.send('conf t\n')
        time.sleep(0.5)
        shell.send('set cli pagination off\n')
        time.sleep(0.5)
        shell.send('end\n')
        time.sleep(0.5)
        shell.recv(65535)  # Clear output
        
        # Execute commands
        outputs = {}
        
        for cmd_name, cmd in commands.items():
            print(f"\n[SSH] Executing: {cmd}")
            shell.send(f'{cmd}\n')
            time.sleep(2)  # Wait for command to complete
            
            output = shell.recv(65535).decode('utf-8', errors='ignore')
            outputs[cmd_name] = output
            
            print(f"[SSH] ✅ Command completed: {cmd_name}")
            print(f"[SSH] Output length: {len(output)} characters")
        
        # Close connection
        shell.close()
        ssh.close()
        print(f"\n[SSH] Connection closed")
        
        return outputs
        
    except Exception as e:
        print(f"[SSH ERROR] {str(e)}")
        raise

def parse_ospf_output(output):
    """Parse OSPF neighbor output"""
    print(f"\n[PARSE] Parsing OSPF output...")
    
    lines = output.split('\n')
    neighbors = []
    
    # Pattern: Neighbor ID     Pri   State           Dead Time   Address         Interface
    pattern = r'(\d+\.\d+\.\d+\.\d+)\s+(\d+)\s+(\S+(?:/\S+)?)\s+(\S+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\S+)'
    
    for line in lines:
        match = re.search(pattern, line)
        if match:
            neighbors.append({
                'neighbor_id': match.group(1),
                'priority': match.group(2),
                'state': match.group(3),
                'dead_time': match.group(4),
                'address': match.group(5),
                'interface': match.group(6)
            })
    
    print(f"[PARSE] Total OSPF neighbors found: {len(neighbors)}")
    
    return {
        'neighbor_count': len(neighbors),
        'neighbors': neighbors,
        'raw_output': output
    }

def parse_bgp_output(output):
    """Parse BGP summary output"""
    print(f"\n[PARSE] Parsing BGP output...")
    
    lines = output.split('\n')
    peers = []
    
    # Pattern: Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
    pattern = r'(\d+\.\d+\.\d+\.\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\d+\s+\d+\s+\d+\s+(\S+)\s+(\S+)'
    
    for line in lines:
        match = re.search(pattern, line)
        if match:
            peers.append({
                'neighbor': match.group(1),
                'version': match.group(2),
                'as_number': match.group(3),
                'msg_rcvd': match.group(4),
                'msg_sent': match.group(5),
                'uptime': match.group(6),
                'state_pfxrcd': match.group(7)
            })
    
    print(f"[PARSE] Total BGP peers found: {len(peers)}")
    
    return {
        'peer_count': len(peers),
        'peers': peers,
        'raw_output': output
    }

def parse_sfp_output(outputs):
    """Parse SFP outputs for multiple interfaces"""
    print(f"\n[PARSE] Parsing SFP outputs...")
    
    interfaces = []
    
    for interface_name, output in outputs.items():
        print(f"[PARSE] Processing interface: {interface_name}")
        lines = output.split('\n')
        
        sfp_data = {
            'interface': interface_name,
            'temperature': None,
            'voltage': None,
            'tx_power': None,
            'rx_power': None,
            'tx_bias': None
        }
        
        for line in lines:
            if 'Temperature' in line:
                match = re.search(r'([\d.]+)', line)
                if match:
                    sfp_data['temperature'] = float(match.group(1))
            elif 'Voltage' in line:
                match = re.search(r'([\d.]+)', line)
                if match:
                    sfp_data['voltage'] = float(match.group(1))
            elif 'Tx Power' in line or 'TX Power' in line:
                match = re.search(r'([-\d.]+)', line)
                if match:
                    sfp_data['tx_power'] = float(match.group(1))
            elif 'Rx Power' in line or 'RX Power' in line:
                match = re.search(r'([-\d.]+)', line)
                if match:
                    sfp_data['rx_power'] = float(match.group(1))
            elif 'Bias' in line:
                match = re.search(r'([\d.]+)', line)
                if match:
                    sfp_data['tx_bias'] = float(match.group(1))
        
        interfaces.append(sfp_data)
        print(f"[PARSE] SFP data: {sfp_data}")
    
    return {'interfaces': interfaces}

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'tejas-monitoring-backend',
        'version': '2.0.0',
        'features': ['dynamic_interfaces', 'db_credentials']
    })

# Unified endpoint - Single SSH session for all data
@app.route('/api/tejas/live/all', methods=['GET'])
def get_all_monitoring_data():
    """
    Get OSPF + BGP + SFP data in single SSH session
    Interfaces fetched dynamically from database
    """
    start_time = time.time()
    
    try:
        router_id = request.args.get('routerId')
        
        if not router_id:
            return jsonify({
                'success': False,
                'error': 'Router ID is required'
            }), 400
        
        # Get router details from database
        router = get_router_details(router_id)
        
        if not router:
            return jsonify({
                'success': False,
                'error': 'Router not found'
            }), 404
        
        if not router['username'] or not router['password']:
            return jsonify({
                'success': False,
                'error': 'Router credentials not configured'
            }), 400
        
        # Get active interfaces from database
        interfaces = get_router_interfaces(router_id)
        
        # Build commands dictionary
        commands = {
            'ospf': 'show ip ospf neighbor',
            'bgp': 'show ip bgp summary'
        }
        
        # Add SFP commands for each interface
        sfp_interface_map = {}
        for idx, iface in enumerate(interfaces):
            if iface['interface_type'].upper() == 'SFP':
                cmd_key = f"sfp_{idx}"
                commands[cmd_key] = f"show sfp {iface['interface_name']}"
                sfp_interface_map[cmd_key] = iface['interface_name']
        
        print(f"\n[INFO] Total commands to execute: {len(commands)}")
        print(f"[INFO] SFP interfaces: {len(sfp_interface_map)}")
        
        # Execute all commands in single SSH session
        outputs = execute_ssh_commands(router, commands)
        
        # Parse outputs
        ospf_data = parse_ospf_output(outputs['ospf'])
        bgp_data = parse_bgp_output(outputs['bgp'])
        
        # Parse SFP data
        sfp_outputs = {}
        for cmd_key, interface_name in sfp_interface_map.items():
            sfp_outputs[interface_name] = outputs[cmd_key]
        
        sfp_data = parse_sfp_output(sfp_outputs)
        
        # Calculate execution time
        execution_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return jsonify({
            'success': True,
            'router': {
                'id': router['id'],
                'hostname': router['hostname'],
                'ip_address': router['ip_address']
            },
            'data': {
                'ospf': ospf_data,
                'bgp': bgp_data,
                'sfp': sfp_data
            },
            'performance': {
                'execution_time_ms': round(execution_time, 2),
                'ssh_sessions': 1,
                'commands_executed': len(commands),
                'interfaces_monitored': len(sfp_interface_map)
            },
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Individual endpoints (for backward compatibility)
@app.route('/api/tejas/live/ospf', methods=['GET'])
def get_ospf_data():
    """Get OSPF neighbors data"""
    try:
        router_id = request.args.get('routerId')
        
        if not router_id:
            return jsonify({'success': False, 'error': 'Router ID required'}), 400
        
        router = get_router_details(router_id)
        if not router:
            return jsonify({'success': False, 'error': 'Router not found'}), 404
        
        commands = {'ospf': 'show ip ospf neighbor'}
        outputs = execute_ssh_commands(router, commands)
        ospf_data = parse_ospf_output(outputs['ospf'])
        
        return jsonify({
            'success': True,
            'router': {'id': router['id'], 'hostname': router['hostname']},
            'data': ospf_data,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tejas/live/bgp', methods=['GET'])
def get_bgp_data():
    """Get BGP summary data"""
    try:
        router_id = request.args.get('routerId')
        
        if not router_id:
            return jsonify({'success': False, 'error': 'Router ID required'}), 400
        
        router = get_router_details(router_id)
        if not router:
            return jsonify({'success': False, 'error': 'Router not found'}), 404
        
        commands = {'bgp': 'show ip bgp summary'}
        outputs = execute_ssh_commands(router, commands)
        bgp_data = parse_bgp_output(outputs['bgp'])
        
        return jsonify({
            'success': True,
            'router': {'id': router['id'], 'hostname': router['hostname']},
            'data': bgp_data,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tejas/live/sfp', methods=['GET'])
def get_sfp_data():
    """Get SFP data for all configured interfaces"""
    try:
        router_id = request.args.get('routerId')
        
        if not router_id:
            return jsonify({'success': False, 'error': 'Router ID required'}), 400
        
        router = get_router_details(router_id)
        if not router:
            return jsonify({'success': False, 'error': 'Router not found'}), 404
        
        # Get interfaces from database
        interfaces = get_router_interfaces(router_id)
        
        # Build SFP commands
        commands = {}
        sfp_interface_map = {}
        
        for idx, iface in enumerate(interfaces):
            if iface['interface_type'].upper() == 'SFP':
                cmd_key = f"sfp_{idx}"
                commands[cmd_key] = f"show sfp {iface['interface_name']}"
                sfp_interface_map[cmd_key] = iface['interface_name']
        
        if not commands:
            return jsonify({
                'success': False,
                'error': 'No SFP interfaces configured for this router'
            }), 404
        
        outputs = execute_ssh_commands(router, commands)
        
        # Parse SFP data
        sfp_outputs = {}
        for cmd_key, interface_name in sfp_interface_map.items():
            sfp_outputs[interface_name] = outputs[cmd_key]
        
        sfp_data = parse_sfp_output(sfp_outputs)
        
        return jsonify({
            'success': True,
            'router': {'id': router['id'], 'hostname': router['hostname']},
            'data': sfp_data,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Tejas Router Monitoring Backend")
    print("="*60)
    print("✅ Dynamic interface loading from database")
    print("✅ Credentials from database")
    print("✅ Single SSH session for all commands")
    print("="*60 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
