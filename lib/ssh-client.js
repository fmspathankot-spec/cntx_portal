/**
 * SSH Client Helper for Tejas Router Connections
 * Handles SSH connections and command execution
 * Uses same approach as Python backend - single session for multiple commands
 */

const { Client } = require('ssh2');

/**
 * Execute single command using shell (matches Python paramiko behavior)
 * @param {Object} router - Router object
 * @param {string} command - Command to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<string>} Command output
 */
async function executeCommandWithShell(router, command, timeout = 15000) {
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
 * Execute multiple commands in single SSH session
 * This is more efficient - one login for all commands
 * @param {Object} router - Router object
 * @param {Array<string>} commands - Array of commands to execute
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Object with command outputs
 */
async function executeMultipleCommands(router, commands, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let output = '';
    const results = {};
    
    conn.on('ready', () => {
      console.log(`[SSH] Connected to ${router.hostname} for ${commands.length} commands`);
      
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
          
          // Split output by commands
          commands.forEach((cmd, index) => {
            results[cmd] = output; // Store full output for each command
          });
          
          resolve({ fullOutput: output, results });
        });
        
        stream.stderr.on('data', (data) => {
          console.error('[SSH] STDERR:', data.toString());
        });
        
        let delay = 500;
        
        // Initial setup
        setTimeout(() => {
          console.log('[SSH] Sending: conf t');
          stream.write('conf t\n');
        }, delay);
        delay += 500;
        
        setTimeout(() => {
          console.log('[SSH] Sending: set cli pagination off');
          stream.write('set cli pagination off\n');
        }, delay);
        delay += 500;
        
        setTimeout(() => {
          console.log('[SSH] Sending: end');
          stream.write('end\n');
        }, delay);
        delay += 500;
        
        // Execute all commands
        commands.forEach((cmd) => {
          setTimeout(() => {
            console.log(`[SSH] Sending: ${cmd}`);
            stream.write(`${cmd}\n`);
          }, delay);
          delay += 2000; // 2 seconds between commands
        });
        
        // Exit
        setTimeout(() => {
          console.log('[SSH] Sending: exit');
          stream.write('exit\n');
        }, delay);
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
 * Get SFP info for all monitored interfaces in SINGLE SSH session
 * Much more efficient than multiple connections
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
    
    // Build commands array
    const commands = interfaces.map(iface => {
      const sfpCommand = iface.sfp_command || 'show sfp 100g';
      return `${sfpCommand} ${iface.interface_name}`;
    });
    
    console.log(`[SSH] Executing ${commands.length} SFP commands in single session`);
    
    // Execute all commands in single session
    const { fullOutput } = await executeMultipleCommands(router, commands, 30000);
    
    // Parse output for each interface
    const sfpData = [];
    
    // Split output by command markers
    const outputLines = fullOutput.split('\n');
    
    interfaces.forEach((iface, index) => {
      try {
        const sfpCommand = iface.sfp_command || 'show sfp 100g';
        const commandStr = `${sfpCommand} ${iface.interface_name}`;
        
        // Find command in output and extract relevant section
        const cmdIndex = fullOutput.indexOf(commandStr);
        let interfaceOutput = '';
        
        if (cmdIndex !== -1) {
          // Extract output until next command or end
          const nextCmdIndex = index < commands.length - 1 
            ? fullOutput.indexOf(commands[index + 1], cmdIndex)
            : fullOutput.length;
          
          interfaceOutput = fullOutput.substring(
            cmdIndex, 
            nextCmdIndex !== -1 ? nextCmdIndex : fullOutput.length
          );
        }
        
        sfpData.push({
          interface_id: iface.id,
          interface_name: iface.interface_name,
          interface_label: iface.interface_label,
          sfp_command: sfpCommand,
          output: interfaceOutput || fullOutput // Fallback to full output
        });
        
      } catch (error) {
        console.error(`[SSH] Error parsing SFP for ${iface.interface_name}:`, error.message);
        sfpData.push({
          interface_id: iface.id,
          interface_name: iface.interface_name,
          interface_label: iface.interface_label,
          error: error.message
        });
      }
    });
    
    console.log(`[SSH] Successfully processed ${sfpData.length} interfaces`);
    return sfpData;
    
  } catch (error) {
    console.error(`[SSH] Error fetching SFP data:`, error.message);
    throw error;
  }
}

/**
 * Get all monitoring data (OSPF, BGP, SFP) in SINGLE SSH session
 * Most efficient approach - one login for everything
 * @param {Object} router - Router object with id
 * @returns {Promise<Object>} Object with ospf, bgp, and sfp data
 */
async function getAllMonitoringData(router) {
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
    
    // Build commands array
    const commands = [
      'show ip ospf neighbor',
      'show ip bgp summary'
    ];
    
    // Add SFP commands
    interfaces.forEach(iface => {
      const sfpCommand = iface.sfp_command || 'show sfp 100g';
      commands.push(`${sfpCommand} ${iface.interface_name}`);
    });
    
    console.log(`[SSH] Executing ${commands.length} commands in single session`);
    
    // Execute all commands in single session
    const { fullOutput } = await executeMultipleCommands(router, commands, 45000);
    
    return {
      fullOutput,
      commands,
      interfaces
    };
    
  } catch (error) {
    console.error(`[SSH] Error fetching monitoring data:`, error.message);
    throw error;
  }
}

module.exports = {
  executeCommandWithShell,
  executeMultipleCommands,
  testConnection,
  getOSPFNeighbors,
  getBGPSummary,
  getSFPInfo,
  getAllSFPInfo,
  getAllMonitoringData
};
