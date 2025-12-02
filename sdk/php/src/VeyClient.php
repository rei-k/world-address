<?php

namespace Vey;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class VeyClient
{
    private string $apiKey;
    private string $apiEndpoint;
    private Client $client;

    public function __construct(string $apiKey, string $apiEndpoint = 'https://api.vey.example')
    {
        $this->apiKey = $apiKey;
        $this->apiEndpoint = $apiEndpoint;
        $this->client = new Client([
            'base_uri' => $apiEndpoint,
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * Validate an address for a specific country.
     *
     * @param Address $address
     * @param string $countryCode
     * @return ValidationResult
     * @throws GuzzleException
     */
    public function validateAddress(Address $address, string $countryCode): ValidationResult
    {
        $response = $this->client->post('/validate', [
            'json' => [
                'address' => $address->toArray(),
                'countryCode' => $countryCode,
            ],
        ]);

        $data = json_decode($response->getBody()->getContents(), true);
        return ValidationResult::fromArray($data);
    }

    /**
     * Normalize an address to standard format.
     *
     * @param Address $address
     * @param string $countryCode
     * @return Address
     * @throws GuzzleException
     */
    public function normalizeAddress(Address $address, string $countryCode): Address
    {
        $response = $this->client->post('/normalize', [
            'json' => [
                'address' => $address->toArray(),
                'countryCode' => $countryCode,
            ],
        ]);

        $data = json_decode($response->getBody()->getContents(), true);
        return new Address($data);
    }

    /**
     * Encode address components into a PID.
     *
     * @param array $components
     * @return string
     */
    public function encodePID(array $components): string
    {
        $parts = [];
        
        foreach (['country', 'admin1', 'admin2', 'locality'] as $key) {
            if (isset($components[$key])) {
                $parts[] = $components[$key];
            }
        }
        
        return implode('-', $parts);
    }
}
