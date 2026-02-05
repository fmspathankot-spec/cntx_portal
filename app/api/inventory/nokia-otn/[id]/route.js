/**
 * Nokia OTN Inventory Item API
 * GET /api/inventory/nokia-otn/[id] - Get single item
 * PUT /api/inventory/nokia-otn/[id] - Update item
 * DELETE /api/inventory/nokia-otn/[id] - Delete item
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

// GET - Get single inventory item
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const query = `
      SELECT * FROM nokia_otn_inventory
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update inventory item
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    // List of updatable fields
    const updatableFields = [
      'card_number', 'card_type', 'card_description',
      'location', 'rack_number', 'shelf_number', 'slot_number',
      'part_number', 'serial_number', 'hardware_version', 'software_version',
      'operational_status', 'admin_status', 'health_status',
      'node_name', 'node_ip', 'network_element',
      'port_count', 'bandwidth_capacity', 'current_utilization',
      'vendor', 'manufacturer', 'purchase_date', 'warranty_expiry',
      'installation_date', 'commissioned_date',
      'last_maintenance_date', 'next_maintenance_date',
      'notes', 'tags', 'category', 'updated_by'
    ];
    
    // Build SET clause
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }
    
    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Add ID to values
    values.push(id);
    
    const query = `
      UPDATE nokia_otn_inventory
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Inventory item updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Card number or serial number already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete inventory item
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const query = `
      DELETE FROM nokia_otn_inventory
      WHERE id = $1
      RETURNING card_number
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Inventory item ${result.rows[0].card_number} deleted successfully`
    });
    
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
