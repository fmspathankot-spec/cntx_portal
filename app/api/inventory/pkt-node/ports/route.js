/**
 * PKT Node Ports API
 * POST /api/inventory/pkt-node/ports - Create new port
 * PUT /api/inventory/pkt-node/ports - Update port
 * DELETE /api/inventory/pkt-node/ports - Delete port
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

// POST - Create new port
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      node_id,
      sr_no,
      port_type,
      source_port_no,
      destination_ip,
      destination_location,
      destination_port_no,
      service_name,
      remarks
    } = body;

    const query = `
      INSERT INTO pkt_node_ports (
        node_id, sr_no, port_type, source_port_no, 
        destination_ip, destination_location, destination_port_no,
        service_name, remarks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(query, [
      node_id,
      sr_no,
      port_type,
      source_port_no,
      destination_ip,
      destination_location,
      destination_port_no,
      service_name,
      remarks
    ]);

    return NextResponse.json({
      success: true,
      port: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating port:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update port
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      port_type,
      source_port_no,
      destination_ip,
      destination_location,
      destination_port_no,
      service_name,
      remarks
    } = body;

    const query = `
      UPDATE pkt_node_ports
      SET 
        port_type = $1,
        source_port_no = $2,
        destination_ip = $3,
        destination_location = $4,
        destination_port_no = $5,
        service_name = $6,
        remarks = $7
      WHERE id = $8
      RETURNING *
    `;

    const result = await pool.query(query, [
      port_type,
      source_port_no,
      destination_ip,
      destination_location,
      destination_port_no,
      service_name,
      remarks,
      id
    ]);

    return NextResponse.json({
      success: true,
      port: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating port:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete port
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const query = `
      UPDATE pkt_node_ports
      SET is_active = false
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    return NextResponse.json({
      success: true,
      port: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting port:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
