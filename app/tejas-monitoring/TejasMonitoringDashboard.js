"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  useTejasRouters
} from '../hooks/useTejasMonitoring';
import RouterSelector from './components/RouterSelector';
import OSPFNeighborsCard from './components/OSPFNeighborsCard';
import BGPSummaryCard from './components/BGPSummaryCard';
import SFPMonitoringCard from './components/SFPMonitoringCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';

export default function TejasMonitoringDashboard() {
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [ospfData, setOspfData] = useState(null);
  const [bgpData, setBgpData] = useState(null);
  const [sfpInfo, setSfpInfo] = useState(null);
  const [sfpStats, setSfpStats] = useState(null);
  const [loading, setLoading] = useState({
    ospf: false,
    bgp: false,
    sfp: false
  });
  const [errors, setErrors] = useState({
    ospf: null,
    bgp: null,
    sfp: null
  });
  
  // Fetch routers list
  const { data: routers, isLoading: routersLoading, error: routersError } = useTejasRouters();
  
  // Fetch live data function
  const fetchLiveData = async () => {
    if (!selectedRouter) return;
    
    // Reset data
    setOspfData(null);
    setBgpData(null);
    setSfpInfo(null);
    setSfpStats(null);
    setErrors({ ospf: null, bgp: null, sfp: null });
    
    // Set all loading
    setLoading({ ospf: true, bgp: true, sfp: true });
    
    // Fetch OSPF
    fetch(`/api/tejas/live/ospf?routerId=${selectedRouter.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOspfData(data);
        } else {
          setErrors(prev => ({ ...prev, ospf: data.error || 'Failed to fetch OSPF data' }));
        }
      })
      .catch(err => {
        setErrors(prev => ({ ...prev, ospf: err.message }));
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, ospf: false }));
      });
    
    // Fetch BGP
    fetch(`/api/tejas/live/bgp?routerId=${selectedRouter.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBgpData(data);
        } else {
          setErrors(prev => ({ ...prev, bgp: data.error || 'Failed to fetch BGP data' }));
        }
      })
      .catch(err => {
        setErrors(prev => ({ ...prev, bgp: err.message }));
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, bgp: false }));
      });
    
    // Fetch SFP Info
    fetch(`/api/tejas/live/sfp?routerId=${selectedRouter.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSfpInfo(data.data?.sfp_info || []);
          setSfpStats(data.data?.sfp_stats || []);
        } else {
          setErrors(prev => ({ ...prev, sfp: data.error || 'Failed to fetch SFP data' }));
        }
      })
      .catch(err => {
        setErrors(prev => ({ ...prev, sfp: err.message }));
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, sfp: false }));
      });
  };
  
  // Handle router selection
  const handleRouterSelect = (router) => {
    setSelectedRouter(router);
    // Clear previous data
    setOspfData(null);
    setBgpData(null);
    setSfpInfo(null);
    setSfpStats(null);
    setErrors({ ospf: null, bgp: null, sfp: null });
  };
  
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
                Live monitoring of OSPF, BGP, and SFP parameters
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Node Status Link */}
              <Link
                href="/tejas-monitoring/status"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <span>🔌</span>
                <span>Node Status</span>
              </Link>
              
              {/* Fetch Live Button */}
              {selectedRouter && (
                <button
                  onClick={fetchLiveData}
                  disabled={loading.ospf || loading.bgp || loading.sfp}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(loading.ospf || loading.bgp || loading.sfp) ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Fetch Live Data</span>
                    </>
                  )}
                </button>
              )}
              
              {/* Last update time */}
              <div className="text-sm text-gray-500">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Router Selector */}
        <div className="mb-6">
          <RouterSelector 
            routers={routers || []}
            selectedRouter={selectedRouter}
            onSelectRouter={handleRouterSelect}
          />
        </div>
        
        {/* Dashboard Grid */}
        {selectedRouter ? (
          <div className="space-y-6">
            {/* Info Banner */}
            {!ospfData && !bgpData && !sfpInfo && !loading.ospf && !loading.bgp && !loading.sfp && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="text-blue-900 font-medium">Ready to fetch live data</div>
                    <div className="text-blue-700 text-sm mt-1">
                      Click the <strong>"Fetch Live Data"</strong> button above to get real-time OSPF, BGP, and SFP information from {selectedRouter.hostname}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Row 1: OSPF and BGP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OSPFNeighborsCard 
                data={ospfData}
                isLoading={loading.ospf}
                error={errors.ospf}
                routerName={selectedRouter.hostname}
              />
              
              <BGPSummaryCard 
                data={bgpData}
                isLoading={loading.bgp}
                error={errors.bgp}
                routerName={selectedRouter.hostname}
              />
            </div>
            
            {/* Row 2: SFP Monitoring */}
            <SFPMonitoringCard 
              sfpInfo={sfpInfo}
              sfpStats={sfpStats}
              isLoadingInfo={loading.sfp}
              isLoadingStats={loading.sfp}
              error={errors.sfp}
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
            <p className="text-gray-500 mb-4">
              Choose a router from the dropdown above to view live monitoring data
            </p>
            <p className="text-sm text-gray-400">
              💡 Tip: Check <Link href="/tejas-monitoring/status" className="text-blue-600 hover:underline">Node Status</Link> to see which routers are online
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
