-- CPAN Nodes Inventory Table
CREATE TABLE IF NOT EXISTS cpan_nodes (
    id SERIAL PRIMARY KEY,
    sr_no INTEGER NOT NULL,
    node_detail VARCHAR(100) NOT NULL,
    phase VARCHAR(20),
    node_type VARCHAR(10),
    ba_name VARCHAR(50),
    circle_name VARCHAR(50),
    ne_type VARCHAR(50),
    ring_name VARCHAR(50),
    node_ip VARCHAR(50),
    node_id VARCHAR(20),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cpan_nodes_phase ON cpan_nodes(phase);
CREATE INDEX IF NOT EXISTS idx_cpan_nodes_type ON cpan_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_cpan_nodes_ba ON cpan_nodes(ba_name);
CREATE INDEX IF NOT EXISTS idx_cpan_nodes_circle ON cpan_nodes(circle_name);
CREATE INDEX IF NOT EXISTS idx_cpan_nodes_ring ON cpan_nodes(ring_name);
CREATE INDEX IF NOT EXISTS idx_cpan_nodes_ip ON cpan_nodes(node_ip);

-- Sample data from the provided image
INSERT INTO cpan_nodes (sr_no, node_detail, phase, node_type, ba_name, circle_name, ne_type, ring_name, node_ip, node_id) VALUES
(1, 'PBN_ASR_PTK_RING_03_PKT_B2', 'PH_1', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.4.1', '132-10'),
(2, 'PBN_ASR_PTK_HP_RING_03_DHAR_B2', 'PH_1', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.113', '132-09'),
(3, 'PBN_ASR_PKT_RING_03_DUNERA_B2', 'PH_1', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.4.5', '132-16'),
(4, 'PBN_ASR_PKT_RING_01_PKT_B2_GRE', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.101', '132-01'),
(5, 'PBN_ASR_PKT_RING_01_DINANAGAR_B2', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.117', '132-02'),
(6, 'PBN_ASR_PKT_RING_01_OL_GDSP_B2', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.121', '132-03'),
(7, 'PBN_ASR_PKT_RING_01_MKN_B2', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.53', '132-04'),
(8, 'PBN_ASR_PKT_RING_01_PKT_NTR2_B2', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.109', '132-05'),
(9, 'PBN_ASR_PKT_RING_03_PKT_NTR3_B2', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.105', '132-06'),
(10, 'PBN_ASR_PKT_RING_02_BAT_OFC_B2', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.125', '132-07'),
(11, 'PBN_ASR_PKT_RING_02_KADIAN_OFC_B2', 'PH_2', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.9.129', '132-08'),
(12, 'PBN_ASR_RING_02_PKT_ADD_ON', 'ADD_ON', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_JL_RING_02_ADD_ON', '10.121.129.109', '434-12'),
(13, 'PBN_ASR_PKT_RING_01_GDP_B2_ADD_ON', 'ADD_ON', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.121.129.117', '132-11'),
(14, 'PBN_ASR_PKT_RING_01_SHGP_B1_ADD_ON', 'ADD_ON', 'B1', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.121.129.121', '132-12'),
(15, 'PBN_ASR_PKT_RING_02_DMLI_OFC_B2_ADD_ON', 'ADD_ON', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.121.129.125', '132-13'),
(16, 'PBN_ASR_PKT_RING_03_KOTLI_B1_ADD_ON', 'ADD_ON', 'B1', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.121.129.129', '132-14'),
(17, 'PBN_ASR_PKT_RING_03_GHORATA_B1_ADD_ON', 'ADD_ON', 'B1', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.121.128.77', '132-15'),
(18, 'PBN_ASR_PKT_RING_02_FGCH_B2', 'ADD_ON', 'B2', 'AMRITSAR', 'PBN', 'Citrans 650 U3', 'PBN_PKT_RING', '10.122.128.181', '132-17');
