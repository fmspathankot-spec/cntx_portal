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
    const search = searchParams.get('search');
    const siteCode = searchParams.get('site_code');
    
    let query = `SELECT * FROM v_routes_with_site WHERE 1=1`;
    const params = [];
    let paramCount = 0;
    
    if (siteCode) {
      paramCount++;
      query += ` AND site_code = $${paramCount}`;
      params.push(siteCode);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (
        route_link_name ILIKE $${paramCount} OR 
        site_name ILIKE $${paramCount} OR 
        route_id ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY site_name, sr_no`;
    
    const result = await pool.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
