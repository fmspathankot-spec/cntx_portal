"use client";

export default function SiteCard({ site, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">
          {site.site_name}
        </h3>
        <p className="text-sm text-blue-100 mt-1">
          {site.site_code}
        </p>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Location */}
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-600">
            {site.location || 'N/A'}
          </span>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {site.total_routes || 0}
            </div>
            <div className="text-xs text-blue-700 mt-1">Routes</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {site.total_ports || 0}
            </div>
            <div className="text-xs text-green-700 mt-1">Total Ports</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 col-span-2">
            <div className="text-lg font-bold text-purple-600">
              {parseFloat(site.avg_distance || 0).toFixed(2)} m
            </div>
            <div className="text-xs text-purple-700 mt-1">Avg Distance</div>
          </div>
        </div>
        
        {/* View Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Click to view routes</span>
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
