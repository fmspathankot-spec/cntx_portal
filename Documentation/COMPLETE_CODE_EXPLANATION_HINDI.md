# 🎓 CNTX Portal - पूरी Code Explanation (Hindi)

## 📚 **विषय सूची (Table of Contents)**

1. [Project Structure](#project-structure)
2. [Data Flow - कैसे काम करता है](#data-flow)
3. [File-by-File Explanation](#file-by-file-explanation)
4. [API Call Journey](#api-call-journey)
5. [React Query समझें](#react-query)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting Guide](#troubleshooting)

---

## 📁 **Project Structure**

```
cntx_portal/
│
├── app/                                    # Main application folder
│   ├── api/                               # Backend API routes
│   │   └── otn-route-status/
│   │       └── route.js                   # API endpoint
│   │
│   ├── components/                        # Reusable components
│   │   ├── Sidebar.js                     # Desktop sidebar
│   │   ├── MobileSidebar.js              # Mobile sidebar
│   │   └── PageHeader.js                  # Page header component
│   │
│   ├── hooks/                             # Custom React hooks
│   │   ├── useOtnRouteStatus.js          # OTN status data hook
│   │   └── useOtnRoutes.js               # OTN routes data hook
│   │
│   ├── providers/                         # Context providers
│   │   └── QueryProvider.js              # React Query provider
│   │
│   ├── otn-route-status/                 # OTN Route Status page
│   │   ├── page.js                       # Server component (SSR)
│   │   └── otnroutestatusform.js        # Client component (UI)
│   │
│   ├── layout.js                         # Root layout
│   └── globals.css                       # Global styles
│
├── .env.local                            # Environment variables (SECRET)
├── .env.example                          # Example env file
├── package.json                          # Dependencies
└── next.config.js                        # Next.js config
```

---

## 🔄 **Data Flow - कैसे काम करता है**

### **Step-by-Step Journey:**

```
1. User Browser में URL खोलता है
   ↓
2. Next.js Server Component (page.js) चलता है
   ↓
3. Server External API को call करता है
   ↓
4. Data आता है और validate होता है
   ↓
5. Client Component (otnroutestatusform.js) को data pass होता है
   ↓
6. React Query Hook (useOtnRouteStatus) initialize होता है
   ↓
7. UI पर data display होता है
   ↓
8. हर 1 minute में auto-refresh होता है
```

---

## 📖 **File-by-File Explanation**

### **1. `.env.local` - Environment Variables**

```bash
# ये file SECRET है - GitHub पर नहीं जाती
# सभी API URLs और secrets यहाँ रखते हैं

# External API का URL
OTN_ROUTE_STATUS=http://10.180.16.133:8000/api/otn-status

# Explanation:
# - यहाँ actual API server का URL होता है
# - Development में localhost हो सकता है
# - Production में actual server IP/domain होगा
```

**क्यों जरूरी है?**
- API URLs को code में hard-code नहीं करते
- Different environments (dev/prod) के लिए अलग URLs
- Security - secrets को code से अलग रखते हैं

---

### **2. `app/api/otn-route-status/route.js` - API Route**

```javascript
import { NextResponse } from 'next/server';

/**
 * ये Next.js का internal API route है
 * Browser से direct external API call नहीं कर सकते (CORS issue)
 * इसलिए ये "proxy" की तरह काम करता है
 */

export async function GET(request) {
  try {
    // Step 1: .env.local से API URL लेते हैं
    const externalApiUrl = process.env.OTN_ROUTE_STATUS;
    
    // Step 2: Check करते हैं URL set है या नहीं
    if (!externalApiUrl) {
      return NextResponse.json(
        { error: 'API URL not configured' },
        { status: 500 }
      );
    }

    // Step 3: External API को call करते हैं
    const response = await fetch(externalApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',              // कोई cache नहीं - हमेशा fresh data
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    // Step 4: Response check करते हैं
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Step 5: JSON data parse करते हैं
    const data = await response.json();
    
    // Step 6: Data को array में convert करते हैं
    const statusData = Array.isArray(data) ? data : [data];
    
    // Step 7: Browser को response भेजते हैं
    return NextResponse.json(statusData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*', // CORS allow
      },
    });

  } catch (error) {
    // Error handling
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

**क्या होता है यहाँ?**
1. Browser `/api/otn-route-status` को call करता है
2. ये route external API को call करता है
3. Data लेकर browser को वापस भेजता है
4. CORS issues solve हो जाते हैं

---

### **3. `app/providers/QueryProvider.js` - React Query Setup**

```javascript
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * React Query का setup
 * सभी components को data caching/fetching की power देता है
 */

export default function QueryProvider({ children }) {
  // QueryClient बनाते हैं (एक बार)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 min - data "fresh" रहता है
        gcTime: 10 * 60 * 1000,        // 10 min - cache में रहता है
        refetchOnWindowFocus: true,     // Window focus पर refresh
        refetchOnReconnect: true,       // Internet reconnect पर refresh
        retry: 3,                       // 3 बार retry करेगा fail होने पर
      },
    },
  }));

  // सभी children को QueryClient provide करते हैं
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**क्यों जरूरी है?**
- Data caching - बार-बार API call नहीं करनी पड़ती
- Auto-refresh - data automatically update होता है
- Loading/Error states - automatically handle होते हैं
- Better performance - fast UI

---

### **4. `app/layout.js` - Root Layout**

```javascript
import QueryProvider from './providers/QueryProvider';
import Sidebar from './components/Sidebar';

/**
 * ये सबसे बाहरी wrapper है
 * सभी pages इसके अंदर render होते हैं
 */

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* QueryProvider - सभी को React Query की power देता है */}
        <QueryProvider>
          <div className="flex min-h-screen">
            {/* Sidebar - हमेशा दिखता है */}
            <Sidebar />
            
            {/* Main content - pages यहाँ render होते हैं */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
```

**Structure:**
```
<html>
  <body>
    <QueryProvider>           ← React Query setup
      <div>
        <Sidebar />           ← Left sidebar (navigation)
        <div>
          {children}          ← Your page content
        </div>
      </div>
    </QueryProvider>
  </body>
</html>
```

---

### **5. `app/otn-route-status/page.js` - Server Component**

```javascript
import OtnRouteStatusForm from "./otnroutestatusform";

/**
 * Server Component - Server पर चलता है
 * Browser में नहीं चलता
 * SEO के लिए अच्छा है
 */

export default async function OtnRouteStatus() {
  let data = null;
  let error = null;

  try {
    // Step 1: API URL लेते हैं
    const apiUrl = process.env.OTN_ROUTE_STATUS 
                   || "http://localhost:3000/api/otn-route-status";
    
    console.log(`🔄 [Server] Fetching from: ${apiUrl}`);
    
    // Step 2: API call करते हैं (server-side)
    const response = await fetch(apiUrl, {
      cache: 'no-store',        // कोई cache नहीं
      next: { revalidate: 0 }   // हमेशा fresh data
    });

    // Step 3: Response check करते हैं
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Step 4: JSON parse करते हैं
    const responseData = await response.json();
    
    // Step 5: Array में convert करते हैं
    data = Array.isArray(responseData) 
           ? responseData 
           : (responseData ? [responseData] : []);
    
    console.log(`✅ [Server] Fetched ${data.length} records`);
    
  } catch (err) {
    console.error('❌ [Server] Error:', err);
    error = {
      message: 'Unable to connect to server',
      details: err.message
    };
  }

  // Step 6: Error होने पर error UI दिखाते हैं
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <h3>Server Unreachable</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Step 7: Data को client component में pass करते हैं
  const initialData = (data && data.length > 0) ? data : [];
  
  console.log(`📤 [Server] Passing ${initialData.length} records to client`);
  
  return <OtnRouteStatusForm initialData={initialData} />;
}
```

**क्या होता है?**
1. Server पर API call होती है (browser में नहीं)
2. Data fetch होता है
3. Error handling होती है
4. Client component को data pass होता है
5. SEO friendly - search engines को data दिखता है

---

### **6. `app/hooks/useOtnRouteStatus.js` - React Query Hook**

```javascript
"use client";

import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook - data fetching के लिए
 * React Query का use करता है
 */

export function useOtnRouteStatus(initialData = null) {
  return useQuery({
    // Query का unique name
    queryKey: ['otn-route-status'],
    
    // Data fetch करने का function
    queryFn: async () => {
      // Step 1: API URL
      const apiUrl = '/api/otn-route-status';
      
      console.log(`🔄 [Hook] Fetching from: ${apiUrl}`);
      
      // Step 2: Fetch call
      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      // Step 3: Error check
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // Step 4: Parse JSON
      const data = await response.json();
      
      console.log(`✅ [Hook] Fetched ${data?.length || 0} records`);
      
      // Step 5: Array में convert
      const result = Array.isArray(data) ? data : (data ? [data] : []);
      
      return result;
    },
    
    // Initial data (server से आया हुआ)
    initialData: (initialData && initialData.length > 0) 
                 ? initialData 
                 : undefined,
    
    // Cache settings
    staleTime: 5 * 60 * 1000,        // 5 min fresh
    gcTime: 10 * 60 * 1000,          // 10 min cache
    
    // Auto-refresh settings
    refetchOnWindowFocus: true,       // Window focus पर
    refetchOnReconnect: true,         // Internet reconnect पर
    refetchInterval: 60 * 1000,       // हर 1 minute
    
    // Retry settings
    retry: 3,                         // 3 बार retry
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });
}
```

**क्या मिलता है?**
```javascript
const { data, isLoading, error, refetch, isFetching } = useOtnRouteStatus(initialData);

// data - actual data array
// isLoading - पहली बार load हो रहा है?
// error - कोई error है?
// refetch - manually refresh करने के लिए
// isFetching - background में fetch हो रहा है?
```

---

### **7. `app/otn-route-status/otnroutestatusform.js` - Client Component**

```javascript
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useOtnRouteStatus } from '../hooks/useOtnRouteStatus';

/**
 * Main UI Component - Browser में चलता है
 * User interaction handle करता है
 */

export default function OtnRouteStatusForm({ initialData }) {
  // ============================================
  // STEP 1: React Query Hook से data लेते हैं
  // ============================================
  
  const { data, isLoading, error, refetch, isFetching } = useOtnRouteStatus(initialData);
  const allRoutes = data || [];
  
  console.log(`📊 [Component] Received ${allRoutes.length} routes`);

  // ============================================
  // STEP 2: State Management - User inputs
  // ============================================
  
  const [searchInput, setSearchInput] = useState('');      // Search box
  const [searchTerm, setSearchTerm] = useState('');        // Actual search (debounced)
  const [selectedRegion, setSelectedRegion] = useState(''); // Region filter
  const [selectedSection, setSelectedSection] = useState(''); // Section filter
  const [currentPage, setCurrentPage] = useState(1);       // Pagination
  const [itemsPerPage, setItemsPerPage] = useState(25);    // Items per page

  // ============================================
  // STEP 3: Debounced Search (300ms delay)
  // ============================================
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);  // 300ms बाद search apply होगा
      setCurrentPage(1);            // पहले page पर जाओ
    }, 300);

    return () => clearTimeout(timer); // Cleanup
  }, [searchInput]);

  // ============================================
  // STEP 4: Computed Values (useMemo for performance)
  // ============================================
  
  // Unique regions निकालते हैं
  const regions = useMemo(() => {
    const regionSet = new Set();
    allRoutes.forEach(route => {
      if (route.region) regionSet.add(route.region);
    });
    return Array.from(regionSet).sort();
  }, [allRoutes]);

  // Unique sections निकालते हैं
  const sections = useMemo(() => {
    const sectionSet = new Set();
    allRoutes.forEach(route => {
      if (route.section) sectionSet.add(route.section);
    });
    return Array.from(sectionSet).sort();
  }, [allRoutes]);

  // Filtered routes (search + filters apply करके)
  const filteredRoutes = useMemo(() => {
    return allRoutes.filter(route => {
      // Region filter
      if (selectedRegion && !route.region?.toLowerCase().includes(selectedRegion.toLowerCase())) {
        return false;
      }

      // Section filter
      if (selectedSection && !route.section?.toLowerCase().includes(selectedSection.toLowerCase())) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchableFields = [
          route.region,
          route.linkname,
          route.section,
          route.begin_time,
          route.report_time,
          route.down_time
        ].filter(Boolean);
        
        const hasMatch = searchableFields.some(field =>
          String(field).toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [allRoutes, selectedRegion, selectedSection, searchTerm]);

  // Paginated routes (current page के लिए)
  const paginatedRoutes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRoutes.slice(startIndex, endIndex);
  }, [filteredRoutes, currentPage, itemsPerPage]);

  // ============================================
  // STEP 5: Event Handlers
  // ============================================
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setCurrentPage(1); // पहले page पर जाओ
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSection('');
    setCurrentPage(1);
  };

  // ============================================
  // STEP 6: Export Functions
  // ============================================
  
  const exportToCSV = () => {
    // CSV format में data बनाते हैं
    const headers = ['#', 'Region', 'Link Name', 'Section', 'Begin Time', 'Report Time', 'Down Time'];
    const csvContent = [
      headers.join(','),
      ...filteredRoutes.map((route, index) => [
        index + 1,
        `"${route.region || ''}"`,
        `"${route.linkname || ''}"`,
        `"${route.section || ''}"`,
        `"${route.begin_time || ''}"`,
        `"${route.report_time || ''}"`,
        `"${route.down_time || ''}"`
      ].join(','))
    ].join('\n');

    // File download करते हैं
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `otn-route-status-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ============================================
  // STEP 7: Loading State
  // ============================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600"></div>
          <p className="text-xl mt-4">Loading route status...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 8: Error State
  // ============================================
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-600 p-6">
          <h3 className="text-lg font-medium text-red-900">
            Unable to Load Route Status
          </h3>
          <p className="mt-2 text-red-700">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // STEP 9: Main UI Render
  // ============================================
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold">OTN Route Status</h1>
        <p className="text-gray-600">
          Showing {filteredRoutes.length} of {allRoutes.length} routes
        </p>
        
        {/* Refreshing indicator */}
        {isFetching && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">Refreshing...</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Box */}
        <div className="md:col-span-5">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="w-full px-4 py-3 border-2 rounded-xl"
          />
        </div>

        {/* Region Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className="w-full px-4 py-3 border-2 rounded-xl"
          >
            <option value="">All Regions</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div className="md:col-span-3">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl"
          >
            <option value="">All Sections</option>
            {sections.map((section, index) => (
              <option key={index} value={section}>{section}</option>
            ))}
          </select>
        </div>

        {/* Clear Button */}
        {(searchTerm || selectedRegion || selectedSection) && (
          <div className="md:col-span-1">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-gray-200 rounded-xl"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-xl shadow-md p-5">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-bold text-blue-600 text-lg">
              {filteredRoutes.length}
            </span>
            <span className="text-gray-600 ml-2">routes found</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={filteredRoutes.length === 0}
              className="px-5 py-2 bg-green-600 text-white rounded-xl"
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
            <tr>
              <th className="px-6 py-4 text-white">#</th>
              <th className="px-6 py-4 text-white">Region</th>
              <th className="px-6 py-4 text-white">Link Name</th>
              <th className="px-6 py-4 text-white">Section</th>
              <th className="px-6 py-4 text-white">Begin Time</th>
              <th className="px-6 py-4 text-white">Report Time</th>
              <th className="px-6 py-4 text-white">Down Time</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoutes.length > 0 ? (
              paginatedRoutes.map((route, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="px-6 py-4">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">{route.region || '-'}</td>
                  <td className="px-6 py-4">{route.linkname || '-'}</td>
                  <td className="px-6 py-4">{route.section || '-'}</td>
                  <td className="px-6 py-4">{route.begin_time || '-'}</td>
                  <td className="px-6 py-4">{route.report_time || '-'}</td>
                  <td className="px-6 py-4">
                    {route.down_time ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                        {route.down_time}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-lg text-gray-500">No routes found</p>
                  <p className="text-sm text-gray-400">Try adjusting filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredRoutes.length > 0 && (
          <div className="bg-gray-50 px-6 py-5 border-t-2">
            <div className="flex justify-between items-center">
              {/* Items per page */}
              <div className="flex items-center space-x-2">
                <label>Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border-2 rounded-lg"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredRoutes.length)} of{' '}
                {filteredRoutes.length} results
              </div>

              {/* Page buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border-2 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage * itemsPerPage >= filteredRoutes.length}
                  className="px-3 py-2 border-2 rounded-lg disabled:opacity-50"
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

## 🚀 **API Call Journey - पूरा सफर**

### **Scenario: User `/otn-route-status` page खोलता है**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Browser Request                                     │
│ User types: http://localhost:3000/otn-route-status         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Next.js Routing                                     │
│ Next.js finds: app/otn-route-status/page.js                │
│ Type: Server Component (runs on server)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Server Component Execution                          │
│ File: app/otn-route-status/page.js                         │
│                                                              │
│ async function OtnRouteStatus() {                           │
│   // Server पर चलता है                                      │
│   const apiUrl = process.env.OTN_ROUTE_STATUS;             │
│   // apiUrl = "http://10.180.16.133:8000/api/otn-status"   │
│                                                              │
│   const response = await fetch(apiUrl);                     │
│   // External API को call करता है                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: External API Call                                   │
│ URL: http://10.180.16.133:8000/api/otn-status              │
│                                                              │
│ Request:                                                     │
│   Method: GET                                                │
│   Headers: { Content-Type: application/json }               │
│                                                              │
│ Response:                                                    │
│   Status: 200 OK                                             │
│   Body: [                                                    │
│     {                                                        │
│       region: "North",                                       │
│       linkname: "Link-1",                                    │
│       section: "A",                                          │
│       begin_time: "2024-01-01 10:00",                       │
│       report_time: "2024-01-01 10:05",                      │
│       down_time: "5 minutes"                                 │
│     },                                                       │
│     ... (149 more records)                                   │
│   ]                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Data Processing (Server)                            │
│                                                              │
│ const responseData = await response.json();                 │
│ // responseData = Array of 150 objects                      │
│                                                              │
│ data = Array.isArray(responseData)                          │
│        ? responseData                                        │
│        : [responseData];                                     │
│ // data = Array of 150 objects (validated)                  │
│                                                              │
│ console.log(`✅ Fetched ${data.length} records`);           │
│ // Output: ✅ Fetched 150 records                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Pass to Client Component                            │
│                                                              │
│ const initialData = data;                                   │
│ // initialData = Array of 150 objects                       │
│                                                              │
│ return <OtnRouteStatusForm initialData={initialData} />;   │
│ // Client component को data pass करते हैं                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Client Component Receives Data                      │
│ File: app/otn-route-status/otnroutestatusform.js           │
│                                                              │
│ export default function OtnRouteStatusForm({ initialData }) │
│ // initialData = Array of 150 objects                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: React Query Hook Initialization                     │
│ File: app/hooks/useOtnRouteStatus.js                        │
│                                                              │
│ const { data, isLoading, error } =                          │
│   useOtnRouteStatus(initialData);                           │
│                                                              │
│ React Query:                                                 │
│ 1. initialData को cache में store करता है                  │
│ 2. data = initialData (150 records)                         │
│ 3. isLoading = false (data already hai)                     │
│ 4. Background में fresh data fetch करता है                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Background Fetch (Client-side)                      │
│                                                              │
│ queryFn: async () => {                                      │
│   const apiUrl = '/api/otn-route-status';                  │
│   // Internal Next.js API route                             │
│                                                              │
│   const response = await fetch(apiUrl);                     │
│   // Browser से call होती है                                │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Internal API Route                                 │
│ File: app/api/otn-route-status/route.js                    │
│                                                              │
│ export async function GET(request) {                        │
│   const externalApiUrl = process.env.OTN_ROUTE_STATUS;     │
│   // "http://10.180.16.133:8000/api/otn-status"            │
│                                                              │
│   const response = await fetch(externalApiUrl);             │
│   // फिर से external API को call करता है                   │
│                                                              │
│   const data = await response.json();                       │
│   return NextResponse.json(data);                           │
│   // Browser को data भेजता है                               │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 11: React Query Updates Cache                          │
│                                                              │
│ Fresh data आता है (150 records)                             │
│ React Query cache update करता है                            │
│ Component re-render होता है (if data changed)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 12: UI Rendering                                        │
│                                                              │
│ const allRoutes = data; // 150 records                      │
│                                                              │
│ Filters apply होते हैं:                                     │
│ - Search: "North"                                            │
│ - Region: "North"                                            │
│ - Section: "A"                                               │
│                                                              │
│ filteredRoutes = 45 records                                  │
│                                                              │
│ Pagination:                                                  │
│ - Page 1, 25 items per page                                 │
│ - paginatedRoutes = 25 records                              │
│                                                              │
│ Table में 25 rows display होती हैं                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 13: Auto-Refresh (Every 1 Minute)                      │
│                                                              │
│ refetchInterval: 60 * 1000 // 1 minute                      │
│                                                              │
│ हर 1 minute में:                                             │
│ 1. Background में API call होती है                          │
│ 2. Fresh data आता है                                        │
│ 3. Cache update होता है                                     │
│ 4. UI update होता है (if data changed)                     │
│                                                              │
│ User को "Refreshing..." indicator दिखता है                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 **Console Logs - क्या दिखेगा?**

### **Server Console (Terminal):**
```bash
🔄 [Server] Fetching OTN route status from: http://10.180.16.133:8000/api/otn-status
✅ [Server] Successfully fetched route status
📊 [Server] Data type: Array
📊 [Server] Data length: 150
📊 [Server] Sample data: { region: 'North', linkname: 'Link-1', ... }
📤 [Server] Passing 150 records to client component
```

### **Browser Console (F12):**
```bash
🔄 [Hook] Fetching OTN route status from: /api/otn-route-status
✅ [Hook] Successfully fetched route status
📊 [Hook] Data type: Array
📊 [Hook] Data length: 150
📊 [Hook] Sample data: { region: 'North', linkname: 'Link-1', ... }
📊 [Hook] Returning 150 records
✅ [Hook] Successfully loaded 150 route status records
📊 [Component] Received 150 routes
```

---

## 🎯 **React Query समझें**

### **क्या है React Query?**
```
React Query = Smart Data Manager

Features:
1. Caching - बार-बार API call नहीं करनी पड़ती
2. Auto-refresh - data automatically update होता है
3. Loading states - automatically handle होते हैं
4. Error handling - automatically handle होती है
5. Retry logic - fail होने पर retry करता है
```

### **कैसे काम करता है?**

```javascript
// 1. Hook call करते हैं
const { data, isLoading, error } = useOtnRouteStatus(initialData);

// 2. React Query internally:
{
  queryKey: ['otn-route-status'],  // Unique identifier
  data: [...],                      // Cached data
  status: 'success',                // Current status
  fetchStatus: 'idle',              // Fetch status
  lastUpdated: 1234567890,          // Last update time
}

// 3. States:
isLoading = true   → पहली बार load हो रहा है
isLoading = false  → data आ गया है
isFetching = true  → background में refresh हो रहा है
error = null       → कोई error नहीं
error = {...}      → error आया है
```

### **Cache Flow:**

```
First Load:
1. initialData से start होता है (server data)
2. Background में fresh data fetch करता है
3. Cache update होता है
4. Component re-render होता है

Subsequent Loads:
1. Cache से data लेता है (instant)
2. Background में fresh data fetch करता है
3. Cache update होता है (if changed)
4. Component re-render होता है (if changed)

Auto-Refresh (Every 1 minute):
1. Background में API call होती है
2. Fresh data आता है
3. Cache update होता है
4. Component re-render होता है
```

---

## 🔧 **Common Patterns**

### **Pattern 1: Server + Client Hybrid**

```javascript
// Server Component (page.js)
export default async function Page() {
  // Server पर data fetch करो
  const data = await fetchData();
  
  // Client component को pass करो
  return <ClientComponent initialData={data} />;
}

// Client Component (form.js)
export default function ClientComponent({ initialData }) {
  // React Query से manage करो
  const { data } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData,
    initialData: initialData,  // Server data से start
  });
  
  // UI render करो
  return <div>{data.map(...)}</div>;
}
```

**फायदे:**
- Fast initial load (server data)
- SEO friendly (server rendering)
- Auto-refresh (client-side)
- Better UX (instant display)

---

### **Pattern 2: Debounced Search**

```javascript
const [searchInput, setSearchInput] = useState('');
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
  // 300ms बाद search apply होगा
  const timer = setTimeout(() => {
    setSearchTerm(searchInput);
  }, 300);

  return () => clearTimeout(timer);
}, [searchInput]);

// User types: "N" → "No" → "Nor" → "North"
// API calls: (wait 300ms) → "North" (only 1 call)
```

**फायदे:**
- कम API calls
- Better performance
- Better UX (smooth typing)

---

### **Pattern 3: useMemo for Performance**

```javascript
// Without useMemo (हर render पर calculate होगा)
const filteredRoutes = allRoutes.filter(...);  // ❌ Slow

// With useMemo (dependencies change होने पर ही calculate होगा)
const filteredRoutes = useMemo(() => {
  return allRoutes.filter(...);
}, [allRoutes, searchTerm, selectedRegion]);  // ✅ Fast
```

**कब use करें?**
- Heavy calculations
- Filtering large arrays
- Sorting large arrays
- Complex transformations

---

### **Pattern 4: Pagination**

```javascript
// Total data
const filteredRoutes = [1, 2, 3, ..., 150];

// Current page settings
const currentPage = 1;
const itemsPerPage = 25;

// Calculate slice
const startIndex = (currentPage - 1) * itemsPerPage;  // 0
const endIndex = startIndex + itemsPerPage;           // 25

// Get current page data
const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);
// [1, 2, 3, ..., 25]

// Page 2:
// startIndex = (2 - 1) * 25 = 25
// endIndex = 25 + 25 = 50
// paginatedRoutes = [26, 27, ..., 50]
```

---

## 🐛 **Troubleshooting Guide**

### **Problem 1: "0 routes found"**

**Check:**
```bash
# 1. Browser console
F12 → Console tab
Look for: "Successfully loaded X records"

# 2. Network tab
F12 → Network tab
Look for: /api/otn-route-status
Status: 200 OK
Response: Array of objects

# 3. Server console
Terminal
Look for: "Fetched X records"
```

**Solutions:**
```javascript
// A. Check .env.local
OTN_ROUTE_STATUS=http://correct-url

// B. Check API response format
// Should be: [...]
// Not: { data: [...] }

// C. Check data fields
// Expected: region, linkname, section, etc.
```

---

### **Problem 2: "Loading forever"**

**Check:**
```bash
# 1. Is API responding?
curl http://localhost:3000/api/otn-route-status

# 2. Check timeout
# Default: 30 seconds
# If API is slow, increase timeout
```

**Solutions:**
```javascript
// Increase timeout in route.js
signal: AbortSignal.timeout(60000), // 60 seconds
```

---

### **Problem 3: "Data not refreshing"**

**Check:**
```bash
# 1. Is refetchInterval working?
# Look for "Refreshing..." indicator

# 2. Check React Query settings
refetchInterval: 60 * 1000, // 1 minute
```

**Solutions:**
```javascript
// Force refresh
const { refetch } = useOtnRouteStatus();
refetch(); // Manual refresh
```

---

### **Problem 4: "Search not working"**

**Check:**
```bash
# 1. Is debounce working?
# Wait 300ms after typing

# 2. Check searchTerm state
console.log('searchTerm:', searchTerm);

# 3. Check filteredRoutes
console.log('filteredRoutes:', filteredRoutes.length);
```

**Solutions:**
```javascript
// Check field names
const searchableFields = [
  route.region,      // ✅ Correct field name?
  route.linkname,    // ✅ Correct field name?
  route.section,     // ✅ Correct field name?
];
```

---

## 📚 **Key Concepts Summary**

### **1. Server vs Client Components**

```javascript
// Server Component (runs on server)
export default async function Page() {
  const data = await fetch(...);  // ✅ Can use async/await
  return <div>{data}</div>;
}

// Client Component (runs in browser)
"use client";
export default function Component() {
  const [state, setState] = useState();  // ✅ Can use hooks
  return <div onClick={...}>{state}</div>;
}
```

---

### **2. Data Flow**

```
External API
    ↓
Internal API Route (proxy)
    ↓
Server Component (SSR)
    ↓
Client Component (UI)
    ↓
React Query Hook (caching)
    ↓
User sees data
```

---

### **3. State Management**

```javascript
// Local state (component-specific)
const [searchInput, setSearchInput] = useState('');

// Computed state (derived from other state)
const filteredRoutes = useMemo(() => {
  return allRoutes.filter(...);
}, [allRoutes, searchTerm]);

// Server state (from API)
const { data } = useQuery(...);
```

---

### **4. Performance Optimization**

```javascript
// 1. useMemo - expensive calculations
const result = useMemo(() => heavyCalculation(), [deps]);

// 2. Debouncing - reduce API calls
useEffect(() => {
  const timer = setTimeout(() => setSearchTerm(input), 300);
  return () => clearTimeout(timer);
}, [input]);

// 3. Pagination - show less data
const paginatedData = data.slice(start, end);

// 4. React Query - caching
const { data } = useQuery({
  staleTime: 5 * 60 * 1000, // 5 min cache
});
```

---

## 🎉 **Conclusion**

### **आपने क्या सीखा:**

1. ✅ **Project Structure** - कौन सी file कहाँ है
2. ✅ **Data Flow** - data कैसे flow होता है
3. ✅ **Server Components** - server पर कैसे चलते हैं
4. ✅ **Client Components** - browser में कैसे चलते हैं
5. ✅ **React Query** - caching और auto-refresh
6. ✅ **API Routes** - internal proxy कैसे बनाते हैं
7. ✅ **State Management** - state कैसे manage करते हैं
8. ✅ **Performance** - optimization techniques
9. ✅ **Debugging** - problems कैसे solve करते हैं

---

### **अगले Steps:**

1. 📖 Code को line-by-line पढ़ें
2. 🧪 Console logs देखें और समझें
3. 🔧 Filters और search test करें
4. 📊 Network tab में API calls देखें
5. 🎨 UI में changes करके experiment करें

---

**Happy Coding! 🚀**

**Questions? Console logs check करो और समझने की कोशिश करो!**
