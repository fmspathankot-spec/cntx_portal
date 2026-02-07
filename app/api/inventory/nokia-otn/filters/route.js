/**
 * Nokia OTN Inventory Filter Options API
 * GET /api/inventory/nokia-otn/filters - Get all unique filter values
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

export async function GET(request) {
  try {
    // Get unique values for filters
    const queries = {
      cards: `SELECT card_number, card_model, total_ports, status FROM nokia_otn_cards ORDER BY card_number`,
      destinations: `SELECT DISTINCT destination_location FROM nokia_otn_ports WHERE destination_location IS NOT NULL ORDER BY destination_location`,
      serviceTypes: `SELECT DISTINCT service_type FROM nokia_otn_ports WHERE service_type IS NOT NULL ORDER BY service_type`,
      serviceNames: `SELECT DISTINCT service_name FROM nokia_otn_ports WHERE service_name IS NOT NULL ORDER BY service_name LIMIT 50`,
    };
    
    const results = await Promise.all([
      pool.query(queries.cards),
      pool.query(queries.destinations),
      pool.query(queries.serviceTypes),
      pool.query(queries.serviceNames),
    ]);
    
    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT c.card_number) as total_cards,
        SUM(c.total_ports) as total_ports,
        COUNT(CASE WHEN p.destination_location IS NOT NULL THEN 1 END) as used_ports,
        COUNT(CASE WHEN p.destination_location IS NULL THEN 1 END) as free_ports,
        COUNT(DISTINCT p.destination_location) as total_destinations,
        COUNT(CASE WHEN p.service_type = 'LAN' THEN 1 END) as lan_services,
        COUNT(CASE WHEN p.service_type = 'WAN' THEN 1 END) as wan_services
      FROM nokia_otn_cards c
      LEFT JOIN nokia_otn_ports p ON c.card_number = p.card_number
    `;
    
    const statsResult = await pool.query(statsQuery);
    
    return NextResponse.json({
      success: true,
      filters: {
        cards: results[0].rows,
        destinations: results[1].rows.map(r => r.destination_location),
        serviceTypes: results[2].rows.map(r => r.service_type),
        serviceNames: results[3].rows.map(r => r.service_name),
      },
      statistics: statsResult.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
