/**
 * Ping Monitor for Router Status
 * Tracks router availability with periodic ping checks
 * Saves status to database for persistence
 */

const ping = require('ping');
const { query } = require('./db');

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
    const result = await ping.promise.probe(router.ip_address, {
      timeout: 5,
      extra: ['-c', '3'], // Send 3 packets
    });
    
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
