/**
 * Nokia OTN Inventory API
 * GET /api/inventory/nokia-otn - List all inventory with filters
 * POST /api/inventory/nokia-otn - Create new inventory item
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

// GET - List inventory with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const cardType = searchParams.get('cardType') || '';
    const status = searchParams.get('status') || '';
    const nodeName = searchParams.get('nodeName') || '';
    
    // Pagination
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = (page - 1) * limit;
    
    // Build query
    let query = `
      SELECT 
        id, card_number, card_type, card_description,
        location, rack_number, shelf_number, slot_number,
        part_number, serial_number, hardware_version, software_version,
        operational_status, admin_status, health_status,
        node_name, node_ip, network_element,
        port_count, bandwidth_capacity, current_utilization,
        vendor, manufacturer, purchase_date, warranty_expiry,
        installation_date, commissioned_date, 
        last_maintenance_date, next_maintenance_date,
        notes, tags, category,
        created_at, updated_at
      FROM nokia_otn_inventory
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Search filter (card_number, serial_number, node_name)
    if (search) {
      query += ` AND (
        card_number ILIKE $${paramIndex} OR 
        serial_number ILIKE $${paramIndex} OR 
        node_name ILIKE $${paramIndex} OR
        card_description ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Location filter
    if (location) {
      query += ` AND location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    // Card type filter
    if (cardType) {
      query += ` AND card_type = $${paramIndex}`;
      params.push(cardType);
      paramIndex++;
    }
    
    // Status filter
    if (status) {
      query += ` AND operational_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Node name filter
    if (nodeName) {
      query += ` AND node_name ILIKE $${paramIndex}`;
      params.push(`%${nodeName}%`);
      paramIndex++;
    }
    
    // Get total count
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const totalItems = parseInt(countResult.rows[0].count);
    
    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    // Execute query
    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasMore: offset + result.rows.length < totalItems
      },
      filters: {
        search,
        location,
        cardType,
        status,
        nodeName
      }
    });
    
  } catch (error) {
    console.error('Error fetching Nokia OTN inventory:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new inventory item
export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      card_number, card_type, card_description,
      location, rack_number, shelf_number, slot_number,
      part_number, serial_number, hardware_version, software_version,
      operational_status, admin_status, health_status,
      node_name, node_ip, network_element,
      port_count, bandwidth_capacity, current_utilization,
      vendor, manufacturer, purchase_date, warranty_expiry,
      installation_date, commissioned_date,
      last_maintenance_date, next_maintenance_date,
      notes, tags, category, created_by
    } = body;
    
    // Validate required fields
    if (!card_number) {
      return NextResponse.json(
        { success: false, error: 'Card number is required' },
        { status: 400 }
      );
    }
    
    const query = `
      INSERT INTO nokia_otn_inventory (
        card_number, card_type, card_description,
        location, rack_number, shelf_number, slot_number,
        part_number, serial_number, hardware_version, software_version,
        operational_status, admin_status, health_status,
        node_name, node_ip, network_element,
        port_count, bandwidth_capacity, current_utilization,
        vendor, manufacturer, purchase_date, warranty_expiry,
        installation_date, commissioned_date,
        last_maintenance_date, next_maintenance_date,
        notes, tags, category, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30
      )
      RETURNING *
    `;
    
    const values = [
      card_number, card_type, card_description,
      location, rack_number, shelf_number, slot_number,
      part_number, serial_number, hardware_version, software_version,
      operational_status || 'Active', admin_status || 'Enabled', health_status || 'Good',
      node_name, node_ip, network_element,
      port_count, bandwidth_capacity, current_utilization,
      vendor || 'Nokia', manufacturer || 'Nokia', purchase_date, warranty_expiry,
      installation_date, commissioned_date,
      last_maintenance_date, next_maintenance_date,
      notes, tags, category || 'OTN', created_by
    ];
    
    const result = await pool.query(query, values);
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Inventory item created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating Nokia OTN inventory:', error);
    
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
