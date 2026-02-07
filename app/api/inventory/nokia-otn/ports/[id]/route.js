/**
 * Nokia OTN Port API
 * GET /api/inventory/nokia-otn/ports/[id] - Get single port
 * PUT /api/inventory/nokia-otn/ports/[id] - Update port
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

// GET - Get single port
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const query = `
      SELECT p.*, c.card_model, c.location as card_location
      FROM nokia_otn_ports p
      LEFT JOIN nokia_otn_cards c ON p.card_id = c.id
      WHERE p.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Port not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching port:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update port
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      destination_location,
      destination_port_no,
      service_name,
      service_type,
      remarks,
      status
    } = body;
    
    const query = `
      UPDATE nokia_otn_ports
      SET 
        destination_location = COALESCE($1, destination_location),
        destination_port_no = COALESCE($2, destination_port_no),
        service_name = COALESCE($3, service_name),
        service_type = COALESCE($4, service_type),
        remarks = COALESCE($5, remarks),
        status = COALESCE($6, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      destination_location,
      destination_port_no,
      service_name,
      service_type,
      remarks,
      status,
      id
    ];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Port not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Port updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating port:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
