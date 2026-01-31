"use client";

import PageHeader from '../components/PageHeader';
import { FaNetworkWired } from 'react-icons/fa';

export default function MaanPingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="MAAN Node Status"
        description="Metro Area Access Network node monitoring"
        icon={FaNetworkWired}
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">MAAN node status data will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">Configure your API endpoint in .env.local</p>
      </div>
    </div>
  );
}
