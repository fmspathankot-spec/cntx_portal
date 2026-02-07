/**
 * Check Table Structure
 * GET /api/setup/check-table - Check router_interfaces table structure
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
        message: 'Table does not exist'
      });
    }
    
    // Get column information
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'router_interfaces'
      ORDER BY ordinal_position
    `;
    
    const columnsResult = await pool.query(columnsQuery);
    
    // Check for required columns
    const columnNames = columnsResult.rows.map(col => col.column_name);
    const requiredColumns = ['id', 'router_id', 'interface_name', 'interface_type', 'description', 'is_active', 'created_at', 'updated_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      columns: columnsResult.rows,
      columnNames: columnNames,
      requiredColumns: requiredColumns,
      missingColumns: missingColumns,
      isValid: missingColumns.length === 0
    });
    
  } catch (error) {
    console.error('Check Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
