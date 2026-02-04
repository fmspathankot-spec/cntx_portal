/**
 * API Route: Get live OSPF neighbors from router
 * GET /api/tejas/live/ospf?routerId=1
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { getOSPFNeighbors } from '../../../../../lib/ssh-client';
import { parseOSPFNeighbors } from '../../../../../lib/tejas-parser';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const routerId = searchParams.get('routerId');
    
    if (!routerId) {
      return NextResponse.json(
        { success: false, error: 'Router ID is required' },
        { status: 400 }
      );
    }
    
    // Get router from database
    const routerResult = await query(`
      SELECT 
        r.id,
        r.hostname,
        r.ip_address,
        r.device_type,
        rc.username,
        rc.password,
        rc.ssh_port
      FROM routers r
      LEFT JOIN router_credentials rc ON r.credential_id = rc.id
      WHERE r.id = $1 AND r.is_active = true
    `, [routerId]);
    
    if (routerResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Router not found or inactive' },
        { status: 404 }
      );
    }
    
    const router = routerResult.rows[0];
    
    // Check if credentials exist
    if (!router.password) {
      return NextResponse.json(
        { success: false, error: 'Router credentials not configured' },
        { status: 400 }
      );
    }
    
    console.log(`[OSPF] Fetching live data from ${router.hostname}...`);
    
    // Get live data via SSH
    const rawOutput = await getOSPFNeighbors(router);
    
    // Parse output
    const parsedData = parseOSPFNeighbors(rawOutput);
    
    console.log(`[OSPF] Found ${parsedData.neighbor_count} neighbors`);
    
    return NextResponse.json({
      success: true,
      router: {
        id: router.id,
        hostname: router.hostname,
        ip_address: router.ip_address
      },
      data: parsedData,
      fetched_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[OSPF] Error fetching live data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch OSPF data',
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
