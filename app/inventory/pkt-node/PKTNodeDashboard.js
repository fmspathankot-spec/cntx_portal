"use client";

import { useState, useEffect } from 'react';
import PortEditModal from './components/PortEditModal';

export default function PKTNodeDashboard() {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [ports, setPorts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterPortType, setFilterPortType] = useState('');
  
  // Service filter state
  const [serviceFilter, setServiceFilter] = useState(null);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);

  // Fetch nodes on mount
  useEffect(() => {
    fetchNodes();
    fetchFilters();
  }, []);

  // Fetch ports when node selected
  useEffect(() => {
    if (selectedNode && selectedNode.id !== 'ALL') {
      fetchPorts(selectedNode.id);
    }
  }, [selectedNode, searchTerm, filterDestination, filterPortType]);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory/pkt-node');
      const data = await res.json();
      
      if (data.success) {
        setNodes(data.nodes);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPorts = async (nodeId) => {
    try {
      let url = `/api/inventory/pkt-node?nodeId=${nodeId}`;
      
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterDestination) url += `&destination=${filterDestination}`;
      if (filterPortType) url += `&portType=${filterPortType}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setPorts(data.ports);
      }
    } catch (error) {
      console.error('Error fetching ports:', error);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await fetch('/api/inventory/pkt-node/filters');
      const data = await res.json();
      
      if (data.success) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setSearchTerm('');
    setFilterDestination('');
    setFilterPortType('');
    setServiceFilter(null);
  };

  const handleBackToNodes = () => {
    setSelectedNode(null);
    setPorts([]);
    setSearchTerm('');
    setFilterDestination('');
    setFilterPortType('');
    setServiceFilter(null);
  };

  const handleEditPort = (port) => {
    setSelectedPort(port);
    setEditModalOpen(true);
  };

  const handleSavePort = (updatedPort) => {
    setPorts(ports.map(p => p.id === updatedPort.id ? updatedPort : p));
    fetchNodes();
    alert('Port updated successfully!');
  };

  // Handle service card click
  const handleServiceCardClick = (filterType) => {
    setServiceFilter(filterType);
    setSelectedNode({ id: 'ALL', node_name: 'All Nodes' });
    fetchAllPortsWithFilter(filterType);
  };

  const fetchAllPortsWithFilter = async (filterType) => {
    try {
      // For now, fetch all ports and filter client-side
      // You can create a dedicated API endpoint later
      const res = await fetch('/api/inventory/pkt-node');
      const data = await res.json();
      
      if (data.success) {
        // Get all ports from all nodes
        const allPortsPromises = data.nodes.map(node =>
          fetch(`/api/inventory/pkt-node?nodeId=${node.id}`).then(r => r.json())
        );
        
        const allPortsResults = await Promise.all(allPortsPromises);
        let allPorts = [];
        
        allPortsResults.forEach(result => {
          if (result.success) {
            allPorts = [...allPorts, ...result.ports];
          }
        });
        
        // Filter based on type
        let filteredPorts = allPorts;
        
        if (filterType === 'all') {
          filteredPorts = allPorts.filter(p => p.service_name && p.service_name.trim() !== '');
        } else if (['10G', '100G', '1G', 'STM-1'].includes(filterType)) {
          filteredPorts = allPorts.filter(p => 
            p.port_type === filterType && 
            p.service_name && 
            p.service_name.trim() !== ''
          );
        }
        
        setPorts(filteredPorts);
      }
    } catch (error) {
      console.error('Error fetching filtered ports:', error);
    }
  };

  // Calculate service statistics
  const calculateServiceStats = () => {
    const stats = {
      totalServices: 0,
      portTypes: {}
    };

    stats.totalServices = statistics.live_services || 0;

    if (statistics.port_type_counts) {
      stats.portTypes = statistics.port_type_counts;
    }

    return stats;
  };

  const serviceStats = calculateServiceStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PKT Node Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  PKT Node Inventory
                </h1>
                <p className="mt-1 text-sm text-purple-100">
                  Network Node Port Management System
                </p>
              </div>
            </div>
            
            {selectedNode && (
              <button
                onClick={handleBackToNodes}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center space-x-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Nodes</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!selectedNode ? (
          <>
            {/* Statistics Row 1 - Node Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Nodes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.total_nodes || 0}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Ports</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.total_ports || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Used Ports</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{statistics.used_ports || 0}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Free Ports</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{statistics.free_ports || 0}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Row 2 - Service Stats (CLICKABLE) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              {/* Live Services Card */}
              <button
                onClick={() => handleServiceCardClick('all')}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-100">Live Services</p>
                    <p className="text-3xl font-bold mt-2">{serviceStats.totalServices}</p>
                    <p className="text-xs text-indigo-200 mt-1">Click to view all</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* 100G Ports Card */}
              <button
                onClick={() => handleServiceCardClick('100G')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">100G Ports</p>
                    <p className="text-3xl font-bold mt-2">{serviceStats.portTypes['100G'] || 0}</p>
                    <p className="text-xs text-blue-200 mt-1">Click to view</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* 10G Ports Card */}
              <button
                onClick={() => handleServiceCardClick('10G')}
                className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-cyan-100">10G Ports</p>
                    <p className="text-3xl font-bold mt-2">{serviceStats.portTypes['10G'] || 0}</p>
                    <p className="text-xs text-cyan-200 mt-1">Click to view</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* 1G Ports Card */}
              <button
                onClick={() => handleServiceCardClick('1G')}
                className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-100">1G Ports</p>
                    <p className="text-3xl font-bold mt-2">{serviceStats.portTypes['1G'] || 0}</p>
                    <p className="text-xs text-teal-200 mt-1">Click to view</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* STM-1 Ports Card */}
              <button
                onClick={() => handleServiceCardClick('STM-1')}
                className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-100">STM-1 Ports</p>
                    <p className="text-3xl font-bold mt-2">{serviceStats.portTypes['STM-1'] || 0}</p>
                    <p className="text-xs text-emerald-200 mt-1">Click to view</p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {node.node_name}
                          </h3>
                          <p className="text-sm text-gray-500">{node.node_ip}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {node.total_ports} ports
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Used Ports</span>
                        <span className="text-sm font-semibold text-green-600">{node.used_ports}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Free Ports</span>
                        <span className="text-sm font-semibold text-orange-600">{node.free_ports}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(node.used_ports / node.total_ports) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {((node.used_ports / node.total_ports) * 100).toFixed(1)}% utilized
                      </p>
                    </div>

                    {node.location && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Location:</span> {node.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Port Details View
          <div>
            {/* Node Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedNode.node_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {serviceFilter ? `Showing ${serviceFilter} services` : selectedNode.node_ip}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">{ports.length}</p>
                  <p className="text-sm text-gray-600">
                    {serviceFilter ? 'Filtered Ports' : 'Total Ports'}
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            {!serviceFilter && selectedNode.id !== 'ALL' && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by service, port, IP..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination
                    </label>
                    <select
                      value={filterDestination}
                      onChange={(e) => setFilterDestination(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Destinations</option>
                      {filters.destinations?.map((dest) => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Port Type
                    </label>
                    <select
                      value={filterPortType}
                      onChange={(e) => setFilterPortType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      {filters.portTypes?.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Ports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SR.NO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Port Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source Port
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dest. Port
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ports.map((port) => (
                      <tr key={port.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{port.sr_no}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            port.port_type === '100G' ? 'bg-blue-100 text-blue-800' :
                            port.port_type === '10G' ? 'bg-cyan-100 text-cyan-800' :
                            port.port_type === '1G' ? 'bg-teal-100 text-teal-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {port.port_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${port.service_name ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-gray-900">{port.source_port_no}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{port.destination_ip || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{port.destination_location || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{port.destination_port_no || '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs break-words whitespace-normal">
                            {port.service_name || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs break-words whitespace-normal">
                            {port.remarks || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditPort(port)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {ports.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No ports found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterDestination || filterPortType || serviceFilter
                      ? 'Try adjusting your filters'
                      : 'No ports available for this node'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedPort && (
        <PortEditModal
          port={selectedPort}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedPort(null);
          }}
          onSave={handleSavePort}
        />
      )}
    </div>
  );
}
