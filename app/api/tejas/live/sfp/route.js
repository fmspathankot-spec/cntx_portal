/**
 * API Route: Test SSH Connection (SFP endpoint)
 * GET /api/tejas/live/sfp?routerId=1
 * TESTING MODE: Only tests SSH connection, no actual SFP command
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { testConnection } from '../../../../../lib/ssh-client';

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
    
    console.log(`[SFP-TEST] Testing connection for router ID: ${routerId}`);
    
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
    
    console.log(`[SFP-TEST] Router: ${router.hostname} (${router.ip_address})`);
    console.log(`[SFP-TEST] Username: ${router.username}`);
    console.log(`[SFP-TEST] SSH Port: ${router.ssh_port || 22}`);
    
    // Check if credentials exist
    if (!router.password) {
      return NextResponse.json(
        { success: false, error: 'Router credentials not configured' },
        { status: 400 }
      );
    }
    
    // Test SSH connection
    try {
      console.log(`[SFP-TEST] Testing SSH connection...`);
      const isConnected = await testConnection(router);
      
      if (isConnected) {
        console.log(`[SFP-TEST] ✅ SSH connection successful!`);
        
        return NextResponse.json({
          success: true,
          message: 'SSH connection test successful',
          router: {
            id: router.id,
            hostname: router.hostname,
            ip_address: router.ip_address,
            username: router.username,
            ssh_port: router.ssh_port || 22
          },
          test_result: {
            connection: 'SUCCESS',
            message: 'Router is accessible via SSH'
          },
          timestamp: new Date().toISOString()
        });
        
      } else {
        console.log(`[SFP-TEST] ❌ SSH connection failed`);
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'SSH connection test failed',
            message: 'Could not connect to router. Check IP, credentials, and network connectivity.',
            router: {
              id: router.id,
              hostname: router.hostname,
              ip_address: router.ip_address
            }
          },
          { status: 500 }
        );
      }
      
    } catch (sshError) {
      console.error('[SFP-TEST] SSH Error:', sshError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'SSH connection error',
          message: sshError.message,
          details: sshError.toString()
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[SFP-TEST] Error:', error);
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
