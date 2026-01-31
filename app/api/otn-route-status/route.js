import { NextResponse } from 'next/server';

/**
 * GET /api/otn-route-status
 * 
 * Fetches OTN route status from external API
 * Acts as a proxy to avoid CORS issues
 * Secure logging (development only)
 */
export async function GET(request) {
  try {
    const externalApiUrl = process.env.OTN_ROUTE_STATUS;
    
    if (!externalApiUrl) {
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ OTN_ROUTE_STATUS environment variable is not set');
        console.error('💡 Add OTN_ROUTE_STATUS=http://your-api-url to .env.local');
      }
      
      return NextResponse.json(
        { 
          error: 'API configuration error',
          message: 'External API URL is not configured. Please set OTN_ROUTE_STATUS environment variable.',
          hint: process.env.NODE_ENV === 'development' 
            ? 'Add OTN_ROUTE_STATUS=http://your-api-url to .env.local file'
            : undefined
        },
        { status: 500 }
      );
    }

    // 🔒 SECURE: Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Fetching OTN route status from: ${externalApiUrl}`);
    }

    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ External API error (${response.status}):`, errorText);
      }
      
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

    const data = await response.json();
    
    if (!data) {
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ External API returned empty data');
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid data',
          message: 'External API returned empty data'
        },
        { status: 500 }
      );
    }

    const statusData = Array.isArray(data) ? data : [data];
    
    // 🔒 SECURE: Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Successfully fetched ${statusData.length} route status records`);
    }

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
    // 🔒 SECURE: Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error in OTN route status API:', error);
    }
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('⏱️  Request timed out after 30 seconds');
      }
      
      return NextResponse.json(
        { 
          error: 'Request timeout',
          message: 'The request to external API timed out after 30 seconds. Please try again.',
          hint: process.env.NODE_ENV === 'development' 
            ? 'Check if the external API is responding slowly'
            : undefined
        },
        { status: 504 }
      );
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('🌐 Network error: Unable to connect to external API');
      }
      
      return NextResponse.json(
        { 
          error: 'Network error',
          message: 'Unable to connect to external API. Please check your network connection.',
          hint: process.env.NODE_ENV === 'development'
            ? 'Verify that the external API server is running and accessible'
            : undefined
        },
        { status: 503 }
      );
    }

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
 * Handle CORS preflight requests
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
