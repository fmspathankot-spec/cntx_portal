/**
 * Python Backend Health Check
 * GET /api/tejas/health - Check if Python backend is running
 */

import { NextResponse } from 'next/server';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      backend_status: 'running',
      backend_url: PYTHON_BACKEND_URL,
      backend_info: data
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      backend_status: 'not_running',
      backend_url: PYTHON_BACKEND_URL,
      error: error.message,
      message: 'Python backend is not running. Start it with: cd python-backend && python app.py'
    }, { status: 503 });
  }
}
