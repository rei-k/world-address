# Flask integration
from flask import request, jsonify
from functools import wraps
from vey import VeyClient, Address


def validate_address_middleware(vey_client: VeyClient):
    """Flask middleware for address validation."""
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.method == 'POST' and request.is_json:
                data = request.get_json()
                
                if 'address' in data and 'countryCode' in data:
                    address = Address.from_dict(data['address'])
                    country_code = data['countryCode']
                    
                    try:
                        result = vey_client.validate_address(address, country_code)
                        
                        if not result.valid:
                            return jsonify({
                                'error': 'Invalid address',
                                'details': result.errors
                            }), 400
                    except Exception as e:
                        return jsonify({
                            'error': 'Validation failed',
                            'details': str(e)
                        }), 500
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator


def create_validation_blueprint(vey_client: VeyClient):
    """Create Flask blueprint for address validation."""
    from flask import Blueprint
    
    bp = Blueprint('vey', __name__, url_prefix='/api/vey')
    
    @bp.route('/validate', methods=['POST'])
    def validate():
        data = request.get_json()
        
        address = Address.from_dict(data['address'])
        country_code = data['countryCode']
        
        result = vey_client.validate_address(address, country_code)
        
        return jsonify({
            'valid': result.valid,
            'errors': result.errors
        })
    
    @bp.route('/normalize', methods=['POST'])
    def normalize():
        data = request.get_json()
        
        address = Address.from_dict(data['address'])
        country_code = data['countryCode']
        
        normalized = vey_client.normalize_address(address, country_code)
        
        return jsonify(normalized.to_dict())
    
    return bp
