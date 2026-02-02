-- ============================================
-- Centralized Credentials System
-- Store credentials once, use for multiple routers
-- ============================================

-- Drop existing if needed
DROP TABLE IF EXISTS router_credential_mappings CASCADE;
DROP TABLE IF EXISTS router_credentials CASCADE;

-- ============================================
-- Table: router_credentials
-- Store credentials that can be shared across routers
-- ============================================
CREATE TABLE router_credentials (
    id SERIAL PRIMARY KEY,
    credential_name VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Should be encrypted in production
    enable_password VARCHAR(255),     -- For enable mode
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_credentials_name ON router_credentials(credential_name);
CREATE INDEX idx_credentials_active ON router_credentials(is_active);

-- ============================================
-- Table: router_credential_mappings
-- Map routers to credentials (optional, for override)
-- ============================================
CREATE TABLE router_credential_mappings (
    id SERIAL PRIMARY KEY,
    router_id INTEGER NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
    credential_id INTEGER NOT NULL REFERENCES router_credentials(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(router_id, credential_id)
);

-- Index
CREATE INDEX idx_mappings_router ON router_credential_mappings(router_id);
CREATE INDEX idx_mappings_credential ON router_credential_mappings(credential_id);

-- ============================================
-- Modify routers table to support credential reference
-- ============================================

-- Add credential_id column to routers table
ALTER TABLE routers ADD COLUMN IF NOT EXISTS credential_id INTEGER REFERENCES router_credentials(id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_routers_credential ON routers(credential_id);

-- ============================================
-- Sample Data - Common Credentials
-- ============================================

-- Insert common credentials
INSERT INTO router_credentials (credential_name, username, password, description) VALUES
('default_admin', 'admin', 'your_common_password', 'Default admin credentials for all routers'),
('backup_admin', 'backup', 'backup_password', 'Backup admin credentials'),
('readonly_user', 'monitor', 'monitor_password', 'Read-only monitoring user');

-- ============================================
-- Update existing routers to use credentials
-- ============================================

-- Set default credential for all existing routers
UPDATE routers 
SET credential_id = (SELECT id FROM router_credentials WHERE credential_name = 'default_admin')
WHERE credential_id IS NULL;

-- Now you can remove individual username/password columns if you want
-- Or keep them for backward compatibility

-- ============================================
-- Views for Easy Access
-- ============================================

-- View: Routers with credentials
CREATE OR REPLACE VIEW v_routers_with_credentials AS
SELECT 
    r.id,
    r.hostname,
    r.ip_address,
    r.ssh_port,
    r.device_type,
    r.location,
    COALESCE(rc.username, r.username) as username,
    COALESCE(rc.password, r.password) as password,
    COALESCE(rc.enable_password, '') as enable_password,
    rc.credential_name,
    r.is_active
FROM routers r
LEFT JOIN router_credentials rc ON r.credential_id = rc.id
WHERE r.is_active = true
ORDER BY r.hostname;

-- ============================================
-- Functions
-- ============================================

-- Function to get router credentials
CREATE OR REPLACE FUNCTION get_router_credentials(p_router_id INTEGER)
RETURNS TABLE (
    username VARCHAR,
    password VARCHAR,
    enable_password VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(rc.username, r.username)::VARCHAR as username,
        COALESCE(rc.password, r.password)::VARCHAR as password,
        COALESCE(rc.enable_password, '')::VARCHAR as enable_password
    FROM routers r
    LEFT JOIN router_credentials rc ON r.credential_id = rc.id
    WHERE r.id = p_router_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add router with credential
CREATE OR REPLACE FUNCTION add_router_with_credential(
    p_hostname VARCHAR,
    p_ip_address VARCHAR,
    p_credential_name VARCHAR,
    p_device_type VARCHAR DEFAULT 'tejas',
    p_location VARCHAR DEFAULT NULL,
    p_ssh_port INTEGER DEFAULT 22
)
RETURNS INTEGER AS $$
DECLARE
    v_credential_id INTEGER;
    v_router_id INTEGER;
BEGIN
    -- Get credential ID
    SELECT id INTO v_credential_id 
    FROM router_credentials 
    WHERE credential_name = p_credential_name;
    
    IF v_credential_id IS NULL THEN
        RAISE EXCEPTION 'Credential % not found', p_credential_name;
    END IF;
    
    -- Insert router
    INSERT INTO routers (
        hostname, 
        ip_address, 
        ssh_port, 
        device_type, 
        location, 
        credential_id
    ) VALUES (
        p_hostname,
        p_ip_address,
        p_ssh_port,
        p_device_type,
        p_location,
        v_credential_id
    ) RETURNING id INTO v_router_id;
    
    RETURN v_router_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Usage Examples
-- ============================================

-- Example 1: Add new credential
-- INSERT INTO router_credentials (credential_name, username, password, description)
-- VALUES ('tejas_admin', 'admin', 'tejas123', 'Tejas router admin credentials');

-- Example 2: Add router using credential
-- SELECT add_router_with_credential(
--     'ROUTER-1', 
--     '10.125.1.1', 
--     'default_admin',
--     'tejas',
--     'Location 1'
-- );

-- Example 3: Add multiple routers with same credential
-- SELECT add_router_with_credential('ROUTER-1', '10.125.1.1', 'default_admin', 'tejas', 'Loc 1');
-- SELECT add_router_with_credential('ROUTER-2', '10.125.1.2', 'default_admin', 'tejas', 'Loc 2');
-- SELECT add_router_with_credential('ROUTER-3', '10.125.1.3', 'default_admin', 'tejas', 'Loc 3');

-- Example 4: Get router with credentials
-- SELECT * FROM v_routers_with_credentials;

-- Example 5: Get credentials for specific router
-- SELECT * FROM get_router_credentials(1);

-- Example 6: Update credential (affects all routers using it)
-- UPDATE router_credentials 
-- SET password = 'new_password' 
-- WHERE credential_name = 'default_admin';

-- Example 7: Change router to use different credential
-- UPDATE routers 
-- SET credential_id = (SELECT id FROM router_credentials WHERE credential_name = 'backup_admin')
-- WHERE hostname = 'ROUTER-1';

-- ============================================
-- Bulk Insert Example
-- ============================================

-- Add 10 routers with same credentials in one go
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        PERFORM add_router_with_credential(
            'ROUTER-' || i,
            '10.125.1.' || i,
            'default_admin',
            'tejas',
            'Location ' || i
        );
    END LOOP;
END $$;

-- ============================================
-- Security: Encrypt Passwords (Optional)
-- ============================================

-- Function to encrypt password (simple example, use proper encryption in production)
CREATE OR REPLACE FUNCTION encrypt_password(p_password VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    -- In production, use pgcrypto extension
    -- RETURN encode(digest(p_password, 'sha256'), 'hex');
    RETURN p_password; -- For now, plain text
END;
$$ LANGUAGE plpgsql;

-- Function to decrypt password (simple example)
CREATE OR REPLACE FUNCTION decrypt_password(p_encrypted VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    -- In production, use pgcrypto extension
    RETURN p_encrypted; -- For now, plain text
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================

-- Trigger to update updated_at
CREATE TRIGGER update_credentials_updated_at 
    BEFORE UPDATE ON router_credentials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Useful Queries
-- ============================================

-- Count routers per credential
-- SELECT 
--     rc.credential_name,
--     COUNT(r.id) as router_count
-- FROM router_credentials rc
-- LEFT JOIN routers r ON rc.id = r.credential_id
-- GROUP BY rc.id, rc.credential_name
-- ORDER BY router_count DESC;

-- Find routers without credentials
-- SELECT * FROM routers WHERE credential_id IS NULL;

-- List all credentials with router count
-- SELECT 
--     rc.credential_name,
--     rc.username,
--     rc.description,
--     COUNT(r.id) as router_count,
--     rc.is_active
-- FROM router_credentials rc
-- LEFT JOIN routers r ON rc.id = r.credential_id
-- GROUP BY rc.id, rc.credential_name, rc.username, rc.description, rc.is_active
-- ORDER BY router_count DESC;
