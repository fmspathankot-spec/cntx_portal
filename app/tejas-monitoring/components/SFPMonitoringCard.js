"use client";

import LoadingSpinner from './LoadingSpinner';

export default function SFPMonitoringCard({ sfpInfo, sfpStats, isLoadingInfo, isLoadingStats, routerName }) {
  if (isLoadingInfo || isLoadingStats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner message="Loading SFP data..." />
      </div>
    );
  }
  
  // Handle data format - sfpInfo is array of interfaces
  const interfaces = sfpInfo || [];
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">SFP Monitoring</h3>
              <p className="text-sm text-gray-500">{routerName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {interfaces.length} Interfaces
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {!interfaces || interfaces.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="mt-2">No SFP data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {interfaces.map((iface, index) => {
              const info = iface?.sfp_info || {};
              const stats = iface?.sfp_stats || {};
              
              return (
                <div 
                  key={iface?.id || index}
                  className="border border-gray-200 rounded-lg p-5"
                >
                  {/* Interface Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {iface?.label || iface?.name || 'Unknown Interface'}
                      </h4>
                      <p className="text-sm text-gray-500">{iface?.type || 'N/A'}</p>
                    </div>
                    
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      info?.laser_status === 'ON' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {info?.laser_status || 'Unknown'}
                    </span>
                  </div>
                  
                  {/* SFP Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">RX Power</div>
                      <div className="font-semibold text-gray-900">
                        {info?.rx_power ? `${info.rx_power} dBm` : 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">TX Power</div>
                      <div className="font-semibold text-gray-900">
                        {info?.tx_power ? `${info.tx_power} dBm` : 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Temperature</div>
                      <div className="font-semibold text-gray-900">
                        {info?.module_temperature ? `${info.module_temperature} °C` : 'N/A'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs text-gray-500 mb-1">Voltage</div>
                      <div className="font-semibold text-gray-900">
                        {info?.module_voltage ? `${info.module_voltage} V` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Lane Statistics (if available) */}
                  {stats?.rx_power_lane0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Lane Statistics</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map(lane => (
                          <div key={lane} className="bg-blue-50 rounded p-2">
                            <div className="text-xs text-gray-600 mb-1">Lane {lane}</div>
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                RX: {stats[`rx_power_lane${lane}`] || 'N/A'} dBm
                              </div>
                              <div className="font-medium text-gray-900">
                                TX: {stats[`tx_power_lane${lane}`] || 'N/A'} dBm
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Average Power */}
                      {stats?.rx_power_avg && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="bg-green-50 rounded p-2">
                            <div className="text-xs text-gray-600">Average RX Power</div>
                            <div className="text-sm font-semibold text-green-700">
                              {stats.rx_power_avg} dBm
                            </div>
                          </div>
                          <div className="bg-green-50 rounded p-2">
                            <div className="text-xs text-gray-600">Average TX Power</div>
                            <div className="text-sm font-semibold text-green-700">
                              {stats.tx_power_avg || 'N/A'} dBm
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
