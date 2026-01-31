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
 * - Secure logging (development only)
 * 
 * @param {Array} initialData - Initial data from server (SSR)
 * @returns {Object} { data, isLoading, error, refetch, isFetching }
 */
export function useOtnRouteStatus(initialData = null) {
  return useQuery({
    queryKey: ['otn-route-status'],
    
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_OTN_ROUTE_STATUS 
                     || '/api/otn-route-status';
      
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 [Hook] Fetching OTN route status from: ${apiUrl}`);
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 🔒 SECURE: Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ [Hook] API Error (${response.status}):`, errorText);
        }
        
        throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // 🔒 SECURE: Only log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [Hook] Successfully fetched route status`);
        console.log(`📊 [Hook] Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
        console.log(`📊 [Hook] Data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
        console.log(`📊 [Hook] Sample data:`, data?.[0] || data);
      }
      
      // Ensure we always return an array
      const result = Array.isArray(data) ? data : (data ? [data] : []);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 [Hook] Returning ${result.length} records`);
      }
      
      return result;
    },
    
    // Only use initialData if it's a valid array with items
    initialData: (initialData && Array.isArray(initialData) && initialData.length > 0) 
      ? initialData 
      : undefined,
    
    // Cache settings
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    
    // Refetch settings
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000, // 1 minute
    
    // Retry settings
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Error handler
    onError: (error) => {
      // 🔒 SECURE: Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [Hook] Error fetching OTN route status:', error);
        console.error('💡 [Hook] Check:');
        console.error('   1. Is OTN_ROUTE_STATUS set in .env.local?');
        console.error('   2. Is the external API running?');
        console.error('   3. Is the API URL correct?');
        console.error('   4. Is there a network connection?');
      }
    },
    
    // Success handler
    onSuccess: (data) => {
      // 🔒 SECURE: Only log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [Hook] Successfully loaded ${data?.length || 0} route status records`);
      }
    },
  });
}

/**
 * Hook for filtering route status with search and filters
 */
export function useFilteredRouteStatus(routes, searchTerm, selectedRegion, selectedStatus) {
  if (!routes || !Array.isArray(routes)) return [];

  return routes.filter(route => {
    if (!route) return false;

    if (selectedRegion) {
      const regionFields = ['region', 'region_name', 'location', 'city', 'area'];
      const hasMatchingRegion = regionFields.some(field => {
        const value = route[field];
        return typeof value === 'string' &&
               value.toLowerCase().includes(selectedRegion.toLowerCase());
      });
      if (!hasMatchingRegion) return false;
    }

    if (selectedStatus) {
      const status = route.status;
      if (!status || status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
    }

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
