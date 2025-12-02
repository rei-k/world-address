import requests
from typing import Dict, Optional
from .models import Address, ValidationResult


class VeyClient:
    """Client for VEY address validation API."""
    
    def __init__(
        self,
        api_key: str,
        api_endpoint: str = "https://api.vey.example"
    ):
        """Initialize VEY client.
        
        Args:
            api_key: API key for authentication
            api_endpoint: API endpoint URL
        """
        self.api_key = api_key
        self.api_endpoint = api_endpoint
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        })

    def validate_address(
        self,
        address: Address,
        country_code: str
    ) -> ValidationResult:
        """Validate an address for a specific country.
        
        Args:
            address: Address to validate
            country_code: ISO country code (e.g., 'JP', 'US')
            
        Returns:
            ValidationResult with valid flag and errors
            
        Raises:
            requests.RequestException: If API request fails
        """
        response = self.session.post(
            f"{self.api_endpoint}/validate",
            json={
                "address": address.to_dict(),
                "countryCode": country_code,
            }
        )
        response.raise_for_status()
        
        return ValidationResult.from_dict(response.json())

    def normalize_address(
        self,
        address: Address,
        country_code: str
    ) -> Address:
        """Normalize an address to standard format.
        
        Args:
            address: Address to normalize
            country_code: ISO country code
            
        Returns:
            Normalized address
            
        Raises:
            requests.RequestException: If API request fails
        """
        response = self.session.post(
            f"{self.api_endpoint}/normalize",
            json={
                "address": address.to_dict(),
                "countryCode": country_code,
            }
        )
        response.raise_for_status()
        
        return Address.from_dict(response.json())

    def encode_pid(self, components: Dict[str, str]) -> str:
        """Encode address components into a PID.
        
        Args:
            components: Dictionary of address components
            
        Returns:
            PID string
        """
        parts = []
        
        for key in ["country", "admin1", "admin2", "locality"]:
            if key in components:
                parts.append(components[key])
        
        return "-".join(parts)
