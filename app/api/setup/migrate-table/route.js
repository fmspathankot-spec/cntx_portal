/**
 * Migrate Table Structure
 * POST /api/setup/migrate-table - Add missing columns to existing table
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

export async function POST() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const migrations = [];
    
    // Check and add description column
    const checkDescQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'router_interfaces' 
      AND column_name = 'description'
    `;
    const descResult = await client.query(checkDescQuery);
    
    if (descResult.rows.length === 0) {
      await client.query(`
        ALTER TABLE router_interfaces 
        ADD COLUMN description TEXT
      `);
      migrations.push('Added description column');
    }
    
    // Check and add is_active column
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'router_interfaces' 
      AND column_name = 'is_active'
    `;
    const activeResult = await client.query(checkActiveQuery);
    
    if (activeResult.rows.length === 0) {
      await client.query(`
        ALTER TABLE router_interfaces 
        ADD COLUMN is_active BOOLEAN DEFAULT true
      `);
      migrations.push('Added is_active column');
    }
    
    // Check and add created_at column
    const checkCreatedQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'router_interfaces' 
      AND column_name = 'created_at'
    `;
    const createdResult = await client.query(checkCreatedQuery);
    
    if (createdResult.rows.length === 0) {
      await client.query(`
        ALTER TABLE router_interfaces 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      migrations.push('Added created_at column');
    }
    
    // Check and add updated_at column
    const checkUpdatedQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'router_interfaces' 
      AND column_name = 'updated_at'
    `;
    const updatedResult = await client.query(checkUpdatedQuery);
    
    if (updatedResult.rows.length === 0) {
      await client.query(`
        ALTER TABLE router_interfaces 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      migrations.push('Added updated_at column');
    }
    
    // Create indexes if they don't exist
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_router_interfaces_router_id 
        ON router_interfaces(router_id)
    `);
    migrations.push('Ensured router_id index exists');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_router_interfaces_active 
        ON router_interfaces(router_id, is_active)
    `);
    migrations.push('Ensured active index exists');
    
    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      message: 'Table migration completed successfully',
      migrations: migrations,
      count: migrations.length
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
