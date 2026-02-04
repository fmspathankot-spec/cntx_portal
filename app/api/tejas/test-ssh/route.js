/**
 * API Route: Test SSH connection to router
 * GET /api/tejas/test-ssh?routerId=16
 */

import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

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
    
    console.log(`[TEST-SSH] Testing router ID: ${routerId}`);
    
    // Get router from database
    const routerResult = await query(`
      SELECT 
        r.id,
        r.hostname,
        r.ip_address,
        r.device_type,
        r.credential_id,
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
    
    console.log('[TEST-SSH] Router details:', {
      id: router.id,
      hostname: router.hostname,
      ip: router.ip_address,
      has_credential_id: !!router.credential_id,
      has_username: !!router.username,
      has_password: !!router.password,
      ssh_port: router.ssh_port || 22
    });
    
    // Check if credentials exist
    if (!router.credential_id) {
      return NextResponse.json({
        success: false,
        error: 'Router credentials not linked',
        details: 'credential_id is NULL in routers table',
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address
        }
      }, { status: 400 });
    }
    
    if (!router.password) {
      return NextResponse.json({
        success: false,
        error: 'Router password not configured',
        details: 'Password is NULL in router_credentials table',
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address,
          credential_id: router.credential_id
        }
      }, { status: 400 });
    }
    
    // Try SSH connection
    try {
      const { NodeSSH } = require('node-ssh');
      const ssh = new NodeSSH();
      
      console.log(`[TEST-SSH] Attempting connection to ${router.ip_address}...`);
      
      await ssh.connect({
        host: router.ip_address,
        username: router.username || 'admin',
        password: router.password,
        port: router.ssh_port || 22,
        readyTimeout: 10000,
        tryKeyboard: true,
      });
      
      console.log('[TEST-SSH] Connection successful!');
      
      // Try simple command
      const result = await ssh.execCommand('show version', {
        cwd: '/',
        timeout: 10000,
      });
      
      console.log('[TEST-SSH] Command executed successfully');
      
      ssh.dispose();
      
      return NextResponse.json({
        success: true,
        message: 'SSH connection successful',
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address,
          username: router.username
        },
        test_command: 'show version',
        output_length: result.stdout.length,
        output_preview: result.stdout.substring(0, 200)
      });
      
    } catch (sshError) {
      console.error('[TEST-SSH] SSH Error:', sshError.message);
      
      return NextResponse.json({
        success: false,
        error: 'SSH connection failed',
        message: sshError.message,
        router: {
          id: router.id,
          hostname: router.hostname,
          ip_address: router.ip_address,
          username: router.username,
          ssh_port: router.ssh_port || 22
        },
        troubleshooting: {
          check_firewall: 'Ensure SSH port is open',
          check_credentials: 'Verify username and password',
          check_network: 'Ping test successful, but SSH failed',
          try_manual: `ssh ${router.username}@${router.ip_address}`
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('[TEST-SSH] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
