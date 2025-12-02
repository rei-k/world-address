# FastAPI integration
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from vey import VeyClient, Address as VeyAddress


class AddressModel(BaseModel):
    """Pydantic model for address."""
    
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class ValidationRequest(BaseModel):
    """Request model for validation."""
    
    address: AddressModel
    country_code: str


class ValidationResponse(BaseModel):
    """Response model for validation."""
    
    valid: bool
    errors: List[str]


def create_vey_router(vey_client: VeyClient) -> APIRouter:
    """Create FastAPI router for address validation.
    
    Args:
        vey_client: VEY client instance
        
    Returns:
        FastAPI router
    """
    router = APIRouter(prefix="/api/vey", tags=["address"])

    @router.post("/validate", response_model=ValidationResponse)
    async def validate_address(request: ValidationRequest):
        """Validate an address."""
        address = VeyAddress(
            street=request.address.street,
            city=request.address.city,
            province=request.address.province,
            postal_code=request.address.postal_code,
            country=request.address.country,
        )
        
        try:
            result = vey_client.validate_address(address, request.country_code)
            return ValidationResponse(valid=result.valid, errors=result.errors)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/normalize", response_model=AddressModel)
    async def normalize_address(request: ValidationRequest):
        """Normalize an address."""
        address = VeyAddress(
            street=request.address.street,
            city=request.address.city,
            province=request.address.province,
            postal_code=request.address.postal_code,
            country=request.address.country,
        )
        
        try:
            normalized = vey_client.normalize_address(address, request.country_code)
            return AddressModel(
                street=normalized.street,
                city=normalized.city,
                province=normalized.province,
                postal_code=normalized.postal_code,
                country=normalized.country,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return router
