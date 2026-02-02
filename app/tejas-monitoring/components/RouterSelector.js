"use client";

export default function RouterSelector({ routers, selectedRouter, onSelectRouter }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <label htmlFor="router-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Router
          </label>
          <select
            id="router-select"
            value={selectedRouter?.id || ''}
            onChange={(e) => {
              const router = routers.find(r => r.id === parseInt(e.target.value));
              onSelectRouter(router);
            }}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
          >
            <option value="">-- Select a router --</option>
            {routers.map((router) => (
              <option key={router.id} value={router.id}>
                {router.hostname} ({router.ip_address}) - {router.location || 'N/A'}
              </option>
            ))}
          </select>
        </div>
        
        {selectedRouter && (
          <div className="ml-6 flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedRouter.interface_count || 0}
              </div>
              <div className="text-xs text-gray-500">Interfaces</div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500">Last Reading</div>
              <div className="text-sm font-medium text-gray-900">
                {selectedRouter.last_reading_time 
                  ? new Date(selectedRouter.last_reading_time).toLocaleTimeString()
                  : 'Never'}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
