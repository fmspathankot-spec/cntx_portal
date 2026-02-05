/**
 * API Route: Get live SFP info from router
 * GET /api/tejas/live/sfp?routerId=1
 * 
 * This is a proxy to Python backend which handles SSH operations
 * Python backend is more reliable for SSH connections
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
    
    console.log(`[SFP-PROXY] Forwarding request to Python backend for router ID: ${routerId}`);
    
    // Call Python backend
    const pythonUrl = `${PYTHON_BACKEND_URL}/api/tejas/live/sfp?routerId=${routerId}`;
    
    try {
      const response = await fetch(pythonUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout after 30 seconds
        signal: AbortSignal.timeout(30000)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`[SFP-PROXY] Python backend error:`, errorData);
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Python backend error',
            message: errorData.error || errorData.message || 'Failed to fetch SFP data',
            backend_status: response.status
          },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      console.log(`[SFP-PROXY] Success: Received data from Python backend`);
      
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('[SFP-PROXY] Error calling Python backend:', fetchError.message);
      
      // Check if Python backend is running
      if (fetchError.message.includes('ECONNREFUSED') || fetchError.message.includes('fetch failed')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Python backend not available',
            message: `Cannot connect to Python backend at ${PYTHON_BACKEND_URL}. Please ensure Python backend is running.`,
            hint: 'Start Python backend: cd backend && python app.py'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch SFP data',
          message: fetchError.message 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('[SFP-PROXY] Error:', error);
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
