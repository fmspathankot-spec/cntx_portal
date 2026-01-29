// Custom hook for OTN routes data fetching with React Query
'use client'

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
      try {
        const response = await axios.get('/api/otn-route-detail', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        return response.data
      } catch (error) {
        console.error('Error fetching OTN routes:', error)
        throw new Error(error.response?.data?.error || 'Failed to fetch routes')
      }
    },
    // Use initialData to prevent duplicate API calls
    initialData: initialData,
    // Stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: 10 minutes
    cacheTime: 10 * 60 * 1000,
    // Refetch on window focus
    refetchOnWindowFocus: true,
    // Retry failed requests
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  return {
    routes,
    isLoading,
    error,
    refetch
  }
}
