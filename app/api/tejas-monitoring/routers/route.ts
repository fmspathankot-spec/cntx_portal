/**
 * API Route: Get all Tejas routers
 * GET /api/tejas-monitoring/routers
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id,
        hostname,
        ip_address,
        location,
        is_active,
        (SELECT COUNT(*) FROM router_interfaces WHERE router_id = routers.id AND is_monitored = true) as interface_count
      FROM routers
      WHERE device_type = 'tejas' AND is_active = true
      ORDER BY hostname
    `);

    return NextResponse.json({
      success: true,
      routers: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching routers:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch routers',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
