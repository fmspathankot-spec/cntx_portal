"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { debounce } from 'lodash';
import PageHeader from '../components/PageHeader';
import { FaNetworkWired, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useOtnRoutes } from '../hooks/useOtnRoutes';

export default function OtnRouteDetailsForm({ initialData }) {
  // ============================================
  // REACT QUERY - Data Fetching with Caching
  // ============================================
  const { data, isLoading, error, refetch, isFetching } = useOtnRoutes(initialData);
  const allRoutes = data || [];

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

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
      const region = route.region_name || route.region;
      if (region) regionSet.add(region);
    });
    return Array.from(regionSet).sort();
  }, [allRoutes]);

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    if (!allRoutes || !Array.isArray(allRoutes)) return [];

    return allRoutes.filter(route => {
      if (!route) return false;

      // Region filter
      if (selectedRegion) {
        const regionFields = ['region', 'region_name', 'location', 'city', 'area'];
        const hasMatchingRegion = regionFields.some(field => {
          const value = route[field];
          return typeof value === 'string' &&
                 value.toLowerCase().includes(selectedRegion.toLowerCase());
        });
        if (!hasMatchingRegion) return false;
      }

      // Search filter
      if (searchTerm) {
        const searchableFields = Object.values(route).filter(
          value => typeof value === 'string' || typeof value === 'number'
        );
        const hasMatch = searchableFields.some(field =>
          String(field).toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [allRoutes, selectedRegion, searchTerm]);

  // Paginated routes
  const paginatedRoutes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRoutes.slice(startIndex, endIndex);
  }, [filteredRoutes, currentPage, itemsPerPage]);

  // Pagination info
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredRoutes.length);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7; // Show max 7 page buttons
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Region counts
  const regionCounts = useMemo(() => {
    const counts = {};
    if (!allRoutes || !Array.isArray(allRoutes)) return counts;
    allRoutes.forEach(route => {
      const region = route.region_name || route.region;
      if (region) counts[region] = (counts[region] || 0) + 1;
    });
    return counts;
  }, [allRoutes]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handlePageChange = (newPage) => {
    if (newPage === '...') return;
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

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedRegion('');
    setCurrentPage(1);
  };

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================

  const exportToCSV = () => {
    if (filteredRoutes.length === 0) return;

    const headers = ['#', 'Region', 'ROUTE Name', 'END-A', 'END-B', 'LINK_NUM'];
    const csvContent = [
      headers.join(','),
      ...filteredRoutes.map((route, index) => [
        index + 1,
        `"${(route.region || route.region_name || '').replace(/"/g, '""')}"`,
        `"${(route.route_name || route.name || route.link_name || '').replace(/"/g, '""')}"`,
        `"${(route.endA || '').replace(/"/g, '""')}"`,
        `"${(route.endB || '').replace(/"/g, '""')}"`,
        `"${(route.link_number || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `otn-routes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (filteredRoutes.length === 0 || isExporting) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF('landscape');
      const headers = [['#', 'Region', 'ROUTE Name', 'END-A', 'END-B', 'LINK_NUM']];
      const data = filteredRoutes.map((route, index) => [
        index + 1,
        route.region || route.region_name || '-',
        route.route_name || route.name || route.link_name || '-',
        route.endA || '-',
        route.endB || '-',
        route.link_number || '-'
      ]);

      autoTable(doc, {
        head: headers,
        body: data,
        startY: 20,
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: 249 },
        styles: { fontSize: 8, cellPadding: 2 },
        didDrawPage: function(data) {
          doc.setFontSize(10);
          doc.text('OTN Routes', 14, 10);
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.setFontSize(8);
          doc.text(`Page ${pageNumber}`, pageSize.width / 2, pageHeight - 10, { align: 'center' });
        }
      });

      doc.save(`otn-routes-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const columns = [
    { header: 'SL NO', accessor: 'id', render: (value, row, index) => startItem + index },
    { header: 'REGION', accessor: 'region' },
    { header: 'ROUTE NAME', accessor: 'route_name' },
    { header: 'END-A', accessor: 'endA' },
    { header: 'END-B', accessor: 'endB' },
    { header: 'LINK_NUM', accessor: 'link_number' }
  ];

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-700 text-xl font-semibold">Loading routes...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-100">
        <div className="max-w-md w-full bg-white border-l-4 border-red-600 rounded-lg p-6 shadow-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-900">Unable to Load Routes</h3>
              <p className="mt-2 text-sm text-red-700">{error.message || 'An unexpected error occurred'}</p>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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
    <div className="space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      {/* Page Header with Refresh Indicator */}
      <div className="relative bg-white rounded-xl shadow-md p-6">
        <PageHeader
          title="OTN Routes"
          description={`Showing ${filteredRoutes.length} of ${allRoutes.length} routes`}
          icon={FaNetworkWired}
        />
        {isFetching && (
          <div className="absolute top-6 right-6 flex items-center space-x-2 text-blue-600 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
            <span className="font-medium">Refreshing...</span>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 md:flex-[7]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search routes..."
              className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-gray-700"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex-1 md:flex-[3]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="w-full pl-11 pr-10 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer text-gray-700 font-medium"
            >
              <option value="">All Regions</option>
              {regions.map((region, index) => (
                <option key={index} value={region}>
                  {region} ({regionCounts[region] || 0})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results, Filters, and Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl shadow-md p-5">
        <div className="flex items-center space-x-4">
          {/* Results Count */}
          <div className="text-sm text-gray-700">
            <span className="font-bold text-blue-600 text-lg">{filteredRoutes.length}</span> 
            <span className="ml-1">routes found</span>
            {selectedRegion && (
              <span className="ml-2">
                in <span className="font-semibold text-blue-600">{selectedRegion}</span>
              </span>
            )}
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedRegion) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={filteredRoutes.length === 0 || isExporting}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Export CSV
          </button>
          
          <button
            onClick={exportToPDF}
            disabled={filteredRoutes.length === 0 || isExporting}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedRoutes.length > 0 ? (
                paginatedRoutes.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className="hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100"
                  >
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {column.render 
                          ? column.render(row[column.accessor], row, rowIndex)
                          : row[column.accessor] || '-'
                        }
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-xl font-semibold text-gray-700">No routes found</p>
                      <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {filteredRoutes.length > 0 && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 border-t-2 border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items per page */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
                <span className="text-sm font-medium text-gray-700">per page</span>
              </div>

              {/* Page info */}
              <div className="text-sm font-medium text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to{' '}
                <span className="font-bold text-blue-600">{endItem}</span> of{' '}
                <span className="font-bold text-blue-600">{filteredRoutes.length}</span> routes
              </div>

              {/* Page numbers with navigation */}
              <div className="flex items-center space-x-1">
                {/* First button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="First page"
                >
                  First
                </button>

                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center"
                  title="Previous page"
                >
                  <FaChevronLeft className="mr-1" />
                  Prev
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      disabled={page === '...'}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-md'
                          : page === '...'
                          ? 'text-gray-400 cursor-default'
                          : 'border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center"
                  title="Next page"
                >
                  Next
                  <FaChevronRight className="ml-1" />
                </button>

                {/* Last button */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Last page"
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
