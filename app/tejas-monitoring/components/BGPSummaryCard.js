"use client";

import LoadingSpinner from './LoadingSpinner';

export default function BGPSummaryCard({ data, isLoading, routerName }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner message="Loading BGP summary..." />
      </div>
    );
  }
  
  // Handle null or undefined data
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">BGP Summary</h3>
              <p className="text-sm text-gray-500">{routerName}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No BGP data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">BGP Summary</h3>
              <p className="text-sm text-gray-500">{routerName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Active
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Router ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Router ID</div>
            <div className="text-lg font-semibold text-gray-900">
              {data?.router_id || 'N/A'}
            </div>
          </div>
          
          {/* Local AS */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Local AS</div>
            <div className="text-lg font-semibold text-gray-900">
              {data?.local_as || 'N/A'}
            </div>
          </div>
          
          {/* Established Peers */}
          {data?.established_count && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Established Peers</div>
              <div className="text-lg font-semibold text-green-600">
                {data.established_count}/{data?.configured_count || '0'}
              </div>
            </div>
          )}
          
          {/* Forwarding State */}
          {data?.forwarding_state && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Forwarding State</div>
              <div className="text-lg font-semibold text-gray-900">
                {data.forwarding_state}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
