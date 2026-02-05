/**
 * API Route: Get ALL monitoring data in single SSH session
 * GET /api/tejas/live/all?routerId=1
 * 
 * EFFICIENT APPROACH: One SSH login for OSPF + BGP + SFP
 * Much faster than 3 separate API calls
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { getAllMonitoringData } from '../../../../../lib/ssh-client';
import { parseOSPFNeighbors, parseBGPSummary, parseSFPInfo } from '../../../../../lib/tejas-parser';

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
    
    console.log(`[ALL] Fetching all monitoring data for router ID: ${routerId}`);
    
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
    
    console.log(`[ALL] Router: ${router.hostname} (${router.ip_address})`);
    
    // Check if credentials exist
    if (!router.password) {
      return NextResponse.json(
        { success: false, error: 'Router credentials not configured' },
        { status: 400 }
      );
    }
    
    // Fetch all data via single SSH session
    try {
      const startTime = Date.now();
      
      const { fullOutput, commands, interfaces } = await getAllMonitoringData(router);
      
      const executionTime = Date.now() - startTime;
      console.log(`[ALL] Data fetched in ${executionTime}ms`);
      
      // Extract OSPF output
      const ospfCmdIndex = fullOutput.indexOf('show ip ospf neighbor');
      const bgpCmdIndex = fullOutput.indexOf('show ip bgp summary');
      
      const ospfOutput = ospfCmdIndex !== -1 
        ? fullOutput.substring(ospfCmdIndex, bgpCmdIndex !== -1 ? bgpCmdIndex : fullOutput.length)
        : '';
      
      // Extract BGP output
      const firstSfpCmdIndex = fullOutput.indexOf('show sfp');
      const bgpOutput = bgpCmdIndex !== -1
        ? fullOutput.substring(bgpCmdIndex, firstSfpCmdIndex !== -1 ? firstSfpCmdIndex : fullOutput.length)
        : '';
      
      // Parse OSPF
      const ospfData = parseOSPFNeighbors(ospfOutput);
      console.log(`[ALL] OSPF: ${ospfData.neighbor_count} neighbors`);
      
      // Parse BGP
      const bgpData = parseBGPSummary(bgpOutput);
      console.log(`[ALL] BGP: ${bgpData.peer_count} peers`);
      
      // Parse SFP for each interface
      const sfpData = [];
      
      interfaces.forEach((iface, index) => {
        try {
          const sfpCommand = iface.sfp_command || 'show sfp 100g';
          const commandStr = `${sfpCommand} ${iface.interface_name}`;
          
          // Find command in output
          const cmdIndex = fullOutput.indexOf(commandStr);
          let interfaceOutput = '';
          
          if (cmdIndex !== -1) {
            // Extract output until next command or end
            const nextCmdIndex = index < interfaces.length - 1
              ? fullOutput.indexOf(`${interfaces[index + 1].sfp_command || 'show sfp 100g'} ${interfaces[index + 1].interface_name}`, cmdIndex)
              : fullOutput.length;
            
            interfaceOutput = fullOutput.substring(
              cmdIndex,
              nextCmdIndex !== -1 ? nextCmdIndex : fullOutput.length
            );
          }
          
          const parsed = parseSFPInfo(interfaceOutput || fullOutput);
          
          sfpData.push({
            interface_id: iface.id,
            interface_name: iface.interface_name,
            interface_label: iface.interface_label,
            sfp_command: sfpCommand,
            ...parsed
          });
          
        } catch (error) {
          console.error(`[ALL] Error parsing SFP for ${iface.interface_name}:`, error.message);
          sfpData.push({
            interface_id: iface.id,
            interface_name: iface.interface_name,
            interface_label: iface.interface_label,
            error: error.message
          });
        }
      });
      
      console.log(`[ALL] SFP: ${sfpData.length} interfaces processed`);
      
      return NextResponse.json({
        success: true,
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address
        },
        data: {
          ospf: ospfData,
          bgp: bgpData,
          sfp: {
            interfaces: sfpData,
            total_count: sfpData.length
          }
        },
        performance: {
          execution_time_ms: executionTime,
          commands_executed: commands.length,
          ssh_sessions: 1
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (sshError) {
      console.error('[ALL] SSH Error:', sshError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch monitoring data',
          message: sshError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[ALL] Error fetching monitoring data:', error);
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
