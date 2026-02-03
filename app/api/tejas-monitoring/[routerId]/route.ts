/**
 * API Route: Get monitoring data for specific router
 * GET /api/tejas-monitoring/[routerId]
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const routerId = params.routerId;

    // Get router info
    const routerResult = await query(`
      SELECT id, hostname, ip_address, location, is_active
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

    // Get latest OSPF data
    const ospfResult = await query(`
      SELECT 
        pr.reading_data,
        pr.reading_time
      FROM parameter_readings pr
      JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
      WHERE pr.router_id = $1 
        AND mp.parameter_name = 'TEJAS_OSPF_NEIGHBORS'
      ORDER BY pr.reading_time DESC
      LIMIT 1
    `, [routerId]);

    // Get latest BGP data
    const bgpResult = await query(`
      SELECT 
        pr.reading_data,
        pr.reading_time
      FROM parameter_readings pr
      JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
      WHERE pr.router_id = $1 
        AND mp.parameter_name = 'TEJAS_BGP_SUMMARY'
      ORDER BY pr.reading_time DESC
      LIMIT 1
    `, [routerId]);

    // Get interfaces with latest SFP data
    const interfacesResult = await query(`
      SELECT 
        ri.id,
        ri.interface_name,
        ri.interface_label,
        ri.interface_type,
        (
          SELECT pr.reading_data
          FROM parameter_readings pr
          JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
          WHERE pr.interface_id = ri.id 
            AND mp.parameter_name = 'TEJAS_SFP_100G_INFO'
          ORDER BY pr.reading_time DESC
          LIMIT 1
        ) as sfp_info,
        (
          SELECT pr.reading_data
          FROM parameter_readings pr
          JOIN monitoring_parameters mp ON pr.parameter_id = mp.id
          WHERE pr.interface_id = ri.id 
            AND mp.parameter_name = 'TEJAS_SFP_100G_STATS'
          ORDER BY pr.reading_time DESC
          LIMIT 1
        ) as sfp_stats,
        (
          SELECT pr.reading_time
          FROM parameter_readings pr
          WHERE pr.interface_id = ri.id
          ORDER BY pr.reading_time DESC
          LIMIT 1
        ) as last_reading_time
      FROM router_interfaces ri
      WHERE ri.router_id = $1 AND ri.is_monitored = true
      ORDER BY ri.interface_name
    `, [routerId]);

    // Build response
    const response = {
      success: true,
      router: router,
      ospf: ospfResult.rows.length > 0 ? {
        data: ospfResult.rows[0].reading_data,
        timestamp: ospfResult.rows[0].reading_time
      } : null,
      bgp: bgpResult.rows.length > 0 ? {
        data: bgpResult.rows[0].reading_data,
        timestamp: bgpResult.rows[0].reading_time
      } : null,
      interfaces: interfacesResult.rows.map(row => ({
        id: row.id,
        name: row.interface_name,
        label: row.interface_label,
        type: row.interface_type,
        sfp_info: row.sfp_info,
        sfp_stats: row.sfp_stats,
        last_reading_time: row.last_reading_time
      })),
      last_updated: ospfResult.rows[0]?.reading_time || bgpResult.rows[0]?.reading_time || null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch monitoring data',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
