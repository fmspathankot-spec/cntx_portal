-- Nokia OTN Inventory Table
-- Stores card numbers and inventory details from "My Files" data

CREATE TABLE IF NOT EXISTS nokia_otn_inventory (
    id SERIAL PRIMARY KEY,
    
    -- Card Information
    card_number VARCHAR(100) UNIQUE NOT NULL,
    card_type VARCHAR(100),
    card_description TEXT,
    
    -- Location Details
    location VARCHAR(200),
    rack_number VARCHAR(50),
    shelf_number VARCHAR(50),
    slot_number VARCHAR(50),
    
    -- Hardware Details
    part_number VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    hardware_version VARCHAR(50),
    software_version VARCHAR(50),
    
    -- Status Information
    operational_status VARCHAR(50) DEFAULT 'Active',
    admin_status VARCHAR(50) DEFAULT 'Enabled',
    health_status VARCHAR(50) DEFAULT 'Good',
    
    -- Network Details
    node_name VARCHAR(100),
    node_ip VARCHAR(50),
    network_element VARCHAR(100),
    
    -- Capacity & Performance
    port_count INTEGER,
    bandwidth_capacity VARCHAR(50),
    current_utilization DECIMAL(5,2),
    
    -- Vendor & Warranty
    vendor VARCHAR(100) DEFAULT 'Nokia',
    manufacturer VARCHAR(100) DEFAULT 'Nokia',
    purchase_date DATE,
    warranty_expiry DATE,
    
    -- Installation Details
    installation_date DATE,
    commissioned_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- Additional Information
    notes TEXT,
    tags VARCHAR(200),
    category VARCHAR(100) DEFAULT 'OTN',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Indexes for better query performance
CREATE INDEX idx_nokia_otn_card_number ON nokia_otn_inventory(card_number);
CREATE INDEX idx_nokia_otn_serial_number ON nokia_otn_inventory(serial_number);
CREATE INDEX idx_nokia_otn_location ON nokia_otn_inventory(location);
CREATE INDEX idx_nokia_otn_node_name ON nokia_otn_inventory(node_name);
CREATE INDEX idx_nokia_otn_operational_status ON nokia_otn_inventory(operational_status);
CREATE INDEX idx_nokia_otn_card_type ON nokia_otn_inventory(card_type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nokia_otn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nokia_otn_timestamp
    BEFORE UPDATE ON nokia_otn_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_nokia_otn_updated_at();

-- Sample data (optional - remove if not needed)
INSERT INTO nokia_otn_inventory (
    card_number, card_type, card_description, location, 
    rack_number, shelf_number, slot_number,
    part_number, serial_number, operational_status,
    node_name, port_count, created_by
) VALUES 
(
    'CARD-001', 'OTU4', '100G OTN Line Card', 'Pathankot DC',
    'R1', 'S1', 'SL1',
    'PN-OTU4-100G', 'SN-001-2024', 'Active',
    'PKT-NODE-01', 4, 'admin'
),
(
    'CARD-002', 'ODU4', '100G OTN Client Card', 'Pathankot DC',
    'R1', 'S1', 'SL2',
    'PN-ODU4-100G', 'SN-002-2024', 'Active',
    'PKT-NODE-01', 8, 'admin'
);

-- Comments for documentation
COMMENT ON TABLE nokia_otn_inventory IS 'Nokia OTN equipment inventory with card numbers and detailed specifications';
COMMENT ON COLUMN nokia_otn_inventory.card_number IS 'Unique card identification number';
COMMENT ON COLUMN nokia_otn_inventory.card_type IS 'Type of OTN card (OTU4, ODU4, etc.)';
COMMENT ON COLUMN nokia_otn_inventory.operational_status IS 'Current operational status (Active, Inactive, Maintenance, Faulty)';
COMMENT ON COLUMN nokia_otn_inventory.health_status IS 'Health status (Good, Warning, Critical)';
