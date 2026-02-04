"use client";

import { useState } from 'react';
import { 
  useTejasRouters, 
  useOSPFNeighbors, 
  useBGPSummary, 
  useSFPInfo, 
  useSFPStats 
} from '../hooks/useTejasMonitoring';
import RouterSelector from './components/RouterSelector';
import AllRoutersStatus from './components/AllRoutersStatus';
import OSPFNeighborsCard from './components/OSPFNeighborsCard';
import BGPSummaryCard from './components/BGPSummaryCard';
import SFPMonitoringCard from './components/SFPMonitoringCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';

export default function TejasMonitoringDashboard() {
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [showAllStatus, setShowAllStatus] = useState(true);
  
  // Fetch data using hooks
  const { data: routers, isLoading: routersLoading, error: routersError } = useTejasRouters();
  const { data: ospfData, isLoading: ospfLoading } = useOSPFNeighbors(selectedRouter?.id, false);
  const { data: bgpData, isLoading: bgpLoading } = useBGPSummary(selectedRouter?.id, false);
  const { data: sfpInfo, isLoading: sfpInfoLoading } = useSFPInfo(selectedRouter?.id, false);
  const { data: sfpStats, isLoading: sfpStatsLoading } = useSFPStats(selectedRouter?.id, false);
  
  if (routersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading routers..." />
      </div>
    );
  }
  
  if (routersError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ErrorAlert message={routersError.message} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🌐 Tejas Router Monitoring
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time monitoring of OSPF, BGP, and SFP parameters
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Toggle All Status View */}
              <button
                onClick={() => setShowAllStatus(!showAllStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAllStatus
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showAllStatus ? '📊 Status View' : '📋 Show Status'}
              </button>
              
              {/* Last update time */}
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* All Routers Status Dashboard */}
        {showAllStatus && (
          <div className="mb-6">
            <AllRoutersStatus />
          </div>
        )}
        
        {/* Router Selector */}
        <div className="mb-6">
          <RouterSelector 
            routers={routers || []}
            selectedRouter={selectedRouter}
            onSelectRouter={setSelectedRouter}
          />
        </div>
        
        {/* Dashboard Grid */}
        {selectedRouter ? (
          <div className="space-y-6">
            {/* Row 1: OSPF and BGP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OSPFNeighborsCard 
                data={ospfData}
                isLoading={ospfLoading}
                routerName={selectedRouter.hostname}
              />
              
              <BGPSummaryCard 
                data={bgpData}
                isLoading={bgpLoading}
                routerName={selectedRouter.hostname}
              />
            </div>
            
            {/* Row 2: SFP Monitoring */}
            <SFPMonitoringCard 
              sfpInfo={sfpInfo}
              sfpStats={sfpStats}
              isLoadingInfo={sfpInfoLoading}
              isLoadingStats={sfpStatsLoading}
              routerName={selectedRouter.hostname}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a 2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Router
            </h3>
            <p className="text-gray-500">
              Choose a router from the dropdown above to view monitoring data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
