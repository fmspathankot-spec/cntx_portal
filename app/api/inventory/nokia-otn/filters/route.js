/**
 * Nokia OTN Inventory Filter Options API
 * GET /api/inventory/nokia-otn/filters - Get all unique filter values
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

export async function GET(request) {
  try {
    // Get unique values for filters
    const queries = {
      locations: `SELECT DISTINCT location FROM nokia_otn_inventory WHERE location IS NOT NULL ORDER BY location`,
      cardTypes: `SELECT DISTINCT card_type FROM nokia_otn_inventory WHERE card_type IS NOT NULL ORDER BY card_type`,
      statuses: `SELECT DISTINCT operational_status FROM nokia_otn_inventory WHERE operational_status IS NOT NULL ORDER BY operational_status`,
      nodeNames: `SELECT DISTINCT node_name FROM nokia_otn_inventory WHERE node_name IS NOT NULL ORDER BY node_name`,
      vendors: `SELECT DISTINCT vendor FROM nokia_otn_inventory WHERE vendor IS NOT NULL ORDER BY vendor`,
      healthStatuses: `SELECT DISTINCT health_status FROM nokia_otn_inventory WHERE health_status IS NOT NULL ORDER BY health_status`,
    };
    
    const results = await Promise.all([
      pool.query(queries.locations),
      pool.query(queries.cardTypes),
      pool.query(queries.statuses),
      pool.query(queries.nodeNames),
      pool.query(queries.vendors),
      pool.query(queries.healthStatuses),
    ]);
    
    // Get statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(DISTINCT location) as total_locations,
        COUNT(DISTINCT card_type) as total_card_types,
        COUNT(DISTINCT node_name) as total_nodes,
        COUNT(CASE WHEN operational_status = 'Active' THEN 1 END) as active_items,
        COUNT(CASE WHEN operational_status = 'Inactive' THEN 1 END) as inactive_items,
        COUNT(CASE WHEN health_status = 'Good' THEN 1 END) as healthy_items,
        COUNT(CASE WHEN health_status = 'Warning' THEN 1 END) as warning_items,
        COUNT(CASE WHEN health_status = 'Critical' THEN 1 END) as critical_items
      FROM nokia_otn_inventory
    `;
    
    const statsResult = await pool.query(statsQuery);
    
    return NextResponse.json({
      success: true,
      filters: {
        locations: results[0].rows.map(r => r.location),
        cardTypes: results[1].rows.map(r => r.card_type),
        statuses: results[2].rows.map(r => r.operational_status),
        nodeNames: results[3].rows.map(r => r.node_name),
        vendors: results[4].rows.map(r => r.vendor),
        healthStatuses: results[5].rows.map(r => r.health_status),
      },
      statistics: statsResult.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
