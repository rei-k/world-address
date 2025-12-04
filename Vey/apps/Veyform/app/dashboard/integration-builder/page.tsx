export default function IntegrationBuilderPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Integration Builder
      </h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Build Your Integration
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure how Veyform integrates with your application
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Integration Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integration Type
              </label>
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>E-commerce Platform</option>
                <option>Custom Application</option>
                <option>WordPress Plugin</option>
                <option>Shopify App</option>
              </select>
            </div>

            {/* Form Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Configuration
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-complete"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="auto-complete"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Enable address auto-complete
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="validation"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label
                    htmlFor="validation"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Enable real-time validation
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="veybook"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="veybook"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Enable Veybook integration
                  </label>
                </div>
              </div>
            </div>

            {/* Supported Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supported Countries
              </label>
              <select
                multiple
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                size={5}
              >
                <option value="JP">Japan (日本)</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CN">China (中国)</option>
                <option value="KR">South Korea (한국)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple countries
              </p>
            </div>

            {/* Generate Code */}
            <div className="pt-4 border-t border-gray-200">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Generate Integration Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Integration Code Preview
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100">
              <code>{`import { VeyformAddressForm } from '@vey/veyform';

function CheckoutPage() {
  return (
    <VeyformAddressForm
      apiKey="your-api-key"
      enableAutoComplete={true}
      enableValidation={true}
      countries={['JP', 'US', 'GB']}
      onSubmit={(address) => {
        console.log('Address:', address);
      }}
    />
  );
}`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
