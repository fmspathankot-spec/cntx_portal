"use client";

import { useRouterStatus } from '../../hooks/useTejasMonitoring';

export default function RouterStatusIndicator({ routerId, showDetails = false }) {
  const { data: status, isLoading } = useRouterStatus(routerId);
  
  if (isLoading || !status) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
        {showDetails && <span className="text-sm text-gray-500">Checking...</span>}
      </div>
    );
  }
  
  const isOnline = status.is_alive;
  
  return (
    <div className="flex items-center space-x-2">
      {/* Status Dot */}
      <div className={`w-3 h-3 rounded-full ${
        isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`}></div>
      
      {/* Status Text */}
      {showDetails && (
        <div className="text-sm">
          <span className={`font-medium ${
            isOnline ? 'text-green-700' : 'text-red-700'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
          
          {isOnline && status.response_time && (
            <span className="text-gray-500 ml-2">
              ({status.response_time}ms)
            </span>
          )}
          
          {status.last_checked && (
            <div className="text-xs text-gray-400">
              Last checked: {new Date(status.last_checked).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
