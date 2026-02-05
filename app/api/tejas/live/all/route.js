/**
 * API Route: Get ALL monitoring data in single SSH session
 * GET /api/tejas/live/all?routerId=1
 * 
 * EFFICIENT APPROACH: One SSH login for OSPF + BGP + SFP
 * Much faster than 3 separate API calls
 * 
 * This proxies to Python backend which handles SSH operations
 */

import { NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

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
    
    console.log(`[ALL-PROXY] Forwarding unified request to Python backend for router ID: ${routerId}`);
    
    // Call Python backend unified endpoint
    const pythonUrl = `${PYTHON_BACKEND_URL}/api/tejas/live/all?routerId=${routerId}`;
    
    try {
      const response = await fetch(pythonUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout after 45 seconds (single SSH session for all commands)
        signal: AbortSignal.timeout(45000)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`[ALL-PROXY] Python backend error:`, errorData);
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Python backend error',
            message: errorData.error || errorData.message || 'Failed to fetch monitoring data',
            backend_status: response.status
          },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log(`[ALL-PROXY] Success: Received unified data from Python backend`);
      console.log(`[ALL-PROXY] Performance: ${data.performance?.execution_time_ms}ms, ${data.performance?.ssh_sessions} SSH session(s)`);
      
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('[ALL-PROXY] Error calling Python backend:', fetchError.message);
      
      // Check if Python backend is running
      if (fetchError.message.includes('ECONNREFUSED') || fetchError.message.includes('fetch failed')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Python backend not available',
            message: `Cannot connect to Python backend at ${PYTHON_BACKEND_URL}. Please ensure Python backend is running.`,
            hint: 'Start Python backend: cd python-backend && python app.py'
          },
          { status: 503 }
        );
      }
      
      // Timeout error
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Request timeout',
            message: 'Python backend took too long to respond. Router might be unreachable.',
            hint: 'Check router connectivity and SSH credentials'
          },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch monitoring data',
          message: fetchError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[ALL-PROXY] Error:', error);
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
