"use client";

import PageHeader from '../components/PageHeader';
import { FaServer } from 'react-icons/fa';

export default function CpanLinkStatusPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CPAN Link Status"
        description="Customer Premises Access Network link monitoring"
        icon={FaServer}
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">CPAN link status data will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">Configure your API endpoint in .env.local</p>
      </div>
    </div>
  );
}
