"use client";

import { useState, useEffect } from 'react';

export default function RouterInterfacesTest() {
  const [routerId, setRouterId] = useState('16');
  const [interfaces, setInterfaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tableInfo, setTableInfo] = useState(null);
  
  // Form state
  const [newInterface, setNewInterface] = useState({
    interface_name: '',
    interface_type: 'SFP',
    description: '',
    is_active: true
  });

  // Check table structure
  const checkTable = async () => {
    try {
      setLoading(true);
      setMessage('Checking table structure...');
      
      const res = await fetch('/api/setup/check-table');
      const data = await res.json();
      
      if (data.success) {
        setTableInfo(data);
        if (data.isValid) {
          setMessage('✅ Table structure is valid');
        } else {
          setMessage(`⚠️ Missing columns: ${data.missingColumns.join(', ')}`);
        }
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Migrate table
  const migrateTable = async () => {
    try {
      setLoading(true);
      setMessage('Migrating table...');
      
      const res = await fetch('/api/setup/migrate-table', {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}\n${data.migrations.join('\n')}`);
        checkTable();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Setup database
  const setupDatabase = async () => {
    if (!confirm('This will DROP and recreate the table. Continue?')) return;
    
    try {
      setLoading(true);
      setMessage('Creating table...');
      
      const res = await fetch('/api/setup/router-interfaces', {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        checkTable();
        fetchInterfaces();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch interfaces
  const fetchInterfaces = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/routers/${routerId}/interfaces`);
      const data = await res.json();
      
      if (data.success) {
        setInterfaces(data.interfaces);
        setMessage(`✅ Loaded ${data.count} interfaces`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add interface
  const addInterface = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const res = await fetch(`/api/routers/${routerId}/interfaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInterface)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setNewInterface({
          interface_name: '',
          interface_type: 'SFP',
          description: '',
          is_active: true
        });
        fetchInterfaces();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete interface
  const deleteInterface = async (interfaceId) => {
    if (!confirm('Are you sure you want to delete this interface?')) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/routers/${routerId}/interfaces?interfaceId=${interfaceId}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchInterfaces();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (iface) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/routers/${routerId}/interfaces`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: iface.id,
          is_active: !iface.is_active
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage(`✅ Interface ${iface.is_active ? 'deactivated' : 'activated'}`);
        fetchInterfaces();
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTable();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Router Interfaces Management
          </h1>
          <p className="text-gray-600">
            Manage router interfaces for Tejas monitoring
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 whitespace-pre-line ${
            message.includes('✅') ? 'bg-green-50 text-green-800' : 
            message.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
            'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Table Info */}
        {tableInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Table Status</h2>
            <div className="space-y-2">
              <p><strong>Exists:</strong> {tableInfo.tableExists ? '✅ Yes' : '❌ No'}</p>
              {tableInfo.tableExists && (
                <>
                  <p><strong>Valid:</strong> {tableInfo.isValid ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Columns:</strong> {tableInfo.columnNames?.join(', ')}</p>
                  {tableInfo.missingColumns?.length > 0 && (
                    <p className="text-red-600">
                      <strong>Missing:</strong> {tableInfo.missingColumns.join(', ')}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Setup Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Database Setup</h2>
          <div className="flex gap-4">
            <button
              onClick={checkTable}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Table'}
            </button>
            
            <button
              onClick={migrateTable}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Migrating...' : 'Migrate Table (Add Missing Columns)'}
            </button>
            
            <button
              onClick={setupDatabase}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Fresh Setup (DROP & CREATE)'}
            </button>
          </div>
        </div>

        {/* Router Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Select Router</h2>
          <input
            type="number"
            value={routerId}
            onChange={(e) => setRouterId(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Router ID"
          />
          <button
            onClick={fetchInterfaces}
            disabled={loading}
            className="ml-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Load Interfaces
          </button>
        </div>

        {/* Add Interface Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Interface</h2>
          <form onSubmit={addInterface} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Interface Name</label>
                <input
                  type="text"
                  value={newInterface.interface_name}
                  onChange={(e) => setNewInterface({...newInterface, interface_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., 100g 1/5/11"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Interface Type</label>
                <select
                  value={newInterface.interface_type}
                  onChange={(e) => setNewInterface({...newInterface, interface_type: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="SFP">SFP</option>
                  <option value="Ethernet">Ethernet</option>
                  <option value="Optical">Optical</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <input
                type="text"
                value={newInterface.description}
                onChange={(e) => setNewInterface({...newInterface, description: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Optional description"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Interface'}
            </button>
          </form>
        </div>

        {/* Interfaces List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">
              Configured Interfaces ({interfaces.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interface Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interfaces.map((iface) => (
                  <tr key={iface.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {iface.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {iface.interface_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {iface.interface_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {iface.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        iface.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {iface.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => toggleActive(iface)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {iface.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteInterface(iface.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
