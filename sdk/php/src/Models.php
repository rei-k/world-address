<?php

namespace Vey;

class Address
{
    public ?string $street = null;
    public ?string $city = null;
    public ?string $province = null;
    public ?string $postalCode = null;
    public ?string $country = null;

    public function __construct(array $data = [])
    {
        $this->street = $data['street'] ?? null;
        $this->city = $data['city'] ?? null;
        $this->province = $data['province'] ?? null;
        $this->postalCode = $data['postalCode'] ?? null;
        $this->country = $data['country'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'street' => $this->street,
            'city' => $this->city,
            'province' => $this->province,
            'postalCode' => $this->postalCode,
            'country' => $this->country,
        ];
    }
}

class ValidationResult
{
    public bool $valid;
    public array $errors;

    public function __construct(bool $valid, array $errors = [])
    {
        $this->valid = $valid;
        $this->errors = $errors;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            $data['valid'] ?? false,
            $data['errors'] ?? []
        );
    }
}
