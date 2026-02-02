"use client";

import LoadingSpinner from './LoadingSpinner';

export default function OSPFNeighborsCard({ data, isLoading, routerName }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner message="Loading OSPF neighbors..." />
      </div>
    );
  }
  
  const neighbors = data || [];
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">OSPF Neighbors</h3>
              <p className="text-sm text-gray-500">{routerName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {neighbors.length} Neighbors
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {neighbors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-2">No OSPF neighbors found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {neighbors.map((neighbor, index) => (
              <div 
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {neighbor.neighbor_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {neighbor.neighbor_address}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    neighbor.state?.includes('FULL') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {neighbor.state}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Interface</div>
                    <div className="font-medium text-gray-900">{neighbor.interface}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500">BFD Status</div>
                    <div className="font-medium text-gray-900">
                      <span className={`inline-flex items-center ${
                        neighbor.bfd_status === 'Enabled' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {neighbor.bfd_status === 'Enabled' && (
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {neighbor.bfd_status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500">Area ID</div>
                    <div className="font-medium text-gray-900">{neighbor.area_id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
