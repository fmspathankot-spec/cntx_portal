-- ============================================
-- Site-Based Inventory Schema
-- Group nodes by RTU/Site Name
-- ============================================

-- Drop existing tables
DROP TABLE IF EXISTS site_routes CASCADE;
DROP TABLE IF EXISTS sites CASCADE;

-- ============================================
-- Table: sites
-- RTU/Site master table
-- ============================================
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    site_code VARCHAR(50) NOT NULL UNIQUE,
    site_name VARCHAR(255) NOT NULL,
    site_type VARCHAR(50),
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_sites_code ON sites(site_code);
CREATE INDEX idx_sites_name ON sites(site_name);
CREATE INDEX idx_sites_location ON sites(location);

-- ============================================
-- Table: site_routes
-- Routes/Links for each site
-- ============================================
CREATE TABLE site_routes (
    id SERIAL PRIMARY KEY,
    
    -- Site Reference
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    
    -- Basic Info
    sr_no INTEGER,
    rtu_site_name VARCHAR(255) NOT NULL,
    route_link_name VARCHAR(255) NOT NULL,
    
    -- Technical Details
    rtu_port_number INTEGER,
    route_distance DECIMAL(10, 2),
    route_id VARCHAR(50),
    route_type VARCHAR(20) DEFAULT 'DF',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Additional Info
    remarks TEXT,
    installation_date DATE,
    last_maintenance_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_site_routes_site ON site_routes(site_id);
CREATE INDEX idx_site_routes_rtu_name ON site_routes(rtu_site_name);
CREATE INDEX idx_site_routes_route_type ON site_routes(route_type);
CREATE INDEX idx_site_routes_route_id ON site_routes(route_id);

-- ============================================
-- Insert Sites (Extracted from RTU/Site Name)
-- ============================================

INSERT INTO sites (site_code, site_name, site_type, location) VALUES
('PB-ASR-4638-DINANAGAR', 'DINANAGAR-046', 'RTU', 'Dinanagar'),
('PB-ASR-4704-PATHANKOT-1', 'PATHANKOT-1-044', 'RTU', 'Pathankot'),
('PB-ASR-4704-PATHANKOT-2', 'PATHANKOT-2-045', 'RTU', 'Pathankot'),
('PB-ASR-4637-GURDASPUR', 'GURDASPUR-047', 'RTU', 'Gurdaspur'),
('PB-ASR-4639-BATALA', 'BATALA-048', 'RTU', 'Batala');

-- ============================================
-- Insert Routes Data from Image
-- ============================================

-- DINANAGAR Site Routes
INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 96, 'PB-ASR-4638-DINANAGAR-046', 'DNN-GDP_18', 1, 16330.99, '4900', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4638-DINANAGAR';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 97, 'PB-ASR-4638-DINANAGAR-046', 'DNN-PKT(VIA GRT)_22', 2, 32947.59, '8308', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4638-DINANAGAR';

-- PATHANKOT-1 Site Routes
INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 78, 'PB-ASR-4704-PATHANKOT-1-044', 'C TXC PATHANKOT EXG-CHABRA BTS', 8, 2888.01, '143492', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-1';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 80, 'PB-ASR-4704-PATHANKOT-1-044', 'C TXC Pathankot Exg-C TXC PKT DHAKI-01', 3, 3460.84, '142270', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-1';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 81, 'PB-ASR-4704-PATHANKOT-1-044', 'C TXC PATHANKOT EXG-C TXC PKT KHANPUR-01', 5, 2981.73, 'No', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-1';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 234, 'PB-ASR-4704-PATHANKOT-1-044', 'DTS PKD-DTS LAKHANPUR', 7, 17692.75, '8382', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-1';

-- PATHANKOT-2 Site Routes
INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 235, 'PB-ASR-4704-PATHANKOT-2-045', 'DTS PKT-DTS MUKERIAN', 8, 50880.05, '8284', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-2';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 276, 'PB-ASR-4704-PATHANKOT-2-045', 'PB-ASR-4704-PATHANKOT-2-045', 3, 40903.97, '139784', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-2';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 277, 'PB-ASR-4704-PATHANKOT-2-045', 'PKT-DUNERA_6', 2, 22502.29, '8309', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-2';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 278, 'PB-ASR-4704-PATHANKOT-2-045', 'PKT-KATHLORE(GDP)_1', 5, 40149.14, '183277', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-2';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 279, 'PB-ASR-4704-PATHANKOT-2-045', 'PKT-MAHANPUR_12', 1, 33702.43, '191909', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-2';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 280, 'PB-ASR-4704-PATHANKOT-2-045', 'PLT-KATHLORE(NRT)_13', 4, 36242.35, '183277', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4704-PATHANKOT-2';

-- GURDASPUR Site Routes
INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 62, 'PB-ASR-4637-GURDASPUR-047', 'C TXC GURDASPUR EXCHANGE-GURDASPUR COAXIAL', 6, 6268.84, '143783', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4637-GURDASPUR';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 258, 'PB-ASR-4637-GURDASPUR-047', 'GDP-BAT', 4, 11475.55, '141955', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4637-GURDASPUR';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 259, 'PB-ASR-4637-GURDASPUR-047', 'GDP-BAT VIA SATHIALI', 3, 40761.17, '8243', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4637-GURDASPUR';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 260, 'PB-ASR-4637-GURDASPUR-047', 'GDP-KATHUA', 1, 24011.96, '8453', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4637-GURDASPUR';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 261, 'PB-ASR-4637-GURDASPUR-047', 'GDP-MUKERIAN', 2, 27979.95, '8984', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4637-GURDASPUR';

-- BATALA Site Routes
INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 8, 'PB-ASR-4639-BATALA-048', 'BAT-FTGR', 2, 29428.42, '182800', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4639-BATALA';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 9, 'PB-ASR-4639-BATALA-048', 'BAT-QDN', 1, 23430.53, '9025', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4639-BATALA';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 79, 'PB-ASR-4639-BATALA-048', 'C TXC PATHANKOT EXG-C TXC BAT', 4, 3735.93, '143560', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4639-BATALA';

INSERT INTO site_routes (site_id, sr_no, rtu_site_name, route_link_name, rtu_port_number, route_distance, route_id, route_type)
SELECT id, 112, 'PB-ASR-4639-BATALA-048', 'DTS BATALA - DTS ASR', 3, 19788.95, '9429', 'DF'
FROM sites WHERE site_code = 'PB-ASR-4639-BATALA';

-- ============================================
-- Views for Site-Based Querying
-- ============================================

-- View: Sites with route count
CREATE OR REPLACE VIEW v_sites_with_routes AS
SELECT 
    s.id,
    s.site_code,
    s.site_name,
    s.site_type,
    s.location,
    COUNT(sr.id) as total_routes,
    SUM(sr.rtu_port_number) as total_ports,
    ROUND(AVG(sr.route_distance)::numeric, 2) as avg_distance,
    ROUND(SUM(sr.route_distance)::numeric, 2) as total_distance,
    s.is_active
FROM sites s
LEFT JOIN site_routes sr ON s.id = sr.site_id
GROUP BY s.id, s.site_code, s.site_name, s.site_type, s.location, s.is_active
ORDER BY s.site_name;

-- View: All routes with site info
CREATE OR REPLACE VIEW v_routes_with_site AS
SELECT 
    sr.id,
    sr.sr_no,
    s.site_code,
    s.site_name,
    sr.rtu_site_name,
    sr.route_link_name,
    sr.rtu_port_number,
    sr.route_distance,
    sr.route_id,
    sr.route_type,
    sr.is_active,
    sr.created_at
FROM site_routes sr
JOIN sites s ON sr.site_id = s.id
ORDER BY s.site_name, sr.sr_no;

-- View: Site summary by location
CREATE OR REPLACE VIEW v_sites_by_location AS
SELECT 
    location,
    COUNT(DISTINCT id) as site_count,
    SUM((SELECT COUNT(*) FROM site_routes WHERE site_id = sites.id)) as total_routes
FROM sites
WHERE is_active = true
GROUP BY location
ORDER BY site_count DESC;

-- ============================================
-- Functions
-- ============================================

-- Function: Get routes by site
CREATE OR REPLACE FUNCTION get_routes_by_site(p_site_code VARCHAR)
RETURNS TABLE (
    sr_no INTEGER,
    route_link_name VARCHAR,
    rtu_port_number INTEGER,
    route_distance DECIMAL,
    route_id VARCHAR,
    route_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.sr_no,
        sr.route_link_name,
        sr.rtu_port_number,
        sr.route_distance,
        sr.route_id,
        sr.route_type
    FROM site_routes sr
    JOIN sites s ON sr.site_id = s.id
    WHERE s.site_code = p_site_code
      AND sr.is_active = true
    ORDER BY sr.sr_no;
END;
$$ LANGUAGE plpgsql;

-- Function: Search routes
CREATE OR REPLACE FUNCTION search_routes(p_search_term VARCHAR)
RETURNS TABLE (
    site_name VARCHAR,
    route_link_name VARCHAR,
    route_distance DECIMAL,
    route_id VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.site_name,
        sr.route_link_name,
        sr.route_distance,
        sr.route_id
    FROM site_routes sr
    JOIN sites s ON sr.site_id = s.id
    WHERE sr.route_link_name ILIKE '%' || p_search_term || '%'
       OR s.site_name ILIKE '%' || p_search_term || '%'
       OR sr.route_id ILIKE '%' || p_search_term || '%'
    ORDER BY s.site_name, sr.sr_no;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================

-- Trigger: Update updated_at
CREATE OR REPLACE FUNCTION update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_sites_updated_at();

CREATE TRIGGER trigger_update_site_routes_updated_at
    BEFORE UPDATE ON site_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_sites_updated_at();

-- ============================================
-- Useful Queries
-- ============================================

-- Get all sites with route counts
-- SELECT * FROM v_sites_with_routes;

-- Get all routes with site info
-- SELECT * FROM v_routes_with_site;

-- Get routes for specific site
-- SELECT * FROM get_routes_by_site('PB-ASR-4704-PATHANKOT-2');

-- Search routes
-- SELECT * FROM search_routes('PATHANKOT');

-- Get site with most routes
-- SELECT site_name, total_routes 
-- FROM v_sites_with_routes 
-- ORDER BY total_routes DESC 
-- LIMIT 5;

-- Get longest routes
-- SELECT s.site_name, sr.route_link_name, sr.route_distance
-- FROM site_routes sr
-- JOIN sites s ON sr.site_id = s.id
-- ORDER BY sr.route_distance DESC
-- LIMIT 10;
