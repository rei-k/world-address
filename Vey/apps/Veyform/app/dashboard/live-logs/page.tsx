'use client';

import { useState, useEffect } from 'react';

export default function LiveLogsPage() {
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Address validation request received',
      details: { country: 'JP', postalCode: '100-0001' },
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: 'success',
      message: 'Address created successfully',
      details: { addressId: 'addr_123456' },
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 10000).toISOString(),
      level: 'warning',
      message: 'Rate limit approaching for API key',
      details: { apiKey: 'vey_live_****', usage: '90%' },
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 15000).toISOString(),
      level: 'error',
      message: 'Invalid postal code format',
      details: { country: 'US', postalCode: 'INVALID' },
    },
  ]);

  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('all');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'success':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const filteredLogs =
    filter === 'all' ? logs : logs.filter((log) => log.level === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Live Logs</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isLive ? 'Live' : 'Paused'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-md font-medium ${
              isLive
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {['all', 'info', 'success', 'warning', 'error'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Display */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Real-time Event Stream
          </h2>
        </div>
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No logs match the selected filter
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <span className="text-xl mr-3">{getLevelIcon(log.level)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getLevelColor(
                          log.level
                        )}`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{log.message}</p>
                    {log.details && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 flex justify-end space-x-3">
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          Export as JSON
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          Export as CSV
        </button>
      </div>
    </div>
  );
}
