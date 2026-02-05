/**
 * API Route: Server Startup Initialization
 * Automatically called when server starts
 * Initializes background services like ping monitoring
 */

import { NextResponse } from 'next/server';

// This will be called by instrumentation.js on server startup
export async function GET() {
  try {
    const { initializePingService } = require('../../../lib/ping-service-init');
    
    console.log('[STARTUP] Initializing server services...');
    
    // Start ping service
    const pingResult = await initializePingService();
    
    return NextResponse.json({
      success: true,
      message: 'Server initialized',
      services: {
        ping: pingResult
      }
    });
    
  } catch (error) {
    console.error('[STARTUP] Initialization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Initialization failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
