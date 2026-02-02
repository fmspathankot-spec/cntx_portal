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
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT * FROM v_rfts_nodes_with_category
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (category && category !== 'all') {
      paramCount++;
      query += ` AND category_code = $${paramCount}`;
      params.push(category);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (
        node_name ILIKE $${paramCount} OR 
        node_code ILIKE $${paramCount} OR 
        location ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as filtered`;
    const countResult = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Add pagination
    query += ` ORDER BY sr_no LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    return NextResponse.json({
      nodes: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + result.rows.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching inventory nodes:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
