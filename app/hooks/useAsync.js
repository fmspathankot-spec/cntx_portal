// React 19 'use' hook example
// Ye hook promises aur context ko directly read kar sakta hai

'use client'

import { use, Suspense } from 'react'

// Example: Data fetching with 'use' hook
export function useAsyncData(promise) {
  // React 19 ka 'use' hook - promises ko directly handle karta hai
  const data = use(promise)
  return data
}

// Example component using 'use' hook
export function DataDisplay({ dataPromise }) {
  const data = use(dataPromise)
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

// Usage with Suspense
export function AsyncDataWrapper() {
  const dataPromise = fetch('/api/data').then(res => res.json())
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataDisplay dataPromise={dataPromise} />
    </Suspense>
  )
}
