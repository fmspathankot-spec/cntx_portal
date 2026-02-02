"use client";

import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function SFPMonitoringCard({ sfpInfo, sfpStats, isLoadingInfo, isLoadingStats, routerName }) {
  const [selectedInterface, setSelectedInterface] = useState(null);
  
  if (isLoadingInfo || isLoadingStats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <LoadingSpinner message="Loading SFP data..." />
      </div>
    );
  }
  
  const interfaces = sfpInfo || [];
  const stats = sfpStats || [];
  
  // Merge info and stats
  const mergedData = interfaces.map(info => {
    const stat = stats.find(s => s.interface_id === info.interface_id);
    return { ...info, stats: stat };
  });
  
  const currentInterface = selectedInterface 
    ? mergedData.find(i => i.interface_id === selectedInterface)
    : mergedData[0];
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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
        {mergedData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="mt-2">No SFP data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interface Tabs */}
            {mergedData.length > 1 && (
              <div className="flex space-x-2 border-b border-gray-200">
                {mergedData.map((iface) => (
                  <button
                    key={iface.interface_id}
                    onClick={() => setSelectedInterface(iface.interface_id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      (selectedInterface === iface.interface_id || (!selectedInterface && iface === mergedData[0]))
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {iface.interface_label || iface.interface_name}
                  </button>
                ))}
              </div>
            )}
            
            {currentInterface && (
              <div className="space-y-6">
                {/* Status and Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        currentInterface.operational_status === 'up' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-gray-900 capitalize">
                        {currentInterface.operational_status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Laser</div>
                    <div className="font-medium text-gray-900 text-sm">
                      {currentInterface.laser_status}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Temperature</div>
                    <div className="font-medium text-gray-900">
                      {currentInterface.temperature}°C
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Voltage</div>
                    <div className="font-medium text-gray-900">
                      {currentInterface.voltage}V
                    </div>
                  </div>
                </div>
                
                {/* Power Levels */}
                <div className="grid grid-cols-2 gap-6">
                  {/* RX Power */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">RX Power</h4>
                      <span className="text-2xl font-bold text-blue-600">
                        {currentInterface.rx_power} dBm
                      </span>
                    </div>
                    
                    {currentInterface.stats && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-2">Per Lane:</div>
                        {[0, 1, 2, 3].map(lane => (
                          <div key={lane} className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Lane {lane}:</span>
                            <span className="font-medium text-gray-900">
                              {currentInterface.stats[`rx_power_lane${lane}`]} dBm
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm font-medium">
                          <span className="text-gray-700">Average:</span>
                          <span className="text-blue-600">
                            {currentInterface.stats.rx_power_avg} dBm
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* TX Power */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">TX Power</h4>
                      <span className="text-2xl font-bold text-green-600">
                        {currentInterface.tx_power} dBm
                      </span>
                    </div>
                    
                    {currentInterface.stats && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-2">Per Lane:</div>
                        {[0, 1, 2, 3].map(lane => (
                          <div key={lane} className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Lane {lane}:</span>
                            <span className="font-medium text-gray-900">
                              {currentInterface.stats[`tx_power_lane${lane}`]} dBm
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm font-medium">
                          <span className="text-gray-700">Average:</span>
                          <span className="text-green-600">
                            {currentInterface.stats.tx_power_avg} dBm
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Module Info */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Module Information</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Laser Type:</span>
                      <div className="font-medium text-gray-900 mt-1">
                        {currentInterface.laser_type}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Vendor:</span>
                      <div className="font-medium text-gray-900 mt-1">
                        {currentInterface.vendor}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500">Serial Number:</span>
                      <div className="font-medium text-gray-900 mt-1">
                        {currentInterface.serial_number}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
