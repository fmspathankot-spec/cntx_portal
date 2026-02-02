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
    const siteCode = searchParams.get('site_code');
    
    if (siteCode) {
      // Get specific site with routes
      const siteQuery = `
        SELECT * FROM v_sites_with_routes 
        WHERE site_code = $1
      `;
      const siteResult = await pool.query(siteQuery, [siteCode]);
      
      const routesQuery = `
        SELECT * FROM get_routes_by_site($1)
      `;
      const routesResult = await pool.query(routesQuery, [siteCode]);
      
      return NextResponse.json({
        site: siteResult.rows[0],
        routes: routesResult.rows
      });
    } else {
      // Get all sites
      const result = await pool.query(`
        SELECT * FROM v_sites_with_routes 
        ORDER BY site_name
      `);
      
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
