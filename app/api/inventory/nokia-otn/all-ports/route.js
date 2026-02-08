/**
 * Nokia OTN All Ports API
 * GET /api/inventory/nokia-otn/all-ports - Get all ports across all cards with filters
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
    const { searchParams } = new URL(request.url);
    const hasService = searchParams.get('hasService');
    const portType = searchParams.get('portType');
    const serviceType = searchParams.get('serviceType');
    
    console.log('[All Ports API] Filters:', { hasService, portType, serviceType });
    
    let query = `
      SELECT 
        p.*
      FROM nokia_otn_ports p
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Filter by ports with services
    if (hasService === 'true') {
      query += ` AND (p.service_name IS NOT NULL AND p.service_name != '')`;
      console.log('[All Ports API] Adding hasService filter');
    }
    
    // Filter by port type (10G, 2.5G, 1G)
    if (portType) {
      query += ` AND p.port_type = $${paramCount}`;
      params.push(portType);
      console.log('[All Ports API] Adding portType filter:', portType);
      paramCount++;
    }
    
    // Filter by service type (LAN, WAN)
    if (serviceType) {
      query += ` AND p.service_type = $${paramCount}`;
      params.push(serviceType);
      console.log('[All Ports API] Adding serviceType filter:', serviceType);
      paramCount++;
    }
    
    query += ` ORDER BY p.card_number, p.sr_no`;
    
    console.log('[All Ports API] Final Query:', query);
    console.log('[All Ports API] Query Params:', params);
    
    const result = await pool.query(query, params);
    
    console.log('[All Ports API] Results found:', result.rows.length);
    
    return NextResponse.json({
      success: true,
      ports: result.rows,
      count: result.rows.length,
      filters: {
        hasService,
        portType,
        serviceType
      }
    });
    
  } catch (error) {
    console.error('[All Ports API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
