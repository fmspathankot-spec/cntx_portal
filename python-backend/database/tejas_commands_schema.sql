-- ============================================
-- Tejas Router Specific Commands and Parsers
-- Based on actual command outputs
-- ============================================

-- Clear existing Tejas-specific data
DELETE FROM parameter_parsers WHERE parameter_id IN (
    SELECT id FROM monitoring_parameters 
    WHERE parameter_name LIKE 'TEJAS_%'
);
DELETE FROM monitoring_parameters WHERE parameter_name LIKE 'TEJAS_%';

-- ============================================
-- 1. OSPF Neighbor Monitoring
-- Command: sh ip ospf ne
-- ============================================

INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, description, command_template, applies_to) 
VALUES 
('TEJAS_OSPF_NEIGHBORS', 'ROUTING', 'OSPF Neighbor Status', 'sh ip ospf ne', 'ROUTER');

-- Get the parameter_id for OSPF
DO $$
DECLARE
    ospf_param_id INTEGER;
BEGIN
    SELECT id INTO ospf_param_id FROM monitoring_parameters WHERE parameter_name = 'TEJAS_OSPF_NEIGHBORS';
    
    -- Parsers for OSPF neighbors (extracts each neighbor as separate entry)
    INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
    (ospf_param_id, 'neighbor_count', 'Neighbor-ID.*?\n.*?-{3,}((?:\n\s+[\d.]+.*?)+)', 'custom', '', 1),
    (ospf_param_id, 'neighbor_id', '^\s+([\d.]+)\s+\d+\s+\w+', 'string', '', 2),
    (ospf_param_id, 'state', '^\s+[\d.]+\s+\d+\s+(\w+/?\w*)', 'string', '', 3),
    (ospf_param_id, 'dead_time', '^\s+[\d.]+\s+\d+\s+\w+/?\w*\s+(\d+)', 'number', 'sec', 4),
    (ospf_param_id, 'neighbor_address', '^\s+[\d.]+\s+\d+\s+\w+/?\w*\s+\d+\s+([\d.]+)', 'string', '', 5),
    (ospf_param_id, 'interface', '^\s+[\d.]+\s+\d+\s+\w+/?\w*\s+\d+\s+[\d.]+\s+(\S+)', 'string', '', 6),
    (ospf_param_id, 'bfd_status', '^\s+[\d.]+\s+\d+\s+\w+/?\w*\s+\d+\s+[\d.]+\s+\S+\s+\S+\s+\d+\s+\S+\s+(\w+)', 'string', '', 7),
    (ospf_param_id, 'area_id', '^\s+[\d.]+\s+\d+\s+\w+/?\w*\s+\d+\s+[\d.]+\s+\S+\s+\S+\s+\d+\s+\S+\s+\w+\s+([\d.]+)', 'string', '', 8);
END $$;

-- ============================================
-- 2. BGP Summary Monitoring
-- Command: sh ip bgp summary sorted
-- ============================================

INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, description, command_template, applies_to) 
VALUES 
('TEJAS_BGP_SUMMARY', 'ROUTING', 'BGP Summary Status', 'sh ip bgp summary sorted', 'ROUTER');

DO $$
DECLARE
    bgp_param_id INTEGER;
BEGIN
    SELECT id INTO bgp_param_id FROM monitoring_parameters WHERE parameter_name = 'TEJAS_BGP_SUMMARY';
    
    -- Parsers for BGP summary
    INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
    (bgp_param_id, 'router_id', 'BGP router identifier is ([\d.]+)', 'string', '', 1),
    (bgp_param_id, 'local_as', 'Local AS number (\d+)', 'number', '', 2),
    (bgp_param_id, 'established_count', 'Established Count\s*:\s*(\d+)', 'number', '', 3),
    (bgp_param_id, 'configured_count', 'Configured count\s*:\s*(\d+)', 'number', '', 4),
    (bgp_param_id, 'total_change_version', 'Total Change version\s*:\s*(\d+)', 'number', '', 5),
    (bgp_param_id, 'forwarding_state', 'Forwarding State is (\w+)', 'string', '', 6);
END $$;

-- ============================================
-- 3. SFP 100G Basic Info
-- Command: sh sfp 100g {interface}
-- ============================================

INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, description, command_template, applies_to) 
VALUES 
('TEJAS_SFP_100G_INFO', 'OPTICAL', '100G SFP Information', 'sh sfp 100g {interface}', 'INTERFACE');

DO $$
DECLARE
    sfp_param_id INTEGER;
BEGIN
    SELECT id INTO sfp_param_id FROM monitoring_parameters WHERE parameter_name = 'TEJAS_SFP_100G_INFO';
    
    -- Parsers for SFP 100G
    INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
    (sfp_param_id, 'parent_interface', 'Parent\s*:\s*(.+)', 'string', '', 1),
    (sfp_param_id, 'laser_status', 'MSA Laser Status\s*:\s*(\w+)', 'string', '', 2),
    (sfp_param_id, 'present_status', 'Present Status\s*:\s*(\w+)', 'string', '', 3),
    (sfp_param_id, 'operational_status', 'Operational Status\s*:\s*(\w+)', 'string', '', 4),
    (sfp_param_id, 'laser_type', 'Laser Type\s*:\s*(.+)', 'string', '', 5),
    (sfp_param_id, 'als_mode', 'ALS Mode\s*:\s*(\w+)', 'string', '', 6),
    (sfp_param_id, 'distance_range', 'Distance Range\s*:\s*(\d+)', 'number', 'km', 7),
    (sfp_param_id, 'nominal_bit_rate', 'Nominal Bit Rate.*?:\s*([\d.]+)', 'number', 'Gbps', 8),
    (sfp_param_id, 'rx_power', 'RxPower\s*:\s*([-\d.]+)', 'number', 'dBm', 9),
    (sfp_param_id, 'tx_power', 'TxPower\s*:\s*([-\d.]+)', 'number', 'dBm', 10),
    (sfp_param_id, 'laser_coherent', 'Laser Coherent\s*:\s*(\w+)', 'string', '', 11),
    (sfp_param_id, 'module_temperature', 'Module Temperature.*?:\s*([-\d.]+)', 'number', 'C', 12),
    (sfp_param_id, 'module_voltage', 'Module Voltage.*?:\s*([-\d.]+)', 'number', 'V', 13),
    (sfp_param_id, 'product_code', 'Product Code\s*:\s*(.+)', 'string', '', 14),
    (sfp_param_id, 'serial_number', 'Serial Number\s*:\s*(.+)', 'string', '', 15),
    (sfp_param_id, 'vendor_name', 'Vendor Name\s*:\s*(.+)', 'string', '', 16);
END $$;

-- ============================================
-- 4. SFP 100G Statistics
-- Command: sh sfp stats 100g {interface}
-- ============================================

INSERT INTO monitoring_parameters 
(parameter_name, parameter_category, description, command_template, applies_to) 
VALUES 
('TEJAS_SFP_100G_STATS', 'OPTICAL', '100G SFP Statistics', 'sh sfp stats 100g {interface}', 'INTERFACE');

DO $$
DECLARE
    stats_param_id INTEGER;
BEGIN
    SELECT id INTO stats_param_id FROM monitoring_parameters WHERE parameter_name = 'TEJAS_SFP_100G_STATS';
    
    -- Parsers for SFP Stats
    INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
    (stats_param_id, 'interval_seconds', 'CURRENT COUNTERS \((\d+)\)secs', 'number', 'sec', 1),
    (stats_param_id, 'rx_power_lane0', 'Received Power.*?0=([-\d.]+)', 'number', 'dBm', 2),
    (stats_param_id, 'rx_power_lane1', 'Received Power.*?1=([-\d.]+)', 'number', 'dBm', 3),
    (stats_param_id, 'rx_power_lane2', 'Received Power.*?2=([-\d.]+)', 'number', 'dBm', 4),
    (stats_param_id, 'rx_power_lane3', 'Received Power.*?3=([-\d.]+)', 'number', 'dBm', 5),
    (stats_param_id, 'tx_power_lane0', 'Transmit Power.*?0=([-\d.]+)', 'number', 'dBm', 6),
    (stats_param_id, 'tx_power_lane1', 'Transmit Power.*?1=([-\d.]+)', 'number', 'dBm', 7),
    (stats_param_id, 'tx_power_lane2', 'Transmit Power.*?2=([-\d.]+)', 'number', 'dBm', 8),
    (stats_param_id, 'tx_power_lane3', 'Transmit Power.*?3=([-\d.]+)', 'number', 'dBm', 9),
    (stats_param_id, 'bias_current_lane0', 'Tx Laser Bias Current.*?0=([-\d.]+)', 'number', 'mA', 10),
    (stats_param_id, 'bias_current_lane1', 'Tx Laser Bias Current.*?1=([-\d.]+)', 'number', 'mA', 11),
    (stats_param_id, 'bias_current_lane2', 'Tx Laser Bias Current.*?2=([-\d.]+)', 'number', 'mA', 12),
    (stats_param_id, 'bias_current_lane3', 'Tx Laser Bias Current.*?3=([-\d.]+)', 'number', 'mA', 13),
    (stats_param_id, 'module_voltage', 'Module Voltage.*?:\s*([-\d.]+)', 'number', 'V', 14),
    (stats_param_id, 'module_temperature', 'Module Temperature.*?:\s*([-\d.]+)', 'number', 'C', 15),
    (stats_param_id, 'interval_valid', 'Interval Valid\s*:\s*(\d+)', 'number', '', 16);
END $$;

-- ============================================
-- Sample Data - Update existing routers
-- ============================================

-- Update router device type to 'tejas'
UPDATE routers SET device_type = 'tejas' WHERE hostname LIKE '%GU-7004%';

-- Or insert new Tejas router
INSERT INTO routers (hostname, ip_address, ssh_port, username, password, device_type, location, description) 
VALUES 
('xxx-xxx-B41-GU-7004', '10.125.x.x', 22, 'admin', 'password', 'tejas', 'Location', 'Tejas Router')
ON CONFLICT (hostname) DO UPDATE SET device_type = 'tejas';

-- Add interface for the router
INSERT INTO router_interfaces (router_id, interface_name, interface_label, interface_type) 
SELECT id, '1/1/1', 'Interface 1/1/1', '100G'
FROM routers WHERE hostname = 'xxx-xxx-B41-GU-7004'
ON CONFLICT (router_id, interface_name) DO NOTHING;

-- ============================================
-- Views for Tejas-specific data
-- ============================================

-- View: Latest OSPF Neighbors
CREATE OR REPLACE VIEW v_tejas_ospf_neighbors AS
SELECT 
    r.hostname,
    r.ip_address,
    pr.reading_data->>'neighbor_id' as neighbor_id,
    pr.reading_data->>'state' as state,
    pr.reading_data->>'neighbor_address' as neighbor_address,
    pr.reading_data->>'interface' as interface,
    pr.reading_data->>'bfd_status' as bfd_status,
    pr.reading_data->>'area_id' as area_id,
    pr.reading_time
FROM parameter_readings pr
JOIN routers r ON pr.router_id = r.id
JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
WHERE mp.parameter_name = 'TEJAS_OSPF_NEIGHBORS'
  AND pr.reading_time = (
      SELECT MAX(reading_time)
      FROM parameter_readings
      WHERE router_id = pr.router_id
        AND parameter_id = pr.parameter_id
  )
ORDER BY r.hostname, pr.reading_data->>'neighbor_id';

-- View: Latest BGP Summary
CREATE OR REPLACE VIEW v_tejas_bgp_summary AS
SELECT 
    r.hostname,
    r.ip_address,
    pr.reading_data->>'router_id' as bgp_router_id,
    pr.reading_data->>'local_as' as local_as,
    pr.reading_data->>'established_count' as established_count,
    pr.reading_data->>'configured_count' as configured_count,
    pr.reading_data->>'forwarding_state' as forwarding_state,
    pr.reading_time
FROM parameter_readings pr
JOIN routers r ON pr.router_id = r.id
JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
WHERE mp.parameter_name = 'TEJAS_BGP_SUMMARY'
  AND pr.reading_time = (
      SELECT MAX(reading_time)
      FROM parameter_readings
      WHERE router_id = pr.router_id
        AND parameter_id = pr.parameter_id
  )
ORDER BY r.hostname;

-- View: Latest SFP 100G Info
CREATE OR REPLACE VIEW v_tejas_sfp_100g_info AS
SELECT 
    r.hostname,
    ri.interface_name,
    ri.interface_label,
    pr.reading_data->>'laser_status' as laser_status,
    pr.reading_data->>'operational_status' as operational_status,
    pr.reading_data->>'laser_type' as laser_type,
    pr.reading_data->>'rx_power' as rx_power,
    pr.reading_data->>'tx_power' as tx_power,
    pr.reading_data->>'module_temperature' as temperature,
    pr.reading_data->>'module_voltage' as voltage,
    pr.reading_data->>'vendor_name' as vendor,
    pr.reading_data->>'serial_number' as serial_number,
    pr.reading_time
FROM parameter_readings pr
JOIN routers r ON pr.router_id = r.id
JOIN router_interfaces ri ON pr.interface_id = ri.id
JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
WHERE mp.parameter_name = 'TEJAS_SFP_100G_INFO'
  AND pr.reading_time = (
      SELECT MAX(reading_time)
      FROM parameter_readings
      WHERE interface_id = pr.interface_id
        AND parameter_id = pr.parameter_id
  )
ORDER BY r.hostname, ri.interface_name;

-- View: Latest SFP 100G Stats (with all lanes)
CREATE OR REPLACE VIEW v_tejas_sfp_100g_stats AS
SELECT 
    r.hostname,
    ri.interface_name,
    ri.interface_label,
    pr.reading_data->>'rx_power_lane0' as rx_power_lane0,
    pr.reading_data->>'rx_power_lane1' as rx_power_lane1,
    pr.reading_data->>'rx_power_lane2' as rx_power_lane2,
    pr.reading_data->>'rx_power_lane3' as rx_power_lane3,
    pr.reading_data->>'tx_power_lane0' as tx_power_lane0,
    pr.reading_data->>'tx_power_lane1' as tx_power_lane1,
    pr.reading_data->>'tx_power_lane2' as tx_power_lane2,
    pr.reading_data->>'tx_power_lane3' as tx_power_lane3,
    pr.reading_data->>'module_temperature' as temperature,
    pr.reading_data->>'module_voltage' as voltage,
    pr.reading_time
FROM parameter_readings pr
JOIN routers r ON pr.router_id = r.id
JOIN router_interfaces ri ON pr.interface_id = ri.id
JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
WHERE mp.parameter_name = 'TEJAS_SFP_100G_STATS'
  AND pr.reading_time = (
      SELECT MAX(reading_time)
      FROM parameter_readings
      WHERE interface_id = pr.interface_id
        AND parameter_id = pr.parameter_id
  )
ORDER BY r.hostname, ri.interface_name;

-- ============================================
-- Useful Queries
-- ============================================

-- Get all Tejas monitoring parameters
-- SELECT * FROM monitoring_parameters WHERE parameter_name LIKE 'TEJAS_%';

-- Get latest OSPF neighbors
-- SELECT * FROM v_tejas_ospf_neighbors;

-- Get latest BGP summary
-- SELECT * FROM v_tejas_bgp_summary;

-- Get latest SFP info
-- SELECT * FROM v_tejas_sfp_100g_info;

-- Get latest SFP stats
-- SELECT * FROM v_tejas_sfp_100g_stats;

-- Get all readings for a specific router
-- SELECT 
--     mp.parameter_name,
--     pr.reading_data,
--     pr.reading_time
-- FROM parameter_readings pr
-- JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
-- WHERE pr.router_id = (SELECT id FROM routers WHERE hostname = 'xxx-xxx-B41-GU-7004')
-- ORDER BY pr.reading_time DESC;
