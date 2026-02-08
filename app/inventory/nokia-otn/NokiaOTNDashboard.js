"use client";

import { useState, useEffect } from 'react';
import PortEditModal from './components/PortEditModal';

export default function NokiaOTNDashboard() {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [ports, setPorts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterServiceType, setFilterServiceType] = useState('');
  
  // Service filter state
  const [serviceFilter, setServiceFilter] = useState(null); // 'all', '10G', '2.5G', '1G', 'LAN', 'WAN'
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);

  // Fetch cards on mount
  useEffect(() => {
    fetchCards();
    fetchFilters();
  }, []);

  // Fetch ports when card selected
  useEffect(() => {
      if (selectedCard && selectedCard.card_number !== 'ALL') {
          fetchPorts(selectedCard.card_number);
    }
  }, [selectedCard, searchTerm, filterDestination, filterServiceType]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory/nokia-otn');
      const data = await res.json();
      
      if (data.success) {
        setCards(data.cards);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPorts = async (cardNumber) => {
    try {
      let url = `/api/inventory/nokia-otn?cardNumber=${cardNumber}`;
      
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filterDestination) url += `&destination=${filterDestination}`;
      if (filterServiceType) url += `&serviceType=${filterServiceType}`;
      
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
      const res = await fetch('/api/inventory/nokia-otn/filters');
      const data = await res.json();
      
      if (data.success) {
        setFilters(data.filters);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setSearchTerm('');
    setFilterDestination('');
    setFilterServiceType('');
    setServiceFilter(null);
  };

  const handleBackToCards = () => {
    setSelectedCard(null);
    setPorts([]);
    setSearchTerm('');
    setFilterDestination('');
    setFilterServiceType('');
    setServiceFilter(null);
  };

  // Handle service card clicks
  const handleServiceCardClick = async (filterType, filterValue) => {
    try {
      setLoading(true);
      setServiceFilter(filterType);
      
      let url = '/api/inventory/nokia-otn/all-ports?hasService=true';
      
      if (filterType === '10G' || filterType === '2.5G' || filterType === '1G') {
        url += `&portType=${filterType}`;
      } else if (filterType === 'LAN' || filterType === 'WAN') {
        url += `&serviceType=${filterType}`;
      }
      
      console.log('Fetching filtered ports:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Filtered ports response:', data);
      
      if (data.success) {
        setPorts(data.ports);
        setSelectedCard({ 
          card_number: 'ALL',
          card_type: `${filterType} Services`
        });
      }
    } catch (error) {
      console.error('Error fetching filtered ports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPort = (port) => {
    setSelectedPort(port);
    setEditModalOpen(true);
  };

  const handlePortUpdated = () => {
    // Refresh data after port update
    if (selectedCard && selectedCard.card_number !== 'ALL') {
      fetchPorts(selectedCard.card_number);
    }
    fetchCards(); // Refresh statistics
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Nokia OTN inventory...</p>
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
                📡 Nokia OTN Inventory
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                20AX200 & 20MX80 Cards Management
              </p>
            </div>
            
            {selectedCard && (
              <button
                onClick={handleBackToCards}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Cards</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedCard ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Cards */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cards</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {statistics.total_cards || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Ports */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Ports</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {statistics.total_ports || 0}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Used Ports */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Used Ports</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {statistics.used_ports || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {statistics.utilizationPercent}% utilized
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Free Ports */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Free Ports</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {statistics.free_ports || 0}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Statistics - Clickable Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Service Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Live Services */}
                <div 
                  onClick={() => handleServiceCardClick('all')}
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm font-medium opacity-90">Live Services</p>
                      <p className="text-4xl font-bold mt-2">
                        {statistics.live_services || 0}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 10G Ports */}
                <div 
                  onClick={() => handleServiceCardClick('10G')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm font-medium opacity-90">10G Ports</p>
                      <p className="text-4xl font-bold mt-2">
                        {statistics.port_type_counts?.['10G'] || 0}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2.5G Ports */}
                <div 
                  onClick={() => handleServiceCardClick('2.5G')}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm font-medium opacity-90">2.5G Ports</p>
                      <p className="text-4xl font-bold mt-2">
                        {statistics.port_type_counts?.['2.5G'] || 0}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 1G Ports */}
                <div 
                  onClick={() => handleServiceCardClick('1G')}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm font-medium opacity-90">1G Ports</p>
                      <p className="text-4xl font-bold mt-2">
                        {statistics.port_type_counts?.['1G'] || 0}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* LAN Services */}
                <div 
                  onClick={() => handleServiceCardClick('LAN')}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm font-medium opacity-90">LAN Services</p>
                      <p className="text-4xl font-bold mt-2">
                        {statistics.lan_count || 0}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* WAN Services */}
                <div 
                  onClick={() => handleServiceCardClick('WAN')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <p className="text-sm font-medium opacity-90">WAN Services</p>
                      <p className="text-4xl font-bold mt-2">
                        {statistics.wan_count || 0}
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                All Cards ({cards.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Card {card.card_number}
                          </h3>
                          <p className="text-sm text-gray-500">{card.card_model}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {card.total_ports} ports
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Used Ports</span>
                        <span className="text-sm font-semibold text-green-600">{card.used_ports}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Free Ports</span>
                        <span className="text-sm font-semibold text-orange-600">{card.free_ports}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(card.used_ports / card.total_ports) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-1">
                        {((card.used_ports / card.total_ports) * 100).toFixed(1)}% utilized
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>
        ) : (
          // Port Details View
          <div>
            {/* Card Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCard.card_number === 'ALL' ? 'All Cards' : `Card ${selectedCard.card_number}`}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {serviceFilter ? `Showing ${serviceFilter} services` : selectedCard.card_model}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{ports.length}</p>
                  <p className="text-sm text-gray-600">
                    {serviceFilter ? 'Filtered Ports' : 'Total Ports'}
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            {!serviceFilter && (
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
                      placeholder="Search by service name, port..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination
                    </label>
                    <select
                      value={filterDestination}
                      onChange={(e) => setFilterDestination(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Destinations</option>
                      {filters.destinations?.map((dest) => (
                        <option key={dest} value={dest}>{dest}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select
                      value={filterServiceType}
                      onChange={(e) => setFilterServiceType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      {filters.serviceTypes?.map((type) => (
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
                        Sr. No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Port Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source Port No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dest Port No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Type
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
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${port.service_name ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium text-gray-900">{port.sr_no}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            port.port_type === '10G' ? 'bg-blue-100 text-blue-800' :
                            port.port_type === '2.5G' ? 'bg-cyan-100 text-cyan-800' :
                            'bg-teal-100 text-teal-800'
                          }`}>
                            {port.port_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900">{port.source_port_no || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{port.destination_location || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900">{port.destination_port_no || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{port.service_name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {port.service_type ? (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              port.service_type === 'LAN' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {port.service_type}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs break-words whitespace-normal">
                            {port.remarks || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditPort(port)}
                            className="text-blue-600 hover:text-blue-900"
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
                    {searchTerm || filterDestination || filterServiceType
                      ? 'Try adjusting your filters'
                      : 'No ports available for this card'}
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
          onUpdate={handlePortUpdated}
        />
      )}
    </div>
  );
}
