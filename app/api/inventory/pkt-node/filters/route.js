/**
 * PKT Node Filters API
 * GET /api/inventory/pkt-node/filters - Get available filter options
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
    // Get unique port types
    const portTypesQuery = `
      SELECT DISTINCT port_type
      FROM pkt_node_ports
      WHERE is_active = true AND port_type IS NOT NULL
      ORDER BY port_type
    `;

    // Get unique destinations
    const destinationsQuery = `
      SELECT DISTINCT destination_location
      FROM pkt_node_ports
      WHERE is_active = true 
        AND destination_location IS NOT NULL 
        AND destination_location != ''
      ORDER BY destination_location
    `;

    const [portTypesResult, destinationsResult] = await Promise.all([
      pool.query(portTypesQuery),
      pool.query(destinationsQuery)
    ]);

    return NextResponse.json({
      success: true,
      filters: {
        portTypes: portTypesResult.rows.map(row => row.port_type),
        destinations: destinationsResult.rows.map(row => row.destination_location)
      }
    });

  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
