# API Documentation

This document provides comprehensive documentation for all API endpoints in the Next.js example application.

## Table of Contents

- [Authentication](#authentication)
  - [NextAuth (Session-based)](#nextauth-session-based)
  - [JWT Authentication](#jwt-authentication)
  - [API Key Authentication](#api-key-authentication)
  - [OAuth2 (GitHub)](#oauth2-github)
- [Address API](#address-api)
- [Webhook API](#webhook-api)
- [Middleware](#middleware)
- [Error Handling](#error-handling)

## Authentication

The application supports multiple authentication methods:

### NextAuth (Session-based)

NextAuth.js provides session-based authentication with multiple providers.

#### Available Providers

1. **Credentials Provider** (Demo)
2. **GitHub OAuth2 Provider**

#### Demo Users

For testing the credentials provider:

```
Email: demo@example.com
Password: demo123

Email: admin@example.com
Password: admin123
```

#### Session Management

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// In API route or Server Component
const session = await getServerSession(authOptions);

if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### JWT Authentication

JSON Web Token (JWT) authentication for stateless API authentication.

#### Login

**Endpoint:** `POST /api/auth/jwt/login`

**Request:**
```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "demo@example.com",
    "name": "Demo User"
  },
  "expiresIn": "24h"
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

#### Verify Token

**Endpoint:** `GET /api/auth/jwt/verify`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response (Valid):**
```json
{
  "valid": true,
  "user": {
    "userId": "1",
    "email": "demo@example.com"
  }
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "Invalid or expired token"
}
```

#### Using JWT in Requests

```bash
# Login
curl -X POST http://localhost:3000/api/auth/jwt/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}'

# Use token
curl -X GET http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### API Key Authentication

Simple API key authentication for machine-to-machine communication.

#### Verify API Key

**Endpoint:** `GET /api/auth/apikey`

**Headers:**
```
x-api-key: demo_api_key_12345
```

**Response (Valid):**
```json
{
  "valid": true,
  "message": "API key is valid"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "error": "Invalid API key"
}
```

**Rate Limit:** 100 requests per minute per IP

#### Demo API Keys

```
demo_api_key_12345
prod_api_key_67890
```

#### Using API Key

```bash
curl -X GET http://localhost:3000/api/addresses \
  -H "x-api-key: demo_api_key_12345"
```

### OAuth2 (GitHub)

OAuth2 authentication using GitHub as the identity provider.

#### Setup

1. Create a GitHub OAuth App:
   - Go to https://github.com/settings/developers
   - Click "New OAuth App"
   - Set Homepage URL: `http://localhost:3000`
   - Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

2. Add credentials to `.env.local`:
```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

3. Sign in via NextAuth:
```typescript
import { signIn } from 'next-auth/react';

// Trigger GitHub OAuth flow
signIn('github');
```

## Address API

CRUD operations for address management.

### List Addresses

**Endpoint:** `GET /api/addresses`

**Authentication:** Required (NextAuth session)

**Response:**
```json
{
  "addresses": [
    {
      "id": "addr_1",
      "country": "JP",
      "postal_code": "100-0001",
      "province": "Tokyo",
      "city": "Chiyoda",
      "street_address": "1-1 Chiyoda",
      "recipient": "John Doe",
      "userId": "1",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

### Create Address

**Endpoint:** `POST /api/addresses`

**Authentication:** Required (NextAuth session)

**Request:**
```json
{
  "country": "JP",
  "postal_code": "100-0001",
  "province": "Tokyo",
  "city": "Chiyoda",
  "street_address": "1-1 Chiyoda",
  "recipient": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": "addr_1",
  "country": "JP",
  "postal_code": "100-0001",
  "province": "Tokyo",
  "city": "Chiyoda",
  "street_address": "1-1 Chiyoda",
  "recipient": "John Doe",
  "userId": "1",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Address

**Endpoint:** `GET /api/addresses/{id}`

**Authentication:** Required (NextAuth session)

**Response:**
```json
{
  "id": "addr_1",
  "country": "JP",
  "postal_code": "100-0001",
  "province": "Tokyo",
  "city": "Chiyoda",
  "street_address": "1-1 Chiyoda",
  "recipient": "John Doe",
  "userId": "1",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Update Address

**Endpoint:** `PUT /api/addresses/{id}`

**Authentication:** Required (NextAuth session)

**Request:**
```json
{
  "city": "Shibuya",
  "street_address": "2-2 Shibuya"
}
```

**Response:**
```json
{
  "id": "addr_1",
  "country": "JP",
  "postal_code": "100-0001",
  "province": "Tokyo",
  "city": "Shibuya",
  "street_address": "2-2 Shibuya",
  "recipient": "John Doe",
  "userId": "1",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

### Delete Address

**Endpoint:** `DELETE /api/addresses/{id}`

**Authentication:** Required (NextAuth session)

**Response:** `204 No Content`

### Validate Address

**Endpoint:** `POST /api/addresses/validate`

**Authentication:** Required (NextAuth session)

**Request:**
```json
{
  "country": "JP",
  "postal_code": "100-0001",
  "city": "Tokyo"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "address": {
    "country": "JP",
    "postal_code": "100-0001",
    "city": "Tokyo"
  }
}
```

## Webhook API

Manage webhooks for address events.

### List Webhooks

**Endpoint:** `GET /api/webhooks`

**Authentication:** Required (NextAuth session)

**Response:**
```json
{
  "webhooks": [
    {
      "id": "webhook_1",
      "url": "https://example.com/webhook",
      "events": ["address.created", "address.updated"]
    }
  ],
  "count": 1
}
```

### Register Webhook

**Endpoint:** `POST /api/webhooks`

**Authentication:** Required (NextAuth session)

**Request:**
```json
{
  "url": "https://example.com/webhook",
  "events": ["address.created", "address.updated", "address.deleted"],
  "secret": "your-webhook-secret-minimum-16-chars"
}
```

**Response:** `201 Created`
```json
{
  "id": "webhook_1"
}
```

### Webhook Payload

When an event occurs, the webhook receives:

```json
{
  "event": "address.created",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "id": "addr_1",
    "country": "JP",
    "postal_code": "100-0001",
    "province": "Tokyo",
    "city": "Chiyoda",
    "street_address": "1-1 Chiyoda",
    "recipient": "John Doe",
    "userId": "1",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Headers:**
```
Content-Type: application/json
X-Webhook-Event: address.created
X-Webhook-Timestamp: 2024-01-01T00:00:00.000Z
```

## Protected Endpoint Example

**Endpoint:** `GET /api/examples/protected`

Demonstrates JWT and API key authentication.

**Authentication:** JWT or API Key

**Headers (Option 1 - JWT):**
```
Authorization: Bearer <your-jwt-token>
```

**Headers (Option 2 - API Key):**
```
x-api-key: demo_api_key_12345
```

**Response:**
```json
{
  "message": "Access granted",
  "authMethod": "jwt",
  "user": {
    "userId": "1",
    "email": "demo@example.com"
  }
}
```

**POST Endpoint with Validation:**

**Endpoint:** `POST /api/examples/protected`

**Request:**
```json
{
  "country": "JP",
  "postal_code": "100-0001",
  "city": "Tokyo"
}
```

**Response:**
```json
{
  "message": "Data validated and processed successfully",
  "data": {
    "country": "JP",
    "postal_code": "100-0001",
    "city": "Tokyo"
  },
  "meta": {
    "duration": "5ms",
    "authMethod": "jwt"
  }
}
```

## Middleware

### Rate Limiting

All API endpoints include rate limiting:

- **Authentication endpoints:** 5 requests per 15 minutes
- **General API endpoints:** 100 requests per minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200000
Retry-After: 60
```

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}
```

### Request Logging

All requests are logged with:
- Timestamp
- HTTP method
- URL
- Client IP
- User agent
- Response status
- Duration

Example log:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "method": "POST",
  "url": "http://localhost:3000/api/addresses",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "status": 201,
  "duration": "15ms"
}
```

### CORS

CORS headers are configured for:
- Origin: `*` (configure for production)
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization, x-api-key`

## Error Handling

### Standard Error Response

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "errors": ["field1: error message", "field2: error message"]
}
```

### HTTP Status Codes

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Validation error or malformed request
- `401 Unauthorized` - Authentication required or failed
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Validation Errors

```json
{
  "error": "Validation Error",
  "errors": [
    "country: Country code must be 2 characters (ISO 3166-1 alpha-2)",
    "email: Invalid email format"
  ]
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
// Login with JWT
const response = await fetch('/api/auth/jwt/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'demo@example.com',
    password: 'demo123'
  })
});

const { token } = await response.json();

// Use JWT token
const addresses = await fetch('/api/addresses', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### cURL

```bash
# JWT Authentication
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/jwt/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  | jq -r '.token')

# List addresses with JWT
curl -X GET http://localhost:3000/api/addresses \
  -H "Authorization: Bearer $TOKEN"

# Create address with API key
curl -X POST http://localhost:3000/api/addresses \
  -H "Content-Type: application/json" \
  -H "x-api-key: demo_api_key_12345" \
  -d '{
    "country": "JP",
    "postal_code": "100-0001",
    "city": "Tokyo"
  }'
```

### Python

```python
import requests

# Login
response = requests.post('http://localhost:3000/api/auth/jwt/login', json={
    'email': 'demo@example.com',
    'password': 'demo123'
})
token = response.json()['token']

# Use token
headers = {'Authorization': f'Bearer {token}'}
addresses = requests.get('http://localhost:3000/api/addresses', headers=headers)
print(addresses.json())
```

## Security Best Practices

1. **Environment Variables:** Never commit secrets to version control
2. **HTTPS:** Always use HTTPS in production
3. **Rate Limiting:** Implement appropriate rate limits for your use case
4. **API Keys:** Rotate API keys regularly
5. **JWT Secrets:** Use strong, random secrets for JWT signing
6. **Password Hashing:** Use bcrypt or similar for password storage (currently demo only)
7. **CORS:** Configure strict CORS policies for production
8. **Input Validation:** Always validate and sanitize user input

## Troubleshooting

### Common Issues

**Issue:** "Unauthorized" error
- **Solution:** Ensure you're sending valid authentication credentials

**Issue:** "Too Many Requests"
- **Solution:** Wait for the rate limit window to reset, or implement exponential backoff

**Issue:** "Validation Error"
- **Solution:** Check the error messages and ensure your request body matches the schema

**Issue:** JWT token expired
- **Solution:** Login again to get a fresh token

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

All requests and responses will be logged to console.
