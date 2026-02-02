"use client";

import { useState, useEffect } from 'react';
import SiteCard from './components/SiteCard';
import RouteTable from './components/RouteTable';
import SearchBar from './components/SearchBar';
import StatsCards from './components/StatsCards';

export default function InventoryDashboard() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('sites'); // 'sites' or 'routes'

  // Fetch sites
  useEffect(() => {
    fetchSites();
  }, []);

  // Fetch routes when site selected
  useEffect(() => {
    if (selectedSite) {
      fetchRoutes(selectedSite.site_code);
    }
  }, [selectedSite]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory/sites');
      const data = await res.json();
      setSites(data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async (siteCode) => {
    try {
      const res = await fetch(`/api/inventory/routes?site_code=${siteCode}`);
      const data = await res.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term) {
      try {
        const res = await fetch(`/api/inventory/routes?search=${term}`);
        const data = await res.json();
        setRoutes(data);
        setViewMode('routes');
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      setViewMode('sites');
      setSelectedSite(null);
      setRoutes([]);
    }
  };

  const handleSiteClick = (site) => {
    setSelectedSite(site);
    setViewMode('routes');
    setSearchTerm('');
  };

  const handleBackToSites = () => {
    setSelectedSite(null);
    setViewMode('sites');
    setRoutes([]);
    setSearchTerm('');
  };

  // Calculate stats
  const totalSites = sites.length;
  const totalRoutes = sites.reduce((sum, site) => sum + (site.total_routes || 0), 0);
  const totalDistance = sites.reduce((sum, site) => sum + parseFloat(site.total_distance || 0), 0);
  const avgDistance = totalRoutes > 0 ? (totalDistance / totalRoutes).toFixed(2) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
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
                📡 Network Inventory
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                RFTS Nodes - Site-based Management
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {selectedSite && (
                <button
                  onClick={handleBackToSites}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Sites</span>
                </button>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards 
          totalSites={totalSites}
          totalRoutes={totalRoutes}
          totalDistance={totalDistance}
          avgDistance={avgDistance}
        />

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar 
            searchTerm={searchTerm}
            onSearch={handleSearch}
          />
        </div>

        {/* Content Area */}
        {viewMode === 'sites' ? (
          // Sites Grid View
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                All Sites ({totalSites})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map((site) => (
                <SiteCard 
                  key={site.id}
                  site={site}
                  onClick={() => handleSiteClick(site)}
                />
              ))}
            </div>
          </div>
        ) : (
          // Routes Table View
          <div>
            <div className="mb-4">
              {selectedSite ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-900">
                        {selectedSite.site_name}
                      </h2>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedSite.site_code} • {selectedSite.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">
                        {selectedSite.total_routes}
                      </div>
                      <div className="text-sm text-blue-700">Routes</div>
                    </div>
                  </div>
                </div>
              ) : (
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results ({routes.length})
                </h2>
              )}
            </div>
            
            <RouteTable routes={routes} />
          </div>
        )}
      </div>
    </div>
  );
}
