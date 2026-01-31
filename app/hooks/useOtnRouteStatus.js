"use client";

import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for fetching OTN route status with caching and error handling
 * 
 * Features:
 * - Automatic caching (5 minutes)
 * - Auto-refresh every 1 minute
 * - Retry on failure (3 attempts)
 * - Loading and error states
 * - Refetch on window focus
 * - Refetch on reconnect
 * 
 * @param {Array} initialData - Initial data from server (SSR)
 * @returns {Object} { data, isLoading, error, refetch, isFetching }
 * 
 * Usage:
 * const { data, isLoading, error } = useOtnRouteStatus(initialData);
 */
export function useOtnRouteStatus(initialData = null) {
  return useQuery({
    // ============================================
    // QUERY KEY
    // ============================================
    
    queryKey: ['otn-route-status'],
    // Unique identifier for this query
    // React Query uses this for caching
    // Same key = same cache
    
    // ============================================
    // QUERY FUNCTION
    // ============================================
    
    queryFn: async () => {
      // Function that fetches the data
      
      const apiUrl = process.env.NEXT_PUBLIC_OTN_ROUTE_STATUS 
                     || '/api/otn-route-status';
      // API URL:
      // 1. Try public environment variable (browser-accessible)
      // 2. Fallback to local API route
      
      console.log(`🔄 Fetching OTN route status from: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error (${response.status}):`, errorText);
        throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched ${data?.length || 0} route status records`);
      
      return Array.isArray(data) ? data : [data];
    },
    
    // ============================================
    // INITIAL DATA
    // ============================================
    
    initialData,
    // Data from server-side rendering
    // Used on first render to avoid loading state
    // No API call needed initially if this is provided
    
    // ============================================
    // CACHE SETTINGS
    // ============================================
    
    staleTime: 5 * 60 * 1000,
    // 5 minutes = 300,000 milliseconds
    // Data is considered "fresh" for 5 minutes
    // No refetch if data is less than 5 minutes old
    // 
    // Example:
    // - Fetch at 10:00 AM
    // - Data fresh until 10:05 AM
    // - No refetch before 10:05 AM (unless forced)
    
    gcTime: 10 * 60 * 1000,
    // 10 minutes = 600,000 milliseconds
    // Garbage Collection time
    // Cache is kept for 10 minutes
    // After 10 minutes, cache is removed
    // 
    // Example:
    // - Fetch at 10:00 AM
    // - Cache kept until 10:10 AM
    // - After 10:10 AM, cache deleted
    
    // ============================================
    // REFETCH SETTINGS
    // ============================================
    
    refetchOnWindowFocus: true,
    // Refetch when user returns to the tab
    // 
    // Example:
    // - User switches to another tab
    // - User comes back to this tab
    // - Data automatically refreshes
    
    refetchOnReconnect: true,
    // Refetch when internet reconnects
    // 
    // Example:
    // - WiFi disconnects
    // - WiFi reconnects
    // - Data automatically refreshes
    
    refetchInterval: 60 * 1000,
    // 60 seconds = 60,000 milliseconds
    // Auto-refresh every 1 minute
    // Runs in background even if user is not interacting
    // 
    // Example:
    // - 10:00:00 - Initial fetch
    // - 10:01:00 - Auto refresh
    // - 10:02:00 - Auto refresh
    // - And so on...
    
    // ============================================
    // RETRY SETTINGS
    // ============================================
    
    retry: 3,
    // Number of retry attempts on failure
    // If fetch fails, retry 3 times before giving up
    // 
    // Example:
    // - Attempt 1: Fail
    // - Attempt 2: Fail
    // - Attempt 3: Fail
    // - Give up, show error
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Exponential backoff delay between retries
    // 
    // Calculation:
    // attemptIndex starts at 0
    // 
    // Attempt 1 (index 0): 1000 * 2^0 = 1000ms = 1 second
    // Attempt 2 (index 1): 1000 * 2^1 = 2000ms = 2 seconds
    // Attempt 3 (index 2): 1000 * 2^2 = 4000ms = 4 seconds
    // 
    // Math.min ensures maximum delay is 30 seconds
    // 
    // Why exponential backoff?
    // - Gives server time to recover
    // - Reduces load on failing server
    // - Industry best practice
    
    // ============================================
    // ERROR CALLBACK
    // ============================================
    
    onError: (error) => {
      // Called when query fails (after all retries)
      
      console.error('❌ Error fetching OTN route status:', error);
      console.error('💡 Check:');
      console.error('   1. Is OTN_ROUTE_STATUS set in .env.local?');
      console.error('   2. Is the external API running?');
      console.error('   3. Is the API URL correct?');
      console.error('   4. Is there a network connection?');
    },
    
    // ============================================
    // SUCCESS CALLBACK
    // ============================================
    
    onSuccess: (data) => {
      // Called when query succeeds
      
      console.log(`✅ Successfully loaded ${data?.length || 0} route status records`);
      
      // Optional: Additional success handling
      // - Show notification
      // - Update other state
      // - Analytics tracking
    },
  });
}

/**
 * Hook for filtering route status with search and filters
 * 
 * @param {Array} routes - All routes
 * @param {string} searchTerm - Search term
 * @param {string} selectedRegion - Selected region filter
 * @param {string} selectedStatus - Selected status filter
 * @returns {Array} Filtered routes
 * 
 * Usage:
 * const filtered = useFilteredRouteStatus(routes, search, region, status);
 */
export function useFilteredRouteStatus(routes, searchTerm, selectedRegion, selectedStatus) {
  if (!routes || !Array.isArray(routes)) return [];

  return routes.filter(route => {
    if (!route) return false;

    // ============================================
    // REGION FILTER
    // ============================================
    
    if (selectedRegion) {
      const regionFields = ['region', 'region_name', 'location', 'city', 'area'];
      const hasMatchingRegion = regionFields.some(field => {
        const value = route[field];
        return typeof value === 'string' &&
               value.toLowerCase().includes(selectedRegion.toLowerCase());
      });
      if (!hasMatchingRegion) return false;
    }

    // ============================================
    // STATUS FILTER
    // ============================================
    
    if (selectedStatus) {
      const status = route.status;
      if (!status || status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

    // ============================================
    // SEARCH FILTER
    // ============================================
    
    if (searchTerm) {
      const searchableFields = Object.values(route).filter(
        value => typeof value === 'string' || typeof value === 'number'
      );

      const hasMatch = searchableFields.some(field =>
        String(field).toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (!hasMatch) return false;
    }

    return true;
  });
}
