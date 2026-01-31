import { NextResponse } from 'next/server';

/**
 * GET /api/otn-route-detail
 * 
 * Fetches OTN route details from external API
 * Acts as a proxy to avoid CORS issues
 * Secure logging (development only)
 */
export async function GET(request) {
  try {
    const externalApiUrl = process.env.OTN_ROUTE_DETAIL;
    
    if (!externalApiUrl) {
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ OTN_ROUTE_DETAIL environment variable is not set');
      }
      
      return NextResponse.json(
        { 
          error: 'API configuration error',
          message: 'External API URL is not configured. Please set OTN_ROUTE_DETAIL environment variable.'
        },
        { status: 500 }
      );
    }

    // 🔒 SECURE: Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Fetching OTN routes from: ${externalApiUrl}`);
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
          details: process.env.NODE_ENV === 'development' ? errorText : undefined
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

    const routesData = Array.isArray(data) ? data : [data];
    
    // 🔒 SECURE: Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Successfully fetched ${routesData.length} routes`);
    }

    return NextResponse.json(routesData, {
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
      console.error('❌ Error in OTN route API:', error);
    }
    
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          message: 'The request to external API timed out. Please try again.'
        },
        { status: 504 }
      );
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Network error',
          message: 'Unable to connect to external API. Please check your network connection.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching OTN routes',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/otn-route-detail
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
