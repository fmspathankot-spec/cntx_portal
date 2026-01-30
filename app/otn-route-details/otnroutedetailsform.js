"use client";

import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import ExportButtons from '../components/ExportButtons';
import DataTable from '../components/DataTable';
import { FaNetworkWired } from 'react-icons/fa';

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

  // Prepare region options for dropdown
  const regionOptions = regions.map(region => ({
    value: region,
    label: `${region} (${regionCounts[region] || 0})`
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="OTN Routes"
        description={`Showing ${filteredRoutes.length} of ${allRoutes.length} routes`}
        icon={FaNetworkWired}
      />

      {/* Search, Filter & Export Section - Improved Layout */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Search and Filter Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* Search Bar - Takes more space */}
          <div className="lg:col-span-7">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search routes..."
            />
          </div>
          
          {/* Filter Dropdown - Takes less space */}
          <div className="lg:col-span-5">
            <FilterDropdown
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              label="Filter by Region"
              placeholder="All Regions"
              options={regionOptions}
            />
          </div>
        </div>

        {/* Export Buttons Row - Separate line, right aligned */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
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
          <ExportButtons
            onExportCSV={exportToCSV}
            onExportPDF={exportToPDF}
            disabled={filteredRoutes.length === 0}
            isExporting={isExporting}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredRoutes}
        isLoading={false}
        emptyMessage="No routes found matching your criteria"
      />
    </div>
  );
}
