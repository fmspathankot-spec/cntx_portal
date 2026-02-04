/**
 * API Route: Get router ping status
 * GET /api/tejas/status
 * GET /api/tejas/status?routerId=1
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { pingRouter, getCachedStatus, getAllCachedStatuses } from '../../../../lib/ping-monitor';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const routerId = searchParams.get('routerId');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Single router status
    if (routerId) {
      // Check cache first
      if (!forceRefresh) {
        const cached = getCachedStatus(parseInt(routerId));
        if (cached) {
          return NextResponse.json({
            success: true,
            status: cached,
            source: 'cache'
          });
        }
      }
      
      // Get router from database
      const routerResult = await query(`
        SELECT id, hostname, ip_address, is_active
        FROM routers
        WHERE id = $1
      `, [routerId]);
      
      if (routerResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Router not found' },
          { status: 404 }
        );
      }
      
      const router = routerResult.rows[0];
      
      // Ping router
      const status = await pingRouter(router);
      
      return NextResponse.json({
        success: true,
        status: status,
        source: 'live'
      });
    }
    
    // All routers status
    // Check cache first
    if (!forceRefresh) {
      const cached = getAllCachedStatuses();
      if (cached.length > 0) {
        return NextResponse.json({
          success: true,
          statuses: cached,
          count: cached.length,
          online_count: cached.filter(s => s.is_alive).length,
          source: 'cache'
        });
      }
    }
    
    // Get all routers from database
    const routersResult = await query(`
      SELECT id, hostname, ip_address, is_active, location
      FROM routers
      WHERE device_type = 'tejas' AND is_active = true
      ORDER BY hostname
    `);
    
    if (routersResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        statuses: [],
        count: 0,
        online_count: 0,
        message: 'No routers found'
      });
    }
    
    // Ping all routers
    const statuses = await Promise.all(
      routersResult.rows.map(router => pingRouter(router))
    );
    
    const onlineCount = statuses.filter(s => s.is_alive).length;
    
    return NextResponse.json({
      success: true,
      statuses: statuses,
      count: statuses.length,
      online_count: onlineCount,
      source: 'live'
    });
    
  } catch (error) {
    console.error('[STATUS] Error fetching router status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch router status',
        message: error.message
      },
      { status: 500 }
    );
  }
}
