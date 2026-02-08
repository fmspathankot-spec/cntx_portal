"use client";

import { useState, useEffect } from 'react';

export default function PortEditModal({ port, onClose, onSave }) {
  const [formData, setFormData] = useState({
    port_type: '',
    source_port_no: '',
    destination_ip: '',
    destination_location: '',
    destination_port_no: '',
    service_name: '',
    remarks: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (port) {
      setFormData({
        port_type: port.port_type || '',
        source_port_no: port.source_port_no || '',
        destination_ip: port.destination_ip || '',
        destination_location: port.destination_location || '',
        destination_port_no: port.destination_port_no || '',
        service_name: port.service_name || '',
        remarks: port.remarks || ''
      });
    }
  }, [port]);

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

    try {
      const res = await fetch('/api/inventory/pkt-node/ports', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: port.id,
          ...formData
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSave(data.port);
        onClose();
      } else {
        alert('Error updating port: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating port:', error);
      alert('Error updating port');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Edit Port - {port.source_port_no}
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
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Port Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port Type *
              </label>
              <select
                name="port_type"
                value={formData.port_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Port Type</option>
                <option value="100G">100G</option>
                <option value="10G">10G</option>
                <option value="1G">1G</option>
                <option value="STM-1">STM-1</option>
              </select>
            </div>

            {/* Source Port No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Port No *
              </label>
              <input
                type="text"
                name="source_port_no"
                value={formData.source_port_no}
                onChange={handleChange}
                required
                placeholder="e.g., ETH-1-4-1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Destination IP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination IP Address
              </label>
              <input
                type="text"
                name="destination_ip"
                value={formData.destination_ip}
                onChange={handleChange}
                placeholder="e.g., 10.125.0.146"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Destination Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Location
              </label>
              <input
                type="text"
                name="destination_location"
                value={formData.destination_location}
                onChange={handleChange}
                placeholder="e.g., PKT-TX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Destination Port No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Port No
              </label>
              <input
                type="text"
                name="destination_port_no"
                value={formData.destination_port_no}
                onChange={handleChange}
                placeholder="e.g., ETH-1-5-10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name
              </label>
              <input
                type="text"
                name="service_name"
                value={formData.service_name}
                onChange={handleChange}
                placeholder="e.g., PKT-CNN-C1 TO PKT-TX-C1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes or remarks..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
