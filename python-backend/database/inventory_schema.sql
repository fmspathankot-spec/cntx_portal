-- ============================================
-- Inventory / RFTS Nodes Database Schema
-- Store network inventory and RFTS node data
-- ============================================

-- Drop existing tables if needed
DROP TABLE IF EXISTS rfts_nodes CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;

-- ============================================
-- Table: inventory_categories
-- Different categories of inventory items
-- ============================================
CREATE TABLE inventory_categories (
    id SERIAL PRIMARY KEY,
    category_code VARCHAR(10) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    color_code VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample categories
INSERT INTO inventory_categories (category_code, category_name, color_code, description) VALUES
('DF', 'Distribution Frame', '#90EE90', 'Distribution Frame nodes'),
('GDP', 'GDP Nodes', '#FFD700', 'GDP network nodes'),
('BAT', 'Battery Nodes', '#87CEEB', 'Battery backup nodes'),
('TXC', 'Transmission Exchange', '#ADD8E6', 'Transmission exchange nodes');

-- ============================================
-- Table: rfts_nodes
-- Main inventory table for RFTS nodes
-- ============================================
CREATE TABLE rfts_nodes (
    id SERIAL PRIMARY KEY,
    
    -- Basic Info
    sr_no INTEGER,
    node_name VARCHAR(255) NOT NULL,
    node_code VARCHAR(100),
    
    -- Technical Details
    fiber_count INTEGER,
    distance DECIMAL(10, 2),
    port_number INTEGER,
    
    -- Category
    category_code VARCHAR(10) REFERENCES inventory_categories(category_code),
    
    -- Location
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Additional Info
    remarks TEXT,
    installation_date DATE,
    last_maintenance_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT unique_node_name UNIQUE(node_name)
);

-- Create indexes
CREATE INDEX idx_rfts_nodes_category ON rfts_nodes(category_code);
CREATE INDEX idx_rfts_nodes_status ON rfts_nodes(is_active);
CREATE INDEX idx_rfts_nodes_location ON rfts_nodes(location);
CREATE INDEX idx_rfts_nodes_node_name ON rfts_nodes(node_name);

-- ============================================
-- Insert Sample Data from Image
-- ============================================

-- DF Category (Green - Distribution Frame)
INSERT INTO rfts_nodes (sr_no, node_name, fiber_count, distance, port_number, category_code) VALUES
(96, 'PB-ASR-4638-D|DNN-GDP_18', 1, 16330.99, 4900, 'DF'),
(97, 'PB-ASR-4638-D|DNN-PKT(VIA GRT)_22', 2, 32947.59, 8308, 'DF'),
(78, 'PB-ASR-4704-P|C TXC PATHANKOT-CHARRA RTS', 8, 2888.91, 141492, 'DF'),
(80, 'PB-ASR-4704-P|C TXC Pathankot Exg-C TXC PKT DHAKLOI', 3, 3460.84, 142270, 'DF'),
(81, 'PB-ASR-4704-P|C TXC PATHANKOT EXG-C TXC PKT KHAI', 5, 2981.73, NULL, 'DF'),
(234, 'PB-ASR-4704-P|DTS PKD-DTS LAKHANPUR', 7, 17692.75, 8382, 'DF'),
(235, 'PB-ASR-4704-P|DTS PKT-DTS MUKERIAN', 8, 50880.05, 8284, 'DF'),
(276, 'PB-ASR-4704-P|PB-ASR-4704-PATHANKOT-2-045', 3, 40903.97, 139784, 'DF'),
(277, 'PB-ASR-4704-P|PKT-DUNERA_6', 2, 22502.29, 8309, 'DF'),
(278, 'PB-ASR-4704-P|PKT-KATHLORE(DP)_1', 6, 40149.14, 183277, 'DF'),
(279, 'PB-ASR-4704-P|PKT-MAHANPUR_12', 1, 33702.43, 191909, 'DF'),
(280, 'PB-ASR-4704-P|PLT-KATHLORE(NRT)_13', 4, 36242.35, 183277, 'DF');

-- GDP Category (Yellow/Orange - GDP Nodes)
INSERT INTO rfts_nodes (sr_no, node_name, fiber_count, distance, port_number, category_code) VALUES
(62, 'PB-ASR-4637-G|C TXC GURDASPUR EXCHANGE-GURDAS', 6, 8268.94, 143783, 'GDP'),
(258, 'PB-ASR-4637-G|GDP-BAT', 4, 11475.65, 141955, 'GDP'),
(259, 'PB-ASR-4637-G|GDP-BAT VIA SATHIALI', 3, 40761.17, 8243, 'GDP'),
(260, 'PB-ASR-4637-G|GDP-KATHUA', 1, 24011.96, 8453, 'GDP'),
(261, 'PB-ASR-4637-G|GDP-MUKERIAN', 2, 27979.95, 8984, 'GDP');

-- BAT Category (Light Blue - Battery Nodes)
INSERT INTO rfts_nodes (sr_no, node_name, fiber_count, distance, port_number, category_code) VALUES
(8, 'PB-ASR-4639-B|BAT-FTGR', 2, 29428.42, 182800, 'BAT'),
(9, 'PB-ASR-4639-B|BAT-QDN', 1, 23430.53, 9025, 'BAT'),
(79, 'PB-ASR-4639-B|C TXC PATHANKOT EXG-C TXC BAT', 4, 3735.93, 143560, 'BAT'),
(112, 'PB-ASR-4639-B|DTS BATALA - DTS ASR', 3, 19788.95, 9429, 'BAT');

-- ============================================
-- Views for Easy Querying
-- ============================================

-- View: All nodes with category info
CREATE OR REPLACE VIEW v_rfts_nodes_with_category AS
SELECT 
    rn.id,
    rn.sr_no,
    rn.node_name,
    rn.node_code,
    rn.fiber_count,
    rn.distance,
    rn.port_number,
    rn.category_code,
    ic.category_name,
    ic.color_code,
    rn.location,
    rn.is_active,
    rn.status,
    rn.created_at
FROM rfts_nodes rn
LEFT JOIN inventory_categories ic ON rn.category_code = ic.category_code
ORDER BY rn.sr_no;

-- View: Category-wise summary
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT 
    ic.category_code,
    ic.category_name,
    ic.color_code,
    COUNT(rn.id) as total_nodes,
    SUM(rn.fiber_count) as total_fibers,
    ROUND(AVG(rn.distance)::numeric, 2) as avg_distance,
    COUNT(CASE WHEN rn.is_active = true THEN 1 END) as active_nodes
FROM inventory_categories ic
LEFT JOIN rfts_nodes rn ON ic.category_code = rn.category_code
GROUP BY ic.category_code, ic.category_name, ic.color_code
ORDER BY ic.category_code;

-- View: Nodes by location
CREATE OR REPLACE VIEW v_nodes_by_location AS
SELECT 
    COALESCE(location, 'Unknown') as location,
    COUNT(*) as node_count,
    SUM(fiber_count) as total_fibers,
    ROUND(AVG(distance)::numeric, 2) as avg_distance
FROM rfts_nodes
WHERE is_active = true
GROUP BY location
ORDER BY node_count DESC;

-- ============================================
-- Functions
-- ============================================

-- Function: Get nodes by category
CREATE OR REPLACE FUNCTION get_nodes_by_category(p_category_code VARCHAR)
RETURNS TABLE (
    id INTEGER,
    sr_no INTEGER,
    node_name VARCHAR,
    fiber_count INTEGER,
    distance DECIMAL,
    port_number INTEGER,
    category_name VARCHAR,
    color_code VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rn.id,
        rn.sr_no,
        rn.node_name,
        rn.fiber_count,
        rn.distance,
        rn.port_number,
        ic.category_name,
        ic.color_code
    FROM rfts_nodes rn
    JOIN inventory_categories ic ON rn.category_code = ic.category_code
    WHERE rn.category_code = p_category_code
      AND rn.is_active = true
    ORDER BY rn.sr_no;
END;
$$ LANGUAGE plpgsql;

-- Function: Search nodes
CREATE OR REPLACE FUNCTION search_nodes(p_search_term VARCHAR)
RETURNS TABLE (
    id INTEGER,
    sr_no INTEGER,
    node_name VARCHAR,
    category_name VARCHAR,
    distance DECIMAL,
    port_number INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rn.id,
        rn.sr_no,
        rn.node_name,
        ic.category_name,
        rn.distance,
        rn.port_number
    FROM rfts_nodes rn
    LEFT JOIN inventory_categories ic ON rn.category_code = ic.category_code
    WHERE rn.node_name ILIKE '%' || p_search_term || '%'
       OR rn.node_code ILIKE '%' || p_search_term || '%'
       OR rn.location ILIKE '%' || p_search_term || '%'
    ORDER BY rn.sr_no;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================

-- Trigger: Update updated_at on change
CREATE OR REPLACE FUNCTION update_rfts_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rfts_nodes_updated_at
    BEFORE UPDATE ON rfts_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_rfts_nodes_updated_at();

-- ============================================
-- Useful Queries
-- ============================================

-- Get all nodes with category
-- SELECT * FROM v_rfts_nodes_with_category;

-- Get category summary
-- SELECT * FROM v_inventory_summary;

-- Get nodes by category
-- SELECT * FROM get_nodes_by_category('DF');

-- Search nodes
-- SELECT * FROM search_nodes('PATHANKOT');

-- Get top 10 longest distance nodes
-- SELECT node_name, distance, category_code 
-- FROM rfts_nodes 
-- WHERE distance IS NOT NULL 
-- ORDER BY distance DESC 
-- LIMIT 10;

-- Get nodes without port numbers
-- SELECT node_name, category_code 
-- FROM rfts_nodes 
-- WHERE port_number IS NULL;

-- Count nodes by category
-- SELECT category_code, COUNT(*) as count 
-- FROM rfts_nodes 
-- GROUP BY category_code 
-- ORDER BY count DESC;
