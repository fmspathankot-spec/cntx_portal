/**
 * API Route: Test ping functionality
 * GET /api/tejas/test-ping?ip=10.125.0.8
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip') || '10.125.0.8';
    
    console.log(`[TEST-PING] Testing ping to ${ip}...`);
    
    const ping = require('ping');
    
    // Test with different configurations
    const tests = [];
    
    // Test 1: Default config
    try {
      const result1 = await ping.promise.probe(ip, {
        timeout: 5,
      });
      tests.push({
        name: 'Default config',
        success: true,
        result: result1
      });
    } catch (error) {
      tests.push({
        name: 'Default config',
        success: false,
        error: error.message
      });
    }
    
    // Test 2: With extra args
    try {
      const result2 = await ping.promise.probe(ip, {
        timeout: 5,
        extra: ['-c', '3'],
      });
      tests.push({
        name: 'With -c 3',
        success: true,
        result: result2
      });
    } catch (error) {
      tests.push({
        name: 'With -c 3',
        success: false,
        error: error.message
      });
    }
    
    // Test 3: Windows specific
    try {
      const result3 = await ping.promise.probe(ip, {
        timeout: 5,
        extra: ['-n', '3'],
      });
      tests.push({
        name: 'Windows -n 3',
        success: true,
        result: result3
      });
    } catch (error) {
      tests.push({
        name: 'Windows -n 3',
        success: false,
        error: error.message
      });
    }
    
    // Test 4: No extra args
    try {
      const result4 = await ping.promise.probe(ip);
      tests.push({
        name: 'No extra args',
        success: true,
        result: result4
      });
    } catch (error) {
      tests.push({
        name: 'No extra args',
        success: false,
        error: error.message
      });
    }
    
    return NextResponse.json({
      success: true,
      ip: ip,
      platform: process.platform,
      tests: tests,
      summary: {
        total: tests.length,
        successful: tests.filter(t => t.success).length,
        failed: tests.filter(t => !t.success).length
      }
    });
    
  } catch (error) {
    console.error('[TEST-PING] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}
