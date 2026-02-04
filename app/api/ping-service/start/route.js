/**
 * API Route: Start ping monitoring service
 * GET /api/ping-service/start
 */

import { NextResponse } from 'next/server';
import { startPingService } from '../../../../lib/ping-service';

export async function GET() {
  try {
    startPingService();
    
    return NextResponse.json({
      success: true,
      message: 'Ping monitoring service started',
      interval: '5 minutes'
    });
  } catch (error) {
    console.error('[PING SERVICE API] Error starting service:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start ping service',
        message: error.message
      },
      { status: 500 }
    );
  }
}
