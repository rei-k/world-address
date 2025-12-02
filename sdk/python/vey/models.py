from dataclasses import dataclass
from typing import Optional, List


@dataclass
class Address:
    """Address data model."""
    
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert address to dictionary."""
        return {
            "street": self.street,
            "city": self.city,
            "province": self.province,
            "postalCode": self.postal_code,
            "country": self.country,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Address":
        """Create address from dictionary."""
        return cls(
            street=data.get("street"),
            city=data.get("city"),
            province=data.get("province"),
            postal_code=data.get("postalCode"),
            country=data.get("country"),
        )


@dataclass
class ValidationResult:
    """Validation result model."""
    
    valid: bool
    errors: List[str]

    @classmethod
    def from_dict(cls, data: dict) -> "ValidationResult":
        """Create validation result from dictionary."""
        return cls(
            valid=data.get("valid", False),
            errors=data.get("errors", []),
        )
