import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cntx_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

export async function GET(request) {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.hostname,
        r.ip_address,
        r.location,
        r.device_type,
        COUNT(DISTINCT ri.id) as interface_count,
        MAX(pr.reading_time) as last_reading_time
      FROM routers r
      LEFT JOIN router_interfaces ri ON r.id = ri.router_id
      LEFT JOIN parameter_readings pr ON r.id = pr.router_id
      WHERE r.is_active = true AND r.device_type = 'tejas'
      GROUP BY r.id, r.hostname, r.ip_address, r.location, r.device_type
      ORDER BY r.hostname
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching routers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
