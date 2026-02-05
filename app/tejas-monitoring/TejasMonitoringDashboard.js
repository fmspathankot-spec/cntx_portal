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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [performance, setPerformance] = useState(null);
  
  // Fetch routers list
  const { data: routers, isLoading: routersLoading, error: routersError } = useTejasRouters();
  
  // Fetch live data function - UNIFIED API (Single SSH Session)
  const fetchLiveData = async () => {
    if (!selectedRouter) return;
    
    console.log(`[DASHBOARD] Fetching unified data for router: ${selectedRouter.hostname}`);
    
    // Reset data
    setOspfData(null);
    setBgpData(null);
    setSfpInfo(null);
    setSfpStats(null);
    setError(null);
    setPerformance(null);
    
    // Set loading
    setLoading(true);
    
    try {
      // Single API call for all data (OSPF + BGP + SFP)
      const response = await fetch(`/api/tejas/live/all?routerId=${selectedRouter.id}`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`[DASHBOARD] Success! Data fetched in ${result.performance?.execution_time_ms}ms`);
        console.log(`[DASHBOARD] SSH Sessions: ${result.performance?.ssh_sessions}`);
        
        // Set OSPF data
        setOspfData({
          success: true,
          router: result.router,
          data: result.data.ospf,
          timestamp: result.timestamp
        });
        
        // Set BGP data
        setBgpData({
          success: true,
          router: result.router,
          data: result.data.bgp,
          timestamp: result.timestamp
        });
        
        // Set SFP data
        setSfpInfo(result.data.sfp?.interfaces || []);
        setSfpStats(result.data.sfp?.interfaces || []);
        
        // Set performance metrics
        setPerformance(result.performance);
        
      } else {
        console.error(`[DASHBOARD] Error:`, result.error);
        setError(result.message || result.error || 'Failed to fetch monitoring data');
      }
      
    } catch (err) {
      console.error(`[DASHBOARD] Fetch error:`, err);
      setError(err.message || 'Network error while fetching data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle router selection
  const handleRouterSelect = (router) => {
    setSelectedRouter(router);
    // Clear previous data
    setOspfData(null);
    setBgpData(null);
    setSfpInfo(null);
    setSfpStats(null);
    setError(null);
    setPerformance(null);
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
              {performance && (
                <p className="mt-1 text-xs text-green-600 font-medium">
                  ⚡ Data fetched in {performance.execution_time_ms}ms using {performance.ssh_sessions} SSH session
                </p>
              )}
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
              
              {/* Back to Dashboard */}
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <span>←</span>
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Router Selector */}
        <div className="mb-6">
          <RouterSelector
            routers={routers}
            selectedRouter={selectedRouter}
            onRouterSelect={handleRouterSelect}
          />
        </div>
        
        {/* Fetch Button */}
        {selectedRouter && (
          <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">
                Selected Router: <span className="font-semibold text-gray-900">{selectedRouter.hostname}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                IP: {selectedRouter.ip_address} | Type: {selectedRouter.device_type}
              </p>
            </div>
            <button
              onClick={fetchLiveData}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Fetching Data...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>Fetch Live Data</span>
                </span>
              )}
            </button>
          </div>
        )}
        
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} />
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" message="Fetching live data from router..." />
          </div>
        )}
        
        {/* Data Display */}
        {!loading && selectedRouter && (ospfData || bgpData || sfpInfo) && (
          <div className="space-y-6">
            {/* OSPF Neighbors */}
            {ospfData && (
              <OSPFNeighborsCard
                data={ospfData.data}
                router={ospfData.router}
                timestamp={ospfData.timestamp}
              />
            )}
            
            {/* BGP Summary */}
            {bgpData && (
              <BGPSummaryCard
                data={bgpData.data}
                router={bgpData.router}
                timestamp={bgpData.timestamp}
              />
            )}
            
            {/* SFP Monitoring */}
            {sfpInfo && sfpInfo.length > 0 && (
              <SFPMonitoringCard
                sfpInfo={sfpInfo}
                sfpStats={sfpStats}
                router={selectedRouter}
              />
            )}
          </div>
        )}
        
        {/* No Data State */}
        {!loading && selectedRouter && !ospfData && !bgpData && !sfpInfo && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📡</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready to Fetch Data
            </h3>
            <p className="text-gray-500">
              Click "Fetch Live Data" to retrieve monitoring information from {selectedRouter.hostname}
            </p>
          </div>
        )}
        
        {/* No Router Selected */}
        {!selectedRouter && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Select a Router
            </h3>
            <p className="text-gray-500">
              Choose a router from the dropdown above to start monitoring
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
