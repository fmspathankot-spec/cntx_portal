/**
 * API Route: Get live SFP info and stats from router
 * GET /api/tejas/live/sfp?routerId=1
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { getSFPInfo, getSFPStats } from '../../../../../lib/ssh-client';
import { parseSFPInfo, parseSFPStats } from '../../../../../lib/tejas-parser';

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
    
    console.log(`[SFP] Fetching live data for router ID: ${routerId}`);
    
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
    
    console.log(`[SFP] Router: ${router.hostname} (${router.ip_address})`);
    
    // Check if credentials exist
    if (!router.password) {
      return NextResponse.json(
        { success: false, error: 'Router credentials not configured' },
        { status: 400 }
      );
    }
    
    // Fetch SFP data via SSH
    try {
      // Fetch both SFP info and stats in parallel
      const [sfpInfoOutput, sfpStatsOutput] = await Promise.all([
        getSFPInfo(router),
        getSFPStats(router)
      ]);
      
      const sfpInfo = parseSFPInfo(sfpInfoOutput);
      const sfpStats = parseSFPStats(sfpStatsOutput);
      
      console.log(`[SFP] Success: ${sfpInfo.length} interfaces found`);
      
      return NextResponse.json({
        success: true,
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address
        },
        data: {
          sfp_info: sfpInfo,
          sfp_stats: sfpStats
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (sshError) {
      console.error('[SFP] SSH Error:', sshError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch SFP data',
          message: sshError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[SFP] Error fetching live data:', error);
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
