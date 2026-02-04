"use client";

import { useState } from 'react';
import { useAllRoutersStatus } from '../../hooks/useTejasMonitoring';
import LoadingSpinner from '../components/LoadingSpinner';
import Link from 'next/link';

export default function NodeStatusDashboard() {
  const { data: statuses, isLoading, error, refetch } = useAllRoutersStatus();
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Auto refresh every 30 seconds if enabled
  useState(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading node status..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 font-medium">Error loading status</div>
            <div className="text-red-600 text-sm mt-1">{error.message}</div>
          </div>
        </div>
      </div>
    );
  }
  
  const onlineCount = statuses?.filter(s => s.is_online).length || 0;
  const totalCount = statuses?.length || 0;
  const offlineCount = totalCount - onlineCount;
  const uptime = totalCount > 0 ? ((onlineCount / totalCount) * 100).toFixed(1) : 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Link 
                  href="/tejas-monitoring"
                  className="text-gray-400 hover:text-gray-600"
                >
                  ← Back
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  🔌 Node Status Monitor
                </h1>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Real-time ping monitoring of all Tejas routers (updated every 5 minutes)
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto Refresh Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
              </label>
              
              {/* Manual Refresh */}
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                🔄 Refresh Now
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Nodes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Nodes</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {totalCount}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
            </div>
          </div>
          
          {/* Online Nodes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Online</div>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  {onlineCount}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>
          
          {/* Offline Nodes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Offline</div>
                <div className="text-3xl font-bold text-red-600 mt-1">
                  {offlineCount}
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✗</span>
              </div>
            </div>
          </div>
          
          {/* Uptime */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Uptime</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">
                  {uptime}%
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Nodes List */}
        <div className="bg-white rounded-lg shadow">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Nodes
            </h2>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostname
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packet Loss
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Checked
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statuses && statuses.length > 0 ? (
                  statuses.map((status) => (
                    <tr 
                      key={status.router_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            status.is_online 
                              ? 'bg-green-500 animate-pulse' 
                              : 'bg-red-500'
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            status.is_online ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {status.is_online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Hostname */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {status.hostname}
                        </div>
                      </td>
                      
                      {/* IP Address */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {status.ip_address}
                        </div>
                      </td>
                      
                      {/* Response Time */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {status.response_time 
                            ? `${status.response_time}ms`
                            : '-'}
                        </div>
                      </td>
                      
                      {/* Packet Loss */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          status.packet_loss === null || status.packet_loss === 0
                            ? 'text-green-600'
                            : status.packet_loss < 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}>
                          {status.packet_loss !== null 
                            ? `${status.packet_loss}%`
                            : '-'}
                        </div>
                      </td>
                      
                      {/* Last Checked */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(status.last_checked).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No nodes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
