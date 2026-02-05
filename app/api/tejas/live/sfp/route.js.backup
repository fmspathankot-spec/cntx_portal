/**
 * API Route: Get live SFP info from router
 * GET /api/tejas/live/sfp?routerId=1
 * Fetches SFP data for all monitored interfaces using database-configured commands
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { getAllSFPInfo } from '../../../../../lib/ssh-client';
import { parseSFPInfo } from '../../../../../lib/tejas-parser';

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
    
    // Fetch SFP data via SSH for all monitored interfaces
    try {
      const sfpDataArray = await getAllSFPInfo(router);
      
      if (sfpDataArray.length === 0) {
        return NextResponse.json({
          success: true,
          router: {
            id: router.id,
            hostname: router.hostname,
            ip_address: router.ip_address
          },
          data: {
            interfaces: [],
            message: 'No monitored interfaces found'
          },
          timestamp: new Date().toISOString()
        });
      }
      
      // Parse each interface's SFP data
      const parsedData = sfpDataArray.map(item => {
        if (item.error) {
          return {
            interface_id: item.interface_id,
            interface_name: item.interface_name,
            interface_label: item.interface_label,
            error: item.error
          };
        }
        
        const parsed = parseSFPInfo(item.output);
        
        return {
          interface_id: item.interface_id,
          interface_name: item.interface_name,
          interface_label: item.interface_label,
          sfp_command: item.sfp_command,
          ...parsed
        };
      });
      
      console.log(`[SFP] Success: ${parsedData.length} interfaces processed`);
      
      return NextResponse.json({
        success: true,
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address
        },
        data: {
          interfaces: parsedData,
          total_count: parsedData.length
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
