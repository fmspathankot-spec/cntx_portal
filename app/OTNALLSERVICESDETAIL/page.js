"use client";

import PageHeader from '../components/PageHeader';
import { FaNetworkWired } from 'react-icons/fa';

export default function OtnAllServicesDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="OTN All Service Data"
        description="Complete OTN service information"
        icon={FaNetworkWired}
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">All OTN service data will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">Configure your API endpoint in .env.local</p>
      </div>
    </div>
  );
}
