"use client";

import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageHeader from '../components/PageHeader';
import { FaNetworkWired, FaSearch, FaFilter } from 'react-icons/fa';

export default function OtnRouteDetailsForm({ initialData }) {
  const allRoutes = initialData || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Get unique regions from the routes
  const regions = useMemo(() => {
    if (!allRoutes || !Array.isArray(allRoutes)) return [];
    const regionSet = new Set();
    allRoutes.forEach(route => {
      const region = route.region_name || route.region;
      if (region) {
        regionSet.add(region);
      }
    });
    return Array.from(regionSet).sort();
  }, [allRoutes]);

  // Filter routes by search term and region
  const filteredRoutes = useMemo(() => {
    if (!allRoutes || !Array.isArray(allRoutes)) return [];

    return allRoutes.filter(route => {
      if (!route) return false;

      // Filter by region if selected
      if (selectedRegion) {
        const regionFields = ['region', 'region_name', 'location', 'city', 'area'];
        const hasMatchingRegion = regionFields.some(field => {
          const value = route[field];
          return typeof value === 'string' &&
                 value.toLowerCase().includes(selectedRegion.toLowerCase());
        });
        if (!hasMatchingRegion) return false;
      }

      // Filter by search term
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

  // Count routes per region
  const regionCounts = useMemo(() => {
    const counts = {};
    if (!allRoutes || !Array.isArray(allRoutes)) return counts;

    allRoutes.forEach(route => {
      const region = route.region_name || route.region;
      if (region) {
        counts[region] = (counts[region] || 0) + 1;
      }
    });
    return counts;
  }, [allRoutes]);

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
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: 245,
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
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

  // Define table columns
  const columns = [
    { 
      header: 'SL NO', 
      accessor: 'id',
      render: (value, row, index) => index + 1
    },
    { header: 'REGION', accessor: 'region' },
    { header: 'ROUTE NAME', accessor: 'route_name' },
    { header: 'END-A', accessor: 'endA' },
    { header: 'END-B', accessor: 'endB' },
    { header: 'LINK_NUM', accessor: 'link_number' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="OTN Routes"
        description={`Showing ${filteredRoutes.length} of ${allRoutes.length} routes`}
        icon={FaNetworkWired}
      />

      {/* Search and Filter - Side by Side in One Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar - 70% width on desktop */}
        <div className="flex-1 md:flex-[7]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search routes..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Filter Dropdown - 30% width on desktop */}
        <div className="flex-1 md:flex-[3]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer text-gray-700"
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

      {/* Results and Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-lg shadow-sm p-4">
        {/* Results Count */}
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-800">{filteredRoutes.length}</span> routes found
          {selectedRegion && (
            <span className="ml-2">
              in <span className="font-semibold text-blue-600">{selectedRegion}</span>
            </span>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={filteredRoutes.length === 0 || isExporting}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
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
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
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
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
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
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-lg font-medium">No routes found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
