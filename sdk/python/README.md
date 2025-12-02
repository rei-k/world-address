# VEY SDK (Python)

Python SDK for World Address YAML - Address validation and formatting for Python applications.

## Installation

```bash
pip install vey-sdk
```

### With Framework Support

```bash
# Django
pip install vey-sdk[django]

# Flask
pip install vey-sdk[flask]

# FastAPI
pip install vey-sdk[fastapi]
```

## Usage

### Basic Usage

```python
from vey import VeyClient, Address

# Initialize client
client = VeyClient(api_key="your-api-key")

# Create address
address = Address(
    street="1-1 Chiyoda",
    city="Tokyo",
    postal_code="100-0001"
)

# Validate address
result = client.validate_address(address, "JP")

if result.valid:
    print("Address is valid!")
else:
    print(f"Errors: {result.errors}")

# Normalize address
normalized = client.normalize_address(address, "JP")
print(f"Normalized: {normalized.street}")

# Encode PID
pid = client.encode_pid({
    "country": "JP",
    "admin1": "13",
    "admin2": "113"
})
print(f"PID: {pid}")  # "JP-13-113"
```

### Django Integration

```python
# settings.py
VEY_API_KEY = "your-api-key"

# forms.py
from vey.integrations.django import AddressForm
from vey import VeyClient

vey_client = VeyClient(api_key=settings.VEY_API_KEY)

class CheckoutForm(AddressForm):
    def __init__(self, *args, **kwargs):
        kwargs['vey_client'] = vey_client
        super().__init__(*args, **kwargs)

# views.py
def checkout(request):
    if request.method == 'POST':
        form = CheckoutForm(request.POST)
        if form.is_valid():
            # Address is valid
            return redirect('success')
    else:
        form = CheckoutForm()
    
    return render(request, 'checkout.html', {'form': form})
```

### Flask Integration

```python
from flask import Flask
from vey import VeyClient
from vey.integrations.flask import create_validation_blueprint

app = Flask(__name__)

# Initialize client
vey_client = VeyClient(api_key="your-api-key")

# Register blueprint
app.register_blueprint(create_validation_blueprint(vey_client))

# Or use as middleware
from vey.integrations.flask import validate_address_middleware

@app.route('/checkout', methods=['POST'])
@validate_address_middleware(vey_client)
def checkout():
    # Address is already validated
    return {"success": True}

if __name__ == '__main__':
    app.run()
```

### FastAPI Integration

```python
from fastapi import FastAPI
from vey import VeyClient
from vey.integrations.fastapi import create_vey_router

app = FastAPI()

# Initialize client
vey_client = VeyClient(api_key="your-api-key")

# Include router
app.include_router(create_vey_router(vey_client))

# Now you have:
# POST /api/vey/validate
# POST /api/vey/normalize

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Features

- ✅ Address validation
- ✅ Address normalization
- ✅ PID encoding
- ✅ Django integration
- ✅ Flask integration
- ✅ FastAPI integration
- ✅ Type hints
- ✅ Async support (FastAPI)

## License

MIT
