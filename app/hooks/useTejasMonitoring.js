/**
 * React Hooks for Tejas Monitoring - Live Data
 * Fetches real-time data from routers via SSH
 */

import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Fetch all Tejas routers from database
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
    staleTime: 60000, // Cache for 1 minute
  });
}

/**
 * Fetch router status (ping)
 */
export function useRouterStatus(routerId) {
  return useQuery({
    queryKey: ['router-status', routerId],
    queryFn: async () => {
      if (!routerId) return null;
      
      const response = await fetch(`${API_BASE}/api/tejas/status?routerId=${routerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch router status');
      }
      const data = await response.json();
      return data.status;
    },
    enabled: !!routerId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider stale after 4 minutes
  });
}

/**
 * Fetch all routers status
 */
export function useAllRoutersStatus() {
  return useQuery({
    queryKey: ['all-routers-status'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/tejas/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch routers status');
      }
      const data = await response.json();
      return data.statuses;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000,
  });
}

/**
 * Fetch live OSPF neighbors for router
 */
export function useOSPFNeighbors(routerId, enabled = true) {
  return useQuery({
    queryKey: ['ospf-neighbors', routerId],
    queryFn: async () => {
      if (!routerId) return null;
      
      const response = await fetch(`${API_BASE}/api/tejas/live/ospf?routerId=${routerId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch OSPF data');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!routerId && enabled,
    staleTime: 30000, // Consider stale after 30 seconds
    retry: 2,
  });
}

/**
 * Fetch live BGP summary for router
 */
export function useBGPSummary(routerId, enabled = true) {
  return useQuery({
    queryKey: ['bgp-summary', routerId],
    queryFn: async () => {
      if (!routerId) return null;
      
      const response = await fetch(`${API_BASE}/api/tejas/live/bgp?routerId=${routerId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch BGP data');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!routerId && enabled,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Fetch live SFP info for router interfaces
 */
export function useSFPInfo(routerId, enabled = true) {
  return useQuery({
    queryKey: ['sfp-info', routerId],
    queryFn: async () => {
      if (!routerId) return null;
      
      const response = await fetch(`${API_BASE}/api/tejas/live/sfp?routerId=${routerId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch SFP data');
      }
      const data = await response.json();
      return data.interfaces;
    },
    enabled: !!routerId && enabled,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Fetch live SFP stats (same as info for now)
 */
export function useSFPStats(routerId, enabled = true) {
  return useSFPInfo(routerId, enabled);
}
