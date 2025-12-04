'use client';

export default function MonitorPage() {
  const metrics = [
    {
      label: 'Total Requests (24h)',
      value: '12,456',
      change: '+12%',
      positive: true,
    },
    {
      label: 'Success Rate',
      value: '99.8%',
      change: '+0.2%',
      positive: true,
    },
    {
      label: 'Avg Response Time',
      value: '145ms',
      change: '-15ms',
      positive: true,
    },
    {
      label: 'Error Rate',
      value: '0.2%',
      change: '-0.1%',
      positive: true,
    },
  ];

  const recentRequests = [
    {
      id: 1,
      endpoint: '/api/v1/address/validate',
      status: 200,
      responseTime: '123ms',
      timestamp: '2024-01-15 14:32:45',
    },
    {
      id: 2,
      endpoint: '/api/v1/address/create',
      status: 201,
      responseTime: '156ms',
      timestamp: '2024-01-15 14:31:22',
    },
    {
      id: 3,
      endpoint: '/api/v1/address/validate',
      status: 400,
      responseTime: '89ms',
      timestamp: '2024-01-15 14:30:15',
    },
    {
      id: 4,
      endpoint: '/api/v1/countries/JP',
      status: 200,
      responseTime: '45ms',
      timestamp: '2024-01-15 14:28:33',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Monitor</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              {metric.label}
            </p>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold text-gray-900">
                {metric.value}
              </p>
              <span
                className={`text-sm font-medium ${
                  metric.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Request Volume (Last 24 Hours)
          </h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent API Requests
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {request.endpoint}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status >= 200 && request.status < 300
                          ? 'bg-green-100 text-green-800'
                          : request.status >= 400
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {request.responseTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {request.timestamp}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
