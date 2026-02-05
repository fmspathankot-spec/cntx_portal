/**
 * SSH Client Helper for Tejas Router Connections
 * Handles SSH connections and command execution
 * Uses same commands as Python backend for consistency
 */

const { NodeSSH } = require('node-ssh');

/**
 * Execute command on router via SSH with proper terminal setup
 * @param {Object} router - Router object with host, username, password
 * @param {string} command - Command to execute
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<string>} Command output
 */
async function executeCommand(router, command, timeout = 30000) {
  const ssh = new NodeSSH();
  
  try {
    console.log(`[SSH] Connecting to ${router.hostname} (${router.ip_address})...`);
    
    // Connect to router
    await ssh.connect({
      host: router.ip_address,
      username: router.username || 'admin',
      password: router.password,
      port: router.ssh_port || 22,
      readyTimeout: timeout,
      tryKeyboard: true,
    });
    
    console.log(`[SSH] Connected to ${router.hostname}`);
    
    // Use shell for interactive commands
    const result = await ssh.exec('bash', [], {
      stdin: `conf t
set cli pagination off
end
${command}
exit
`,
      stream: 'both',
      options: { pty: true }
    });
    
    console.log(`[SSH] Executed: ${command}`);
    console.log(`[SSH] Command completed successfully`);
    
    // Close connection
    ssh.dispose();
    
    return result;
    
  } catch (error) {
    console.error(`[SSH] Error executing command on ${router.hostname}:`, error.message);
    ssh.dispose();
    throw error;
  }
}

/**
 * Execute command using invoke_shell (like Python paramiko)
 * This matches the Python backend behavior exactly
 * @param {Object} router - Router object
 * @param {string} command - Command to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<string>} Command output
 */
async function executeCommandWithShell(router, command, timeout = 30000) {
  const Client = require('ssh2').Client;
  
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    
    conn.on('ready', () => {
      console.log(`[SSH] Connected to ${router.hostname}`);
      
      conn.shell((err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        
        // Collect output
        stream.on('data', (data) => {
          output += data.toString('utf8');
        });
        
        stream.on('close', () => {
          conn.end();
          resolve(output);
        });
        
        stream.stderr.on('data', (data) => {
          console.error('[SSH] STDERR:', data.toString());
        });
        
        // Send commands with delays (like Python backend)
        setTimeout(() => {
          console.log('[SSH] Sending: conf t');
          stream.write('conf t\n');
        }, 500);
        
        setTimeout(() => {
          console.log('[SSH] Sending: set cli pagination off');
          stream.write('set cli pagination off\n');
        }, 1000);
        
        setTimeout(() => {
          console.log('[SSH] Sending: end');
          stream.write('end\n');
        }, 1500);
        
        setTimeout(() => {
          console.log(`[SSH] Sending: ${command}`);
          stream.write(`${command}\n`);
        }, 2000);
        
        setTimeout(() => {
          console.log('[SSH] Sending: exit');
          stream.write('exit\n');
        }, timeout - 1000);
      });
    });
    
    conn.on('error', (err) => {
      console.error('[SSH] Connection error:', err.message);
      reject(err);
    });
    
    // Connect
    console.log(`[SSH] Connecting to ${router.hostname} (${router.ip_address})...`);
    conn.connect({
      host: router.ip_address,
      port: router.ssh_port || 22,
      username: router.username || 'admin',
      password: router.password,
      readyTimeout: timeout,
      keepaliveInterval: 10000
    });
  });
}

/**
 * Test SSH connection to router
 * @param {Object} router - Router object
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection(router) {
  try {
    const output = await executeCommandWithShell(router, 'show system info', 10000);
    return output.length > 0;
  } catch (error) {
    console.error(`[SSH] Connection test failed for ${router.hostname}:`, error.message);
    return false;
  }
}

/**
 * Get OSPF neighbors from router
 * @param {Object} router - Router object
 * @returns {Promise<string>} OSPF neighbors output
 */
async function getOSPFNeighbors(router) {
  return await executeCommandWithShell(router, 'show ip ospf neighbor', 15000);
}

/**
 * Get BGP summary from router
 * @param {Object} router - Router object
 * @returns {Promise<string>} BGP summary output
 */
async function getBGPSummary(router) {
  return await executeCommandWithShell(router, 'show ip bgp summary', 15000);
}

/**
 * Get SFP info for specific interface
 * Uses database-configured command or default 'show sfp 100g'
 * @param {Object} router - Router object
 * @param {string} interfaceName - Interface name (e.g., '1/5/11')
 * @param {string} sfpCommand - Custom SFP command (optional, default: 'show sfp 100g')
 * @returns {Promise<string>} SFP info output
 */
async function getSFPInfo(router, interfaceName, sfpCommand = 'show sfp 100g') {
  const command = `${sfpCommand} ${interfaceName}`;
  return await executeCommandWithShell(router, command, 15000);
}

/**
 * Get SFP info for all monitored interfaces
 * Fetches interfaces from database and gets SFP data for each
 * @param {Object} router - Router object with id
 * @returns {Promise<Array>} Array of SFP info for all interfaces
 */
async function getAllSFPInfo(router) {
  const { query } = require('./db');
  
  try {
    // Get monitored interfaces from database
    const result = await query(`
      SELECT 
        id,
        interface_name,
        interface_label,
        sfp_command
      FROM router_interfaces
      WHERE router_id = $1 AND is_monitored = true
      ORDER BY interface_name
    `, [router.id]);
    
    const interfaces = result.rows;
    
    if (interfaces.length === 0) {
      console.log(`[SSH] No monitored interfaces found for ${router.hostname}`);
      return [];
    }
    
    console.log(`[SSH] Found ${interfaces.length} monitored interfaces`);
    
    // Get SFP data for each interface
    const sfpData = [];
    
    for (const iface of interfaces) {
      try {
        const sfpCommand = iface.sfp_command || 'show sfp 100g';
        console.log(`[SSH] Fetching SFP for ${iface.interface_label} (${iface.interface_name})`);
        
        const output = await getSFPInfo(router, iface.interface_name, sfpCommand);
        
        sfpData.push({
          interface_id: iface.id,
          interface_name: iface.interface_name,
          interface_label: iface.interface_label,
          sfp_command: sfpCommand,
          output: output
        });
        
      } catch (error) {
        console.error(`[SSH] Error getting SFP for ${iface.interface_name}:`, error.message);
        sfpData.push({
          interface_id: iface.id,
          interface_name: iface.interface_name,
          interface_label: iface.interface_label,
          error: error.message
        });
      }
    }
    
    return sfpData;
    
  } catch (error) {
    console.error(`[SSH] Error fetching interfaces:`, error.message);
    throw error;
  }
}

module.exports = {
  executeCommand,
  executeCommandWithShell,
  testConnection,
  getOSPFNeighbors,
  getBGPSummary,
  getSFPInfo,
  getAllSFPInfo
};
