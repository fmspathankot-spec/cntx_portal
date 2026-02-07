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
    if (selectedCard) {
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
  };

  const handleBackToCards = () => {
    setSelectedCard(null);
    setPorts([]);
    setSearchTerm('');
    setFilterDestination('');
    setFilterServiceType('');
  };

  const handleEditPort = (port) => {
    setSelectedPort(port);
    setEditModalOpen(true);
  };

  const handleSavePort = (updatedPort) => {
    // Update ports list
    setPorts(ports.map(p => p.id === updatedPort.id ? updatedPort : p));
    
    // Refresh cards to update statistics
    fetchCards();
    
    // Show success message
    alert('Port updated successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Nokia OTN Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Nokia OTN Inventory
                </h1>
                <p className="mt-1 text-sm text-blue-100">
                  20AX200 & 20MX80 Cards - Port Management System
                </p>
              </div>
            </div>
            
            {selectedCard && (
              <button
                onClick={handleBackToCards}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2 font-medium"
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
          // Cards Grid View
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cards</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.total_cards || 0}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
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
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* Cards Grid */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                All Cards ({cards.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card) => {
                const utilization = ((card.used_ports / card.total_ports) * 100).toFixed(0);
                
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{card.card_number}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          {card.card_model}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Ports:</span>
                          <span className="font-semibold text-gray-900">{card.total_ports}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Used:</span>
                          <span className="font-semibold text-green-600">{card.used_ports}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Free:</span>
                          <span className="font-semibold text-orange-600">{card.free_ports}</span>
                        </div>

                        {/* Utilization Bar */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Utilization</span>
                            <span className="font-semibold">{utilization}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                utilization > 75 ? 'bg-red-500' :
                                utilization > 50 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${utilization}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📍 {card.location}</span>
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            {card.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Port Details View
          <>
            {/* Card Info Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCard.card_number}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCard.card_model} • {selectedCard.port_type} • {selectedCard.location}
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{selectedCard.total_ports}</div>
                    <div className="text-sm text-gray-600">Total Ports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{selectedCard.used_ports}</div>
                    <div className="text-sm text-gray-600">Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{selectedCard.free_ports}</div>
                    <div className="text-sm text-gray-600">Free</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search service, location, remarks..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
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

            {/* Ports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dest. Port</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ports.map((port) => (
                      <tr 
                        key={port.id}
                        className={`hover:bg-gray-50 ${!port.destination_location ? 'bg-gray-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${port.destination_location ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium text-gray-900">{port.sr_no}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{port.source_port_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {port.destination_location ? (
                            <span className="text-sm font-medium text-blue-600">{port.destination_location}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {port.destination_port_no || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {port.service_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {port.service_type ? (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              port.service_type === 'LAN' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {port.service_type}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {port.remarks || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            port.destination_location ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {port.destination_location ? 'In Use' : 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleEditPort(port)}
                            className="text-blue-600 hover:text-blue-900 font-medium flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <PortEditModal
        port={selectedPort}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPort(null);
        }}
        onSave={handleSavePort}
      />
    </div>
  );
}
