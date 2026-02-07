-- Nokia OTN Inventory Table
-- Based on 20AX200 Card Data (Card No 07, 14, 23, 29)

-- Main Cards Table
CREATE TABLE IF NOT EXISTS nokia_otn_cards (
    id SERIAL PRIMARY KEY,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    card_model VARCHAR(50) DEFAULT '20AX200',
    total_ports INTEGER DEFAULT 20,
    port_type VARCHAR(20) DEFAULT '10G',
    location VARCHAR(100) DEFAULT 'Pathankot',
    status VARCHAR(50) DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ports Table (Each card has 20 ports)
CREATE TABLE IF NOT EXISTS nokia_otn_ports (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES nokia_otn_cards(id) ON DELETE CASCADE,
    card_number VARCHAR(50) NOT NULL,
    sr_no INTEGER NOT NULL,
    port_type VARCHAR(20),
    source_port_no VARCHAR(50),
    destination_location VARCHAR(100),
    destination_port_no VARCHAR(50),
    service_name VARCHAR(200),
    service_type VARCHAR(50),
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_number, sr_no)
);

-- Indexes
CREATE INDEX idx_nokia_cards_number ON nokia_otn_cards(card_number);
CREATE INDEX idx_nokia_cards_status ON nokia_otn_cards(status);
CREATE INDEX idx_nokia_ports_card ON nokia_otn_ports(card_id);
CREATE INDEX idx_nokia_ports_card_number ON nokia_otn_ports(card_number);
CREATE INDEX idx_nokia_ports_destination ON nokia_otn_ports(destination_location);
CREATE INDEX idx_nokia_ports_service ON nokia_otn_ports(service_name);
CREATE INDEX idx_nokia_ports_status ON nokia_otn_ports(status);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_nokia_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_nokia_cards_timestamp
    BEFORE UPDATE ON nokia_otn_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_nokia_timestamp();

CREATE TRIGGER trigger_update_nokia_ports_timestamp
    BEFORE UPDATE ON nokia_otn_ports
    FOR EACH ROW
    EXECUTE FUNCTION update_nokia_timestamp();

-- Insert Card Data
INSERT INTO nokia_otn_cards (card_number, card_model, total_ports, port_type, location, status) VALUES
('CARD-07', '20AX200', 20, '10G', 'Pathankot', 'Active'),
('CARD-14', '20AX200', 20, '10G', 'Pathankot', 'Active'),
('CARD-23', '20AX200', 20, '10G', 'Pathankot', 'Active'),
('CARD-29', '20AX200', 20, '10G', 'Pathankot', 'Active');

-- Insert Port Data for CARD-07
INSERT INTO nokia_otn_ports (card_id, card_number, sr_no, port_type, source_port_no, destination_location, destination_port_no, service_name, service_type, remarks) VALUES
(1, 'CARD-07', 1, '10G', '1/7/1', 'AMRITSAR', '1/5/1', 'PKT-ASR CPAN', 'LAN', 'CPAN-PKT-434-12-(4/1)-ASR-434-1-(1/1)'),
(1, 'CARD-07', 2, '10G', '1/7/2', 'AMRITSAR', '1/5/2', 'PKT-ASR-BNG', 'LAN', 'PKT-BNG-UP2-1/1/C5/1-F.NO 34&35'),
(1, 'CARD-07', 3, '10G', '1/7/3', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 4, '10G', '1/7/4', 'CHANDIGARH', '1/7/4', 'PKT-CHD-BNG', 'LAN', NULL),
(1, 'CARD-07', 5, '10G', '1/7/5', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 6, '10G', '1/7/6', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 7, '10G', '1/7/7', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 8, '10G', '1/7/8', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 9, '10G', '1/7/9', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 10, '10G', '1/7/10', 'JALANDHAR', '1/15/10', 'PKT-JLD-MPLS', 'WAN', NULL),
(1, 'CARD-07', 11, '10G', '1/7/11', 'JALANDHAR', '1/15/11', 'PKT-JLD-BNG-II', 'LAN', NULL),
(1, 'CARD-07', 12, '10G', '1/7/12', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 13, '10G', '1/7/13', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 14, '10G', '1/7/14', 'UDHAMPUR', '1/5/14', 'KT-MHNPR CPAN', 'LAN', 'PKT HP CPAN'),
(1, 'CARD-07', 15, '10G', '1/7/15', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 16, '10G', '1/7/16', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 17, '10G', '1/7/17', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 18, '10G', '1/7/18', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 19, '10G', '1/7/19', NULL, NULL, NULL, NULL, NULL),
(1, 'CARD-07', 20, '10G', '1/7/20', NULL, NULL, NULL, NULL, NULL);

-- Insert Port Data for CARD-14
INSERT INTO nokia_otn_ports (card_id, card_number, sr_no, port_type, source_port_no, destination_location, destination_port_no, service_name, service_type, remarks) VALUES
(2, 'CARD-14', 1, '10G', '1/14/1', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 2, '10G', '1/14/2', 'DHARAMSHALA', '1/13/2', 'PKT-DMA-', 'LAN', 'PKT-10.125.0.5-'),
(2, 'CARD-14', 3, '10G', '1/14/3', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 4, '10G', '1/14/4', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 5, '10G', '1/14/5', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 6, '10G', '1/14/6', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 7, '10G', '1/14/7', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 8, '10G', '1/14/8', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 9, '10G', '1/14/9', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 10, '10G', '1/14/10', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 11, '10G', '1/14/11', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 12, '10G', '1/14/12', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 13, '10G', '1/14/13', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 14, '10G', '1/14/14', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 15, '10G', '1/14/15', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 16, '10G', '1/14/16', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 17, '10G', '1/14/17', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 18, '10G', '1/14/18', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 19, '10G', '1/14/19', NULL, NULL, NULL, NULL, NULL),
(2, 'CARD-14', 20, '10G', '1/14/20', NULL, NULL, NULL, NULL, NULL);

-- Insert Port Data for CARD-23
INSERT INTO nokia_otn_ports (card_id, card_number, sr_no, port_type, source_port_no, destination_location, destination_port_no, service_name, service_type, remarks) VALUES
(3, 'CARD-23', 1, '10G', '1/23/1', 'UDHAMPUR', '1/21/1', 'DM-KATHUA MNGPAN', 'LAN', 'UDM-KATHUA-MNGPAN VIA PKT UTL-(1/1)/ALIEN-(1/1)'),
(3, 'CARD-23', 2, '10G', '1/23/2', 'JALANDHAR', '1/14/7', 'PKT-JLD-BNG', 'LAN', 'PKT-NIB-BNG1 F.NO.15&16 FDF.NO. E-10B-4'),
(3, 'CARD-23', 3, '10G', '1/23/3', 'UDHAMPUR', '1/21/3', 'PKT-UDM AFNET', 'LAN', 'PKT-MAAN-7/8 TO OTN-1/23/3'),
(3, 'CARD-23', 4, '10G', '1/23/4', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 5, '10G', '1/23/5', 'JALANDHAR', '1/15/5', 'PKT-JLD-CPAN', 'LAN', 'PKT-434-12-(6/1)-JLD-80-9-(10/1)'),
(3, 'CARD-23', 6, '10G', '1/23/6', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 7, '10G', '1/23/7', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 8, '10G', '1/23/8', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 9, '10G', '1/23/9', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 10, '10G', '1-23-10', 'CHANDIGARH_RD', '1/21/10', 'PKT-CHD_RD MPLS-1', 'WAN', 'NIB-3/0/1-CHD_RD-3/46-MPLS-1 F.NO. 11&12,FDF.NO.E-10'),
(3, 'CARD-23', 11, '10G', '1-23-11', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 12, '10G', '1-23-12', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 13, '10G', '1-23-13', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 14, '10G', '1-23-14', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 15, '10G', '1-23-15', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 16, '10G', '1-23-16', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 17, '10G', '1-23-17', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 18, '10G', '1-23-18', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 19, '10G', '1-23-19', NULL, NULL, NULL, NULL, NULL),
(3, 'CARD-23', 20, '10G', '1-23-20', NULL, NULL, NULL, NULL, NULL);

-- Insert Port Data for CARD-29 (All empty)
INSERT INTO nokia_otn_ports (card_id, card_number, sr_no, port_type, source_port_no, destination_location, destination_port_no, service_name, service_type, remarks) VALUES
(4, 'CARD-29', 1, '10G', '1/29/1', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 2, '10G', '1/29/2', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 3, '10G', '1/29/3', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 4, '10G', '1/29/4', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 5, '10G', '1/29/5', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 6, '10G', '1/29/6', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 7, '10G', '1/29/7', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 8, '10G', '1/29/8', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 9, '10G', '1/29/9', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 10, '10G', '1/29/10', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 11, '10G', '1/29/11', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 12, '10G', '1/29/12', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 13, '10G', '1/29/13', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 14, '10G', '1/29/14', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 15, '10G', '1/29/15', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 16, '10G', '1/29/16', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 17, '10G', '1/29/17', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 18, '10G', '1/29/18', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 19, '10G', '1/29/19', NULL, NULL, NULL, NULL, NULL),
(4, 'CARD-29', 20, '10G', '1/29/20', NULL, NULL, NULL, NULL, NULL);

-- Comments
COMMENT ON TABLE nokia_otn_cards IS 'Nokia 20AX200 OTN Cards inventory';
COMMENT ON TABLE nokia_otn_ports IS 'Port-level details for each Nokia OTN card';
COMMENT ON COLUMN nokia_otn_ports.source_port_no IS 'Source port number on this card';
COMMENT ON COLUMN nokia_otn_ports.destination_location IS 'Destination city/location';
COMMENT ON COLUMN nokia_otn_ports.destination_port_no IS 'Destination port number';
COMMENT ON COLUMN nokia_otn_ports.service_name IS 'Service/circuit name';
COMMENT ON COLUMN nokia_otn_ports.service_type IS 'LAN or WAN service type';
