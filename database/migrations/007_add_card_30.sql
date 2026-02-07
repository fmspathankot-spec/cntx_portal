-- Add CARD-30 (20MX80) to Nokia OTN Inventory

-- Insert Card-30
INSERT INTO nokia_otn_cards (card_number, card_model, total_ports, port_type, location, status) VALUES
('CARD-30', '20MX80', 20, 'Mixed', 'Pathankot', 'Active');

-- Insert Port Data for CARD-30
INSERT INTO nokia_otn_ports (card_id, card_number, sr_no, port_type, source_port_no, destination_location, destination_port_no, service_name, service_type, remarks) VALUES
(5, 'CARD-30', 1, '2.5G', '1/30/1', 'AMRITSAR', '1/29/1', 'PKT-ASR-PB-23', 'LAN', 'PKT-PB-23-OLTE-7'),
(5, 'CARD-30', 2, NULL, '1/30/2', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 3, '2.5G', '1/30/3', 'AMRITSAR', '1/29/3', 'PKT-ASR-PB-33', 'LAN', 'PKT-PB-33-OLTE-10'),
(5, 'CARD-30', 4, NULL, '1/30/4', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 5, '2.5G', '1/30/5', 'AMRITSAR', '1/29/5', 'PKT-ASR-PB-08', 'LAN', NULL),
(5, 'CARD-30', 6, NULL, '1/30/6', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 7, NULL, '1/30/7', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 8, NULL, '1/30/8', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 9, NULL, '1/30/9', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 10, NULL, '1/30/10', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 11, '2.5', '1/30/11', 'JALANDHAR', '1/30/11', 'PKT-JLD-HP-14', 'LAN', 'HP-14 OLTE-10'),
(5, 'CARD-30', 12, NULL, '1/30/12', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 13, '1G', '1/30/13', 'PATIALA', '1/29/13', 'PKT-BNL-AR1', 'LAN', 'AN -PKT-10.125.0.5-16/1 TO IAF-AR1-10.1250.15-'),
(5, 'CARD-30', 14, NULL, '1/30/14', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 15, NULL, '1/30/15', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 16, NULL, '1/30/16', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 17, NULL, '1/30/17', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 18, NULL, '1/30/18', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 19, NULL, '1/30/19', NULL, NULL, NULL, NULL, NULL),
(5, 'CARD-30', 20, NULL, '1/30/20', NULL, NULL, NULL, NULL, NULL);

-- Verify
SELECT card_number, card_model, total_ports, port_type FROM nokia_otn_cards WHERE card_number = 'CARD-30';
SELECT COUNT(*) as port_count FROM nokia_otn_ports WHERE card_number = 'CARD-30';
