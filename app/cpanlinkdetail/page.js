"use client";

import PageHeader from '../components/PageHeader';
import { FaServer } from 'react-icons/fa';

export default function CpanLinkDetailPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="CPAN Link Detail"
        description="Detailed CPAN link information"
        icon={FaServer}
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">CPAN link details will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">Configure your API endpoint in .env.local</p>
      </div>
    </div>
  );
}
