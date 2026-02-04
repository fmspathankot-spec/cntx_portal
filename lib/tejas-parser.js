/**
 * Tejas Router Output Parser
 * Parses command outputs into structured JSON
 */

/**
 * Parse OSPF neighbors output
 * @param {string} output - Raw OSPF neighbors output
 * @returns {Object} Parsed OSPF data
 */
function parseOSPFNeighbors(output) {
  const neighbors = [];
  const lines = output.split('\n');
  
  let neighborCount = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and headers
    if (!trimmed || trimmed.includes('Neighbor ID') || trimmed.includes('---')) {
      continue;
    }
    
    // Parse neighbor line
    // Format: Neighbor ID    Pri   State           Dead Time   Address         Interface
    const parts = trimmed.split(/\s+/);
    
    if (parts.length >= 6) {
      const neighbor = {
        neighbor_id: parts[0],
        priority: parts[1],
        state: parts[2],
        dead_time: parts[3],
        neighbor_address: parts[4],
        interface: parts[5],
        area_id: parts[6] || '0.0.0.0',
        bfd_status: parts[7] || 'Disabled'
      };
      
      neighbors.push(neighbor);
      neighborCount++;
    }
  }
  
  return {
    neighbor_count: neighborCount,
    neighbors: neighbors,
    timestamp: new Date().toISOString()
  };
}

/**
 * Parse BGP summary output
 * @param {string} output - Raw BGP summary output
 * @returns {Object} Parsed BGP data
 */
function parseBGPSummary(output) {
  const lines = output.split('\n');
  
  let routerId = null;
  let localAs = null;
  let configuredCount = 0;
  let establishedCount = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Extract Router ID
    if (trimmed.includes('BGP router identifier')) {
      const match = trimmed.match(/identifier\s+([\d.]+)/);
      if (match) routerId = match[1];
    }
    
    // Extract Local AS
    if (trimmed.includes('local AS number')) {
      const match = trimmed.match(/AS number\s+(\d+)/);
      if (match) localAs = match[1];
    }
    
    // Count configured peers
    if (trimmed.match(/^\d+\.\d+\.\d+\.\d+/)) {
      configuredCount++;
      
      // Check if established
      if (trimmed.includes('Established')) {
        establishedCount++;
      }
    }
  }
  
  return {
    router_id: routerId,
    local_as: localAs,
    configured_count: configuredCount,
    established_count: establishedCount,
    forwarding_state: establishedCount > 0 ? 'Active' : 'Inactive',
    timestamp: new Date().toISOString()
  };
}

/**
 * Parse SFP info output
 * @param {string} output - Raw SFP info output
 * @returns {Object} Parsed SFP info
 */
function parseSFPInfo(output) {
  const lines = output.split('\n');
  
  const info = {
    laser_status: 'Unknown',
    rx_power: null,
    tx_power: null,
    module_temperature: null,
    module_voltage: null,
    vendor_name: null,
    part_number: null,
    serial_number: null
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Parse laser status
    if (trimmed.includes('Laser')) {
      info.laser_status = trimmed.includes('ON') ? 'ON' : 'OFF';
    }
    
    // Parse RX power
    if (trimmed.includes('Rx Power')) {
      const match = trimmed.match(/([-\d.]+)\s*dBm/);
      if (match) info.rx_power = parseFloat(match[1]);
    }
    
    // Parse TX power
    if (trimmed.includes('Tx Power')) {
      const match = trimmed.match(/([-\d.]+)\s*dBm/);
      if (match) info.tx_power = parseFloat(match[1]);
    }
    
    // Parse temperature
    if (trimmed.includes('Temperature')) {
      const match = trimmed.match(/([\d.]+)\s*C/);
      if (match) info.module_temperature = parseFloat(match[1]);
    }
    
    // Parse voltage
    if (trimmed.includes('Voltage')) {
      const match = trimmed.match(/([\d.]+)\s*V/);
      if (match) info.module_voltage = parseFloat(match[1]);
    }
    
    // Parse vendor info
    if (trimmed.includes('Vendor Name')) {
      const match = trimmed.match(/:\s*(.+)$/);
      if (match) info.vendor_name = match[1].trim();
    }
    
    if (trimmed.includes('Part Number')) {
      const match = trimmed.match(/:\s*(.+)$/);
      if (match) info.part_number = match[1].trim();
    }
    
    if (trimmed.includes('Serial Number')) {
      const match = trimmed.match(/:\s*(.+)$/);
      if (match) info.serial_number = match[1].trim();
    }
  }
  
  return info;
}

/**
 * Parse SFP stats output (lane-based)
 * @param {string} output - Raw SFP stats output
 * @returns {Object} Parsed SFP stats
 */
function parseSFPStats(output) {
  const lines = output.split('\n');
  
  const stats = {
    rx_power_lane0: null,
    rx_power_lane1: null,
    rx_power_lane2: null,
    rx_power_lane3: null,
    tx_power_lane0: null,
    tx_power_lane1: null,
    tx_power_lane2: null,
    tx_power_lane3: null,
    rx_power_avg: null,
    tx_power_avg: null
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Parse lane-specific power
    for (let lane = 0; lane < 4; lane++) {
      if (trimmed.includes(`Lane ${lane}`) || trimmed.includes(`Lane${lane}`)) {
        // RX power
        if (trimmed.includes('Rx')) {
          const match = trimmed.match(/([-\d.]+)\s*dBm/);
          if (match) stats[`rx_power_lane${lane}`] = parseFloat(match[1]);
        }
        
        // TX power
        if (trimmed.includes('Tx')) {
          const match = trimmed.match(/([-\d.]+)\s*dBm/);
          if (match) stats[`tx_power_lane${lane}`] = parseFloat(match[1]);
        }
      }
    }
  }
  
  // Calculate averages
  const rxPowers = [
    stats.rx_power_lane0,
    stats.rx_power_lane1,
    stats.rx_power_lane2,
    stats.rx_power_lane3
  ].filter(p => p !== null);
  
  const txPowers = [
    stats.tx_power_lane0,
    stats.tx_power_lane1,
    stats.tx_power_lane2,
    stats.tx_power_lane3
  ].filter(p => p !== null);
  
  if (rxPowers.length > 0) {
    stats.rx_power_avg = (rxPowers.reduce((a, b) => a + b, 0) / rxPowers.length).toFixed(2);
  }
  
  if (txPowers.length > 0) {
    stats.tx_power_avg = (txPowers.reduce((a, b) => a + b, 0) / txPowers.length).toFixed(2);
  }
  
  return stats;
}

module.exports = {
  parseOSPFNeighbors,
  parseBGPSummary,
  parseSFPInfo,
  parseSFPStats
};
