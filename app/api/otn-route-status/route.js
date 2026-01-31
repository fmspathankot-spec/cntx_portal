import { NextResponse } from 'next/server';

/**
 * GET /api/otn-route-status
 * 
 * Fetches OTN route status from external API
 * Acts as a proxy to avoid CORS issues
 * 
 * Flow:
 * 1. Client/Server → This API route
 * 2. This route → External API (OTN_ROUTE_STATUS env var)
 * 3. External API → Returns status data
 * 4. This route → Returns to client
 */
export async function GET(request) {
  try {
    // ============================================
    // STEP 1: Get External API URL
    // ============================================
    
    const externalApiUrl = process.env.OTN_ROUTE_STATUS;
    
    if (!externalApiUrl) {
      console.error('❌ OTN_ROUTE_STATUS environment variable is not set');
      console.error('💡 Add OTN_ROUTE_STATUS=http://your-api-url to .env.local');
      
      return NextResponse.json(
        { 
          error: 'API configuration error',
          message: 'External API URL is not configured. Please set OTN_ROUTE_STATUS environment variable.',
          hint: 'Add OTN_ROUTE_STATUS=http://your-api-url to .env.local file'
        },
        { status: 500 }
      );
    }

    console.log(`🔄 Fetching OTN route status from: ${externalApiUrl}`);

    // ============================================
    // STEP 2: Fetch from External API
    // ============================================
    
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store', // Always get fresh data
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    // ============================================
    // STEP 3: Check Response Status
    // ============================================
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ External API error (${response.status}):`, errorText);
      
      return NextResponse.json(
        { 
          error: 'External API error',
          message: `Failed to fetch data from external API (Status: ${response.status})`,
          details: process.env.NODE_ENV === 'development' ? errorText : undefined,
          apiUrl: process.env.NODE_ENV === 'development' ? externalApiUrl : undefined
        },
        { status: response.status }
      );
    }

    // ============================================
    // STEP 4: Parse JSON Data
    // ============================================
    
    const data = await response.json();
    
    if (!data) {
      console.error('❌ External API returned empty data');
      return NextResponse.json(
        { 
          error: 'Invalid data',
          message: 'External API returned empty data'
        },
        { status: 500 }
      );
    }

    // ============================================
    // STEP 5: Ensure Array Format
    // ============================================
    
    const statusData = Array.isArray(data) ? data : [data];
    
    console.log(`✅ Successfully fetched ${statusData.length} route status records`);

    // ============================================
    // STEP 6: Return Success Response
    // ============================================
    
    return NextResponse.json(statusData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Error in OTN route status API:', error);
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    // Timeout Error
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      console.error('⏱️  Request timed out after 30 seconds');
      return NextResponse.json(
        { 
          error: 'Request timeout',
          message: 'The request to external API timed out after 30 seconds. Please try again.',
          hint: 'Check if the external API is responding slowly'
        },
        { status: 504 }
      );
    }

    // Network Error
    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network error: Unable to connect to external API');
      return NextResponse.json(
        { 
          error: 'Network error',
          message: 'Unable to connect to external API. Please check your network connection.',
          hint: 'Verify that the external API server is running and accessible'
        },
        { status: 503 }
      );
    }

    // Generic Error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching OTN route status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/otn-route-status
 * 
 * Handle CORS preflight requests
 * Browser automatically sends OPTIONS request before actual request
 */
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
