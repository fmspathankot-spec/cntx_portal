"use client";

import { useState } from 'react';

export default function ServiceEditModal({ service, serviceType, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    link_name: service.link_name || '',
    network_type: service.network_type || '',
    source_station: service.source_station || '',
    source_ip: service.source_ip || '',
    source_node_port: service.source_node_port || '',
    sink_station: service.sink_station || '',
    sink_ip: service.sink_ip || '',
    sink_node_port: service.sink_node_port || '',
    remarks: service.remarks || ''
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/inventory/afnet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: service.id,
          serviceType,
          ...formData
        }),
      });

      const data = await res.json();

      if (data.success) {
        onUpdate();
        onClose();
      } else {
        setError(data.error || 'Failed to update service');
      }
    } catch (err) {
      setError('An error occurred while updating the service');
      console.error('Error updating service:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            Edit Service - {service.ar_number}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Link Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Name
              </label>
              <input
                type="text"
                name="link_name"
                value={formData.link_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Network Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network Type
              </label>
              <select
                name="network_type"
                value={formData.network_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="PKT">PKT</option>
                <option value="GDP">GDP</option>
              </select>
            </div>

            {/* Source Station */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Station
              </label>
              <input
                type="text"
                name="source_station"
                value={formData.source_station}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Source IP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source IP
              </label>
              <input
                type="text"
                name="source_ip"
                value={formData.source_ip}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Source Node Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Node Port
              </label>
              <input
                type="text"
                name="source_node_port"
                value={formData.source_node_port}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Sink Station */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sink Station
              </label>
              <input
                type="text"
                name="sink_station"
                value={formData.sink_station}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Sink IP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sink IP
              </label>
              <input
                type="text"
                name="sink_ip"
                value={formData.sink_ip}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Sink Node Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sink Node Port
              </label>
              <input
                type="text"
                name="sink_node_port"
                value={formData.sink_node_port}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
