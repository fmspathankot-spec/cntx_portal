/**
 * PKT Node Inventory API
 * GET /api/inventory/pkt-node - Get all nodes or specific node ports
 * POST /api/inventory/pkt-node - Create new node
 * PUT /api/inventory/pkt-node - Update node
 * DELETE /api/inventory/pkt-node - Delete node
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

// GET - Fetch nodes or node ports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get('nodeId');
    const search = searchParams.get('search');
    const portType = searchParams.get('portType');
    const destination = searchParams.get('destination');

    if (nodeId) {
      // Fetch ports for specific node
      let query = `
        SELECT p.* 
        FROM pkt_node_ports p
        WHERE p.node_id = $1 AND p.is_active = true
      `;
      const params = [nodeId];
      let paramCount = 2;

      // Add search filter
      if (search) {
        query += ` AND (
          p.source_port_no ILIKE $${paramCount} OR
          p.service_name ILIKE $${paramCount} OR
          p.destination_location ILIKE $${paramCount} OR
          p.destination_ip ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Add port type filter
      if (portType) {
        query += ` AND p.port_type = $${paramCount}`;
        params.push(portType);
        paramCount++;
      }

      // Add destination filter
      if (destination) {
        query += ` AND p.destination_location = $${paramCount}`;
        params.push(destination);
        paramCount++;
      }

      query += ` ORDER BY p.sr_no`;

      const portsResult = await pool.query(query, params);

      return NextResponse.json({
        success: true,
        ports: portsResult.rows
      });

    } else {
      // Fetch all nodes with statistics
      const nodesQuery = `
        SELECT 
          n.*,
          COUNT(p.id) as total_ports,
          COUNT(CASE WHEN p.service_name IS NOT NULL AND p.service_name != '' THEN 1 END) as used_ports,
          COUNT(CASE WHEN p.service_name IS NULL OR p.service_name = '' THEN 1 END) as free_ports
        FROM pkt_nodes n
        LEFT JOIN pkt_node_ports p ON n.id = p.node_id AND p.is_active = true
        WHERE n.is_active = true
        GROUP BY n.id
        ORDER BY n.node_id
      `;

      const nodesResult = await pool.query(nodesQuery);

      // Calculate overall statistics
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT n.id) as total_nodes,
          COUNT(p.id) as total_ports,
          COUNT(CASE WHEN p.service_name IS NOT NULL AND p.service_name != '' THEN 1 END) as used_ports,
          COUNT(CASE WHEN p.service_name IS NULL OR p.service_name = '' THEN 1 END) as free_ports,
          COUNT(CASE WHEN p.service_name IS NOT NULL AND p.service_name != '' THEN 1 END) as live_services
        FROM pkt_nodes n
        LEFT JOIN pkt_node_ports p ON n.id = p.node_id AND p.is_active = true
        WHERE n.is_active = true
      `;

      const statsResult = await pool.query(statsQuery);

      // Get port type counts (only for ports with services)
      const portTypeQuery = `
        SELECT 
          port_type,
          COUNT(*) as count
        FROM pkt_node_ports
        WHERE is_active = true 
          AND service_name IS NOT NULL 
          AND service_name != ''
        GROUP BY port_type
        ORDER BY port_type
      `;

      const portTypeResult = await pool.query(portTypeQuery);
      const portTypeCounts = {};
      portTypeResult.rows.forEach(row => {
        portTypeCounts[row.port_type] = parseInt(row.count);
      });

      return NextResponse.json({
        success: true,
        nodes: nodesResult.rows,
        statistics: {
          ...statsResult.rows[0],
          port_type_counts: portTypeCounts
        }
      });
    }

  } catch (error) {
    console.error('Error fetching PKT nodes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new node
export async function POST(request) {
  try {
    const body = await request.json();
    const { node_id, node_name, node_ip, location, description } = body;

    const query = `
      INSERT INTO pkt_nodes (node_id, node_name, node_ip, location, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      node_id,
      node_name,
      node_ip,
      location,
      description
    ]);

    return NextResponse.json({
      success: true,
      node: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating PKT node:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update node
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, node_name, node_ip, location, description } = body;

    const query = `
      UPDATE pkt_nodes
      SET node_name = $1, node_ip = $2, location = $3, description = $4
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [
      node_name,
      node_ip,
      location,
      description,
      id
    ]);

    return NextResponse.json({
      success: true,
      node: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating PKT node:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete node
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const query = `
      UPDATE pkt_nodes
      SET is_active = false
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    return NextResponse.json({
      success: true,
      node: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting PKT node:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
