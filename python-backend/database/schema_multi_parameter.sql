-- ============================================
-- Multi-Parameter Router Monitoring System
-- Flexible schema for monitoring ANY router parameters
-- ============================================

-- Drop existing tables
DROP TABLE IF EXISTS parameter_readings CASCADE;
DROP TABLE IF EXISTS parameter_parsers CASCADE;
DROP TABLE IF EXISTS monitoring_parameters CASCADE;
DROP TABLE IF EXISTS router_interfaces CASCADE;
DROP TABLE IF EXISTS routers CASCADE;

-- ============================================
-- Table: routers
-- Stores router connection details
-- ============================================
CREATE TABLE routers (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(100) NOT NULL UNIQUE,
    ip_address VARCHAR(50) NOT NULL,
    ssh_port INTEGER DEFAULT 22,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) DEFAULT 'huawei',
    location VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_routers_hostname ON routers(hostname);
CREATE INDEX idx_routers_active ON routers(is_active);

-- ============================================
-- Table: router_interfaces
-- Stores interface details
-- ============================================
CREATE TABLE router_interfaces (
    id SERIAL PRIMARY KEY,
    router_id INTEGER NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
    interface_name VARCHAR(50) NOT NULL,
    interface_label VARCHAR(100),
    interface_type VARCHAR(50),  -- e.g., '100G', '10G', 'GE', etc.
    is_monitored BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(router_id, interface_name)
);

CREATE INDEX idx_interfaces_router ON router_interfaces(router_id);
CREATE INDEX idx_interfaces_monitored ON router_interfaces(is_monitored);

-- ============================================
-- Table: monitoring_parameters
-- Defines what parameters to monitor
-- ============================================
CREATE TABLE monitoring_parameters (
    id SERIAL PRIMARY KEY,
    parameter_name VARCHAR(100) NOT NULL UNIQUE,  -- e.g., 'SFP_POWER', 'INTERFACE_STATUS', 'CPU_USAGE'
    parameter_category VARCHAR(50),  -- e.g., 'OPTICAL', 'INTERFACE', 'SYSTEM', 'ALARM'
    description TEXT,
    command_template VARCHAR(500),  -- e.g., 'show sfp 100g {interface}', 'show cpu-usage'
    applies_to VARCHAR(50),  -- 'INTERFACE', 'ROUTER', 'BOTH'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parameters_category ON monitoring_parameters(parameter_category);
CREATE INDEX idx_parameters_active ON monitoring_parameters(is_active);

-- ============================================
-- Table: parameter_parsers
-- Regex patterns to extract values from command output
-- ============================================
CREATE TABLE parameter_parsers (
    id SERIAL PRIMARY KEY,
    parameter_id INTEGER NOT NULL REFERENCES monitoring_parameters(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,  -- e.g., 'rx_power', 'tx_power', 'temperature'
    regex_pattern VARCHAR(500) NOT NULL,  -- e.g., 'RxPower\s*:\s*([-\d.]+)'
    data_type VARCHAR(50) DEFAULT 'string',  -- 'string', 'number', 'boolean'
    unit VARCHAR(20),  -- e.g., 'dBm', 'C', '%', 'Mbps'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_parsers_parameter ON parameter_parsers(parameter_id);

-- ============================================
-- Table: parameter_readings
-- Stores all parameter readings (flexible JSON storage)
-- ============================================
CREATE TABLE parameter_readings (
    id SERIAL PRIMARY KEY,
    router_id INTEGER NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
    interface_id INTEGER REFERENCES router_interfaces(id) ON DELETE CASCADE,
    parameter_id INTEGER NOT NULL REFERENCES monitoring_parameters(id) ON DELETE CASCADE,
    reading_data JSONB NOT NULL,  -- Flexible JSON storage for any parameters
    raw_output TEXT,  -- Original command output
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_readings_router ON parameter_readings(router_id);
CREATE INDEX idx_readings_interface ON parameter_readings(interface_id);
CREATE INDEX idx_readings_parameter ON parameter_readings(parameter_id);
CREATE INDEX idx_readings_time ON parameter_readings(reading_time DESC);
CREATE INDEX idx_readings_data ON parameter_readings USING GIN (reading_data);

-- ============================================
-- Sample Data - Monitoring Parameters
-- ============================================

-- 1. SFP/Optical Parameters
INSERT INTO monitoring_parameters (parameter_name, parameter_category, description, command_template, applies_to) VALUES
('SFP_100G_POWER', 'OPTICAL', '100G SFP Power Levels', 'show sfp 100g {interface}', 'INTERFACE'),
('SFP_10G_POWER', 'OPTICAL', '10G SFP Power Levels', 'show sfp 10g {interface}', 'INTERFACE'),
('OPTICAL_MODULE_INFO', 'OPTICAL', 'Optical Module Information', 'display transceiver interface {interface}', 'INTERFACE');

-- 2. Interface Parameters
INSERT INTO monitoring_parameters (parameter_name, parameter_category, description, command_template, applies_to) VALUES
('INTERFACE_STATUS', 'INTERFACE', 'Interface Status and Statistics', 'display interface {interface}', 'INTERFACE'),
('INTERFACE_BRIEF', 'INTERFACE', 'Interface Brief Status', 'display ip interface brief', 'ROUTER'),
('INTERFACE_ERRORS', 'INTERFACE', 'Interface Error Counters', 'display interface {interface} | include error', 'INTERFACE');

-- 3. System Parameters
INSERT INTO monitoring_parameters (parameter_name, parameter_category, description, command_template, applies_to) VALUES
('CPU_USAGE', 'SYSTEM', 'CPU Usage Statistics', 'display cpu-usage', 'ROUTER'),
('MEMORY_USAGE', 'SYSTEM', 'Memory Usage Statistics', 'display memory-usage', 'ROUTER'),
('TEMPERATURE', 'SYSTEM', 'System Temperature', 'display temperature', 'ROUTER'),
('FAN_STATUS', 'SYSTEM', 'Fan Status', 'display fan', 'ROUTER'),
('POWER_SUPPLY', 'SYSTEM', 'Power Supply Status', 'display power', 'ROUTER');

-- 4. Alarm Parameters
INSERT INTO monitoring_parameters (parameter_name, parameter_category, description, command_template, applies_to) VALUES
('ACTIVE_ALARMS', 'ALARM', 'Active Alarms', 'display alarm active', 'ROUTER'),
('ALARM_HISTORY', 'ALARM', 'Alarm History', 'display alarm history', 'ROUTER');

-- 5. Performance Parameters
INSERT INTO monitoring_parameters (parameter_name, parameter_category, description, command_template, applies_to) VALUES
('INTERFACE_TRAFFIC', 'PERFORMANCE', 'Interface Traffic Statistics', 'display interface {interface} | include rate', 'INTERFACE'),
('QOS_STATISTICS', 'PERFORMANCE', 'QoS Statistics', 'display qos queue statistics interface {interface}', 'INTERFACE');

-- ============================================
-- Sample Data - Parameter Parsers
-- ============================================

-- Parsers for SFP_100G_POWER
INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
(1, 'rx_power', 'RxPower\s*:\s*([-\d.]+)', 'number', 'dBm', 1),
(1, 'tx_power', 'TxPower\s*:\s*([-\d.]+)', 'number', 'dBm', 2),
(1, 'laser_type', 'Laser Type\s*:\s*([^\n\r]+)', 'string', '', 3),
(1, 'temperature', 'Temperature\s*:\s*([-\d.]+)', 'number', 'C', 4),
(1, 'voltage', 'Voltage\s*:\s*([-\d.]+)', 'number', 'V', 5),
(1, 'bias_current', 'Bias Current\s*:\s*([-\d.]+)', 'number', 'mA', 6);

-- Parsers for CPU_USAGE
INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
(6, 'cpu_usage_5sec', 'CPU usage for five seconds:\s*([\d.]+)%', 'number', '%', 1),
(6, 'cpu_usage_1min', 'one minute:\s*([\d.]+)%', 'number', '%', 2),
(6, 'cpu_usage_5min', 'five minutes:\s*([\d.]+)%', 'number', '%', 3);

-- Parsers for MEMORY_USAGE
INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
(7, 'memory_total', 'Total Memory:\s*([\d.]+)', 'number', 'MB', 1),
(7, 'memory_used', 'Used Memory:\s*([\d.]+)', 'number', 'MB', 2),
(7, 'memory_free', 'Free Memory:\s*([\d.]+)', 'number', 'MB', 3),
(7, 'memory_usage_percent', 'Memory Utilization:\s*([\d.]+)%', 'number', '%', 4);

-- Parsers for TEMPERATURE
INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
(8, 'board_temp', 'Board Temperature:\s*([-\d.]+)', 'number', 'C', 1),
(8, 'inlet_temp', 'Inlet Temperature:\s*([-\d.]+)', 'number', 'C', 2),
(8, 'outlet_temp', 'Outlet Temperature:\s*([-\d.]+)', 'number', 'C', 3);

-- Parsers for INTERFACE_STATUS
INSERT INTO parameter_parsers (parameter_id, field_name, regex_pattern, data_type, unit, display_order) VALUES
(4, 'admin_status', 'Line protocol current state\s*:\s*(\w+)', 'string', '', 1),
(4, 'link_status', 'Physical link is\s*(\w+)', 'string', '', 2),
(4, 'speed', 'Speed\s*:\s*([\d,]+)', 'string', '', 3),
(4, 'duplex', 'Duplex\s*:\s*(\w+)', 'string', '', 4),
(4, 'mtu', 'MTU\s*(\d+)', 'number', 'bytes', 5);

-- ============================================
-- Sample Data - Routers and Interfaces
-- ============================================

-- Insert sample routers
INSERT INTO routers (hostname, ip_address, ssh_port, username, password, device_type, location) VALUES
('PKT-TX-C1', '10.125.xx.xx', 22, 'admin', 'password', 'huawei', 'Pathankot'),
('JGL-CNN-B4', '10.125.xxx.xxx', 22, 'admin', 'password', 'huawei', 'Jugial');

-- Insert interfaces for PKT-TX-C1
INSERT INTO router_interfaces (router_id, interface_name, interface_label, interface_type) VALUES
(1, '1/4/5', 'PKT-KATHUA', '100G'),
(1, '1/5/11', 'PKT-JUGIAL', '100G');

-- Insert interfaces for JGL-CNN-B4
INSERT INTO router_interfaces (router_id, interface_name, interface_label, interface_type) VALUES
(2, '1/1/1', 'JUGIAL-PKT', '100G'),
(2, '1/1/2', 'JUGIAL-MAHANPUR', '100G');

-- ============================================
-- Views for Easy Querying
-- ============================================

-- View: Latest readings for all parameters
CREATE OR REPLACE VIEW v_latest_parameter_readings AS
SELECT 
    r.id as router_id,
    r.hostname,
    r.ip_address,
    ri.id as interface_id,
    ri.interface_name,
    ri.interface_label,
    mp.parameter_name,
    mp.parameter_category,
    pr.reading_data,
    pr.reading_time
FROM routers r
LEFT JOIN router_interfaces ri ON r.id = ri.router_id
JOIN monitoring_parameters mp ON mp.is_active = true
LEFT JOIN LATERAL (
    SELECT reading_data, reading_time
    FROM parameter_readings
    WHERE router_id = r.id 
      AND (interface_id = ri.id OR interface_id IS NULL)
      AND parameter_id = mp.id
    ORDER BY reading_time DESC
    LIMIT 1
) pr ON true
WHERE r.is_active = true
ORDER BY r.hostname, ri.interface_name, mp.parameter_category, mp.parameter_name;

-- View: SFP Power readings only
CREATE OR REPLACE VIEW v_sfp_power_readings AS
SELECT 
    r.hostname,
    ri.interface_label,
    ri.interface_name,
    pr.reading_data->>'rx_power' as rx_power,
    pr.reading_data->>'tx_power' as tx_power,
    pr.reading_data->>'laser_type' as laser_type,
    pr.reading_data->>'temperature' as temperature,
    pr.reading_time
FROM parameter_readings pr
JOIN routers r ON pr.router_id = r.id
JOIN router_interfaces ri ON pr.interface_id = ri.id
JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
WHERE mp.parameter_category = 'OPTICAL'
  AND pr.reading_time = (
      SELECT MAX(reading_time)
      FROM parameter_readings
      WHERE interface_id = pr.interface_id
        AND parameter_id = pr.parameter_id
  )
ORDER BY r.hostname, ri.interface_name;

-- View: System health summary
CREATE OR REPLACE VIEW v_system_health AS
SELECT 
    r.hostname,
    r.ip_address,
    r.location,
    MAX(CASE WHEN mp.parameter_name = 'CPU_USAGE' 
        THEN pr.reading_data->>'cpu_usage_5min' END) as cpu_usage,
    MAX(CASE WHEN mp.parameter_name = 'MEMORY_USAGE' 
        THEN pr.reading_data->>'memory_usage_percent' END) as memory_usage,
    MAX(CASE WHEN mp.parameter_name = 'TEMPERATURE' 
        THEN pr.reading_data->>'board_temp' END) as temperature,
    MAX(pr.reading_time) as last_update
FROM routers r
LEFT JOIN parameter_readings pr ON r.id = pr.router_id
LEFT JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
WHERE mp.parameter_category = 'SYSTEM'
GROUP BY r.id, r.hostname, r.ip_address, r.location
ORDER BY r.hostname;

-- ============================================
-- Functions
-- ============================================

-- Function to get latest reading for specific parameter
CREATE OR REPLACE FUNCTION get_latest_reading(
    p_router_id INTEGER,
    p_interface_id INTEGER,
    p_parameter_name VARCHAR
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT reading_data INTO result
    FROM parameter_readings pr
    JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
    WHERE pr.router_id = p_router_id
      AND (pr.interface_id = p_interface_id OR p_interface_id IS NULL)
      AND mp.parameter_name = p_parameter_name
    ORDER BY pr.reading_time DESC
    LIMIT 1;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_routers_updated_at 
    BEFORE UPDATE ON routers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interfaces_updated_at 
    BEFORE UPDATE ON router_interfaces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parameters_updated_at 
    BEFORE UPDATE ON monitoring_parameters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Queries
-- ============================================

-- Get all monitoring parameters
-- SELECT * FROM monitoring_parameters WHERE is_active = true ORDER BY parameter_category, parameter_name;

-- Get parsers for a specific parameter
-- SELECT * FROM parameter_parsers WHERE parameter_id = 1 ORDER BY display_order;

-- Get latest SFP readings
-- SELECT * FROM v_sfp_power_readings;

-- Get system health
-- SELECT * FROM v_system_health;

-- Get all readings for a router
-- SELECT * FROM v_latest_parameter_readings WHERE hostname = 'PKT-TX-C1';

-- Get reading history for specific interface and parameter
-- SELECT 
--     reading_data,
--     reading_time
-- FROM parameter_readings pr
-- JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
-- WHERE pr.interface_id = 1
--   AND mp.parameter_name = 'SFP_100G_POWER'
-- ORDER BY reading_time DESC
-- LIMIT 100;
