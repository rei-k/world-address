# VEY SDK (PHP)

PHP SDK for World Address YAML - Address validation and formatting for PHP applications.

## Installation

```bash
composer require vey/sdk
```

## Usage

### Basic Usage

```php
<?php

require 'vendor/autoload.php';

use Vey\VeyClient;
use Vey\Address;

// Initialize client
$client = new VeyClient('your-api-key');

// Create address
$address = new Address([
    'street' => '1-1 Chiyoda',
    'city' => 'Tokyo',
    'postalCode' => '100-0001'
]);

// Validate address
$result = $client->validateAddress($address, 'JP');

if ($result->valid) {
    echo "Address is valid!";
} else {
    echo "Errors: " . implode(', ', $result->errors);
}

// Normalize address
$normalized = $client->normalizeAddress($address, 'JP');
echo "Normalized: " . $normalized->street;

// Encode PID
$pid = $client->encodePID([
    'country' => 'JP',
    'admin1' => '13',
    'admin2' => '113'
]);
echo "PID: $pid"; // "JP-13-113"
```

### Laravel Integration

1. Register the service provider in `config/app.php`:

```php
'providers' => [
    // ...
    Vey\Laravel\VeyServiceProvider::class,
],
```

2. Publish the config:

```bash
php artisan vendor:publish --provider="Vey\Laravel\VeyServiceProvider"
```

3. Set your API key in `.env`:

```env
VEY_API_KEY=your-api-key
```

4. Use in your controllers:

```php
<?php

namespace App\Http\Controllers;

use Vey\VeyClient;
use Vey\Address;

class CheckoutController extends Controller
{
    private $veyClient;

    public function __construct(VeyClient $veyClient)
    {
        $this->veyClient = $veyClient;
    }

    public function validateAddress(Request $request)
    {
        $address = new Address($request->all());
        
        $result = $this->veyClient->validateAddress(
            $address,
            $request->input('country_code')
        );
        
        if ($result->valid) {
            return response()->json(['success' => true]);
        }
        
        return response()->json([
            'success' => false,
            'errors' => $result->errors
        ], 400);
    }
}
```

### Symfony Integration

```php
<?php

namespace App\Service;

use Vey\VeyClient;
use Vey\Address;

class AddressValidator
{
    private $veyClient;

    public function __construct(string $apiKey)
    {
        $this->veyClient = new VeyClient($apiKey);
    }

    public function validate(array $addressData, string $countryCode): array
    {
        $address = new Address($addressData);
        $result = $this->veyClient->validateAddress($address, $countryCode);
        
        return [
            'valid' => $result->valid,
            'errors' => $result->errors
        ];
    }
}
```

### WordPress Integration

See the [WordPress Plugin](../wordpress-plugin/README.md) for WordPress-specific integration.

## Features

- ✅ Address validation
- ✅ Address normalization
- ✅ PID encoding
- ✅ Laravel service provider
- ✅ Symfony integration
- ✅ PSR-4 autoloading
- ✅ Guzzle HTTP client

## License

MIT
