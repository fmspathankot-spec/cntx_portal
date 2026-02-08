-- PKT Node Inventory Schema
-- Stores PKT node information and port details

-- Create PKT Nodes table
CREATE TABLE IF NOT EXISTS pkt_nodes (
  id SERIAL PRIMARY KEY,
  node_id VARCHAR(50) NOT NULL UNIQUE,
  node_name VARCHAR(100) NOT NULL,
  node_ip VARCHAR(50) NOT NULL,
  location VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create PKT Node Ports table
CREATE TABLE IF NOT EXISTS pkt_node_ports (
  id SERIAL PRIMARY KEY,
  node_id INTEGER REFERENCES pkt_nodes(id) ON DELETE CASCADE,
  sr_no INTEGER NOT NULL,
  port_type VARCHAR(20) NOT NULL, -- 10G, 100G, 1G, STM-1, etc.
  source_port_no VARCHAR(50) NOT NULL,
  destination_ip VARCHAR(50),
  destination_location VARCHAR(100),
  destination_port_no VARCHAR(50),
  service_name TEXT,
  remarks TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(node_id, sr_no)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pkt_nodes_node_id ON pkt_nodes(node_id);
CREATE INDEX IF NOT EXISTS idx_pkt_nodes_is_active ON pkt_nodes(is_active);
CREATE INDEX IF NOT EXISTS idx_pkt_node_ports_node_id ON pkt_node_ports(node_id);
CREATE INDEX IF NOT EXISTS idx_pkt_node_ports_port_type ON pkt_node_ports(port_type);
CREATE INDEX IF NOT EXISTS idx_pkt_node_ports_is_active ON pkt_node_ports(is_active);

-- Insert sample PKT Node (from image)
INSERT INTO pkt_nodes (node_id, node_name, node_ip, location, description)
VALUES 
  ('9008', 'PKT-NODE-9008', '10.125.0.5', 'C1', 'PKT Node IP 10.125.0.5 (C1) - Node ID-9008')
ON CONFLICT (node_id) DO NOTHING;

-- Insert sample ports from the image
INSERT INTO pkt_node_ports (node_id, sr_no, port_type, source_port_no, destination_ip, destination_location, destination_port_no, service_name, remarks)
SELECT 
  (SELECT id FROM pkt_nodes WHERE node_id = '9008'),
  sr_no,
  port_type,
  source_port_no,
  destination_ip,
  destination_location,
  destination_port_no,
  service_name,
  remarks
FROM (VALUES
  (1, '10G', 'ETH-1-4-1', '10.125.0.146', 'PKT-TX', 'ETH-1-5-10', 'PKT-CNN-C1 TO PKT-TX-C1', 'NNI LINK-001-PKT-TX-F.NO.3&4'),
  (2, '10G', 'ETH-1-4-2', '218.248.176.77', 'NIB MPLS', 'GE-5-0-3', '4G BTS LINK TO NIB MPLS', 'E-10B-F.NO 21&22'),
  (3, '10G', 'ETH-1-4-3', NULL, NULL, NULL, NULL, NULL),
  (4, '10G', 'ETH-1-4-4', NULL, NULL, NULL, NULL, NULL),
  (5, '100G', 'ETH-1-4-5', NULL, NULL, NULL, NULL, NULL),
  (6, '100G', 'ETH-1-4-6', '10.125.100.38', 'JASSUR-HP', 'ETH-1-4-6', 'PKT-CNN-C1 TO JASSUR-CNN-C1', 'NNI LINK(PKT-JASUR CABLE-F.NO.3&4)'),
  (7, '10G', 'ETH-1-5-1', '10.125.100.20', 'DHARAMSHALLA HP', 'ETH-1-5-1', 'PKT-CNN-C1 TO DMA-CNN-C1', 'NNI LINK (DMA-15/12 TO PKT-16/2 --FH OTN)'),
  (8, '10G', 'ETH-1-5-2', NULL, NULL, NULL, NULL, NULL),
  (9, '10G', 'ETH-1-5-3', '10.218.130.209', 'NIBPKT-BNG', 'LAG-49-1-1-29', 'FTTH OLTES LINK-01-TO BNG PKT', 'E-10B-F.NO 9&10'),
  (10, '10G', 'ETH-1-5-4', NULL, NULL, NULL, NULL, NULL),
  (11, '10G', 'ETH-1-5-5', NULL, NULL, NULL, NULL, NULL),
  (12, '10G', 'ETH-1-5-6', NULL, NULL, NULL, NULL, NULL),
  (13, '10G', 'ETH-1-5-7', NULL, NULL, NULL, NULL, NULL),
  (14, '10G', 'ETH-1-5-8', NULL, NULL, NULL, NULL, NULL),
  (15, '10G', 'ETH-1-5-9', NULL, NULL, NULL, NULL, NULL),
  (16, '10G', 'ETH-1-5-10', NULL, NULL, NULL, NULL, NULL),
  (17, '100G', 'ETH-1-5-11', '10.125.0.10', 'NANGAL BHOOR', 'ETH-1-1-1', 'PKT-CNN-C1 TO NBR-B4', 'NNI LINK(PKT-MKN CABLE F.NO.-11&12)'),
  (18, '10G', 'ETH-1-6-1', NULL, NULL, NULL, NULL, NULL),
  (19, '10G', 'ETH-1-6-2', '10.125.0.6', 'GDP-CNN', 'ETH-1-6-2', 'CPAN-PKT-132-5-6/2-GDP-132-11-6/2', 'CPAN-PKT-132-5-6/2- GDP-132-11-6/2'),
  (20, '10G', 'ETH-1-6-3', '10.125.0.146', 'PKT-TX', 'ETH-1-6-3', 'PKT-CNN-C1 TO PKT-TX-C1', 'NNI LINK-002-PKT-TX'),
  (21, '10G', 'ETH-1-6-4', '10.125.0.9', 'PKT-DNN-CPAN', 'ETH-1-1-4', 'CPAN-PKT-132-1-1/2-DNN-132-2-6/2', NULL),
  (22, '10G', 'ETH-1-6-5', NULL, NULL, NULL, NULL, NULL),
  (23, '10G', 'ETH-1-6-6', '218.248.176.77', 'NIB MPLS', '10GE-5-0-1', 'LINK FOR LEASEDLINE.', 'F NO 39&41'),
  (24, '10G', 'ETH-1-6-7', NULL, NULL, NULL, NULL, NULL),
  (25, '10G', 'ETH-1-6-8', NULL, NULL, NULL, NULL, NULL),
  (26, '10G', 'ETH-1-6-9', NULL, NULL, NULL, NULL, NULL),
  (27, '10G', 'ETH-1-6-10', NULL, NULL, NULL, NULL, NULL),
  (28, '100G', 'ETH-1-6-11', '10.125.0.9', 'DINANAGAR', 'ETH-1-1-1', 'PKT-CNN-C1 TO DNN-B4', 'NNI LINK (PKT-DNN- F.NO.19&21--- PKT-DNN-VIA CABLE)'),
  (29, '10G', 'ETH-1-7-1', '10.125.0.6', 'GDP-CNN', 'ETH-1-7-1', 'PKT-GDP-CPAN SERVICE', 'CPAN-PKT-132-1-4/1 -GDP-132-3-8/2'),
  (30, '10G', 'ETH-1-7-2', '10.125.0.15', 'IAF-AR1', 'ETH-1-1-13', 'PKT-CNN-C1 TO PKT-IAF-AR1', 'NNI LINK (F.NO.21&23--PKT-GHAROTA CABLE)'),
  (31, '10G', 'ETH-1-7-3', NULL, NULL, NULL, NULL, NULL),
  (32, '10G', 'ETH-1-7-4', '218.248.176.77', 'NIB MPLS', 'GE-5-0-0', 'MPLS LINK FROM PKT MPLS TO BATALA-BNG', 'E-10B-F.NO 5&6'),
  (33, '10G', 'ETH-1-7-5', '10.218.130.209', 'NIBPKT-BNG', 'LAG-43-1-1-23', 'FTTH OLTES LINK-02-TO BNG PKT', 'E-10B-F.NO 3&637'),
  (34, '10G', 'ETH-1-7-6', NULL, NULL, NULL, NULL, NULL),
  (35, '10G', 'ETH-1-7-7', NULL, NULL, NULL, NULL, NULL),
  (36, '10G', 'ETH-1-7-8', '10.136.136.47', 'OTN-NOKIA', 'ETH-23/03', 'PKT-23/3--UDM-21/3 OTN NOKIA FOR AFNET SERVICES PKT-UDM', '1. IAF-AR1-10.125.0.15 ETH-1-1-2 -PKT-UDM1 2. IAF-AR2-10.125.0.16 ETH-1-1-3-PKT-UDM2'),
  (37, '1G', 'ETH-1-12-1', NULL, NULL, NULL, NULL, NULL),
  (38, '1G', 'ETH-1-12-2', NULL, NULL, NULL, NULL, NULL),
  (39, '1G', 'ETH-1-12-3', NULL, NULL, NULL, NULL, NULL),
  (40, '1G', 'ETH-1-12-4', NULL, NULL, NULL, NULL, NULL),
  (41, 'STM-1', 'STM-1-12-5', NULL, NULL, NULL, NULL, NULL),
  (42, 'STM-1', 'STM-1-12-6', NULL, NULL, NULL, NULL, NULL),
  (43, 'STM-1', 'STM-1-12-7', NULL, NULL, NULL, NULL, NULL),
  (44, 'STM-1', 'STM-1-12-8', NULL, NULL, NULL, NULL, NULL),
  (45, '1G', 'ETH-1-15-1', '218.248.176.77', 'NIB MPLS', 'GE-16-0-12', 'MAAN GNE LINK TO NIB MPLS', 'E-10B-F.NO 1&2'),
  (46, '1G', 'ETH-1-15-2', NULL, NULL, NULL, NULL, NULL),
  (47, '1G', 'ETH-1-15-3', NULL, NULL, NULL, NULL, NULL),
  (48, '1G', 'ETH-1-15-4', NULL, NULL, NULL, NULL, NULL),
  (49, '1G', 'ETH-1-15-5', NULL, NULL, NULL, NULL, NULL),
  (50, '1G', 'ETH-1-15-6', '10.125.0.10', 'NANGAL BHOOR', '1-1-22', 'CPAN-PTK-NGL', 'CPAN-PTK-NGL'),
  (51, '1G', 'ETH-1-15-7', '218.248.176.77', 'NIB MPLS', 'GE-16-0-12', 'LEASED LINES LINK TO NIB MPLS', 'E-10B-F.NO 13&14'),
  (52, '1G', 'ETH-1-15-8', '218.248.176.77', 'NIB MPLS', 'GE-1-0-26', 'WIFI RODMING LINK TO NIB MPL', 'E-10B-F.NO 19&20'),
  (53, '1G', 'ETH-1-16-1', '10.125.0.15', 'IAF-AR1', 'ETH-1-1-1', 'IAF-AR1-BNL1', 'MAIN-LINK- OTN-PA-- PKT-30/13--PAT-29/13 S/B-LINK- CPAN-PKT-434-12-3/5--PAT-140-2-2/2'),
  (54, '1G', 'ETH-1-16-2', NULL, NULL, NULL, NULL, NULL),
  (55, '1G', 'ETH-1-16-3', '10.125.0.16', 'IAF-AR2', 'ETH-1-1-2', 'IAF-AR2-DLU', 'CPAN-PKT-132-10-2/2-DLU-110-13-3/1'),
  (56, '1G', 'ETH-1-16-4', NULL, NULL, NULL, NULL, NULL),
  (57, '1G', 'ETH-1-16-5', NULL, NULL, NULL, NULL, NULL),
  (58, '1G', 'ETH-1-16-6', NULL, NULL, NULL, NULL, NULL),
  (59, '1G', 'ETH-1-16-7', NULL, NULL, NULL, NULL, NULL),
  (60, '1G', 'ETH-1-16-8', NULL, NULL, NULL, NULL, NULL),
  (61, '1G', 'ETH-1-17-1', NULL, NULL, NULL, NULL, NULL),
  (62, '1G', 'ETH-1-17-2', NULL, NULL, NULL, NULL, NULL),
  (63, '1G', 'ETH-1-17-3', NULL, NULL, NULL, NULL, NULL),
  (64, '1G', 'ETH-1-17-4', NULL, NULL, NULL, NULL, NULL),
  (65, '1G', 'ETH-1-17-5', NULL, NULL, NULL, NULL, NULL),
  (66, '1G', 'ETH-1-17-6', NULL, NULL, NULL, NULL, NULL),
  (67, '1G', 'ETH-1-17-7', NULL, NULL, NULL, NULL, NULL),
  (68, '1G', 'ETH-1-17-8', NULL, NULL, NULL, NULL, NULL),
  (69, '1G', 'ETH-1-18-1', NULL, NULL, NULL, NULL, NULL),
  (70, '1G', 'ETH-1-18-2', NULL, NULL, NULL, NULL, NULL),
  (71, '1G', 'ETH-1-18-3', NULL, NULL, NULL, NULL, NULL),
  (72, '1G', 'ETH-1-18-4', NULL, NULL, NULL, NULL, NULL),
  (73, '1G', 'ETH-1-18-5', NULL, NULL, NULL, NULL, NULL),
  (74, '1G', 'ETH-1-18-6', NULL, NULL, NULL, NULL, NULL),
  (75, '1G', 'ETH-1-18-7', NULL, NULL, NULL, NULL, NULL),
  (76, '1G', 'ETH-1-18-8', NULL, NULL, NULL, NULL, NULL)
) AS data(sr_no, port_type, source_port_no, destination_ip, destination_location, destination_port_no, service_name, remarks)
ON CONFLICT (node_id, sr_no) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pkt_node_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pkt_nodes_updated_at
  BEFORE UPDATE ON pkt_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_pkt_node_updated_at();

CREATE TRIGGER update_pkt_node_ports_updated_at
  BEFORE UPDATE ON pkt_node_ports
  FOR EACH ROW
  EXECUTE FUNCTION update_pkt_node_updated_at();

COMMENT ON TABLE pkt_nodes IS 'Stores PKT node information';
COMMENT ON TABLE pkt_node_ports IS 'Stores port details for each PKT node';
