# 🎨 Components Guide - Beautiful & Reusable Components

## 📋 Table of Contents

1. [Overview](#overview)
2. [Layout Components](#layout-components)
3. [UI Components](#ui-components)
4. [Usage Examples](#usage-examples)
5. [Customization](#customization)

---

## Overview

Aapke project mein ab **beautiful, reusable components** hain jo:
- ✅ Easy to use
- ✅ Fully responsive
- ✅ Customizable
- ✅ Modern design
- ✅ Smooth animations

---

## Layout Components

### 1. **Sidebar** (Desktop)

**Location:** `app/components/Sidebar.js`

**Features:**
- ✅ Gradient background
- ✅ Click-to-expand submenus
- ✅ Active route highlighting
- ✅ Smooth animations
- ✅ Next.js Link (no page reload)

**Usage:**
```javascript
import Sidebar from './components/Sidebar'

<Sidebar />
```

**Design:**
- Dark gradient (slate-800 to slate-900)
- Blue-purple gradient for active items
- Hover effects
- Expandable menus with chevron icons

---

### 2. **MobileSidebar** (Mobile)

**Location:** `app/components/MobileSidebar.js`

**Features:**
- ✅ Hamburger menu button
- ✅ Slide-in animation
- ✅ Backdrop overlay
- ✅ Auto-close on link click
- ✅ Same design as desktop

**Usage:**
```javascript
import MobileSidebar from './components/MobileSidebar'

<MobileSidebar />
```

**Behavior:**
- Shows only on mobile (< 1024px)
- Slides from left
- Closes when clicking outside
- Smooth transitions

---

### 3. **Breadcrumb**

**Location:** `app/components/Breadcrumb-new.js`

**Features:**
- ✅ Auto-generated from URL
- ✅ Clickable segments
- ✅ Home icon
- ✅ Chevron separators
- ✅ Active segment highlighted

**Usage:**
```javascript
import Breadcrumb from './components/Breadcrumb'

<Breadcrumb />
```

**Example:**
```
Home > OTN Route Details
```

---

## UI Components

### 4. **PageHeader**

**Location:** `app/components/PageHeader.js`

**Features:**
- ✅ Gradient background
- ✅ Icon support
- ✅ Title & description
- ✅ Action buttons area

**Usage:**
```javascript
import PageHeader from './components/PageHeader'
import { FaNetworkWired } from 'react-icons/fa'

<PageHeader
  title="OTN Routes"
  description="View and manage all OTN routes"
  icon={FaNetworkWired}
  actions={
    <button>Add Route</button>
  }
/>
```

**Design:**
- Blue-purple gradient
- Large icon with backdrop
- White text
- Actions on right side

---

### 5. **StatsCard**

**Location:** `app/components/StatsCard-new.js`

**Features:**
- ✅ Gradient header
- ✅ Icon with animation
- ✅ Trend indicator
- ✅ Hover effects
- ✅ Multiple colors

**Usage:**
```javascript
import StatsCard from './components/StatsCard'
import { FaUsers } from 'react-icons/fa'

<StatsCard
  title="Total Routes"
  value="1,234"
  icon={FaUsers}
  color="blue"
  trend="12%"
  trendUp={true}
/>
```

**Colors:**
- `blue` - Blue gradient
- `green` - Green gradient
- `purple` - Purple gradient
- `orange` - Orange gradient
- `red` - Red gradient
- `indigo` - Indigo gradient

---

### 6. **SearchBar**

**Location:** `app/components/SearchBar.js`

**Features:**
- ✅ Search icon
- ✅ Placeholder text
- ✅ Focus ring
- ✅ Hover shadow
- ✅ Smooth transitions

**Usage:**
```javascript
import SearchBar from './components/SearchBar'

const [search, setSearch] = useState('')

<SearchBar
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search routes..."
/>
```

---

### 7. **FilterDropdown**

**Location:** `app/components/FilterDropdown.js`

**Features:**
- ✅ Filter icon
- ✅ Label
- ✅ Custom options
- ✅ Styled dropdown
- ✅ Arrow indicator

**Usage:**
```javascript
import FilterDropdown from './components/FilterDropdown'

const [region, setRegion] = useState('')

<FilterDropdown
  value={region}
  onChange={(e) => setRegion(e.target.value)}
  label="Filter by Region"
  placeholder="All Regions"
  options={[
    { value: 'punjab', label: 'Punjab (45)' },
    { value: 'delhi', label: 'Delhi (32)' }
  ]}
/>
```

---

### 8. **ExportButtons**

**Location:** `app/components/ExportButtons.js`

**Features:**
- ✅ CSV & PDF buttons
- ✅ Icons
- ✅ Loading state
- ✅ Disabled state
- ✅ Gradient backgrounds
- ✅ Hover animations

**Usage:**
```javascript
import ExportButtons from './components/ExportButtons'

<ExportButtons
  onExportCSV={exportToCSV}
  onExportPDF={exportToPDF}
  disabled={data.length === 0}
  isExporting={isExporting}
/>
```

---

### 9. **DataTable**

**Location:** `app/components/DataTable.js`

**Features:**
- ✅ Responsive table
- ✅ Loading skeleton
- ✅ Empty state
- ✅ Hover effects
- ✅ Custom columns
- ✅ Custom rendering

**Usage:**
```javascript
import DataTable from './components/DataTable'

const columns = [
  { 
    header: 'SL NO', 
    accessor: 'id',
    render: (value, row, index) => index + 1
  },
  { header: 'Region', accessor: 'region' },
  { header: 'Route Name', accessor: 'route_name' },
  { header: 'END-A', accessor: 'endA' },
  { header: 'END-B', accessor: 'endB' }
]

<DataTable
  columns={columns}
  data={filteredRoutes}
  isLoading={isLoading}
  emptyMessage="No routes found"
/>
```

---

## Usage Examples

### Complete Page Example

```javascript
'use client'

import { useState } from 'react'
import PageHeader from './components/PageHeader'
import SearchBar from './components/SearchBar'
import FilterDropdown from './components/FilterDropdown'
import ExportButtons from './components/ExportButtons'
import DataTable from './components/DataTable'
import StatsCard from './components/StatsCard'
import { FaNetworkWired, FaRoute, FaCheckCircle } from 'react-icons/fa'

export default function OTNRoutesPage() {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const columns = [
    { header: 'SL NO', accessor: 'id' },
    { header: 'Region', accessor: 'region' },
    { header: 'Route Name', accessor: 'route_name' }
  ]

  const data = [
    { id: 1, region: 'Punjab', route_name: 'PTK-JLD-01' },
    { id: 2, region: 'Delhi', route_name: 'DEL-GUR-01' }
  ]

  const exportToCSV = () => {
    // CSV export logic
  }

  const exportToPDF = () => {
    setIsExporting(true)
    // PDF export logic
    setTimeout(() => setIsExporting(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="OTN Routes"
        description="View and manage all OTN routes"
        icon={FaNetworkWired}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Routes"
          value="1,234"
          icon={FaRoute}
          color="blue"
          trend="12%"
          trendUp={true}
        />
        <StatsCard
          title="Active Routes"
          value="1,156"
          icon={FaCheckCircle}
          color="green"
          trend="8%"
          trendUp={true}
        />
        <StatsCard
          title="Regions"
          value="28"
          icon={FaNetworkWired}
          color="purple"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routes..."
            className="md:col-span-2"
          />
          <FilterDropdown
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            label="Region"
            placeholder="All Regions"
            options={[
              { value: 'punjab', label: 'Punjab' },
              { value: 'delhi', label: 'Delhi' }
            ]}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <ExportButtons
            onExportCSV={exportToCSV}
            onExportPDF={exportToPDF}
            disabled={data.length === 0}
            isExporting={isExporting}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data}
        isLoading={false}
        emptyMessage="No routes found"
      />
    </div>
  )
}
```

---

## Customization

### Colors

**Tailwind Classes:**
```javascript
// Gradients
from-blue-500 to-blue-600
from-green-500 to-green-600
from-purple-500 to-purple-600

// Backgrounds
bg-white
bg-gray-50
bg-gradient-to-r

// Text
text-gray-600
text-blue-600
text-white

// Borders
border-gray-200
border-blue-500
```

### Animations

**Hover Effects:**
```javascript
hover:shadow-lg
hover:scale-105
hover:bg-blue-700
transition-all duration-200
```

**Loading States:**
```javascript
animate-spin
animate-pulse
animate-bounce
```

### Responsive Design

**Breakpoints:**
```javascript
// Mobile first
className="w-full"

// Tablet (768px+)
className="md:w-1/2"

// Desktop (1024px+)
className="lg:w-1/3"
```

---

## Component Checklist

| Component | Status | Responsive | Animated | Customizable |
|-----------|--------|------------|----------|--------------|
| Sidebar | ✅ | ✅ | ✅ | ✅ |
| MobileSidebar | ✅ | ✅ | ✅ | ✅ |
| Breadcrumb | ✅ | ✅ | ✅ | ✅ |
| PageHeader | ✅ | ✅ | ✅ | ✅ |
| StatsCard | ✅ | ✅ | ✅ | ✅ |
| SearchBar | ✅ | ✅ | ✅ | ✅ |
| FilterDropdown | ✅ | ✅ | ✅ | ✅ |
| ExportButtons | ✅ | ✅ | ✅ | ✅ |
| DataTable | ✅ | ✅ | ✅ | ✅ |

---

## Tips & Best Practices

### 1. **Consistent Spacing**
```javascript
// Use consistent spacing
space-y-6  // Vertical spacing
space-x-4  // Horizontal spacing
gap-6      // Grid gap
```

### 2. **Color Scheme**
```javascript
// Stick to your color palette
Primary: Blue (blue-500, blue-600)
Secondary: Purple (purple-500, purple-600)
Success: Green (green-500, green-600)
Danger: Red (red-500, red-600)
```

### 3. **Shadows**
```javascript
// Use shadows for depth
shadow-sm   // Subtle
shadow-md   // Medium
shadow-lg   // Large
shadow-xl   // Extra large
```

### 4. **Transitions**
```javascript
// Always add transitions
transition-all duration-200
transition-colors duration-150
transition-transform duration-300
```

---

**Happy Building! 🎨**
