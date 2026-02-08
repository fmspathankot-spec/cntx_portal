"use client";

import { useState, useEffect } from 'react';
import ServiceEditModal from './components/ServiceEditModal';

export default function AFNETDashboard() {
  const [serviceType, setServiceType] = useState('maan'); // 'maan' or 'madm'
  const [selectedAR, setSelectedAR] = useState(null);
  const [services, setServices] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [arStatistics, setArStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Fetch data on mount and when service type changes
  useEffect(() => {
    fetchData();
  }, [serviceType]);

  // Fetch services when AR selected
  useEffect(() => {
    if (selectedAR) {
      fetchServices(selectedAR);
    }
  }, [selectedAR, serviceType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/afnet?serviceType=${serviceType}`);
      const data = await res.json();
      
      if (data.success) {
        setStatistics(data.statistics);
        setArStatistics(data.arStatistics);
      }
    } catch (error) {
      console.error('Error fetching AFNET data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (arNumber) => {
    try {
      const res = await fetch(`/api/inventory/afnet?serviceType=${serviceType}&arNumber=${arNumber}`);
      const data = await res.json();
      
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleARClick = (arNumber) => {
    setSelectedAR(arNumber);
  };

  const handleBackToARs = () => {
    setSelectedAR(null);
    setServices([]);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  const handleServiceUpdated = () => {
    if (selectedAR) {
      fetchServices(selectedAR);
    }
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AFNET inventory...</p>
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
                🌐 AFNET Service Details
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                AFNET MAAN & MADM Service Management
              </p>
            </div>
            
            {selectedAR && (
              <button
                onClick={handleBackToARs}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to ARs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Service Type Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Service Type:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setServiceType('maan');
                  setSelectedAR(null);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  serviceType === 'maan'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                MAAN
              </button>
              <button
                onClick={() => {
                  setServiceType('madm');
                  setSelectedAR(null);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  serviceType === 'madm'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                MADM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {!selectedAR ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Services</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {statistics.total_services || 0}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Total ARs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {statistics.total_ars || 0}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Network Types</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {statistics.network_types || 0}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* AR Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {arStatistics.map((ar) => (
                <div
                  key={ar.ar_number}
                  onClick={() => handleARClick(ar.ar_number)}
                  className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="text-white">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl font-bold">{ar.ar_number}</h2>
                      <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                        <span className="text-2xl font-bold">{ar.service_count}</span>
                        <span className="text-sm ml-2">services</span>
                      </div>
                    </div>
                    <p className="text-white text-opacity-90 mb-6">
                      AFNET {serviceType.toUpperCase()} Service Details
                    </p>
                    <div className="flex items-center text-white text-opacity-90">
                      <span className="text-sm font-medium">View Services</span>
                      <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Services Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedAR} - {serviceType.toUpperCase()} Services ({services.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source Station
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source Node Port
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sink Station
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sink IP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sink Node Port
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
                  {services.map((service, index) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{service.link_name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          service.network_type === 'PKT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {service.source_station || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{service.source_ip || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{service.source_node_port || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{service.sink_station || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{service.sink_ip || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{service.sink_node_port || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs break-words whitespace-normal">
                          {service.remarks || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditService(service)}
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
            
            {services.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No services available for this AR
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedService && (
        <ServiceEditModal
          service={selectedService}
          serviceType={serviceType}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedService(null);
          }}
          onUpdate={handleServiceUpdated}
        />
      )}
    </div>
  );
}
