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
    const result = await pool.query('SELECT * FROM v_inventory_summary ORDER BY category_code');
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
