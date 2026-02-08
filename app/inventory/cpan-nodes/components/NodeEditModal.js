"use client";

import { useState } from 'react';

export default function NodeEditModal({ node, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    node_detail: node.node_detail || '',
    phase: node.phase || '',
    node_type: node.node_type || '',
    ba_name: node.ba_name || '',
    circle_name: node.circle_name || '',
    ne_type: node.ne_type || '',
    ring_name: node.ring_name || '',
    node_ip: node.node_ip || '',
    node_id: node.node_id || '',
    remarks: node.remarks || ''
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
      const res = await fetch('/api/inventory/cpan-nodes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: node.id,
          ...formData
        }),
      });

      const data = await res.json();

      if (data.success) {
        onUpdate();
        onClose();
      } else {
        setError(data.error || 'Failed to update node');
      }
    } catch (err) {
      setError('An error occurred while updating the node');
      console.error('Error updating node:', err);
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
            Edit CPAN Node
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
            {/* Node Detail */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node Detail
              </label>
              <input
                type="text"
                name="node_detail"
                value={formData.node_detail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phase
              </label>
              <select
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Phase</option>
                <option value="PH_1">PH_1</option>
                <option value="PH_2">PH_2</option>
                <option value="ADD_ON">ADD_ON</option>
              </select>
            </div>

            {/* Node Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node Type
              </label>
              <select
                name="node_type"
                value={formData.node_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
              </select>
            </div>

            {/* BA Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BA Name
              </label>
              <input
                type="text"
                name="ba_name"
                value={formData.ba_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Circle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Circle Name
              </label>
              <input
                type="text"
                name="circle_name"
                value={formData.circle_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* NE Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NE Type
              </label>
              <input
                type="text"
                name="ne_type"
                value={formData.ne_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ring Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ring Name
              </label>
              <input
                type="text"
                name="ring_name"
                value={formData.ring_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Node IP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node IP
              </label>
              <input
                type="text"
                name="node_ip"
                value={formData.node_ip}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Node ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Node ID
              </label>
              <input
                type="text"
                name="node_id"
                value={formData.node_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
