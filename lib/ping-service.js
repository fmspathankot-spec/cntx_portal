/**
 * Background Ping Service
 * Starts ping monitoring when server starts
 */

const { startMonitoring } = require('./ping-monitor');
const { query } = require('./db');

let monitoringInterval = null;

/**
 * Get all active Tejas routers from database
 */
async function getActiveRouters() {
  try {
    const result = await query(`
      SELECT id, hostname, ip_address, is_active
      FROM routers
      WHERE device_type = 'tejas' AND is_active = true
      ORDER BY hostname
    `);
    
    return result.rows;
  } catch (error) {
    console.error('[PING SERVICE] Error fetching routers:', error);
    return [];
  }
}

/**
 * Start the ping monitoring service
 */
function startPingService() {
  if (monitoringInterval) {
    console.log('[PING SERVICE] Already running');
    return;
  }
  
  console.log('[PING SERVICE] Starting background ping monitoring...');
  
  // Start monitoring with 5 minute interval
  monitoringInterval = startMonitoring(getActiveRouters, 5 * 60 * 1000);
  
  console.log('[PING SERVICE] Background ping monitoring started (5 min interval)');
}

/**
 * Stop the ping monitoring service
 */
function stopPingService() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('[PING SERVICE] Background ping monitoring stopped');
  }
}

module.exports = {
  startPingService,
  stopPingService
};
