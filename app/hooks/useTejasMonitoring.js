"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================
// Hook: Get All Routers
// ============================================
export function useTejasRouters() {
  return useQuery({
    queryKey: ['tejas-routers'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/tejas/routers`);
      if (!res.ok) throw new Error('Failed to fetch routers');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}

// ============================================
// Hook: Get OSPF Neighbors
// ============================================
export function useOSPFNeighbors(routerId = null) {
  return useQuery({
    queryKey: ['ospf-neighbors', routerId],
    queryFn: async () => {
      const url = routerId 
        ? `${API_URL}/api/tejas/ospf-neighbors?router_id=${routerId}`
        : `${API_URL}/api/tejas/ospf-neighbors`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch OSPF neighbors');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: true, // Always enabled
  });
}

// ============================================
// Hook: Get BGP Summary
// ============================================
export function useBGPSummary(routerId = null) {
  return useQuery({
    queryKey: ['bgp-summary', routerId],
    queryFn: async () => {
      const url = routerId 
        ? `${API_URL}/api/tejas/bgp-summary?router_id=${routerId}`
        : `${API_URL}/api/tejas/bgp-summary`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch BGP summary');
      return res.json();
    },
    refetchInterval: 30000,
  });
}

// ============================================
// Hook: Get SFP Info
// ============================================
export function useSFPInfo(routerId = null, interfaceId = null) {
  return useQuery({
    queryKey: ['sfp-info', routerId, interfaceId],
    queryFn: async () => {
      let url = `${API_URL}/api/tejas/sfp-info`;
      const params = new URLSearchParams();
      
      if (routerId) params.append('router_id', routerId);
      if (interfaceId) params.append('interface_id', interfaceId);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch SFP info');
      return res.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

// ============================================
// Hook: Get SFP Stats
// ============================================
export function useSFPStats(routerId = null, interfaceId = null) {
  return useQuery({
    queryKey: ['sfp-stats', routerId, interfaceId],
    queryFn: async () => {
      let url = `${API_URL}/api/tejas/sfp-stats`;
      const params = new URLSearchParams();
      
      if (routerId) params.append('router_id', routerId);
      if (interfaceId) params.append('interface_id', interfaceId);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch SFP stats');
      return res.json();
    },
    refetchInterval: 15000,
  });
}

// ============================================
// Hook: Get All Latest Readings
// ============================================
export function useLatestReadings(category = null) {
  return useQuery({
    queryKey: ['latest-readings', category],
    queryFn: async () => {
      const url = category 
        ? `${API_URL}/api/tejas/latest-readings?category=${category}`
        : `${API_URL}/api/tejas/latest-readings`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch latest readings');
      return res.json();
    },
    refetchInterval: 20000,
  });
}

// ============================================
// Hook: Get Reading History
// ============================================
export function useReadingHistory(parameterId, interfaceId, limit = 100) {
  return useQuery({
    queryKey: ['reading-history', parameterId, interfaceId, limit],
    queryFn: async () => {
      const url = `${API_URL}/api/tejas/reading-history?parameter_id=${parameterId}&interface_id=${interfaceId}&limit=${limit}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch reading history');
      return res.json();
    },
    enabled: !!parameterId && !!interfaceId,
  });
}

// ============================================
// Hook: Trigger Manual Monitoring
// ============================================
export function useTriggerMonitoring() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (routerId) => {
      const res = await fetch(`${API_URL}/api/tejas/trigger-monitoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ router_id: routerId }),
      });
      
      if (!res.ok) throw new Error('Failed to trigger monitoring');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['ospf-neighbors'] });
      queryClient.invalidateQueries({ queryKey: ['bgp-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sfp-info'] });
      queryClient.invalidateQueries({ queryKey: ['sfp-stats'] });
      queryClient.invalidateQueries({ queryKey: ['latest-readings'] });
    },
  });
}

// ============================================
// Hook: Get System Health
// ============================================
export function useSystemHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/tejas/system-health`);
      if (!res.ok) throw new Error('Failed to fetch system health');
      return res.json();
    },
    refetchInterval: 30000,
  });
}

// ============================================
// Hook: Get Dashboard Summary
// ============================================
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/tejas/dashboard-summary`);
      if (!res.ok) throw new Error('Failed to fetch dashboard summary');
      return res.json();
    },
    refetchInterval: 30000,
  });
}

// ============================================
// Hook: Search Readings
// ============================================
export function useSearchReadings(filters) {
  return useQuery({
    queryKey: ['search-readings', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_URL}/api/tejas/search-readings?${params}`);
      if (!res.ok) throw new Error('Failed to search readings');
      return res.json();
    },
    enabled: Object.keys(filters).length > 0,
  });
}
