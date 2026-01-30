"use client";

import PageHeader from '../components/PageHeader';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function OtnServiceFailureDetailsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="OTN Services Status"
        description="Monitor OTN service failures and issues"
        icon={FaExclamationTriangle}
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">OTN service failure details will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">Configure your API endpoint in .env.local</p>
      </div>
    </div>
  );
}
