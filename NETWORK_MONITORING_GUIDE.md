# 🌐 Network Monitoring Portal - Complete Guide (Hindi)

## 📋 विषय सूची (Table of Contents)

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Components Explanation](#3-components-explanation)
4. [API Routes](#4-api-routes)
5. [Custom Hooks](#5-custom-hooks)
6. [Data Flow](#6-data-flow)
7. [Features](#7-features)
8. [Setup Guide](#8-setup-guide)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Project Overview

### **Ye Project Kya Karta Hai?**

Ye ek **Network Monitoring Portal** hai jo telecom networks ko monitor karta hai:

- **OTN (Optical Transport Network)**: Optical fiber routes aur links
- **CPAN (Customer Premises Access Network)**: Customer connection links
- **MAAN (Metro Area Access Network)**: Metro area nodes aur connections

### **Main Features:**

1. ✅ **Real-time Monitoring** - Live network status
2. ✅ **Route Details** - Complete route information
3. ✅ **Link Status** - Active/Inactive links tracking
4. ✅ **Service Status** - Service health monitoring
5. ✅ **Data Export** - CSV/PDF export functionality
6. ✅ **Search & Filter** - Region-wise filtering
7. ✅ **Responsive UI** - Mobile-friendly design

---

## 2. Architecture

### **Tech Stack Breakdown:**

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js 15)           │
│  ┌───────────────────────────────────┐  │
│  │  React 19 Components              │  │
│  │  - Sidebar Navigation             │  │
│  │  - Breadcrumb                     │  │
│  │  - Data Tables                    │  │
│  │  - Export Functions               │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │  State Management                 │  │
│  │  - TanStack React Query           │  │
│  │  - Client-side caching            │  │
│  │  - Automatic refetching           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         API Layer (Next.js API)         │
│  ┌───────────────────────────────────┐  │
│  │  /api/otn-route-detail            │  │
│  │  /api/cpan-link-status            │  │
│  │  /api/maan-node-status            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│      External Network APIs              │
│  - OTN Management System                │
│  - CPAN Controller                      │
│  - MAAN Monitoring System               │
└─────────────────────────────────────────┘
```

---

## 3. Components Explanation

### **3.1 Sidebar Component**

**Location:** `app/components/Sidebar.js`

**Purpose:** Navigation menu with hover-based submenus

**Key Features:**
```javascript
// State management
const [breadcrumb, setBreadcrumb] = useState(["Home"])
const [hoveredMenu, setHoveredMenu] = useState(null)

// Menu structure
const menus = {
  OTN: [
    'OTN Link Status',
    'OTN Route Details',
    'OTN Services Status',
    'OTN All Service Data'
  ],
  CPAN: [
    'CPAN Link Status',
    'CPAN Link Detail'
  ],
  MAAN: [
    'MAAN Node Status',
    'OTN Port Status',
    'Project Topology'
  ]
}
```

**How It Works:**
1. User hovers over menu item (OTN/CPAN/MAAN)
2. `handleMouseEnter` sets `hoveredMenu` state
3. Submenu appears with conditional rendering
4. Click updates breadcrumb

**Improvements Needed:**
```javascript
// ❌ Current: Using <a> tags (causes full page reload)
<a href="otnroutestatus">Link</a>

// ✅ Better: Use Next.js Link
import Link from 'next/link'
<Link href="/otnroutestatus">Link</Link>
```

---

### **3.2 Breadcrumb Component**

**Location:** `app/components/Breadcrumb.js`

**Purpose:** Show current page path

**How It Works:**
```javascript
const pathname = usePathname() // Get current URL
const pathSegments = pathname.split("/").filter(Boolean)

// Example: /otn-route-details
// pathSegments = ['otn-route-details']
// Display: Home / Otn Route Details
```

**Current Implementation:**
```javascript
<nav className="bg-slate-100 py-2 px-8">
  <ol className="flex space-x-2">
    <li><Link href="/">Home</Link></li>
    {pathSegments.map((segment, index) => (
      <li key={index}>
        <span>/ </span>
        <Link href={`/${segment}`}>
          {segment.replace("-", " ")}
        </Link>
      </li>
    ))}
  </ol>
</nav>
```

---

### **3.3 OTN Route Details Form**

**Location:** `app/otn-route-details/otnroutedetailsform.js`

**Purpose:** Display and manage OTN routes data

**Key Features:**

#### **State Management:**
```javascript
const [searchTerm, setSearchTerm] = useState('')
const [selectedRegion, setSelectedRegion] = useState('')
const [isExporting, setIsExporting] = useState(false)
```

#### **Data Fetching:**
```javascript
const {
  routes: allRoutes = initialData || [],
  isLoading,
  error
} = useOtnRoutes(initialData)
```

#### **Filtering Logic:**
```javascript
const filteredRoutes = useMemo(() => {
  return allRoutes.filter(route => {
    // Region filter
    if (selectedRegion) {
      const hasMatchingRegion = /* check region fields */
      if (!hasMatchingRegion) return false
    }

    // Search filter
    if (searchTerm) {
      const hasMatch = /* search in all fields */
      if (!hasMatch) return false
    }

    return true
  })
}, [allRoutes, selectedRegion, searchTerm])
```

#### **Export Functions:**

**CSV Export:**
```javascript
const exportToCSV = () => {
  const headers = ['#', 'Region', 'ROUTE Name', 'END-A', 'END-B', 'LINK_NUM']
  const csvContent = [
    headers.join(','),
    ...filteredRoutes.map((route, index) => [
      index + 1,
      `"${route.region}"`,
      `"${route.route_name}"`,
      // ... more fields
    ].join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `otn-routes-${new Date().toISOString()}.csv`
  link.click()
}
```

**PDF Export:**
```javascript
const exportToPDF = () => {
  const doc = new jsPDF('landscape')

  autoTable(doc, {
    head: [['#', 'Region', 'ROUTE Name', 'END-A', 'END-B', 'LINK_NUM']],
    body: filteredRoutes.map((route, index) => [
      index + 1,
      route.region,
      route.route_name,
      route.endA,
      route.endB,
      route.link_number
    ]),
    // Styling options
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: 245 },
    // Footer with page numbers
    didDrawPage: function(data) {
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
      doc.text(`Page ${pageNumber}`, pageSize.width / 2, pageHeight - 10)
    }
  })

  doc.save(`otn-routes-${new Date().toISOString()}.pdf`)
}
```

---

### **3.4 Loading Component**

**Location:** `app/otn-route-details/loading.js`

**Purpose:** Show loading state during data fetch

**Features:**
- Animated spinner
- Loading text
- Bouncing dots animation
- Progress bar

```javascript
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500" />
      
      {/* Loading text */}
      <h1>Loading OTN Services</h1>
      
      {/* Bouncing dots */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-bounce"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}
```

---

## 4. API Routes

### **4.1 OTN Route Detail API**

**Location:** `app/api/otn-route-detail/route.js`

**Purpose:** Fetch OTN routes from external API

**Current Implementation:**
```javascript
export async function GET() {
  try {
    const response = await fetch(process.env.OTN_ROUTE_DETAIL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    })
  }
}
```

**Improvements:**

```javascript
// ✅ Better: Add caching, retry logic, timeout
export async function GET() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(process.env.OTN_ROUTE_DETAIL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      // Add caching
      next: { revalidate: 60 } // Cache for 60 seconds
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Validate data structure
    if (!Array.isArray(data)) {
      throw new Error('Invalid data format')
    }

    return Response.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    
    return Response.json(
      { 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
```

---

## 5. Custom Hooks

### **5.1 useOtnRoutes Hook**

**Location:** `app/hooks/useOtnRoutes.js`

**Purpose:** Manage OTN routes data with React Query

**Implementation:**
```javascript
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useOtnRoutes(initialData = null) {
  const {
    data: routes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['otn-routes'],
    queryFn: async () => {
      const response = await axios.get('/api/otn-route-detail')
      return response.data
    },
    initialData: initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2
  })

  return { routes, isLoading, error, refetch }
}
```

**Benefits:**
1. ✅ Automatic caching
2. ✅ Background refetching
3. ✅ Error handling
4. ✅ Loading states
5. ✅ Retry logic

---

## 6. Data Flow

### **Complete Data Flow Diagram:**

```
┌─────────────────────────────────────────────────────────┐
│  1. User visits /otn-route-details                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  2. Server Component (page.js) runs on server           │
│     - Fetches initial data from API                     │
│     - Passes data as initialData prop                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  3. Client Component (otnroutedetailsform.js) hydrates  │
│     - Receives initialData                              │
│     - useOtnRoutes hook uses initialData                │
│     - No duplicate API call!                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  4. User interacts (search, filter, export)             │
│     - State updates trigger re-renders                  │
│     - useMemo optimizes filtering                       │
│     - Export functions generate files                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  5. Background refetch (after 5 minutes)                │
│     - React Query automatically refetches               │
│     - Updates data without user action                  │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Features

### **7.1 Search Functionality**

```javascript
// Search in all fields
const filteredRoutes = allRoutes.filter(route => {
  const searchableFields = Object.values(route).filter(
    value => typeof value === 'string' || typeof value === 'number'
  )

  return searchableFields.some(field =>
    String(field).toLowerCase().includes(searchTerm.toLowerCase())
  )
})
```

### **7.2 Region Filtering**

```javascript
// Get unique regions
const regions = useMemo(() => {
  const regionSet = new Set()
  allRoutes.forEach(route => {
    const region = route.region_name || route.region
    if (region) regionSet.add(region)
  })
  return Array.from(regionSet).sort()
}, [allRoutes])

// Filter by region
if (selectedRegion) {
  const regionFields = ['region', 'region_name', 'location', 'city']
  const hasMatchingRegion = regionFields.some(field =>
    route[field]?.toLowerCase().includes(selectedRegion.toLowerCase())
  )
  if (!hasMatchingRegion) return false
}
```

### **7.3 Export to CSV**

```javascript
const exportToCSV = () => {
  const headers = ['#', 'Region', 'ROUTE Name', 'END-A', 'END-B', 'LINK_NUM']
  const csvContent = [
    headers.join(','),
    ...filteredRoutes.map((route, index) => [
      index + 1,
      `"${route.region.replace(/"/g, '""')}"`, // Escape quotes
      `"${route.route_name.replace(/"/g, '""')}"`,
      `"${route.endA}"`,
      `"${route.endB}"`,
      `"${route.link_number}"`
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `otn-routes-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
```

### **7.4 Export to PDF**

```javascript
const exportToPDF = () => {
  const doc = new jsPDF('landscape')

  const headers = [['#', 'Region', 'ROUTE Name', 'END-A', 'END-B', 'LINK_NUM']]
  const data = filteredRoutes.map((route, index) => [
    index + 1,
    route.region || '-',
    route.route_name || '-',
    route.endA || '-',
    route.endB || '-',
    route.link_number || '-'
  ])

  autoTable(doc, {
    head: headers,
    body: data,
    startY: 20,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: 245
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    didDrawPage: function(data) {
      // Header
      doc.text('OTN Routes', 14, 10)

      // Footer with page numbers
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber
      const totalPages = doc.internal.getNumberOfPages()
      doc.text(
        `Page ${pageNumber} of ${totalPages}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      )
    }
  })

  doc.save(`otn-routes-${new Date().toISOString().split('T')[0]}.pdf`)
}
```

---

## 8. Setup Guide

### **8.1 Installation**

```bash
# Clone repository
git clone https://github.com/fmspathankot-spec/cntx_portal.git
cd cntx_portal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API endpoints

# Run development server
npm run dev
```

### **8.2 Environment Variables**

```env
# .env.local
OTN_ROUTE_DETAIL=http://your-api-server.com/api/otn/routes
CPAN_LINK_STATUS=http://your-api-server.com/api/cpan/links
MAAN_NODE_STATUS=http://your-api-server.com/api/maan/nodes

MONGODB_URI=mongodb://localhost:27017/network-monitoring
BETTER_AUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **8.3 Database Setup (MongoDB)**

```javascript
// lib/mongodb.js
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB
```

---

## 9. Troubleshooting

### **Common Issues:**

#### **Issue 1: API Not Responding**
```javascript
// Error: Failed to fetch routes
// Solution: Check API endpoint in .env.local

// Debug:
console.log('API URL:', process.env.OTN_ROUTE_DETAIL)

// Test API manually:
curl http://your-api-server.com/api/otn/routes
```

#### **Issue 2: Duplicate API Calls**
```javascript
// Problem: useOtnRoutes calling API even with initialData

// Solution: Check initialData is passed correctly
<OtnRouteDetailsForm initialData={routeDetailsData} />

// In hook:
const { data } = useQuery({
  queryKey: ['otn-routes'],
  queryFn: fetchRoutes,
  initialData: initialData, // ✅ This prevents duplicate call
  enabled: !initialData // ✅ Or disable query if initialData exists
})
```

#### **Issue 3: PDF Export Not Working**
```javascript
// Error: Cannot read property 'internal' of undefined

// Solution: Check jsPDF import
import { jsPDF } from 'jspdf' // ✅ Correct
import jsPDF from 'jspdf' // ❌ Wrong

// Also check autoTable import
import autoTable from 'jspdf-autotable' // ✅ Correct
```

#### **Issue 4: Sidebar Links Causing Full Page Reload**
```javascript
// Problem: Using <a> tags

// ❌ Wrong:
<a href="otnroutestatus">Link</a>

// ✅ Correct:
import Link from 'next/link'
<Link href="/otnroutestatus">Link</Link>
```

---

## 🎯 **Next Steps**

### **Immediate Improvements:**

1. ✅ Replace `<a>` tags with Next.js `<Link>`
2. ✅ Add error boundaries
3. ✅ Implement authentication
4. ✅ Add loading skeletons
5. ✅ Optimize images
6. ✅ Add unit tests

### **Future Features:**

1. 📊 Real-time dashboard with WebSockets
2. 📈 Historical data charts
3. 🔔 Alert notifications
4. 📱 Mobile app
5. 🌐 Multi-language support
6. 🔐 Role-based access control

---

**Happy Monitoring! 🚀**

Questions? Email: fmspathankot@gmail.com
