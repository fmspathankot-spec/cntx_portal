/**
 * Ping Monitor for Router Status
 * Tracks router availability with periodic ping checks
 */

const ping = require('ping');

// In-memory cache for router status
const routerStatusCache = new Map();

/**
 * Ping a single router
 * @param {Object} router - Router object with ip_address
 * @returns {Promise<Object>} Ping result
 */
async function pingRouter(router) {
  try {
    const result = await ping.promise.probe(router.ip_address, {
      timeout: 5,
      extra: ['-c', '3'], // Send 3 packets
    });
    
    return {
      router_id: router.id,
      hostname: router.hostname,
      ip_address: router.ip_address,
      is_alive: result.alive,
      response_time: result.time || null,
      packet_loss: result.packetLoss || null,
      last_checked: new Date().toISOString(),
      status: result.alive ? 'online' : 'offline'
    };
  } catch (error) {
    console.error(`[PING] Error pinging ${router.hostname}:`, error.message);
    return {
      router_id: router.id,
      hostname: router.hostname,
      ip_address: router.ip_address,
      is_alive: false,
      response_time: null,
      packet_loss: 100,
      last_checked: new Date().toISOString(),
      status: 'offline',
      error: error.message
    };
  }
}

/**
 * Ping all routers and update cache
 * @param {Array} routers - Array of router objects
 * @returns {Promise<Array>} Array of ping results
 */
async function pingAllRouters(routers) {
  console.log(`[PING] Pinging ${routers.length} routers...`);
  
  const results = await Promise.all(
    routers.map(router => pingRouter(router))
  );
  
  // Update cache
  results.forEach(result => {
    routerStatusCache.set(result.router_id, result);
  });
  
  const onlineCount = results.filter(r => r.is_alive).length;
  console.log(`[PING] Results: ${onlineCount}/${routers.length} routers online`);
  
  return results;
}

/**
 * Get cached status for a router
 * @param {number} routerId - Router ID
 * @returns {Object|null} Cached status or null
 */
function getCachedStatus(routerId) {
  return routerStatusCache.get(routerId) || null;
}

/**
 * Get all cached statuses
 * @returns {Array} Array of all cached statuses
 */
function getAllCachedStatuses() {
  return Array.from(routerStatusCache.values());
}

/**
 * Clear cache
 */
function clearCache() {
  routerStatusCache.clear();
  console.log('[PING] Cache cleared');
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
  getCachedStatus,
  getAllCachedStatuses,
  clearCache,
  startMonitoring
};
