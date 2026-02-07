/**
 * Nokia OTN Inventory API
 * GET /api/inventory/nokia-otn - List all cards with port summary
 * GET /api/inventory/nokia-otn?cardNumber=CARD-07 - Get specific card with all ports
 */

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// GET - List cards or get specific card with ports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const cardNumber = searchParams.get('cardNumber');
    const search = searchParams.get('search') || '';
    const destination = searchParams.get('destination') || '';
    const serviceType = searchParams.get('serviceType') || '';
    const status = searchParams.get('status') || 'Active';
    
    // If specific card requested
    if (cardNumber) {
      // Get card details
      const cardQuery = `
        SELECT * FROM nokia_otn_cards
        WHERE card_number = $1
      `;
      const cardResult = await pool.query(cardQuery, [cardNumber]);
      
      if (cardResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Card not found' },
          { status: 404 }
        );
      }
      
      // Get all ports for this card
      let portsQuery = `
        SELECT * FROM nokia_otn_ports
        WHERE card_number = $1
      `;
      
      const params = [cardNumber];
      let paramIndex = 2;
      
      // Apply filters
      if (search) {
        portsQuery += ` AND (
          service_name ILIKE $${paramIndex} OR
          destination_location ILIKE $${paramIndex} OR
          remarks ILIKE $${paramIndex}
        )`;
        params.push(`%${search}%`);
        paramIndex++;
      }
      
      if (destination) {
        portsQuery += ` AND destination_location ILIKE $${paramIndex}`;
        params.push(`%${destination}%`);
        paramIndex++;
      }
      
      if (serviceType) {
        portsQuery += ` AND service_type = $${paramIndex}`;
        params.push(serviceType);
        paramIndex++;
      }
      
      portsQuery += ` ORDER BY sr_no`;
      
      const portsResult = await pool.query(portsQuery, params);
      
      // Calculate statistics
      const usedPorts = portsResult.rows.filter(p => p.destination_location).length;
      const freePorts = portsResult.rows.filter(p => !p.destination_location).length;
      
      return NextResponse.json({
        success: true,
        card: cardResult.rows[0],
        ports: portsResult.rows,
        statistics: {
          totalPorts: portsResult.rows.length,
          usedPorts,
          freePorts,
          utilizationPercent: ((usedPorts / portsResult.rows.length) * 100).toFixed(2)
        }
      });
    }
    
    // List all cards with summary
    const cardsQuery = `
      SELECT 
        c.*,
        COUNT(p.id) as total_ports,
        COUNT(CASE WHEN p.destination_location IS NOT NULL THEN 1 END) as used_ports,
        COUNT(CASE WHEN p.destination_location IS NULL THEN 1 END) as free_ports
      FROM nokia_otn_cards c
      LEFT JOIN nokia_otn_ports p ON c.card_number = p.card_number
      WHERE c.status = $1
      GROUP BY c.id, c.card_number, c.card_model, c.total_ports, c.port_type, c.location, c.status, c.created_at, c.updated_at
      ORDER BY c.card_number
    `;
    
    const cardsResult = await pool.query(cardsQuery, [status]);
    
    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT c.id) as total_cards,
        COUNT(p.id) as total_ports,
        COUNT(CASE WHEN p.destination_location IS NOT NULL THEN 1 END) as used_ports,
        COUNT(CASE WHEN p.destination_location IS NULL THEN 1 END) as free_ports,
        COUNT(CASE WHEN p.service_name IS NOT NULL AND p.service_name != '' THEN 1 END) as live_services,
        COUNT(CASE WHEN p.service_type = 'LAN' THEN 1 END) as lan_count,
        COUNT(CASE WHEN p.service_type = 'WAN' THEN 1 END) as wan_count
      FROM nokia_otn_cards c
      LEFT JOIN nokia_otn_ports p ON c.card_number = p.card_number
      WHERE c.status = $1
    `;
    
    const statsResult = await pool.query(statsQuery, [status]);
    
    // Get port type counts (only for live services with service_name)
    const portTypeQuery = `
      SELECT 
        port_type,
        COUNT(*) as count
      FROM nokia_otn_ports
      WHERE service_name IS NOT NULL
        AND service_name != ''
        AND port_type IS NOT NULL
      GROUP BY port_type
      ORDER BY port_type
    `;
    
    const portTypeResult = await pool.query(portTypeQuery);
    
    // Convert port type counts to object
    const portTypeCounts = {};
    portTypeResult.rows.forEach(row => {
      portTypeCounts[row.port_type] = parseInt(row.count);
    });
    
    const statistics = {
      ...statsResult.rows[0],
      port_type_counts: portTypeCounts,
      utilizationPercent: statsResult.rows[0].total_ports > 0
        ? ((statsResult.rows[0].used_ports / statsResult.rows[0].total_ports) * 100).toFixed(2)
        : 0
    };
    
    return NextResponse.json({
      success: true,
      cards: cardsResult.rows,
      statistics
    });
    
  } catch (error) {
    console.error('Nokia OTN API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
