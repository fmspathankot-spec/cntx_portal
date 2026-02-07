/**
 * Tejas Monitoring Proxy - Unified Endpoint
 * Proxies requests to Python backend for OSPF + BGP + SFP data
 * GET /api/tejas/live/all?routerId=X
 */

import { NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5000';

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
    
    console.log(`[PROXY] Forwarding request to Python backend for router ${routerId}`);
    console.log(`[PROXY] Backend URL: ${PYTHON_BACKEND_URL}`);
    
    // Forward request to Python backend
    const backendUrl = `${PYTHON_BACKEND_URL}/api/tejas/live/all?routerId=${routerId}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(60000), // 60 seconds
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[PROXY] Backend error (${response.status}):`, data);
      return NextResponse.json(
        { success: false, error: data.error || 'Backend request failed' },
        { status: response.status }
      );
    }
    
    console.log(`[PROXY] ✅ Success! Data received from backend`);
    console.log(`[PROXY] Performance: ${data.performance?.execution_time_ms}ms`);
    console.log(`[PROXY] Interfaces monitored: ${data.performance?.interfaces_monitored || 0}`);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[PROXY] Error:', error.message);
    
    // Check if Python backend is running
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Python backend is not running',
          message: 'Please start Python backend: cd python-backend && python app.py',
          details: {
            backend_url: PYTHON_BACKEND_URL,
            error_message: error.message
          }
        },
        { status: 503 }
      );
    }
    
    // Timeout error
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Request timeout',
          message: 'SSH connection took too long. Please check router connectivity.',
          details: error.message
        },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        message: 'Unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
