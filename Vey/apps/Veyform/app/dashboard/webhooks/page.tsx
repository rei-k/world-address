'use client';

export default function WebhooksPage() {
  const webhooks = [
    {
      id: 1,
      url: 'https://api.example.com/webhooks/veyform',
      events: ['address.created', 'address.updated'],
      status: 'active',
      lastTriggered: '2 hours ago',
    },
    {
      id: 2,
      url: 'https://myapp.com/api/veyform-webhook',
      events: ['address.validated'],
      status: 'active',
      lastTriggered: '1 day ago',
    },
  ];

  const availableEvents = [
    'address.created',
    'address.updated',
    'address.deleted',
    'address.validated',
    'form.submitted',
    'integration.connected',
    'integration.disconnected',
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Create Webhook
        </button>
      </div>

      {/* Active Webhooks */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Webhooks
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage webhook endpoints for event notifications
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded mr-2">
                      {webhook.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last triggered: {webhook.lastTriggered}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-mono text-gray-900 break-all">
                      {webhook.url}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex flex-col space-y-2">
                  <button className="text-sm text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-900">
                    Test
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Events */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Available Events
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Events you can subscribe to via webhooks
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableEvents.map((event) => (
              <div
                key={event}
                className="flex items-center p-3 border border-gray-200 rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-sm font-mono text-gray-900">{event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Webhook Documentation */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          📚 Webhook Documentation
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Payload Format:</strong> All webhooks send JSON payloads with
            a consistent structure.
          </p>
          <p>
            <strong>Security:</strong> Webhooks include a signature header for
            verification.
          </p>
          <p>
            <strong>Retry Policy:</strong> Failed webhooks are retried up to 3
            times with exponential backoff.
          </p>
          <div className="mt-4 bg-white border border-gray-300 rounded p-4">
            <p className="font-mono text-xs text-gray-800">
              {`{
  "event": "address.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "addr_123456",
    "country": "JP",
    "postalCode": "100-0001"
  }
}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
