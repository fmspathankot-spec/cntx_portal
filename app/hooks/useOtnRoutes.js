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
 * - Secure logging (development only)
 * 
 * @param {Array} initialData - Initial data from server
 * @returns {Object} { data, isLoading, error, refetch }
 */
export function useOtnRoutes(initialData = null) {
  return useQuery({
    queryKey: ['otn-routes'],
    
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_OTN_ROUTE_DETAIL || '/api/otn-route-detail';
      
      // 🔒 SECURE: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Fetching OTN routes from: ${apiUrl}`);
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 🔒 SECURE: Only log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ API Error (${response.status}):`, errorText);
        }
        
        throw new Error(`API Error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // 🔒 SECURE: Only log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully fetched ${data?.length || 0} routes`);
      }
      
      return Array.isArray(data) ? data : [data];
    },
    
    initialData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    onError: (error) => {
      // 🔒 SECURE: Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Error fetching OTN routes:', error);
      }
    },
    
    onSuccess: (data) => {
      // 🔒 SECURE: Only log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully loaded ${data?.length || 0} routes`);
      }
    },
  });
}

/**
 * Hook for searching routes with debouncing
 */
export function useFilteredRoutes(routes, searchTerm, selectedRegion) {
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
