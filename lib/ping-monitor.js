/**
 * Ping Monitor for Router Status
 * Tracks router availability with periodic ping checks
 * Saves status to database for persistence
 * Uses native ping command for Windows compatibility
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const { query } = require('./db');

/**
 * Parse Windows ping output
 */
function parseWindowsPing(output) {
  const lines = output.split('\n');
  
  // Check if host is reachable
  const isAlive = !output.includes('Request timed out') && 
                  !output.includes('Destination host unreachable') &&
                  !output.includes('could not find host');
  
  // Extract average time
  let avgTime = null;
  for (const line of lines) {
    // Look for: Average = 10ms
    const match = line.match(/Average\s*=\s*(\d+)ms/i);
    if (match) {
      avgTime = parseFloat(match[1]);
      break;
    }
    // Alternative format: time=10ms
    const match2 = line.match(/time[=<]\s*(\d+)ms/i);
    if (match2) {
      avgTime = parseFloat(match2[1]);
    }
  }
  
  // Extract packet loss
  let packetLoss = null;
  for (const line of lines) {
    // Look for: (0% loss)
    const match = line.match(/\((\d+)%\s+loss\)/i);
    if (match) {
      packetLoss = parseFloat(match[1]);
      break;
    }
  }
  
  return {
    alive: isAlive,
    time: avgTime,
    packetLoss: packetLoss
  };
}

/**
 * Ping using native command
 */
async function nativePing(ipAddress) {
  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `ping -n 3 ${ipAddress}`  // Windows: -n for count
      : `ping -c 3 ${ipAddress}`; // Linux/Mac: -c for count
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 10000
    });
    
    if (isWindows) {
      return parseWindowsPing(stdout);
    } else {
      // For Linux/Mac, use existing ping library
      const ping = require('ping');
      return await ping.promise.probe(ipAddress, {
        timeout: 5,
        extra: ['-c', '3']
      });
    }
  } catch (error) {
    // Command failed - host unreachable
    return {
      alive: false,
      time: null,
      packetLoss: 100
    };
  }
}

/**
 * Parse response time to number or null
 */
function parseResponseTime(time) {
  if (time === null || time === undefined || time === 'unknown') {
    return null;
  }
  const parsed = parseFloat(time);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse packet loss to number or null
 */
function parsePacketLoss(loss) {
  if (loss === null || loss === undefined || loss === 'unknown') {
    return null;
  }
  const parsed = parseFloat(loss);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Ping a single router and save to database
 * @param {Object} router - Router object with ip_address
 * @returns {Promise<Object>} Ping result
 */
async function pingRouter(router) {
  try {
    console.log(`[PING] Pinging ${router.hostname} (${router.ip_address})...`);
    
    const result = await nativePing(router.ip_address);
    
    const responseTime = parseResponseTime(result.time);
    const packetLoss = parsePacketLoss(result.packetLoss);
    
    const status = {
      router_id: router.id,
      hostname: router.hostname,
      ip_address: router.ip_address,
      is_online: result.alive,
      response_time: responseTime,
      packet_loss: packetLoss,
      last_checked: new Date().toISOString(),
      error_message: null
    };
    
    // Save to database
    await query(`
      SELECT update_router_ping_status($1, $2, $3, $4, $5)
    `, [
      router.id,
      result.alive,
      responseTime,
      packetLoss,
      null
    ]);
    
    console.log(`[PING] ${router.hostname}: ${result.alive ? 'ONLINE' : 'OFFLINE'} (${responseTime || 'N/A'}ms)`);
    
    return status;
  } catch (error) {
    console.error(`[PING] Error pinging ${router.hostname}:`, error.message);
    
    const status = {
      router_id: router.id,
      hostname: router.hostname,
      ip_address: router.ip_address,
      is_online: false,
      response_time: null,
      packet_loss: 100,
      last_checked: new Date().toISOString(),
      error_message: error.message
    };
    
    // Save error to database
    try {
      await query(`
        SELECT update_router_ping_status($1, $2, $3, $4, $5)
      `, [
        router.id,
        false,
        null,
        100,
        error.message
      ]);
    } catch (dbError) {
      console.error(`[PING] Error saving to DB:`, dbError.message);
    }
    
    return status;
  }
}

/**
 * Ping all routers and save to database
 * @param {Array} routers - Array of router objects
 * @returns {Promise<Array>} Array of ping results
 */
async function pingAllRouters(routers) {
  console.log(`[PING] Pinging ${routers.length} routers...`);
  
  const results = await Promise.all(
    routers.map(router => pingRouter(router))
  );
  
  const onlineCount = results.filter(r => r.is_online).length;
  console.log(`[PING] Results: ${onlineCount}/${routers.length} routers online`);
  
  return results;
}

/**
 * Get ping status from database
 * @param {number} routerId - Router ID
 * @returns {Promise<Object|null>} Ping status or null
 */
async function getPingStatus(routerId) {
  try {
    const result = await query(`
      SELECT 
        rps.router_id,
        r.hostname,
        r.ip_address,
        rps.is_online,
        rps.response_time,
        rps.packet_loss,
        rps.last_checked,
        rps.error_message
      FROM router_ping_status rps
      JOIN routers r ON rps.router_id = r.id
      WHERE rps.router_id = $1
    `, [routerId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('[PING] Error fetching status from DB:', error.message);
    return null;
  }
}

/**
 * Get all ping statuses from database
 * @returns {Promise<Array>} Array of all ping statuses
 */
async function getAllPingStatuses() {
  try {
    const result = await query(`
      SELECT 
        rps.router_id,
        r.hostname,
        r.ip_address,
        rps.is_online,
        rps.response_time,
        rps.packet_loss,
        rps.last_checked,
        rps.error_message
      FROM router_ping_status rps
      JOIN routers r ON rps.router_id = r.id
      ORDER BY r.hostname
    `);
    
    return result.rows;
  } catch (error) {
    console.error('[PING] Error fetching statuses from DB:', error.message);
    return [];
  }
}

/**
 * Start periodic ping monitoring
 * @param {Function} getRouters - Function to fetch routers from DB
 * @param {number} interval - Interval in milliseconds (default: 5 minutes)
 */
function startMonitoring(getRouters, interval = 5 * 60 * 1000) {
  console.log(`[PING] Starting monitoring with ${interval/1000}s interval`);
  
  // Initial ping
  (async () => {
    try {
      const routers = await getRouters();
      await pingAllRouters(routers);
    } catch (error) {
      console.error('[PING] Error in initial ping:', error);
    }
  })();
  
  // Periodic ping
  const intervalId = setInterval(async () => {
    try {
      const routers = await getRouters();
      await pingAllRouters(routers);
    } catch (error) {
      console.error('[PING] Error in periodic ping:', error);
    }
  }, interval);
  
  return intervalId;
}

module.exports = {
  pingRouter,
  pingAllRouters,
  getPingStatus,
  getAllPingStatuses,
  startMonitoring
};
