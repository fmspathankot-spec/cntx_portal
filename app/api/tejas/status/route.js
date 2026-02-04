/**
 * API Route: Get router ping status from database
 * GET /api/tejas/status
 * GET /api/tejas/status?routerId=1
 * GET /api/tejas/status?refresh=true (force live ping)
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { pingRouter, getPingStatus, getAllPingStatuses } from '../../../../lib/ping-monitor';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const routerId = searchParams.get('routerId');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Single router status
    if (routerId) {
      // Force refresh - ping now
      if (forceRefresh) {
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
        const status = await pingRouter(router);
        
        return NextResponse.json({
          success: true,
          status: status,
          source: 'live'
        });
      }
      
      // Get from database
      const status = await getPingStatus(parseInt(routerId));
      
      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Status not found. Ping monitoring may not be running.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        status: status,
        source: 'database'
      });
    }
    
    // All routers status
    // Force refresh - ping all now
    if (forceRefresh) {
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
      
      const statuses = await Promise.all(
        routersResult.rows.map(router => pingRouter(router))
      );
      
      const onlineCount = statuses.filter(s => s.is_online).length;
      
      return NextResponse.json({
        success: true,
        statuses: statuses,
        count: statuses.length,
        online_count: onlineCount,
        source: 'live'
      });
    }
    
    // Get from database
    const statuses = await getAllPingStatuses();
    
    if (statuses.length === 0) {
      return NextResponse.json({
        success: true,
        statuses: [],
        count: 0,
        online_count: 0,
        message: 'No ping status found. Ping monitoring may not be running.'
      });
    }
    
    const onlineCount = statuses.filter(s => s.is_online).length;
    
    return NextResponse.json({
      success: true,
      statuses: statuses,
      count: statuses.length,
      online_count: onlineCount,
      source: 'database'
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
