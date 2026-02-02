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
    const { searchParams } = new URL(request.url);
    const routerId = searchParams.get('router_id');
    const interfaceId = searchParams.get('interface_id');
    
    let query = `
      SELECT * FROM v_tejas_sfp_100g_stats
      WHERE 1=1
    `;
    
    const params = [];
    
    if (routerId) {
      query += ` AND router_id = $${params.length + 1}`;
      params.push(routerId);
    }
    
    if (interfaceId) {
      query += ` AND interface_id = $${params.length + 1}`;
      params.push(interfaceId);
    }
    
    query += ` ORDER BY hostname, interface_name`;
    
    const result = await pool.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching SFP stats:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
