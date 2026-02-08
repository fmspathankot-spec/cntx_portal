import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    const nodeType = searchParams.get('nodeType');
    const baName = searchParams.get('baName');
    const ringName = searchParams.get('ringName');
    const search = searchParams.get('search');

    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_nodes,
        COUNT(DISTINCT phase) as total_phases,
        COUNT(DISTINCT node_type) as node_types,
        COUNT(DISTINCT ba_name) as ba_areas,
        COUNT(DISTINCT ring_name) as total_rings
      FROM cpan_nodes
    `;
    
    const statsResult = await pool.query(statsQuery);
    const statistics = statsResult.rows[0];

    // Get phase-wise counts
    const phaseStatsQuery = `
      SELECT 
        phase,
        COUNT(*) as node_count
      FROM cpan_nodes
      GROUP BY phase
      ORDER BY phase
    `;
    
    const phaseStatsResult = await pool.query(phaseStatsQuery);
    const phaseStatistics = phaseStatsResult.rows;

    // Get node type counts
    const nodeTypeStatsQuery = `
      SELECT 
        node_type,
        COUNT(*) as count
      FROM cpan_nodes
      GROUP BY node_type
      ORDER BY node_type
    `;
    
    const nodeTypeStatsResult = await pool.query(nodeTypeStatsQuery);
    const nodeTypeStatistics = nodeTypeStatsResult.rows;

    // Build nodes query with filters
    let nodesQuery = 'SELECT * FROM cpan_nodes WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (phase) {
      nodesQuery += ` AND phase = $${paramCount}`;
      queryParams.push(phase);
      paramCount++;
    }

    if (nodeType) {
      nodesQuery += ` AND node_type = $${paramCount}`;
      queryParams.push(nodeType);
      paramCount++;
    }

    if (baName) {
      nodesQuery += ` AND ba_name = $${paramCount}`;
      queryParams.push(baName);
      paramCount++;
    }

    if (ringName) {
      nodesQuery += ` AND ring_name = $${paramCount}`;
      queryParams.push(ringName);
      paramCount++;
    }

    if (search) {
      nodesQuery += ` AND (node_detail ILIKE $${paramCount} OR node_ip ILIKE $${paramCount} OR node_id ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    nodesQuery += ' ORDER BY sr_no';

    const nodesResult = await pool.query(nodesQuery, queryParams);

    // Get filter options
    const filtersQuery = `
      SELECT 
        array_agg(DISTINCT phase ORDER BY phase) as phases,
        array_agg(DISTINCT node_type ORDER BY node_type) as node_types,
        array_agg(DISTINCT ba_name ORDER BY ba_name) as ba_names,
        array_agg(DISTINCT ring_name ORDER BY ring_name) as ring_names
      FROM cpan_nodes
    `;
    
    const filtersResult = await pool.query(filtersQuery);
    const filters = filtersResult.rows[0];

    return NextResponse.json({
      success: true,
      nodes: nodesResult.rows,
      statistics,
      phaseStatistics,
      nodeTypeStatistics,
      filters
    });

  } catch (error) {
    console.error('Error fetching CPAN nodes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // Build update query dynamically
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE cpan_nodes
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, id]);

    return NextResponse.json({
      success: true,
      node: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating CPAN node:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
