/**
 * API Route: Test database connection
 * GET /api/test-db
 */

import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    // Test query
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    
    // Count routers
    const routerCount = await query('SELECT COUNT(*) as count FROM routers');
    
    // Count readings
    const readingCount = await query('SELECT COUNT(*) as count FROM parameter_readings');

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      database: {
        current_time: result.rows[0].current_time,
        postgres_version: result.rows[0].pg_version,
        router_count: routerCount.rows[0].count,
        reading_count: readingCount.rows[0].count
      }
    });

  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        message: error.message,
        hint: 'Check your .env.local file and ensure PostgreSQL is running'
      },
      { status: 500 }
    );
  }
}
