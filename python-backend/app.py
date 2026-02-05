"""
Flask Backend for Tejas Router Monitoring
Handles SSH operations for OSPF, BGP, and SFP monitoring

Single SSH session approach for better performance
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

def execute_ssh_commands(router, commands):
    """
    Execute multiple SSH commands in single session
    Returns dict with command outputs
    """
    try:
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
        
        # Get shell
        shell = ssh.invoke_shell()
        time.sleep(1)
        
        # Clear initial output
        shell.recv(65535)
        
        # Configure terminal
        shell.send('conf t\n')
        time.sleep(0.5)
        shell.send('set cli pagination off\n')
        time.sleep(0.5)
        shell.send('end\n')
        time.sleep(0.5)
        
        # Clear configuration output
        shell.recv(65535)
        
        # Execute commands and collect outputs
        outputs = {}
        for cmd_name, cmd in commands.items():
            shell.send(f'{cmd}\n')
            time.sleep(2)  # Wait for command execution
            
            output = shell.recv(65535).decode('utf-8', errors='ignore')
            outputs[cmd_name] = output
        
        # Exit
        shell.send('exit\n')
        time.sleep(0.5)
        
        # Close connection
        shell.close()
        ssh.close()
        
        return outputs
        
    except Exception as e:
        raise Exception(f"SSH Error: {str(e)}")

def parse_ospf_output(output):
    """Parse OSPF neighbor output"""
    neighbors = []
    lines = output.split('\n')
    
    for line in lines:
        # Match OSPF neighbor lines
        match = re.search(r'(\d+\.\d+\.\d+\.\d+)\s+\d+\s+(\w+)/\s*-\s+(\d+:\d+:\d+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\S+)', line)
        if match:
            neighbors.append({
                'neighbor_id': match.group(1),
                'state': match.group(2),
                'dead_time': match.group(3),
                'address': match.group(4),
                'interface': match.group(5)
            })
    
    return {
        'neighbor_count': len(neighbors),
        'neighbors': neighbors
    }

def parse_bgp_output(output):
    """Parse BGP summary output"""
    peers = []
    lines = output.split('\n')
    
    for line in lines:
        # Match BGP peer lines
        match = re.search(r'(\d+\.\d+\.\d+\.\d+)\s+\d+\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+:\d+:\d+|\d+)\s+(\d+)', line)
        if match:
            peers.append({
                'neighbor': match.group(1),
                'as': match.group(2),
                'msg_rcvd': match.group(3),
                'msg_sent': match.group(4),
                'uptime': match.group(5),
                'state_pfxrcd': match.group(6)
            })
    
    return {
        'peer_count': len(peers),
        'peers': peers
    }

def parse_sfp_output(outputs):
    """Parse SFP outputs for multiple interfaces"""
    interfaces = []
    
    for interface_name, output in outputs.items():
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
    
    return {'interfaces': interfaces}

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'tejas-monitoring-backend',
        'version': '1.0.0'
    })

# Unified endpoint - Single SSH session for all data
@app.route('/api/tejas/live/all', methods=['GET'])
def get_all_monitoring_data():
    """
    Get OSPF + BGP + SFP data in single SSH session
    Much faster than separate API calls
    """
    start_time = time.time()
    
    try:
        router_id = request.args.get('routerId')
        
        if not router_id:
            return jsonify({
                'success': False,
                'error': 'Router ID is required'
            }), 400
        
        # Get router details
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
        
        # Define all commands to execute
        commands = {
            'ospf': 'show ip ospf neighbor',
            'bgp': 'show ip bgp summary',
            'sfp_1_5_11': 'show sfp 100g 1/5/11',
            'sfp_1_4_5': 'show sfp 100g 1/4/5',
            'sfp_1_3_2': 'show sfp 100g 1/3/2'
        }
        
        # Execute all commands in single SSH session
        outputs = execute_ssh_commands(router, commands)
        
        # Parse outputs
        ospf_data = parse_ospf_output(outputs['ospf'])
        bgp_data = parse_bgp_output(outputs['bgp'])
        
        # Parse SFP data
        sfp_outputs = {
            '100g 1/5/11': outputs['sfp_1_5_11'],
            '100g 1/4/5': outputs['sfp_1_4_5'],
            '100g 1/3/2': outputs['sfp_1_3_2']
        }
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
                'commands_executed': len(commands)
            },
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
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
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tejas/live/sfp', methods=['GET'])
def get_sfp_data():
    """Get SFP monitoring data"""
    try:
        router_id = request.args.get('routerId')
        
        if not router_id:
            return jsonify({'success': False, 'error': 'Router ID required'}), 400
        
        router = get_router_details(router_id)
        if not router:
            return jsonify({'success': False, 'error': 'Router not found'}), 404
        
        commands = {
            'sfp_1_5_11': 'show sfp 100g 1/5/11',
            'sfp_1_4_5': 'show sfp 100g 1/4/5',
            'sfp_1_3_2': 'show sfp 100g 1/3/2'
        }
        outputs = execute_ssh_commands(router, commands)
        
        sfp_outputs = {
            '100g 1/5/11': outputs['sfp_1_5_11'],
            '100g 1/4/5': outputs['sfp_1_4_5'],
            '100g 1/3/2': outputs['sfp_1_3_2']
        }
        sfp_data = parse_sfp_output(sfp_outputs)
        
        return jsonify({
            'success': True,
            'router': {'id': router['id'], 'hostname': router['hostname']},
            'data': sfp_data,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Tejas Monitoring Backend Starting...")
    print("=" * 60)
    print(f"📡 Server: http://localhost:8000")
    print(f"🔍 Health Check: http://localhost:8000/health")
    print(f"⚡ Unified API: http://localhost:8000/api/tejas/live/all")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=True)
