"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { debounce } from 'lodash';
import PageHeader from '../components/PageHeader';
import { FaNetworkWired, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useOtnRouteStatus } from '../hooks/useOtnRouteStatus';

/**
 * OTN Route Status Form - Client Component
 * 
 * API Fields:
 * - region: Region name
 * - linkname: Link/Route name
 * - section: Section/Area
 * - begin_time: When the issue started
 * - report_time: When it was reported
 * - down_time: Total downtime duration
 * 
 * Features:
 * - Display route status in table
 * - Search functionality
 * - Filter by region and section
 * - Pagination
 * - CSV/PDF export
 * - Auto-refresh every 1 minute
 * - Loading and error states
 */
export default function OtnRouteStatusForm({ initialData }) {
  // ============================================
  // REACT QUERY - Data Fetching with Caching
  // ============================================
  
  const { data, isLoading, error, refetch, isFetching } = useOtnRouteStatus(initialData);
  const allRoutes = data || [];

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // ============================================
  // DEBOUNCED SEARCH (300ms delay)
  // ============================================
  
  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);

    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchInput]);

  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  // Unique regions
  const regions = useMemo(() => {
    if (!allRoutes || !Array.isArray(allRoutes)) return [];
    
    const regionSet = new Set();
    allRoutes.forEach(route => {
      if (route.region) regionSet.add(route.region);
    });
    
    return Array.from(regionSet).sort();
  }, [allRoutes]);

  // Unique sections
  const sections = useMemo(() => {
    if (!allRoutes || !Array.isArray(allRoutes)) return [];
    
    const sectionSet = new Set();
    allRoutes.forEach(route => {
      if (route.section) sectionSet.add(route.section);
    });
    
    return Array.from(sectionSet).sort();
  }, [allRoutes]);

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    if (!allRoutes || !Array.isArray(allRoutes)) return [];

    return allRoutes.filter(route => {
      if (!route) return false;

      // Region filter
      if (selectedRegion) {
        if (!route.region || !route.region.toLowerCase().includes(selectedRegion.toLowerCase())) {
          return false;
        }
      }

      // Section filter
      if (selectedSection) {
        if (!route.section || !route.section.toLowerCase().includes(selectedSection.toLowerCase())) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const searchableFields = [
          route.region,
          route.linkname,
          route.section,
          route.begin_time,
          route.report_time,
          route.down_time
        ].filter(value => value);
        
        const hasMatch = searchableFields.some(field =>
          String(field).toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [allRoutes, selectedRegion, selectedSection, searchTerm]);

  // Paginated routes
  const paginatedRoutes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRoutes.slice(startIndex, endIndex);
  }, [filteredRoutes, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const maxDisplayPage = Math.min(totalPages, 25);
  const isPageLimitReached = totalPages > 25;
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredRoutes.length);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handlePageChange = (newPage) => {
    if (newPage === '...') return;
    if (newPage > maxDisplayPage) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setCurrentPage(1);
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSection('');
    setCurrentPage(1);
  };

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================
  
  const exportToCSV = () => {
    if (filteredRoutes.length === 0) return;

    const headers = ['#', 'Region', 'Link Name', 'Section', 'Begin Time', 'Report Time', 'Down Time'];
    const csvContent = [
      headers.join(','),
      ...filteredRoutes.map((route, index) => [
        index + 1,
        `"${(route.region || '').replace(/"/g, '""')}"`,
        `"${(route.linkname || '').replace(/"/g, '""')}"`,
        `"${(route.section || '').replace(/"/g, '""')}"`,
        `"${(route.begin_time || '').replace(/"/g, '""')}"`,
        `"${(route.report_time || '').replace(/"/g, '""')}"`,
        `"${(route.down_time || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `otn-route-status-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (filteredRoutes.length === 0 || isExporting) return;

    setIsExporting(true);

    try {
      const doc = new jsPDF('landscape');
      
      // Title
      doc.setFontSize(16);
      doc.text('OTN Route Status Report', 14, 15);
      
      // Date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Total Routes: ${filteredRoutes.length}`, 14, 27);

      // Table
      const headers = [['#', 'Region', 'Link Name', 'Section', 'Begin Time', 'Report Time', 'Down Time']];
      const data = filteredRoutes.map((route, index) => [
        index + 1,
        route.region || '-',
        route.linkname || '-',
        route.section || '-',
        route.begin_time || '-',
        route.report_time || '-',
        route.down_time || '-'
      ]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 32,
        headStyles: { 
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        styles: { 
          fontSize: 7,
          cellPadding: 1.5,
          halign: 'left'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30 },
          4: { cellWidth: 35 },
          5: { cellWidth: 35 },
          6: { cellWidth: 25 }
        },
        didDrawPage: function(data) {
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.text(
            `Page ${pageNumber}`,
            pageSize.width / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });

      doc.save(`otn-route-status-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================
  // PAGINATION HELPER
  // ============================================
  
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const maxTotalPages = Math.min(totalPages, 25);
    
    if (maxTotalPages <= maxPagesToShow) {
      return Array.from({ length: maxTotalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const halfWay = Math.floor(maxPagesToShow / 2);
    
    if (currentPage <= halfWay) {
      for (let i = 1; i <= maxPagesToShow - 1; i++) pages.push(i);
      pages.push('...');
      pages.push(maxTotalPages);
    } else if (currentPage >= maxTotalPages - halfWay) {
      pages.push(1);
      pages.push('...');
      for (let i = maxTotalPages - (maxPagesToShow - 2); i <= maxTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(maxTotalPages);
    }

    return pages;
  };

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-700 text-xl font-semibold">Loading route status...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-l-4 border-red-600 rounded-lg p-6 shadow-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-900">
                Unable to Load Route Status
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {error.message || 'An unexpected error occurred while fetching route status data.'}
              </p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  
  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6 pb-24">
      {/* Page Header */}
      <div className="relative bg-white rounded-xl shadow-md p-6">
        <PageHeader
          title="OTN Route Status"
          description={`Real-time monitoring • Showing ${filteredRoutes.length} of ${allRoutes.length} routes`}
          icon={FaNetworkWired}
        />
        
        {/* Refreshing Indicator */}
        {isFetching && (
          <div className="absolute top-6 right-6 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600 font-medium">Refreshing...</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Bar */}
        <div className="md:col-span-5">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search region, link name, section..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Region Filter */}
        <div className="md:col-span-3">
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">All Regions</option>
              {regions.map((region, index) => (
                <option key={index} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Filter */}
        <div className="md:col-span-3">
          <div className="relative">
            <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedSection}
              onChange={handleSectionChange}
              className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">All Sections</option>
              {sections.map((section, index) => (
                <option key={index} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || selectedRegion || selectedSection) && (
          <div className="md:col-span-1 flex items-center">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
              title="Clear all filters"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Summary and Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-xl shadow-md p-5">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-blue-600 text-lg">
            {filteredRoutes.length}
          </span>
          <span className="text-gray-600">
            {filteredRoutes.length === 1 ? 'route' : 'routes'} found
          </span>
          
          {(searchTerm || selectedRegion || selectedSection) && (
            <span className="text-sm text-gray-500">
              (filtered from {allRoutes.length} total)
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToCSV}
            disabled={filteredRoutes.length === 0}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
          >
            📊 Export CSV
          </button>
          
          <button
            onClick={exportToPDF}
            disabled={filteredRoutes.length === 0 || isExporting}
            className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
          >
            {isExporting ? '⏳ Generating...' : '📄 Export PDF'}
          </button>
        </div>
      </div>

      {/* Page Limit Warning */}
      {isPageLimitReached && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> Showing first 25 pages only ({25 * itemsPerPage} items). 
                Use filters or increase items per page to view more data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Link Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Begin Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Report Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Down Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRoutes.length > 0 ? (
                paginatedRoutes.map((route, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {startItem + index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {route.region || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {route.linkname || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {route.section || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-blue-500" />
                        {route.begin_time || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-green-500" />
                        {route.report_time || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {route.down_time ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                          <FaExclamationTriangle className="mr-1" />
                          {route.down_time}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FaNetworkWired className="text-6xl mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No routes found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRoutes.length > 0 && (
          <div className="bg-gray-50 px-6 py-5 border-t-2 border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Items per page */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700 font-medium">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{startItem}</span> to{' '}
                <span className="font-semibold">{endItem}</span> of{' '}
                <span className="font-semibold">{filteredRoutes.length}</span> results
              </div>

              {/* Page navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                >
                  First
                </button>
                
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FaChevronLeft />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    disabled={page === '...'}
                    className={`px-4 py-2 border-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : page === '...'
                        ? 'border-transparent cursor-default'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === maxDisplayPage}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <FaChevronRight />
                </button>
                
                <button
                  onClick={() => handlePageChange(maxDisplayPage)}
                  disabled={currentPage === maxDisplayPage}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
