"use client";

import PageHeader from '../components/PageHeader';
import { FaNetworkWired } from 'react-icons/fa';

export default function OtnPortStatusPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="OTN Port Status"
        description="Monitor OTN port status and availability"
        icon={FaNetworkWired}
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">OTN port status data will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">Configure your API endpoint in .env.local</p>
      </div>
    </div>
  );
}
