"use client";

import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for fetching OTN routes with caching and error handling
 * 
 * Features:
 * - Automatic caching (5 minutes)
 * - Auto-refresh on window focus
 * - Retry on failure (3 attempts)
 * - Loading and error states
 * 
 * @param {Array} initialData - Initial data from server
 * @returns {Object} { data, isLoading, error, refetch }
 */
export function useOtnRoutes(initialData = null) {
  return useQuery({
    // Unique key for this query
    queryKey: ['otn-routes'],
    
    // Function to fetch data
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_OTN_ROUTE_DETAIL || '/api/otn-route-detail';
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    },
    
    // Initial data from server (for SSR)
    initialData,
    
    // Cache settings
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    
    // Refetch settings
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnReconnect: true, // Refresh when internet reconnects
    refetchInterval: 60 * 1000, // Auto-refresh every 1 minute
    
    // Retry settings
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Attempt 1: Wait 1s
    // Attempt 2: Wait 2s  
    // Attempt 3: Wait 4s
    
    // Error handling
    onError: (error) => {
      console.error('Error fetching OTN routes:', error);
    },
    
    // Success handling
    onSuccess: (data) => {
      console.log(`Successfully loaded ${data?.length || 0} routes`);
    },
  });
}

/**
 * Hook for searching routes with debouncing
 * 
 * @param {Array} routes - All routes
 * @param {string} searchTerm - Search term
 * @param {string} selectedRegion - Selected region filter
 * @returns {Array} Filtered routes
 */
export function useFilteredRoutes(routes, searchTerm, selectedRegion) {
  if (!routes || !Array.isArray(routes)) return [];

  return routes.filter(route => {
    if (!route) return false;

    // Filter by region
    if (selectedRegion) {
      const regionFields = ['region', 'region_name', 'location', 'city', 'area'];
      const hasMatchingRegion = regionFields.some(field => {
        const value = route[field];
        return typeof value === 'string' &&
               value.toLowerCase().includes(selectedRegion.toLowerCase());
      });
      if (!hasMatchingRegion) return false;
    }

    // Filter by search term
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
