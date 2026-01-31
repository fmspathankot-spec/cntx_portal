import OtnRouteDetailsForm from "./otnroutedetailsform";

/**
 * OTN Route Details Page - Server Component
 * 
 * Purpose:
 * - Server-side data fetching (SSR)
 * - SEO friendly
 * - Fast initial load
 * - Error handling
 * - Secure logging (development only)
 */
export default async function OtnRouteDetails() {
  let data = null;
  let error = null;

  try {
    const apiUrl = process.env.OTN_ROUTE_DETAIL || "http://localhost:3000/api/otn-route-detail";
    
    // 🔒 SECURE: Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 [Server] Fetching OTN route details from: ${apiUrl}`);
    }
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // 🔒 SECURE: Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ [Server] API Error (${response.status}):`, errorText);
      }
      
      throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
    }

    data = await response.json();
    
    // 🔒 SECURE: Only log success in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [Server] Successfully fetched ${data?.length || 0} route details`);
    }
    
  } catch (err) {
    // 🔒 SECURE: Only log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [Server] Error in OtnRouteDetails:', err);
      console.error('💡 [Server] Check:');
      console.error('   1. Is OTN_ROUTE_DETAIL set in .env.local?');
      console.error('   2. Is the external API running?');
      console.error('   3. Is the API URL correct?');
    }
    
    error = {
      message: 'Unable to connect to the server. Please check your network connection and try again.',
      details: err.message
    };
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">OTN Route Details</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Server Unreachable</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-1 text-xs opacity-75">Details: {error.details}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const routeDetailsData = Array.isArray(data) ? data : [data];

  return <OtnRouteDetailsForm initialData={routeDetailsData} />;
}
