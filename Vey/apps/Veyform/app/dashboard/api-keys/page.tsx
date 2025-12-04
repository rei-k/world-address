'use client';

import { useState } from 'react';

export default function APIKeysPage() {
  const [showKey, setShowKey] = useState(false);

  const apiKeys = [
    {
      id: 1,
      name: 'Production Key',
      key: 'vey_live_1234567890abcdef',
      created: '2024-01-15',
      lastUsed: '2 hours ago',
      status: 'active',
    },
    {
      id: 2,
      name: 'Development Key',
      key: 'vey_test_abcdef1234567890',
      created: '2024-01-10',
      lastUsed: '1 day ago',
      status: 'active',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Create New Key
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your API Keys</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your API keys for accessing Veyform services
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {apiKey.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {showKey
                        ? apiKey.key
                        : apiKey.key.substring(0, 12) + '••••••••••••'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{apiKey.created}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{apiKey.lastUsed}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {apiKey.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Copy
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          🔒 Security Best Practices
        </h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
          <li>Never share your API keys publicly or commit them to source control</li>
          <li>Use environment variables to store API keys in your applications</li>
          <li>Rotate your keys regularly for enhanced security</li>
          <li>Use different keys for development and production environments</li>
          <li>Revoke keys immediately if you suspect they have been compromised</li>
        </ul>
      </div>
    </div>
  );
}
