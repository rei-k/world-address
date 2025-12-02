# Django integration
from django import forms
from vey import VeyClient, Address


class AddressForm(forms.Form):
    """Django form for address validation."""
    
    street = forms.CharField(max_length=255, required=True)
    city = forms.CharField(max_length=100, required=True)
    province = forms.CharField(max_length=100, required=False)
    postal_code = forms.CharField(max_length=20, required=True)
    country_code = forms.CharField(max_length=2, required=True)

    def __init__(self, *args, **kwargs):
        self.vey_client = kwargs.pop('vey_client', None)
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        
        if self.vey_client:
            address = Address(
                street=cleaned_data.get('street'),
                city=cleaned_data.get('city'),
                province=cleaned_data.get('province'),
                postal_code=cleaned_data.get('postal_code'),
            )
            
            country_code = cleaned_data.get('country_code')
            
            try:
                result = self.vey_client.validate_address(address, country_code)
                
                if not result.valid:
                    for error in result.errors:
                        self.add_error(None, error)
            except Exception as e:
                self.add_error(None, f"Validation failed: {str(e)}")
        
        return cleaned_data
