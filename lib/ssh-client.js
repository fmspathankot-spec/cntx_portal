/**
 * SSH Client Helper for Tejas Router Connections
 * Handles SSH connections and command execution
 * Uses same commands as Python backend for consistency
 */

const { NodeSSH } = require('node-ssh');

/**
 * Execute command on router via SSH
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
    console.log(`[SSH] Executing: ${command}`);
    
    // Execute command
    const result = await ssh.execCommand(command, {
      cwd: '/',
      timeout: timeout,
    });
    
    if (result.code !== 0) {
      console.error(`[SSH] Command failed with code ${result.code}`);
      console.error(`[SSH] Error: ${result.stderr}`);
      throw new Error(`Command failed: ${result.stderr || 'Unknown error'}`);
    }
    
    console.log(`[SSH] Command executed successfully`);
    
    // Close connection
    ssh.dispose();
    
    return result.stdout;
    
  } catch (error) {
    console.error(`[SSH] Error executing command on ${router.hostname}:`, error.message);
    ssh.dispose();
    throw error;
  }
}

/**
 * Test SSH connection to router
 * @param {Object} router - Router object
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection(router) {
  try {
    const output = await executeCommand(router, 'show version', 10000);
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
  return await executeCommand(router, 'show ip ospf neighbor');
}

/**
 * Get BGP summary from router
 * @param {Object} router - Router object
 * @returns {Promise<string>} BGP summary output
 */
async function getBGPSummary(router) {
  return await executeCommand(router, 'show ip bgp summary');
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
  return await executeCommand(router, command);
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
  testConnection,
  getOSPFNeighbors,
  getBGPSummary,
  getSFPInfo,
  getAllSFPInfo
};
