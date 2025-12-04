export default function ConnectPage() {
  const platforms = [
    {
      name: 'Shopify',
      description: 'Connect your Shopify store',
      icon: '🛒',
      status: 'available',
    },
    {
      name: 'WooCommerce',
      description: 'WordPress e-commerce integration',
      icon: '🔌',
      status: 'available',
    },
    {
      name: 'Magento',
      description: 'Enterprise e-commerce platform',
      icon: '🏢',
      status: 'available',
    },
    {
      name: 'BigCommerce',
      description: 'Cloud-based e-commerce solution',
      icon: '☁️',
      status: 'coming-soon',
    },
    {
      name: 'Salesforce Commerce',
      description: 'Enterprise commerce cloud',
      icon: '⚡',
      status: 'coming-soon',
    },
    {
      name: 'Custom API',
      description: 'Build custom integration',
      icon: '🔧',
      status: 'available',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Connect</h1>

      <div className="mb-6">
        <p className="text-gray-600">
          Connect Veyform to your e-commerce platform or application
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">{platform.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {platform.name}
                  </h3>
                  {platform.status === 'coming-soon' && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {platform.description}
              </p>
              <button
                className={`w-full px-4 py-2 rounded-md font-medium ${
                  platform.status === 'available'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={platform.status !== 'available'}
              >
                {platform.status === 'available' ? 'Connect' : 'Not Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Platforms */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Connected Platforms
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            No platforms connected yet. Click "Connect" above to get started.
          </div>
        </div>
      </div>
    </div>
  );
}
