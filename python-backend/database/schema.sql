-- ============================================
-- Router SFP Monitoring Database Schema
-- ============================================

-- Drop existing tables (if needed)
DROP TABLE IF EXISTS sfp_readings CASCADE;
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
    password VARCHAR(255) NOT NULL,  -- Should be encrypted in production
    device_type VARCHAR(50) DEFAULT 'huawei',  -- cisco_ios, huawei, juniper, etc.
    location VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_routers_hostname ON routers(hostname);
CREATE INDEX idx_routers_active ON routers(is_active);

-- ============================================
-- Table: router_interfaces
-- Stores interface details for each router
-- ============================================
CREATE TABLE router_interfaces (
    id SERIAL PRIMARY KEY,
    router_id INTEGER NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
    interface_name VARCHAR(50) NOT NULL,  -- e.g., '1/5/11', '1/4/5'
    interface_label VARCHAR(100),  -- e.g., 'PKT-KATHUA', 'PKT-JUGIAL'
    sfp_command VARCHAR(100) DEFAULT 'show sfp 100g',  -- Command to check SFP
    is_monitored BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(router_id, interface_name)
);

-- Index for faster queries
CREATE INDEX idx_interfaces_router ON router_interfaces(router_id);
CREATE INDEX idx_interfaces_monitored ON router_interfaces(is_monitored);

-- ============================================
-- Table: sfp_readings
-- Stores SFP power readings
-- ============================================
CREATE TABLE sfp_readings (
    id SERIAL PRIMARY KEY,
    router_id INTEGER NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
    interface_id INTEGER NOT NULL REFERENCES router_interfaces(id) ON DELETE CASCADE,
    rx_power VARCHAR(20),  -- RxPower in dBm
    tx_power VARCHAR(20),  -- TxPower in dBm
    laser_type VARCHAR(100),  -- Laser type
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_readings_router ON sfp_readings(router_id);
CREATE INDEX idx_readings_interface ON sfp_readings(interface_id);
CREATE INDEX idx_readings_time ON sfp_readings(reading_time DESC);

-- ============================================
-- Sample Data
-- ============================================

-- Insert sample routers
INSERT INTO routers (hostname, ip_address, ssh_port, username, password, device_type, location, description) VALUES
('PKT-TX-C1', '10.125.xx.xx', 22, 'admin', 'password123', 'huawei', 'Pathankot', 'Main router at Pathankot'),
('JGL-CNN-B4', '10.125.xxx.xxx', 22, 'admin', 'password123', 'huawei', 'Jugial', 'Main router at Jugial');

-- Insert sample interfaces for PKT-TX-C1
INSERT INTO router_interfaces (router_id, interface_name, interface_label, sfp_command) VALUES
(1, '1/4/5', 'PKT-KATHUA', 'show sfp 100g'),
(1, '1/5/11', 'PKT-JUGIAL', 'show sfp 100g');

-- Insert sample interfaces for JGL-CNN-B4
INSERT INTO router_interfaces (router_id, interface_name, interface_label, sfp_command) VALUES
(2, '1/1/1', 'JUGIAL-PKT', 'show sfp 100g'),
(2, '1/1/2', 'JUGIAL-MAHANPUR', 'show sfp 100g');

-- ============================================
-- Useful Queries
-- ============================================

-- Get all active routers with interface count
-- SELECT 
--     r.id,
--     r.hostname,
--     r.ip_address,
--     r.location,
--     COUNT(ri.id) as interface_count
-- FROM routers r
-- LEFT JOIN router_interfaces ri ON r.id = ri.router_id
-- WHERE r.is_active = true
-- GROUP BY r.id, r.hostname, r.ip_address, r.location
-- ORDER BY r.hostname;

-- Get latest SFP readings for all interfaces
-- SELECT 
--     r.hostname,
--     ri.interface_label,
--     ri.interface_name,
--     sr.rx_power,
--     sr.tx_power,
--     sr.laser_type,
--     sr.reading_time
-- FROM sfp_readings sr
-- JOIN router_interfaces ri ON sr.interface_id = ri.id
-- JOIN routers r ON sr.router_id = r.id
-- WHERE sr.reading_time = (
--     SELECT MAX(reading_time) 
--     FROM sfp_readings 
--     WHERE interface_id = sr.interface_id
-- )
-- ORDER BY r.hostname, ri.interface_name;

-- Get SFP reading history for specific interface
-- SELECT 
--     r.hostname,
--     ri.interface_label,
--     sr.rx_power,
--     sr.tx_power,
--     sr.reading_time
-- FROM sfp_readings sr
-- JOIN router_interfaces ri ON sr.interface_id = ri.id
-- JOIN routers r ON sr.router_id = r.id
-- WHERE ri.interface_label = 'PKT-KATHUA'
-- ORDER BY sr.reading_time DESC
-- LIMIT 100;

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for routers table
CREATE TRIGGER update_routers_updated_at 
    BEFORE UPDATE ON routers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for router_interfaces table
CREATE TRIGGER update_interfaces_updated_at 
    BEFORE UPDATE ON router_interfaces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views for Easy Querying
-- ============================================

-- View: Latest SFP readings
CREATE OR REPLACE VIEW v_latest_sfp_readings AS
SELECT 
    r.id as router_id,
    r.hostname,
    r.ip_address,
    r.location,
    ri.id as interface_id,
    ri.interface_name,
    ri.interface_label,
    sr.rx_power,
    sr.tx_power,
    sr.laser_type,
    sr.reading_time
FROM routers r
JOIN router_interfaces ri ON r.id = ri.router_id
LEFT JOIN LATERAL (
    SELECT rx_power, tx_power, laser_type, reading_time
    FROM sfp_readings
    WHERE interface_id = ri.id
    ORDER BY reading_time DESC
    LIMIT 1
) sr ON true
WHERE r.is_active = true AND ri.is_monitored = true
ORDER BY r.hostname, ri.interface_name;

-- View: Router summary
CREATE OR REPLACE VIEW v_router_summary AS
SELECT 
    r.id,
    r.hostname,
    r.ip_address,
    r.location,
    r.is_active,
    COUNT(DISTINCT ri.id) as total_interfaces,
    COUNT(DISTINCT CASE WHEN ri.is_monitored THEN ri.id END) as monitored_interfaces,
    MAX(sr.reading_time) as last_reading_time
FROM routers r
LEFT JOIN router_interfaces ri ON r.id = ri.router_id
LEFT JOIN sfp_readings sr ON r.id = sr.router_id
GROUP BY r.id, r.hostname, r.ip_address, r.location, r.is_active
ORDER BY r.hostname;

-- ============================================
-- Grants (if using specific user)
-- ============================================

-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_user;
