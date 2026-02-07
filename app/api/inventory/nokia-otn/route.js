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
      GROUP BY c.id
      ORDER BY c.card_number
    `;
    
    const cardsResult = await pool.query(cardsQuery, [status]);
    
    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT card_number) as total_cards,
        COUNT(*) as total_ports,
        COUNT(CASE WHEN destination_location IS NOT NULL THEN 1 END) as used_ports,
        COUNT(CASE WHEN destination_location IS NULL THEN 1 END) as free_ports,
        COUNT(DISTINCT destination_location) as total_destinations
      FROM nokia_otn_ports
    `;
    
    const statsResult = await pool.query(statsQuery);
    
    return NextResponse.json({
      success: true,
      cards: cardsResult.rows,
      statistics: statsResult.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching Nokia OTN inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
