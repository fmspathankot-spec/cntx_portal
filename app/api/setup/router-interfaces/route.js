/**
 * Database Setup API - Router Interfaces Table
 * POST /api/setup/router-interfaces - Create table and add sample data
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

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Drop existing table if exists (for clean setup)
    await client.query('DROP TABLE IF EXISTS router_interfaces CASCADE');
    
    // Create router_interfaces table
    const createTableQuery = `
      CREATE TABLE router_interfaces (
        id SERIAL PRIMARY KEY,
        router_id INTEGER NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
        interface_name VARCHAR(100) NOT NULL,
        interface_type VARCHAR(50) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(router_id, interface_name)
      );
      
      CREATE INDEX idx_router_interfaces_router_id 
        ON router_interfaces(router_id);
      
      CREATE INDEX idx_router_interfaces_active 
        ON router_interfaces(router_id, is_active);
    `;
    
    await client.query(createTableQuery);
    
    // Get first router ID
    const routerQuery = `SELECT id FROM routers ORDER BY id LIMIT 1`;
    const routerResult = await client.query(routerQuery);
    
    let sampleDataAdded = false;
    
    if (routerResult.rows.length > 0) {
      const routerId = routerResult.rows[0].id;
      
      const sampleDataQuery = `
        INSERT INTO router_interfaces 
          (router_id, interface_name, interface_type, description, is_active)
        VALUES 
          ($1, '100g 1/5/11', 'SFP', 'Primary uplink interface', true),
          ($1, '100g 1/4/5', 'SFP', 'Secondary uplink interface', true),
          ($1, '100g 1/3/2', 'SFP', 'Backup interface', true)
      `;
      
      await client.query(sampleDataQuery, [routerId]);
      sampleDataAdded = true;
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      message: 'Router interfaces table created successfully',
      sampleDataAdded,
      details: {
        table: 'router_interfaces',
        indexes: ['idx_router_interfaces_router_id', 'idx_router_interfaces_active'],
        sample_router_id: routerResult.rows[0]?.id
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Setup Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// GET - Check table status
export async function GET() {
  try {
    // Check if table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'router_interfaces'
      ) as table_exists
    `;
    
    const tableResult = await pool.query(tableCheckQuery);
    const tableExists = tableResult.rows[0].table_exists;
    
    if (!tableExists) {
      return NextResponse.json({
        success: true,
        tableExists: false,
        message: 'Table does not exist. Use POST to create it.'
      });
    }
    
    // Get table stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_interfaces,
        COUNT(DISTINCT router_id) as routers_with_interfaces,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_interfaces,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_interfaces
      FROM router_interfaces
    `;
    
    const statsResult = await pool.query(statsQuery);
    
    // Get interface types
    const typesQuery = `
      SELECT 
        interface_type,
        COUNT(*) as count
      FROM router_interfaces
      GROUP BY interface_type
      ORDER BY count DESC
    `;
    
    const typesResult = await pool.query(typesQuery);
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      statistics: statsResult.rows[0],
      interfaceTypes: typesResult.rows
    });
    
  } catch (error) {
    console.error('Check Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
