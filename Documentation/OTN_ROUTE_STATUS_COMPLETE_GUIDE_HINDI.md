# 🔧 OTN Route Status - Complete Guide (Hindi)

## 📚 **Puri Samajh - Har Line Ka Matlab**

---

## 🎯 **Overview - Kya Hai Yeh?**

**OTN Route Status** ek page hai jo **real-time network route status** dikhata hai.

### **Kya Karta Hai:**
```
✅ External API se data fetch karta hai
✅ Routes ki status dikhata hai (UP/DOWN)
✅ Search aur filter karne deta hai
✅ Auto-refresh karta hai har 1 minute
✅ CSV/PDF export karta hai
✅ Pagination support hai
```

---

## 📊 **Architecture - Kaise Kaam Karta Hai**

### **Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
│  (http://localhost:3000/otnroutestatus)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1. Page Load Request
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (SSR)                            │
│  File: app/otnroutestatus/page.js                           │
│                                                              │
│  Step 1: Server Component Runs                              │
│  Step 2: Fetch from External API                            │
│  Step 3: Return HTML + Initial Data                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 2. Fetch Data
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           INTERNAL API ROUTE (Proxy)                         │
│  File: app/api/otn-route-status/route.js                    │
│                                                              │
│  Step 1: Receive request from server/client                 │
│  Step 2: Read OTN_ROUTE_STATUS env variable                 │
│  Step 3: Fetch from external API                            │
│  Step 4: Handle errors                                      │
│  Step 5: Return JSON data                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 3. External API Call
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL API SERVER                             │
│  URL: From OTN_ROUTE_STATUS env variable                    │
│  Example: http://192.168.1.100:8000/api/otn-status         │
│                                                              │
│  Returns: JSON data with route status                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 4. Data Returns
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              CLIENT COMPONENT                                │
│  File: app/otnroutestatus/otnroutestatusform.js             │
│                                                              │
│  Step 1: Receive initialData from server                    │
│  Step 2: Setup React Query hook                             │
│  Step 3: Display data in table                              │
│  Step 4: Auto-refresh every 1 minute                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 5. Auto-Refresh (After 1 min)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              REACT QUERY HOOK                                │
│  File: app/hooks/useOtnRouteStatus.js                       │
│                                                              │
│  Step 1: Timer triggers after 1 minute                      │
│  Step 2: Call /api/otn-route-status                         │
│  Step 3: Update cache                                       │
│  Step 4: Re-render component                                │
│  Step 5: Repeat every 1 minute                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 **File Structure - Kaun Si File Kya Karti Hai**

```
cntx_portal/
│
├── app/
│   │
│   ├── api/
│   │   └── otn-route-status/
│   │       └── route.js                    ← API Proxy Route
│   │           │
│   │           ├── Purpose: External API se data fetch karna
│   │           ├── Input: GET request
│   │           ├── Output: JSON data
│   │           └── Error Handling: 500, 503, 504
│   │
│   ├── hooks/
│   │   └── useOtnRouteStatus.js            ← React Query Hook
│   │       │
│   │       ├── Purpose: Data fetching + caching
│   │       ├── Features: Auto-refresh, retry, error handling
│   │       └── Cache: 5 minutes
│   │
│   └── otnroutestatus/
│       │
│       ├── page.js                         ← Server Component
│       │   │
│       │   ├── Purpose: Initial data fetch (SSR)
│       │   ├── Runs: Server-side only
│       │   └── Returns: HTML + initialData
│       │
│       └── otnroutestatusform.js          ← Client Component
│           │
│           ├── Purpose: Display data + interactions
│           ├── Runs: Client-side (browser)
│           ├── Features: Search, filter, pagination
│           └── Auto-refresh: Every 1 minute
│
├── .env.local                              ← Environment Variables
│   │
│   └── OTN_ROUTE_STATUS=http://api-url    ← External API URL
│
└── Documentation/
    └── OTN_ROUTE_STATUS_COMPLETE_GUIDE_HINDI.md  ← This file
```

---

## 🔍 **Detailed Explanation - Har File Line by Line**

---

### **1. API Route: `app/api/otn-route-status/route.js`**

#### **Purpose:**
```
External API aur Next.js ke beech mein proxy ka kaam karta hai
```

#### **Kyun Chahiye:**
```
1. CORS issues avoid karne ke liye
2. API URL hide karne ke liye (security)
3. Error handling centralize karne ke liye
4. Timeout control karne ke liye
```

#### **Code Explanation:**

```javascript
// ============================================
// IMPORTS
// ============================================

import { NextResponse } from 'next/server';
// NextResponse: Next.js ka response object
// Purpose: JSON response bhejne ke liye

// ============================================
// GET HANDLER
// ============================================

export async function GET(request) {
  // GET: HTTP method
  // request: Incoming request object
  // Purpose: /api/otn-route-status pe GET request handle karna

  try {
    // Try block: Error handling ke liye
    
    // ============================================
    // STEP 1: Get API URL from Environment
    // ============================================
    
    const externalApiUrl = process.env.OTN_ROUTE_STATUS;
    // process.env: Environment variables
    // OTN_ROUTE_STATUS: .env.local se value
    // Example: http://192.168.1.100:8000/api/status
    
    if (!externalApiUrl) {
      // Agar env variable nahi hai
      
      console.error('OTN_ROUTE_STATUS environment variable is not set');
      // Console mein error log karo
      
      return NextResponse.json(
        { 
          error: 'API configuration error',
          message: 'External API URL is not configured.'
        },
        { status: 500 }
      );
      // 500 error return karo
      // Status 500 = Internal Server Error
    }

    // ============================================
    // STEP 2: Fetch from External API
    // ============================================
    
    console.log(`Fetching OTN route status from: ${externalApiUrl}`);
    // Log karo ki kahan se fetch kar rahe hain

    const response = await fetch(externalApiUrl, {
      // fetch: External API ko call karo
      // await: Wait karo response ke liye
      
      method: 'GET',
      // HTTP method: GET
      
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Headers: API ko batao ki JSON chahiye
      
      cache: 'no-store',
      // cache: Data cache mat karo
      // Always fresh data fetch karo
      
      signal: AbortSignal.timeout(30000),
      // timeout: 30 seconds
      // Agar 30 sec mein response nahi aaya, cancel karo
    });

    // ============================================
    // STEP 3: Check Response Status
    // ============================================
    
    if (!response.ok) {
      // response.ok: false if status >= 400
      
      const errorText = await response.text();
      // Error message read karo
      
      console.error(`External API error (${response.status}):`, errorText);
      // Console mein log karo
      
      return NextResponse.json(
        { 
          error: 'External API error',
          message: `Failed to fetch data (Status: ${response.status})`
        },
        { status: response.status }
      );
      // Same status code return karo jo external API ne diya
    }

    // ============================================
    // STEP 4: Parse JSON Data
    // ============================================
    
    const data = await response.json();
    // JSON parse karo
    // await: Wait karo parsing ke liye
    
    if (!data) {
      // Agar data empty hai
      
      console.error('External API returned empty data');
      
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
    // Agar data array nahi hai, array bana do
    // Example: {id: 1} → [{id: 1}]
    
    console.log(`Successfully fetched ${statusData.length} routes`);
    // Success log karo

    // ============================================
    // STEP 6: Return Success Response
    // ============================================
    
    return NextResponse.json(statusData, {
      status: 200,
      // Status 200 = Success
      
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        // Browser cache mat karo
        
        'Access-Control-Allow-Origin': '*',
        // CORS: Kisi bhi origin se allow karo
        
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        // Only GET aur OPTIONS methods
        
        'Access-Control-Allow-Headers': 'Content-Type',
        // Content-Type header allow karo
      },
    });

  } catch (error) {
    // Catch block: Koi bhi error aaye toh handle karo
    
    console.error('Error in OTN route status API:', error);
    
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    // Timeout Error
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        { 
          error: 'Request timeout',
          message: 'Request timed out after 30 seconds'
        },
        { status: 504 }
      );
      // Status 504 = Gateway Timeout
    }

    // Network Error
    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Network error',
          message: 'Unable to connect to external API'
        },
        { status: 503 }
      );
      // Status 503 = Service Unavailable
    }

    // Generic Error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// ============================================
// OPTIONS HANDLER (CORS Preflight)
// ============================================

export async function OPTIONS(request) {
  // OPTIONS: CORS preflight request
  // Browser pehle OPTIONS request bhejta hai
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
  // Empty response with CORS headers
}
```

---

### **2. React Query Hook: `app/hooks/useOtnRouteStatus.js`**

#### **Purpose:**
```
Data fetching, caching, aur auto-refresh handle karta hai
```

#### **Features:**
```
✅ Automatic caching (5 minutes)
✅ Auto-refresh (1 minute)
✅ Retry on failure (3 times)
✅ Loading states
✅ Error handling
```

#### **Code Explanation:**

```javascript
// ============================================
// IMPORTS
// ============================================

"use client";
// "use client": Yeh client component hai
// Browser mein run hoga, server pe nahi

import { useQuery } from '@tanstack/react-query';
// useQuery: React Query ka hook
// Purpose: Data fetching + caching

// ============================================
// CUSTOM HOOK
// ============================================

export function useOtnRouteStatus(initialData = null) {
  // Function: Custom hook
  // initialData: Server se aaya hua initial data
  // Default: null (agar nahi hai)
  
  return useQuery({
    // useQuery: React Query hook
    // Returns: { data, isLoading, error, refetch }
    
    // ============================================
    // QUERY KEY
    // ============================================
    
    queryKey: ['otn-route-status'],
    // Unique identifier for this query
    // React Query isse cache mein store karta hai
    // Same key = same cache
    
    // ============================================
    // QUERY FUNCTION
    // ============================================
    
    queryFn: async () => {
      // Function jo data fetch karta hai
      // async: Asynchronous function
      
      const apiUrl = process.env.NEXT_PUBLIC_OTN_ROUTE_STATUS 
                     || '/api/otn-route-status';
      // API URL:
      // 1. Try environment variable (NEXT_PUBLIC_*)
      // 2. Fallback to local API route
      
      const response = await fetch(apiUrl, {
        // fetch: API call karo
        // await: Wait karo response ke liye
        
        headers: {
          'Content-Type': 'application/json',
        },
        // Headers: JSON request hai
      });

      if (!response.ok) {
        // Agar response error hai
        
        const errorText = await response.text();
        // Error message read karo
        
        throw new Error(`API Error (${response.status}): ${errorText}`);
        // Error throw karo
        // React Query isse catch karega
      }

      const data = await response.json();
      // JSON parse karo
      
      return Array.isArray(data) ? data : [data];
      // Array format mein return karo
    },
    
    // ============================================
    // INITIAL DATA
    // ============================================
    
    initialData,
    // Server se aaya hua data
    // Pehli baar yeh data use hoga
    // API call nahi hogi initially
    
    // ============================================
    // CACHE SETTINGS
    // ============================================
    
    staleTime: 5 * 60 * 1000,
    // 5 minutes = 300,000 milliseconds
    // Data "fresh" rahega 5 minutes tak
    // Fresh data = no refetch needed
    
    gcTime: 10 * 60 * 1000,
    // 10 minutes = 600,000 milliseconds
    // Garbage Collection time
    // Cache mein 10 minutes tak rahega
    // Uske baad delete ho jayega
    
    // ============================================
    // REFETCH SETTINGS
    // ============================================
    
    refetchOnWindowFocus: true,
    // true: Jab user tab pe wapas aaye, refresh karo
    // Example: User dusri tab pe gaya, wapas aaya → refresh
    
    refetchOnReconnect: true,
    // true: Jab internet reconnect ho, refresh karo
    // Example: WiFi disconnect hua, wapas connect → refresh
    
    refetchInterval: 60 * 1000,
    // 60 seconds = 60,000 milliseconds
    // Har 1 minute mein auto-refresh
    // Background mein chalta rahega
    
    // ============================================
    // RETRY SETTINGS
    // ============================================
    
    retry: 3,
    // Agar error aaye, 3 baar retry karo
    // Attempt 1, 2, 3 → phir fail
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Retry delay calculation:
    // attemptIndex: 0, 1, 2 (0-based)
    // 
    // Attempt 1: 1000 * 2^0 = 1000ms = 1 second
    // Attempt 2: 1000 * 2^1 = 2000ms = 2 seconds
    // Attempt 3: 1000 * 2^2 = 4000ms = 4 seconds
    // 
    // Math.min: Maximum 30 seconds tak
    // Exponential backoff strategy
    
    // ============================================
    // ERROR CALLBACK
    // ============================================
    
    onError: (error) => {
      // Jab error aaye, yeh function run hoga
      
      console.error('Error fetching OTN route status:', error);
      // Console mein error log karo
      // Debugging ke liye helpful
    },
    
    // ============================================
    // SUCCESS CALLBACK
    // ============================================
    
    onSuccess: (data) => {
      // Jab successfully data fetch ho, yeh function run hoga
      
      console.log(`Successfully loaded ${data?.length || 0} routes`);
      // Console mein success log karo
      // data?.length: Optional chaining (agar data null hai)
      // || 0: Default value agar length nahi hai
    },
  });
}
```

---

### **3. Server Component: `app/otnroutestatus/page.js`**

#### **Purpose:**
```
Server-side initial data fetch karta hai
```

#### **Kyun Chahiye:**
```
1. SEO ke liye (search engines ko data dikhe)
2. Fast initial load (data pehle se ready)
3. No loading spinner on first visit
```

#### **Code Explanation:**

```javascript
// ============================================
// IMPORTS
// ============================================

import OtnRouteStatusForm from "./otnroutestatusform";
// Client component import karo
// Yeh actual UI render karega

// ============================================
// SERVER COMPONENT
// ============================================

export default async function OtnRouteStatus() {
  // async: Asynchronous function
  // Server-side run hoga
  // Browser mein nahi run hoga
  
  let data = null;
  // Variable: Fetched data store karne ke liye
  // Initial: null
  
  let error = null;
  // Variable: Error store karne ke liye
  // Initial: null

  try {
    // Try block: Error handling
    
    // ============================================
    // STEP 1: Get API URL
    // ============================================
    
    const apiUrl = process.env.OTN_ROUTE_STATUS 
                   || "http://localhost:3000/api/otn-route-status";
    // API URL:
    // 1. Try environment variable
    // 2. Fallback to localhost
    // 
    // Note: Server-side hai, toh NEXT_PUBLIC_ nahi chahiye
    
    // ============================================
    // STEP 2: Fetch Data
    // ============================================
    
    const response = await fetch(apiUrl, {
      // fetch: API call
      // await: Wait for response
      
      cache: 'no-store',
      // cache: Don't cache
      // Always fetch fresh data
      
      next: { revalidate: 0 }
      // Next.js specific
      // revalidate: 0 = Don't cache
      // Always fresh data
    });

    // ============================================
    // STEP 3: Check Response
    // ============================================
    
    if (!response.ok) {
      // Agar response error hai
      
      const errorText = await response.text();
      // Error message read karo
      
      throw new Error(`API Error (${response.status}): ${errorText}`);
      // Error throw karo
      // Catch block mein jayega
    }

    // ============================================
    // STEP 4: Parse JSON
    // ============================================
    
    data = await response.json();
    // JSON parse karo
    // data variable mein store karo
    
  } catch (err) {
    // Catch block: Error handling
    
    console.error('Error in OtnRouteStatus:', err);
    // Console mein log karo
    
    error = {
      message: 'Unable to connect to the server.',
      details: err.message
    };
    // Error object bana do
    // User ko dikhane ke liye
  }

  // ============================================
  // ERROR UI
  // ============================================
  
  if (error) {
    // Agar error hai
    
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">
          OTN Route Status
        </h1>
        
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          {/* Error box */}
          
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Error icon */}
              <svg className="h-5 w-5 text-red-500">...</svg>
            </div>
            
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Server Unreachable
              </h3>
              
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
                {/* Error message */}
                
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-1 text-xs opacity-75">
                    Details: {error.details}
                  </p>
                )}
                {/* Development mode mein details dikha do */}
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
  
  const statusData = Array.isArray(data) ? data : [data];
  // Ensure array format
  // Example: {id: 1} → [{id: 1}]
  
  return <OtnRouteStatusForm initialData={statusData} />;
  // Client component ko render karo
  // initialData pass karo
  // Yeh data client component mein use hoga
}
```

---

### **4. Client Component: `app/otnroutestatus/otnroutestatusform.js`**

#### **Purpose:**
```
UI render karta hai aur user interactions handle karta hai
```

#### **Features:**
```
✅ Table display
✅ Search functionality
✅ Filter by region/status
✅ Pagination
✅ CSV/PDF export
✅ Auto-refresh
```

#### **Code Explanation:**

```javascript
// ============================================
// IMPORTS
// ============================================

"use client";
// Client component
// Browser mein run hoga

import React, { useState, useMemo, useEffect } from 'react';
// React hooks:
// - useState: State management
// - useMemo: Performance optimization
// - useEffect: Side effects

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// PDF generation libraries

import { debounce } from 'lodash';
// debounce: Delay function execution
// Example: Search input ke liye

import PageHeader from '../components/PageHeader';
import { FaNetworkWired, FaSearch, FaFilter } from 'react-icons/fa';
// UI components aur icons

import { useOtnRouteStatus } from '../hooks/useOtnRouteStatus';
// Custom hook for data fetching

// ============================================
// COMPONENT
// ============================================

export default function OtnRouteStatusForm({ initialData }) {
  // Props:
  // - initialData: Server se aaya hua data
  
  // ============================================
  // REACT QUERY - Data Fetching
  // ============================================
  
  const { data, isLoading, error, refetch, isFetching } = useOtnRouteStatus(initialData);
  // useOtnRouteStatus: Custom hook
  // Returns:
  // - data: Fetched data
  // - isLoading: Initial loading state
  // - error: Error object (if any)
  // - refetch: Function to manually refetch
  // - isFetching: Background fetching state
  
  const allRoutes = data || [];
  // allRoutes: All data
  // || []: Default empty array agar data null hai
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [searchInput, setSearchInput] = useState('');
  // searchInput: User ka typed text
  // Real-time update hota hai
  
  const [searchTerm, setSearchTerm] = useState('');
  // searchTerm: Actual search term (debounced)
  // 300ms delay ke baad update hota hai
  
  const [selectedRegion, setSelectedRegion] = useState('');
  // selectedRegion: Selected filter region
  // Empty string = All regions
  
  const [selectedStatus, setSelectedStatus] = useState('');
  // selectedStatus: Selected filter status
  // Empty string = All statuses
  
  const [isExporting, setIsExporting] = useState(false);
  // isExporting: PDF export in progress
  // true = Disable export button
  
  const [currentPage, setCurrentPage] = useState(1);
  // currentPage: Current pagination page
  // Default: 1 (first page)
  
  const [itemsPerPage, setItemsPerPage] = useState(25);
  // itemsPerPage: Items per page
  // Default: 25
  
  // ============================================
  // DEBOUNCED SEARCH
  // ============================================
  
  useEffect(() => {
    // useEffect: Side effect
    // Runs when searchInput changes
    
    const debouncedSearch = debounce(() => {
      // debounce: Wait 300ms before executing
      // Agar user type karta rahega, wait karta rahega
      // Jab user ruk jayega, tab execute hoga
      
      setSearchTerm(searchInput);
      // Update actual search term
      
      setCurrentPage(1);
      // Reset to first page
    }, 300);
    // 300ms delay

    debouncedSearch();
    // Execute debounced function

    return () => debouncedSearch.cancel();
    // Cleanup: Cancel pending debounce
    // Component unmount hone par
  }, [searchInput]);
  // Dependency: searchInput
  // Jab searchInput change ho, effect run karo
  
  // ============================================
  // COMPUTED VALUES (useMemo)
  // ============================================
  
  // Unique regions
  const regions = useMemo(() => {
    // useMemo: Memoization
    // Result cache hota hai
    // Jab dependencies change ho, tab recalculate
    
    if (!allRoutes || !Array.isArray(allRoutes)) return [];
    // Validation: Agar data nahi hai, empty array
    
    const regionSet = new Set();
    // Set: Unique values store karta hai
    // Duplicate automatically remove ho jate hain
    
    allRoutes.forEach(route => {
      // Har route ko iterate karo
      
      const region = route.region_name || route.region;
      // region: Try region_name, fallback to region
      
      if (region) regionSet.add(region);
      // Agar region hai, Set mein add karo
    });
    
    return Array.from(regionSet).sort();
    // Set → Array convert karo
    // sort(): Alphabetically sort karo
  }, [allRoutes]);
  // Dependency: allRoutes
  // Jab allRoutes change ho, recalculate
  
  // Unique statuses
  const statuses = useMemo(() => {
    // Same logic as regions
    
    if (!allRoutes || !Array.isArray(allRoutes)) return [];
    
    const statusSet = new Set();
    
    allRoutes.forEach(route => {
      const status = route.status;
      if (status) statusSet.add(status);
    });
    
    return Array.from(statusSet).sort();
  }, [allRoutes]);
  
  // Filtered routes
  const filteredRoutes = useMemo(() => {
    // Filter logic
    
    if (!allRoutes || !Array.isArray(allRoutes)) return [];
    
    return allRoutes.filter(route => {
      // filter: Array method
      // Returns new array with matching items
      
      if (!route) return false;
      // Validation: Agar route null hai, skip
      
      // ============================================
      // REGION FILTER
      // ============================================
      
      if (selectedRegion) {
        // Agar region selected hai
        
        const regionFields = ['region', 'region_name', 'location'];
        // Multiple fields check karo
        
        const hasMatchingRegion = regionFields.some(field => {
          // some: Koi bhi ek match ho
          
          const value = route[field];
          // Field ki value
          
          return typeof value === 'string' &&
                 value.toLowerCase().includes(selectedRegion.toLowerCase());
          // Case-insensitive match
          // Example: "Delhi" matches "delhi"
        });
        
        if (!hasMatchingRegion) return false;
        // Agar match nahi, exclude karo
      }
      
      // ============================================
      // STATUS FILTER
      // ============================================
      
      if (selectedStatus) {
        // Agar status selected hai
        
        const status = route.status;
        
        if (!status || status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
          // Agar match nahi, exclude karo
        }
      }
      
      // ============================================
      // SEARCH FILTER
      // ============================================
      
      if (searchTerm) {
        // Agar search term hai
        
        const searchableFields = Object.values(route).filter(
          value => typeof value === 'string' || typeof value === 'number'
        );
        // Sabhi string aur number fields
        
        const hasMatch = searchableFields.some(field =>
          String(field).toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Koi bhi field match ho
        
        if (!hasMatch) return false;
        // Agar match nahi, exclude karo
      }
      
      return true;
      // Sab filters pass, include karo
    });
  }, [allRoutes, selectedRegion, selectedStatus, searchTerm]);
  // Dependencies: Jab koi bhi change ho, recalculate
  
  // Paginated routes
  const paginatedRoutes = useMemo(() => {
    // Pagination logic
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    // Start index calculate karo
    // Example: Page 2, 25 items → Start at 25
    
    const endIndex = startIndex + itemsPerPage;
    // End index calculate karo
    // Example: Start 25, 25 items → End at 50
    
    return filteredRoutes.slice(startIndex, endIndex);
    // slice: Array ka portion return karo
    // Example: [0...100].slice(25, 50) → [25...49]
  }, [filteredRoutes, currentPage, itemsPerPage]);
  // Dependencies: Pagination parameters
  
  // Pagination info
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  // Total pages calculate karo
  // Math.ceil: Round up
  // Example: 26 items, 25 per page → 2 pages
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  // First item number on current page
  // Example: Page 2, 25 items → Start at 26
  
  const endItem = Math.min(currentPage * itemsPerPage, filteredRoutes.length);
  // Last item number on current page
  // Math.min: Smaller value
  // Example: Page 2, 26 total → End at 26 (not 50)
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handlePageChange = (newPage) => {
    // Page change handler
    
    if (newPage === '...') return;
    // Agar ellipsis hai, ignore
    
    const maxPage = Math.min(totalPages, 25);
    // Max 25 pages
    
    if (newPage > maxPage) return;
    // Agar limit se zyada, ignore
    
    setCurrentPage(newPage);
    // Update current page
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Scroll to top
    // smooth: Animated scroll
  };
  
  const handleItemsPerPageChange = (e) => {
    // Items per page change handler
    
    setItemsPerPage(Number(e.target.value));
    // Update items per page
    // Number(): String → Number convert
    
    setCurrentPage(1);
    // Reset to first page
  };
  
  const handleRegionChange = (e) => {
    // Region filter change handler
    
    setSelectedRegion(e.target.value);
    // Update selected region
    
    setCurrentPage(1);
    // Reset to first page
  };
  
  const handleStatusChange = (e) => {
    // Status filter change handler
    
    setSelectedStatus(e.target.value);
    // Update selected status
    
    setCurrentPage(1);
    // Reset to first page
  };
  
  const clearFilters = () => {
    // Clear all filters
    
    setSearchInput('');
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedStatus('');
    setCurrentPage(1);
    // Reset all states
  };
  
  // ============================================
  // EXPORT FUNCTIONS
  // ============================================
  
  const exportToCSV = () => {
    // CSV export function
    
    if (filteredRoutes.length === 0) return;
    // Agar data nahi, return
    
    const headers = ['#', 'Region', 'Route', 'Status', 'Last Updated'];
    // CSV headers
    
    const csvContent = [
      headers.join(','),
      // First row: Headers
      // join(','): Array → CSV string
      
      ...filteredRoutes.map((route, index) => [
        // Map each route to CSV row
        
        index + 1,
        // Serial number
        
        `"${(route.region || '').replace(/"/g, '""')}"`,
        // Region (escaped quotes)
        // replace(/"/g, '""'): " → ""
        
        `"${(route.route_name || '').replace(/"/g, '""')}"`,
        // Route name (escaped)
        
        `"${(route.status || '').replace(/"/g, '""')}"`,
        // Status (escaped)
        
        `"${(route.last_updated || '').replace(/"/g, '""')}"`
        // Last updated (escaped)
      ].join(','))
      // join(','): Array → CSV row
    ].join('\n');
    // join('\n'): Rows → CSV file
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // Blob: File-like object
    // type: MIME type
    
    const url = URL.createObjectURL(blob);
    // Create download URL
    
    const link = document.createElement('a');
    // Create <a> element
    
    link.href = url;
    link.download = `otn-route-status-${new Date().toISOString().split('T')[0]}.csv`;
    // Filename with date
    // Example: otn-route-status-2024-01-30.csv
    
    link.click();
    // Trigger download
    
    URL.revokeObjectURL(url);
    // Cleanup: Remove URL
  };
  
  const exportToPDF = () => {
    // PDF export function
    
    if (filteredRoutes.length === 0 || isExporting) return;
    // Validation
    
    setIsExporting(true);
    // Set exporting state
    
    try {
      const doc = new jsPDF('landscape');
      // Create PDF document
      // landscape: Horizontal orientation
      
      const headers = [['#', 'Region', 'Route', 'Status', 'Last Updated']];
      // Table headers
      
      const data = filteredRoutes.map((route, index) => [
        index + 1,
        route.region || '-',
        route.route_name || '-',
        route.status || '-',
        route.last_updated || '-'
      ]);
      // Table data
      
      autoTable(doc, {
        // Generate table
        
        head: headers,
        body: data,
        startY: 20,
        // Start position
        
        headStyles: { 
          fillColor: [37, 99, 235],
          // Header background color (blue)
          
          textColor: 255,
          // Header text color (white)
          
          fontStyle: 'bold'
        },
        
        alternateRowStyles: { fillColor: 249 },
        // Alternate row color (light gray)
        
        styles: { fontSize: 8, cellPadding: 2 },
        // Cell styles
        
        didDrawPage: function(data) {
          // Page header/footer
          
          doc.setFontSize(10);
          doc.text('OTN Route Status', 14, 10);
          // Title
          
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.text(
            `Page ${pageNumber}`,
            pageSize.width / 2,
            pageHeight - 10,
            { align: 'center' }
          );
          // Page number
        }
      });
      
      doc.save(`otn-route-status-${new Date().toISOString().split('T')[0]}.pdf`);
      // Save PDF
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
      // Reset exporting state
    }
  };
  
  // ============================================
  // LOADING STATE
  // ============================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          {/* Loading spinner */}
          
          <p className="text-gray-700 text-xl font-semibold">
            Loading route status...
          </p>
        </div>
      </div>
    );
  }
  
  // ============================================
  // ERROR STATE
  // ============================================
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-l-4 border-red-600 rounded-lg p-6 shadow-xl">
          {/* Error box */}
          
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600">...</svg>
              {/* Error icon */}
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-900">
                Unable to Load Route Status
              </h3>
              
              <p className="mt-2 text-sm text-red-700">
                {error.message || 'An unexpected error occurred'}
              </p>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
                {/* Retry button */}
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Refresh Page
                </button>
                {/* Refresh button */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6 pb-24">
      {/* Main container */}
      
      {/* Page Header */}
      <div className="relative bg-white rounded-xl shadow-md p-6">
        <PageHeader
          title="OTN Route Status"
          description={`Showing ${filteredRoutes.length} of ${allRoutes.length} routes`}
          icon={FaNetworkWired}
        />
        
        {isFetching && (
          <div className="absolute top-6 right-6">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
            {/* Refreshing indicator */}
          </div>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search routes..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Region Filter */}
        <div className="flex-1 md:flex-[2]">
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl"
          >
            <option value="">All Regions</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        
        {/* Status Filter */}
        <div className="flex-1 md:flex-[2]">
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl"
          >
            <option value="">All Statuses</option>
            {statuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Results and Export */}
      <div className="flex justify-between items-center bg-white rounded-xl shadow-md p-5">
        <div>
          <span className="font-bold text-blue-600 text-lg">
            {filteredRoutes.length}
          </span>
          <span className="ml-1">routes found</span>
          
          {(searchTerm || selectedRegion || selectedStatus) && (
            <button
              onClick={clearFilters}
              className="ml-4 text-blue-600 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            disabled={filteredRoutes.length === 0}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl"
          >
            Export CSV
          </button>
          
          <button
            onClick={exportToPDF}
            disabled={filteredRoutes.length === 0 || isExporting}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl"
          >
            {isExporting ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
            <tr>
              <th className="px-6 py-4 text-left text-white">#</th>
              <th className="px-6 py-4 text-left text-white">Region</th>
              <th className="px-6 py-4 text-left text-white">Route Name</th>
              <th className="px-6 py-4 text-left text-white">Status</th>
              <th className="px-6 py-4 text-left text-white">Last Updated</th>
            </tr>
          </thead>
          
          <tbody>
            {paginatedRoutes.length > 0 ? (
              paginatedRoutes.map((route, index) => (
                <tr key={index} className="hover:bg-blue-50 border-b">
                  <td className="px-6 py-4">{startItem + index}</td>
                  <td className="px-6 py-4">{route.region || '-'}</td>
                  <td className="px-6 py-4">{route.route_name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      route.status === 'UP' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {route.status || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{route.last_updated || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                  No routes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {filteredRoutes.length > 0 && (
          <div className="bg-gray-50 px-6 py-5 border-t-2">
            <div className="flex justify-between items-center">
              <div>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-2 border-2 rounded-lg"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="ml-2">per page</span>
              </div>
              
              <div>
                Showing {startItem} to {endItem} of {filteredRoutes.length}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border-2 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border-2 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 **Summary - Quick Reference**

### **Files:**

```
1. app/api/otn-route-status/route.js
   → External API se data fetch karta hai
   → Error handling karta hai
   → CORS support deta hai

2. app/hooks/useOtnRouteStatus.js
   → Data fetching + caching
   → Auto-refresh (1 min)
   → Retry on error (3 times)

3. app/otnroutestatus/page.js
   → Server-side initial fetch
   → SEO friendly
   → Fast initial load

4. app/otnroutestatus/otnroutestatusform.js
   → UI render karta hai
   → Search, filter, pagination
   → CSV/PDF export
```

### **Data Flow:**

```
1. User visits page
2. Server fetches initial data
3. Client component renders
4. React Query caches data
5. Auto-refresh every 1 minute
6. User can search/filter/export
```

### **Environment Variable:**

```bash
# .env.local
OTN_ROUTE_STATUS=http://your-api-url/api/status
```

---

**🎊 Ab Samajh Aa Gaya? 🚀**

Agar koi specific line ya concept samajh nahi aaya, batao! 😊
