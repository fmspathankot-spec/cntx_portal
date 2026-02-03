/**
 * React Hooks for Tejas Monitoring
 * Fetches data from API routes
 */

import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch all Tejas routers
 */
export function useTejasRouters() {
  return useQuery({
    queryKey: ['tejas-routers'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/tejas-monitoring/routers`);
      if (!response.ok) {
        throw new Error('Failed to fetch routers');
      }
      const data = await response.json();
      return data.routers;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

/**
 * Fetch monitoring data for specific router
 */
export function useRouterMonitoring(routerId) {
  return useQuery({
    queryKey: ['router-monitoring', routerId],
    queryFn: async () => {
      if (!routerId) return null;
      
      const response = await fetch(`${API_BASE}/api/tejas-monitoring/${routerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }
      const data = await response.json();
      return data;
    },
    enabled: !!routerId, // Only run if routerId exists
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000,
  });
}

/**
 * Fetch OSPF neighbors for router
 */
export function useOSPFNeighbors(routerId) {
  const { data, ...rest } = useRouterMonitoring(routerId);
  return {
    data: data?.ospf?.data || null,
    timestamp: data?.ospf?.timestamp,
    ...rest
  };
}

/**
 * Fetch BGP summary for router
 */
export function useBGPSummary(routerId) {
  const { data, ...rest } = useRouterMonitoring(routerId);
  return {
    data: data?.bgp?.data || null,
    timestamp: data?.bgp?.timestamp,
    ...rest
  };
}

/**
 * Fetch SFP info for router interfaces
 */
export function useSFPInfo(routerId) {
  const { data, ...rest } = useRouterMonitoring(routerId);
  return {
    data: data?.interfaces || [],
    ...rest
  };
}

/**
 * Fetch SFP stats for router interfaces
 */
export function useSFPStats(routerId) {
  const { data, ...rest } = useRouterMonitoring(routerId);
  return {
    data: data?.interfaces || [],
    ...rest
  };
}
