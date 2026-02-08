"use client";

import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const router = useRouter();

  const inventoryModules = [
    {
      id: 'nokia-otn',
      name: 'Nokia OTN',
      description: '20AX200 & 20MX80 Cards Management',
      icon: '📡',
      color: 'from-blue-500 to-blue-600',
      route: '/inventory/nokia-otn'
    },
    {
      id: 'afnet',
      name: 'AFNET',
      description: 'AFNET MAAN & MADM Service Details',
      icon: '🌐',
      color: 'from-green-500 to-green-600',
      route: '/inventory/afnet'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📦 Equipment Inventory
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Network Equipment & Service Management
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inventoryModules.map((module) => (
            <div
              key={module.id}
              onClick={() => router.push(module.route)}
              className={`bg-gradient-to-r ${module.color} rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105`}
            >
              <div className="text-white">
                <div className="text-6xl mb-4">{module.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{module.name}</h2>
                <p className="text-white text-opacity-90">{module.description}</p>
                <div className="mt-6 flex items-center text-white text-opacity-90">
                  <span className="text-sm font-medium">View Details</span>
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
