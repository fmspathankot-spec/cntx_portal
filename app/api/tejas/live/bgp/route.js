/**
 * API Route: Get live BGP summary from router
 * GET /api/tejas/live/bgp?routerId=1
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { getBGPSummary } from '../../../../../lib/ssh-client';
import { parseBGPSummary } from '../../../../../lib/tejas-parser';

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
    
    console.log(`[BGP] Fetching live data for router ID: ${routerId}`);
    
    // Get router from database
    const routerResult = await query(`
      SELECT 
        r.id,
        r.hostname,
        r.ip_address,
        r.device_type,
        r.ssh_port,
        rc.username,
        rc.password
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
    
    console.log(`[BGP] Router: ${router.hostname} (${router.ip_address})`);
    
    // Check if credentials exist
    if (!router.password) {
      return NextResponse.json(
        { success: false, error: 'Router credentials not configured' },
        { status: 400 }
      );
    }
    
    // Fetch BGP summary via SSH
    try {
      const bgpOutput = await getBGPSummary(router);
      const bgpData = parseBGPSummary(bgpOutput);
      
      console.log(`[BGP] Success: ${bgpData.peer_count} peers found`);
      
      return NextResponse.json({
        success: true,
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address
        },
        data: bgpData,
        raw_output: bgpOutput, // For debugging
        timestamp: new Date().toISOString()
      });
      
    } catch (sshError) {
      console.error('[BGP] SSH Error:', sshError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch BGP data',
          message: sshError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[BGP] Error fetching live data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
