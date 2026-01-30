"use client";

import PageHeader from '../components/PageHeader';
import { FaClipboardList } from 'react-icons/fa';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and view network reports"
        icon={FaClipboardList}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Daily Report</h3>
          <p className="text-sm text-gray-600 mb-4">Generate daily network status report</p>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            Generate →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Weekly Report</h3>
          <p className="text-sm text-gray-600 mb-4">Generate weekly network summary</p>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            Generate →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all cursor-pointer">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Monthly Report</h3>
          <p className="text-sm text-gray-600 mb-4">Generate monthly analytics report</p>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
            Generate →
          </button>
        </div>
      </div>
    </div>
  );
}
