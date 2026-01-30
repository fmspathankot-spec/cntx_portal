"use client";

import PageHeader from '../components/PageHeader';
import { FaProjectDiagram } from 'react-icons/fa';

export default function ProjectTopologyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Topology"
        description="Network topology visualization"
        icon={FaProjectDiagram}
      />

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-600">Network topology diagram will be displayed here.</p>
        <p className="text-sm text-gray-500 mt-2">Configure your topology data source</p>
      </div>
    </div>
  );
}
