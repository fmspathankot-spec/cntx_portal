/**
 * API Route: Get live SFP data from router interfaces
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
    
    // Get monitored interfaces
    const interfacesResult = await query(`
      SELECT id, interface_name, interface_label, interface_type
      FROM router_interfaces
      WHERE router_id = $1 AND is_monitored = true
      ORDER BY interface_name
    `, [routerId]);
    
    if (interfacesResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address
        },
        interfaces: [],
        message: 'No monitored interfaces found'
      });
    }
    
    console.log(`[SFP] Fetching live data from ${router.hostname} for ${interfacesResult.rows.length} interfaces...`);
    
    // Fetch SFP data for each interface
    const interfacesData = await Promise.all(
      interfacesResult.rows.map(async (iface) => {
        try {
          // Get SFP info
          const infoOutput = await getSFPInfo(router, iface.interface_name);
          const sfpInfo = parseSFPInfo(infoOutput);
          
          // Get SFP stats
          const statsOutput = await getSFPStats(router, iface.interface_name);
          const sfpStats = parseSFPStats(statsOutput);
          
          return {
            id: iface.id,
            name: iface.interface_name,
            label: iface.interface_label,
            type: iface.interface_type,
            sfp_info: sfpInfo,
            sfp_stats: sfpStats,
            status: 'success'
          };
        } catch (error) {
          console.error(`[SFP] Error fetching data for ${iface.interface_name}:`, error.message);
          return {
            id: iface.id,
            name: iface.interface_name,
            label: iface.interface_label,
            type: iface.interface_type,
            sfp_info: null,
            sfp_stats: null,
            status: 'error',
            error: error.message
          };
        }
      })
    );
    
    const successCount = interfacesData.filter(i => i.status === 'success').length;
    console.log(`[SFP] Successfully fetched ${successCount}/${interfacesData.length} interfaces`);
    
    return NextResponse.json({
      success: true,
      router: {
        id: router.id,
        hostname: router.hostname,
        ip_address: router.ip_address
      },
      interfaces: interfacesData,
      fetched_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[SFP] Error fetching live data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch SFP data',
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
