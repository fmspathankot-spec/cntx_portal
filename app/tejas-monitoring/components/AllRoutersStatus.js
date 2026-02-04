"use client";

import { useAllRoutersStatus } from '../../hooks/useTejasMonitoring';
import LoadingSpinner from './LoadingSpinner';

export default function AllRoutersStatus() {
  const { data: statuses, isLoading, error, refetch } = useAllRoutersStatus();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner message="Loading router status..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">Error loading status: {error.message}</div>
      </div>
    );
  }
  
  const onlineCount = statuses?.filter(s => s.is_online).length || 0;
  const totalCount = statuses?.length || 0;
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              🌐 All Routers Status
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Real-time ping status (updated every 5 minutes)
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Summary */}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {onlineCount}/{totalCount}
              </div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Router List */}
      <div className="divide-y divide-gray-200">
        {statuses && statuses.length > 0 ? (
          statuses.map((status) => (
            <div 
              key={status.router_id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Router Info */}
                <div className="flex items-center space-x-4">
                  {/* Status Dot */}
                  <div className={`w-4 h-4 rounded-full ${
                    status.is_online 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-red-500'
                  }`}></div>
                  
                  {/* Name & IP */}
                  <div>
                    <div className="font-medium text-gray-900">
                      {status.hostname}
                    </div>
                    <div className="text-sm text-gray-500">
                      {status.ip_address}
                    </div>
                  </div>
                </div>
                
                {/* Status Details */}
                <div className="flex items-center space-x-6">
                  {/* Status Badge */}
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      status.is_online
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {status.is_online ? '✓ Online' : '✗ Offline'}
                    </span>
                  </div>
                  
                  {/* Response Time */}
                  {status.is_online && status.response_time && (
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {status.response_time}ms
                      </div>
                      <div className="text-xs text-gray-500">Latency</div>
                    </div>
                  )}
                  
                  {/* Packet Loss */}
                  {status.packet_loss !== null && (
                    <div className="text-center">
                      <div className={`text-sm font-medium ${
                        status.packet_loss === 0 
                          ? 'text-green-600' 
                          : status.packet_loss < 50 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                      }`}>
                        {status.packet_loss}%
                      </div>
                      <div className="text-xs text-gray-500">Loss</div>
                    </div>
                  )}
                  
                  {/* Last Checked */}
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Last checked</div>
                    <div className="text-sm text-gray-900">
                      {new Date(status.last_checked).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Error Message */}
              {status.error_message && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
                  Error: {status.error_message}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No routers found
          </div>
        )}
      </div>
    </div>
  );
}
