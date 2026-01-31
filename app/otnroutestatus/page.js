import OtnRouteStatusForm from "./otnroutestatusform";

/**
 * OTN Route Status Page - Server Component
 * 
 * Purpose:
 * - Server-side data fetching (SSR)
 * - SEO friendly
 * - Fast initial load
 * - Error handling
 * 
 * Flow:
 * 1. Server fetches data from API
 * 2. Passes data to client component
 * 3. Client component renders with initial data
 * 4. React Query takes over for auto-refresh
 */
export default async function OtnRouteStatus() {
  let data = null;
  let error = null;

  try {
    // ============================================
    // STEP 1: Get API URL
    // ============================================
    
    const apiUrl = process.env.OTN_ROUTE_STATUS 
                   || "http://localhost:3000/api/otn-route-status";
    // Environment variable se URL lo
    // Fallback: Local API route
    
    console.log(`🔄 [Server] Fetching OTN route status from: ${apiUrl}`);
    
    // ============================================
    // STEP 2: Fetch Data from API
    // ============================================
    
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      // cache: Don't cache
      // Always fetch fresh data
      
      next: { revalidate: 0 }
      // Next.js specific
      // revalidate: 0 = Don't cache
    });

    // ============================================
    // STEP 3: Check Response Status
    // ============================================
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Server] API Error (${response.status}):`, errorText);
      throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
    }

    // ============================================
    // STEP 4: Parse JSON Data
    // ============================================
    
    data = await response.json();
    console.log(`✅ [Server] Successfully fetched ${data?.length || 0} route status records`);
    
  } catch (err) {
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    console.error('❌ [Server] Error in OtnRouteStatus:', err);
    console.error('💡 [Server] Check:');
    console.error('   1. Is OTN_ROUTE_STATUS set in .env.local?');
    console.error('   2. Is the external API running?');
    console.error('   3. Is the API URL correct?');
    
    error = {
      message: 'Unable to connect to the server. Please check your network connection and try again.',
      details: err.message
    };
  }

  // ============================================
  // ERROR UI
  // ============================================
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">OTN Route Status</h1>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Error Icon */}
              <svg 
                className="h-5 w-5 text-red-500" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Server Unreachable
              </h3>
              
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs opacity-75">
                      <strong>Details:</strong> {error.details}
                    </p>
                    <p className="text-xs opacity-75">
                      <strong>Hint:</strong> Add OTN_ROUTE_STATUS to .env.local
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // SUCCESS UI
  // ============================================
  
  // Ensure data is an array
  const statusData = Array.isArray(data) ? data : [data];
  
  // Pass server-fetched data to client component
  return <OtnRouteStatusForm initialData={statusData} />;
}
