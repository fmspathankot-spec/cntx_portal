/**
 * Ping Service Auto-Initialization
 * Automatically starts ping monitoring when server starts
 */

const { startMonitoring } = require('./ping-monitor');
const { query } = require('./db');

let pingServiceRunning = false;
let pingIntervalId = null;

/**
 * Get all active Tejas routers from database
 */
async function getActiveRouters() {
  try {
    const result = await query(`
      SELECT 
        id,
        hostname,
        ip_address,
        device_type
      FROM routers
      WHERE is_active = true
      ORDER BY hostname
    `);
    
    return result.rows;
  } catch (error) {
    console.error('[PING-INIT] Error fetching routers:', error.message);
    return [];
  }
}

/**
 * Initialize and start ping service
 */
async function initializePingService() {
  if (pingServiceRunning) {
    console.log('[PING-INIT] Service already running');
    return { success: true, message: 'Already running' };
  }
  
  try {
    console.log('[PING-INIT] 🚀 Starting ping monitoring service...');
    
    // Start monitoring with 5 minute interval
    pingIntervalId = startMonitoring(getActiveRouters, 5 * 60 * 1000);
    
    pingServiceRunning = true;
    
    console.log('[PING-INIT] ✅ Ping service started successfully');
    console.log('[PING-INIT] 📊 Monitoring interval: 5 minutes');
    
    return {
      success: true,
      message: 'Ping service started',
      interval: '5 minutes'
    };
    
  } catch (error) {
    console.error('[PING-INIT] ❌ Failed to start ping service:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Stop ping service
 */
function stopPingService() {
  if (!pingServiceRunning) {
    return { success: false, message: 'Service not running' };
  }
  
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
  
  pingServiceRunning = false;
  console.log('[PING-INIT] ⏹️ Ping service stopped');
  
  return { success: true, message: 'Service stopped' };
}

/**
 * Get service status
 */
function getPingServiceStatus() {
  return {
    running: pingServiceRunning,
    interval: '5 minutes'
  };
}

module.exports = {
  initializePingService,
  stopPingService,
  getPingServiceStatus
};
