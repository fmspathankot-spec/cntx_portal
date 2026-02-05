/**
 * SSH Client Helper for Tejas Router Connections
 * Handles SSH connections and command execution
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
 * Get SFP transceiver details from router
 * @param {Object} router - Router object
 * @returns {Promise<string>} SFP transceiver output
 */
async function getSFPInfo(router) {
  return await executeCommand(router, 'show interfaces transceiver detail');
}

/**
 * Get SFP statistics from router
 * @param {Object} router - Router object
 * @returns {Promise<string>} SFP statistics output
 */
async function getSFPStats(router) {
  return await executeCommand(router, 'show interfaces transceiver statistics');
}

module.exports = {
  executeCommand,
  testConnection,
  getOSPFNeighbors,
  getBGPSummary,
  getSFPInfo,
  getSFPStats
};
