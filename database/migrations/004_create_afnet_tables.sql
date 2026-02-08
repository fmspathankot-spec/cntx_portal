-- AFNET MAAN Service Details Table
CREATE TABLE IF NOT EXISTS afnet_maan_services (
    id SERIAL PRIMARY KEY,
    ar_number VARCHAR(10) NOT NULL, -- AR-1, AR-2
    sr_no INTEGER NOT NULL,
    link_name VARCHAR(100),
    network_type VARCHAR(50), -- PKT, GDP
    source_station VARCHAR(100),
    source_ip VARCHAR(50),
    source_node_port VARCHAR(50),
    sink_station VARCHAR(100),
    sink_ip VARCHAR(50),
    sink_node_port VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AFNET MADM Service Details Table
CREATE TABLE IF NOT EXISTS afnet_madm_services (
    id SERIAL PRIMARY KEY,
    ar_number VARCHAR(10) NOT NULL, -- AR-1, AR-2
    sr_no INTEGER NOT NULL,
    link_name VARCHAR(100),
    network_type VARCHAR(50), -- PKT, GDP
    source_station VARCHAR(100),
    source_ip VARCHAR(50),
    source_node_port VARCHAR(50),
    sink_station VARCHAR(100),
    sink_ip VARCHAR(50),
    sink_node_port VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_afnet_maan_ar ON afnet_maan_services(ar_number);
CREATE INDEX IF NOT EXISTS idx_afnet_madm_ar ON afnet_madm_services(ar_number);
CREATE INDEX IF NOT EXISTS idx_afnet_maan_link ON afnet_maan_services(link_name);
CREATE INDEX IF NOT EXISTS idx_afnet_madm_link ON afnet_madm_services(link_name);

-- Sample data from the provided image
INSERT INTO afnet_maan_services (ar_number, sr_no, link_name, network_type, source_station, source_ip, source_node_port, sink_station, sink_ip, sink_node_port, remarks) VALUES
('AR-1', 1, 'PKT-BNL1', 'PKT', 'PKT', '10.125.0.5', '.16/1', 'IAF-PKT-AR1', '10.125.0.15', '.1/1', 'NOKIA OTN PKT-30/13-PAT-29/13-- S/B CPAN PKT-434- 12-3/5 -PAT-140-2-2/2'),
('AR-1', 2, 'PKT-UDM-1', 'PKT', 'PKT', '10.125.0.5', '.7/8', 'IAF-PKT-AR1', '10.125.0.15', '.1/2', 'NOKIA OTN PKT-23/3-UDM-21/3');

INSERT INTO afnet_maan_services (ar_number, sr_no, link_name, network_type, source_station, source_ip, source_node_port, sink_station, sink_ip, sink_node_port, remarks) VALUES
('AR-2', 1, 'PKT-BNL2', 'GDP', 'GDP', '10.125.0.6', '.16/1', 'IAF-PKT-AR2', '10.125.0.16', '.1/1', 'CPAN-PKT-132-3-2/3-BNL-3-14-8/2'),
('AR-2', 2, 'PKT-DLU', 'PKT', 'PKT', '10.125.0.5', '.16/3', 'IAF-PKT-AR2', '10.125.0.16', '.1/2', 'CPAN-PKT-132-10-2/2-DLU-110-13-3/1'),
('AR-2', 3, 'PKT-UDM-2', 'PKT', 'PKT', '10.125.0.5', '.7/8', 'IAF-PKT-AR2', '10.125.0.16', '.1/3', 'NOKIA OTN PKT-23/3-UDM-21/3');

INSERT INTO afnet_madm_services (ar_number, sr_no, link_name, network_type, source_station, source_ip, source_node_port, sink_station, sink_ip, sink_node_port, remarks) VALUES
('AR-1', 1, 'PKT-BNL1', 'PKT', 'PKT', '10.118.214.231', '.15/4', 'IAF-PKT-AR1', '10.118.215.233', '.15/4', 'PB-34-2/7');

INSERT INTO afnet_madm_services (ar_number, sr_no, link_name, network_type, source_station, source_ip, source_node_port, sink_station, sink_ip, sink_node_port, remarks) VALUES
('AR-2', 1, 'PKT-DLU', 'PKT', 'PKT', '10.118.214.231', '.15/3', 'IAF-PKT-AR2', '10.118.215.234', '.15/4', 'HP-14-2/8');
