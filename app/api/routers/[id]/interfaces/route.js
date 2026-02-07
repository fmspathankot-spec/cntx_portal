/**
 * Router Interfaces Management API
 * GET /api/routers/[id]/interfaces - List all interfaces for a router
 * POST /api/routers/[id]/interfaces - Add new interface
 * PUT /api/routers/[id]/interfaces - Update interface
 * DELETE /api/routers/[id]/interfaces - Delete interface
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

// GET - List all interfaces for a router
export async function GET(request, { params }) {
  try {
    // Await params for Next.js 15
    const { id: routerId } = await params;
    
    const query = `
      SELECT 
        id,
        router_id,
        interface_name,
        interface_type,
        description,
        is_active,
        created_at,
        updated_at
      FROM router_interfaces
      WHERE router_id = $1
      ORDER BY interface_name
    `;
    
    const result = await pool.query(query, [routerId]);
    
    return NextResponse.json({
      success: true,
      interfaces: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Get Interfaces Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Add new interface
export async function POST(request, { params }) {
  try {
    // Await params for Next.js 15
    const { id: routerId } = await params;
    const body = await request.json();
    
    const { interface_name, interface_type, description, is_active } = body;
    
    if (!interface_name || !interface_type) {
      return NextResponse.json(
        { success: false, error: 'Interface name and type are required' },
        { status: 400 }
      );
    }
    
    // Check if interface already exists
    const checkQuery = `
      SELECT id FROM router_interfaces
      WHERE router_id = $1 AND interface_name = $2
    `;
    const checkResult = await pool.query(checkQuery, [routerId, interface_name]);
    
    if (checkResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Interface already exists' },
        { status: 409 }
      );
    }
    
    const insertQuery = `
      INSERT INTO router_interfaces 
        (router_id, interface_name, interface_type, description, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      routerId,
      interface_name,
      interface_type,
      description || null,
      is_active !== undefined ? is_active : true
    ]);
    
    return NextResponse.json({
      success: true,
      interface: result.rows[0],
      message: 'Interface added successfully'
    });
    
  } catch (error) {
    console.error('Add Interface Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update interface
export async function PUT(request, { params }) {
  try {
    // Await params for Next.js 15
    const { id: routerId } = await params;
    const body = await request.json();
    
    const { id, interface_name, interface_type, description, is_active } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Interface ID is required' },
        { status: 400 }
      );
    }
    
    const updateQuery = `
      UPDATE router_interfaces
      SET 
        interface_name = COALESCE($1, interface_name),
        interface_type = COALESCE($2, interface_type),
        description = COALESCE($3, description),
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND router_id = $6
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      interface_name,
      interface_type,
      description,
      is_active,
      id,
      routerId
    ]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Interface not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      interface: result.rows[0],
      message: 'Interface updated successfully'
    });
    
  } catch (error) {
    console.error('Update Interface Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete interface
export async function DELETE(request, { params }) {
  try {
    // Await params for Next.js 15
    const { id: routerId } = await params;
    const { searchParams } = new URL(request.url);
    const interfaceId = searchParams.get('interfaceId');
    
    if (!interfaceId) {
      return NextResponse.json(
        { success: false, error: 'Interface ID is required' },
        { status: 400 }
      );
    }
    
    const deleteQuery = `
      DELETE FROM router_interfaces
      WHERE id = $1 AND router_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(deleteQuery, [interfaceId, routerId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Interface not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Interface deleted successfully',
      interface: result.rows[0]
    });
    
  } catch (error) {
    console.error('Delete Interface Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
