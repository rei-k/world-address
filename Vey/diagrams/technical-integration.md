# Vey エコシステム 技術統合図 / Technical Integration

このドキュメントは、Veyエコシステムの技術的な統合とAPI連携を詳細に示します。

This document illustrates the technical integration and API connectivity of the Vey ecosystem.

---

## 🔌 API統合アーキテクチャ / API Integration Architecture

### 全体API構成 / Overall API Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      VeyAPI Gateway                              │
│                    (API Management Layer)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   REST API   │  │  GraphQL API │  │   gRPC API   │         │
│  │              │  │              │  │              │         │
│  │ HTTP/HTTPS   │  │ HTTP/HTTPS   │  │   HTTP/2     │         │
│  │ JSON         │  │ JSON         │  │ProtoBuf      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                  │
│         └─────────────────┴─────────────────┘                  │
│                           │                                     │
│  ┌────────────────────────┴──────────────────────────┐         │
│  │          API Gateway Features                     │         │
│  │                                                    │         │
│  │  • Rate Limiting                                  │         │
│  │  • Authentication (JWT, OAuth 2.0)                │         │
│  │  • Request/Response Transformation                │         │
│  │  • Load Balancing                                 │         │
│  │  • Caching                                        │         │
│  │  • Monitoring & Logging                           │         │
│  └────────────────────────────────────────────────────┘         │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Service Mesh (Istio)                          │
│                                                                 │
│  • Service Discovery                                            │
│  • Traffic Management                                           │
│  • Security (mTLS)                                              │
│  • Observability                                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Microservices Layer                           │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Address  │ │  Order   │ │ Delivery │ │ Payment  │         │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │   User   │ │Analytics │ │   ZKP    │ │  Auth    │         │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 REST API仕様 / REST API Specification

### エンドポイント一覧 / Endpoint List

#### 1. Address API

```
Base URL: https://api.vey.com/v1

Authentication: Bearer Token (JWT)
Rate Limit: 1000 requests/hour
```

**住所管理 / Address Management**

```http
# 住所一覧取得
GET /addresses
Response: 200 OK
{
  "addresses": [
    {
      "id": "addr_abc123",
      "type": "home",
      "pid": "JP-13-113-01-T07-B12-BN02-R342",
      "label": "自宅",
      "is_primary": true,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 5
  }
}

# 住所作成
POST /addresses
Request:
{
  "type": "home",
  "country": "JP",
  "postal_code": "150-0001",
  "admin1": "東京都",
  "admin2": "渋谷区",
  "locality": "神宮前",
  "address_line1": "1-2-3",
  "building": "サンプルビル 101",
  "label": "自宅"
}
Response: 201 Created
{
  "id": "addr_abc123",
  "pid": "JP-13-113-01-T07-B12-BN02-R342",
  "validation": {
    "valid": true,
    "deliverable": true,
    "warnings": []
  }
}

# 住所取得
GET /addresses/{id}
Response: 200 OK

# 住所更新
PUT /addresses/{id}
Request: (Same as POST)
Response: 200 OK

# 住所削除
DELETE /addresses/{id}
Response: 204 No Content

# 住所検証
POST /addresses/validate
Request:
{
  "country": "JP",
  "postal_code": "150-0001",
  "address_line1": "神宮前1-2-3"
}
Response: 200 OK
{
  "valid": true,
  "normalized": {
    "country": "JP",
    "postal_code": "150-0001",
    "admin1": "東京都",
    "admin2": "渋谷区",
    "locality": "神宮前",
    "address_line1": "1丁目2-3"
  },
  "suggestions": [],
  "deliverable": true
}
```

#### 2. Order API

```http
# 注文作成
POST /orders
Request:
{
  "items": [
    {
      "product_id": "prod_123",
      "quantity": 2,
      "price": 1000
    }
  ],
  "shipping_address_id": "addr_abc123",
  "payment_method": "credit_card",
  "payment_token": "tok_xyz789"
}
Response: 201 Created
{
  "id": "order_123",
  "status": "pending",
  "total": 2000,
  "shipping_cost": 500,
  "tax": 250,
  "grand_total": 2750
}

# 注文取得
GET /orders/{id}
Response: 200 OK

# 注文一覧
GET /orders
Query Parameters:
  - status: pending|processing|shipped|delivered|cancelled
  - from_date: ISO 8601
  - to_date: ISO 8601
  - page: integer
  - per_page: integer (max 100)
Response: 200 OK

# 注文キャンセル
POST /orders/{id}/cancel
Response: 200 OK
```

#### 3. Delivery API

```http
# 配送業者選択
POST /deliveries/carriers/select
Request:
{
  "from_pid": "JP-13-113-01",
  "to_pid": "JP-27-100-05",
  "weight": 2.5,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15
  }
}
Response: 200 OK
{
  "carriers": [
    {
      "id": "yamato",
      "name": "ヤマト運輸",
      "service": "宅急便",
      "price": 500,
      "estimated_days": 2,
      "rating": 4.8
    },
    {
      "id": "sagawa",
      "name": "佐川急便",
      "service": "飛脚宅配便",
      "price": 600,
      "estimated_days": 2,
      "rating": 4.6
    }
  ]
}

# 配送追跡
GET /deliveries/{tracking_number}/track
Response: 200 OK
{
  "tracking_number": "1234-5678-9012",
  "status": "in_transit",
  "carrier": "yamato",
  "events": [
    {
      "timestamp": "2025-12-03T09:00:00Z",
      "status": "picked_up",
      "location": "東京営業所"
    },
    {
      "timestamp": "2025-12-03T14:30:00Z",
      "status": "in_transit",
      "location": "横浜中継センター"
    }
  ],
  "estimated_delivery": "2025-12-04T16:00:00Z"
}

# リアルタイム位置情報 (WebSocket)
WS /deliveries/{tracking_number}/realtime
Message:
{
  "type": "location_update",
  "latitude": 35.6762,
  "longitude": 139.6503,
  "timestamp": "2025-12-03T15:45:00Z",
  "eta": "2025-12-03T16:15:00Z"
}
```

---

## 🔗 GraphQL API仕様 / GraphQL API Specification

### スキーマ定義 / Schema Definition

```graphql
# ユーザー型
type User {
  id: ID!
  email: String!
  name: String
  phone: String
  addresses: [Address!]!
  orders: [Order!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# 住所型
type Address {
  id: ID!
  user: User!
  type: AddressType!
  pid: String!
  country: String!
  postalCode: String
  admin1: String
  admin2: String
  locality: String
  addressLine1: String
  addressLine2: String
  building: String
  label: String
  isPrimary: Boolean!
  validation: ValidationResult!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum AddressType {
  HOME
  WORK
  OTHER
}

type ValidationResult {
  valid: Boolean!
  deliverable: Boolean!
  warnings: [String!]!
}

# 注文型
type Order {
  id: ID!
  user: User!
  items: [OrderItem!]!
  shippingAddress: Address!
  status: OrderStatus!
  total: Float!
  shippingCost: Float!
  tax: Float!
  grandTotal: Float!
  tracking: Tracking
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

type OrderItem {
  id: ID!
  product: Product!
  quantity: Int!
  price: Float!
  subtotal: Float!
}

type Product {
  id: ID!
  name: String!
  description: String
  price: Float!
  images: [String!]!
  stock: Int!
}

# 配送追跡型
type Tracking {
  trackingNumber: String!
  carrier: Carrier!
  status: DeliveryStatus!
  events: [TrackingEvent!]!
  estimatedDelivery: DateTime
  currentLocation: Location
}

enum DeliveryStatus {
  PENDING
  PICKED_UP
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  FAILED
}

type TrackingEvent {
  timestamp: DateTime!
  status: DeliveryStatus!
  location: String!
  description: String
}

type Carrier {
  id: ID!
  name: String!
  service: String!
  price: Float!
  estimatedDays: Int!
  rating: Float!
}

type Location {
  latitude: Float!
  longitude: Float!
  timestamp: DateTime!
}

# クエリ
type Query {
  # ユーザー
  me: User!
  user(id: ID!): User
  
  # 住所
  address(id: ID!): Address
  addresses(type: AddressType, limit: Int, offset: Int): [Address!]!
  validateAddress(input: AddressInput!): ValidationResult!
  
  # 注文
  order(id: ID!): Order
  orders(status: OrderStatus, limit: Int, offset: Int): [Order!]!
  
  # 配送
  tracking(trackingNumber: String!): Tracking
  carriers(fromPid: String!, toPid: String!, weight: Float!): [Carrier!]!
}

# ミューテーション
type Mutation {
  # 住所
  createAddress(input: AddressInput!): Address!
  updateAddress(id: ID!, input: AddressInput!): Address!
  deleteAddress(id: ID!): Boolean!
  
  # 注文
  createOrder(input: OrderInput!): Order!
  cancelOrder(id: ID!): Order!
  
  # 配送
  selectCarrier(orderId: ID!, carrierId: ID!): Order!
}

# サブスクリプション (リアルタイム更新)
type Subscription {
  # 配送追跡リアルタイム更新
  trackingUpdate(trackingNumber: String!): Tracking!
  
  # 注文状態変更
  orderStatusChanged(orderId: ID!): Order!
}

# 入力型
input AddressInput {
  type: AddressType!
  country: String!
  postalCode: String
  admin1: String
  admin2: String
  locality: String
  addressLine1: String
  addressLine2: String
  building: String
  label: String
  isPrimary: Boolean
}

input OrderInput {
  items: [OrderItemInput!]!
  shippingAddressId: ID!
  paymentMethod: String!
  paymentToken: String!
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
  price: Float!
}
```

### クエリ例 / Query Examples

```graphql
# ユーザー情報と住所一覧を取得
query GetUserWithAddresses {
  me {
    id
    email
    name
    addresses {
      id
      type
      pid
      label
      isPrimary
      validation {
        valid
        deliverable
      }
    }
  }
}

# 注文履歴を取得
query GetOrders {
  orders(status: DELIVERED, limit: 10) {
    id
    status
    grandTotal
    createdAt
    items {
      product {
        name
        price
      }
      quantity
      subtotal
    }
    tracking {
      trackingNumber
      status
      estimatedDelivery
    }
  }
}

# 配送業者を比較
query CompareCarriers($from: String!, $to: String!, $weight: Float!) {
  carriers(fromPid: $from, toPid: $to, weight: $weight) {
    id
    name
    service
    price
    estimatedDays
    rating
  }
}

# 住所を作成
mutation CreateAddress($input: AddressInput!) {
  createAddress(input: $input) {
    id
    pid
    validation {
      valid
      deliverable
      warnings
    }
  }
}

# リアルタイム配送追跡を購読
subscription TrackDelivery($trackingNumber: String!) {
  trackingUpdate(trackingNumber: $trackingNumber) {
    status
    currentLocation {
      latitude
      longitude
    }
    estimatedDelivery
    events {
      timestamp
      status
      location
    }
  }
}
```

---

## 🚀 gRPC API仕様 / gRPC API Specification

### Protocol Buffer定義 / Proto Definition

```protobuf
syntax = "proto3";

package vey.v1;

option go_package = "github.com/vey/proto/go/vey/v1;veyv1";
option java_package = "com.vey.proto.v1";
option java_multiple_files = true;

import "google/protobuf/timestamp.proto";

// Address Service
service AddressService {
  rpc CreateAddress(CreateAddressRequest) returns (Address);
  rpc GetAddress(GetAddressRequest) returns (Address);
  rpc ListAddresses(ListAddressesRequest) returns (ListAddressesResponse);
  rpc UpdateAddress(UpdateAddressRequest) returns (Address);
  rpc DeleteAddress(DeleteAddressRequest) returns (DeleteAddressResponse);
  rpc ValidateAddress(ValidateAddressRequest) returns (ValidationResult);
}

message Address {
  string id = 1;
  string user_id = 2;
  AddressType type = 3;
  string pid = 4;
  string country = 5;
  string postal_code = 6;
  string admin1 = 7;
  string admin2 = 8;
  string locality = 9;
  string address_line1 = 10;
  string address_line2 = 11;
  string building = 12;
  string label = 13;
  bool is_primary = 14;
  google.protobuf.Timestamp created_at = 15;
  google.protobuf.Timestamp updated_at = 16;
}

enum AddressType {
  ADDRESS_TYPE_UNSPECIFIED = 0;
  ADDRESS_TYPE_HOME = 1;
  ADDRESS_TYPE_WORK = 2;
  ADDRESS_TYPE_OTHER = 3;
}

message CreateAddressRequest {
  string user_id = 1;
  AddressType type = 2;
  string country = 3;
  string postal_code = 4;
  string admin1 = 5;
  string admin2 = 6;
  string locality = 7;
  string address_line1 = 8;
  string address_line2 = 9;
  string building = 10;
  string label = 11;
  bool is_primary = 12;
}

message GetAddressRequest {
  string id = 1;
}

message ListAddressesRequest {
  string user_id = 1;
  AddressType type = 2;
  int32 page_size = 3;
  string page_token = 4;
}

message ListAddressesResponse {
  repeated Address addresses = 1;
  string next_page_token = 2;
  int32 total_count = 3;
}

message UpdateAddressRequest {
  string id = 1;
  Address address = 2;
}

message DeleteAddressRequest {
  string id = 1;
}

message DeleteAddressResponse {
  bool success = 1;
}

message ValidateAddressRequest {
  string country = 1;
  string postal_code = 2;
  string address_line1 = 3;
}

message ValidationResult {
  bool valid = 1;
  bool deliverable = 2;
  repeated string warnings = 3;
  Address normalized = 4;
}

// Order Service
service OrderService {
  rpc CreateOrder(CreateOrderRequest) returns (Order);
  rpc GetOrder(GetOrderRequest) returns (Order);
  rpc ListOrders(ListOrdersRequest) returns (ListOrdersResponse);
  rpc CancelOrder(CancelOrderRequest) returns (Order);
}

message Order {
  string id = 1;
  string user_id = 2;
  repeated OrderItem items = 3;
  string shipping_address_id = 4;
  OrderStatus status = 5;
  double total = 6;
  double shipping_cost = 7;
  double tax = 8;
  double grand_total = 9;
  google.protobuf.Timestamp created_at = 10;
  google.protobuf.Timestamp updated_at = 11;
}

enum OrderStatus {
  ORDER_STATUS_UNSPECIFIED = 0;
  ORDER_STATUS_PENDING = 1;
  ORDER_STATUS_PROCESSING = 2;
  ORDER_STATUS_SHIPPED = 3;
  ORDER_STATUS_DELIVERED = 4;
  ORDER_STATUS_CANCELLED = 5;
}

message OrderItem {
  string id = 1;
  string product_id = 2;
  int32 quantity = 3;
  double price = 4;
  double subtotal = 5;
}

message CreateOrderRequest {
  string user_id = 1;
  repeated OrderItem items = 2;
  string shipping_address_id = 3;
  string payment_method = 4;
  string payment_token = 5;
}

message GetOrderRequest {
  string id = 1;
}

message ListOrdersRequest {
  string user_id = 1;
  OrderStatus status = 2;
  int32 page_size = 3;
  string page_token = 4;
}

message ListOrdersResponse {
  repeated Order orders = 1;
  string next_page_token = 2;
  int32 total_count = 3;
}

message CancelOrderRequest {
  string id = 1;
}

// Delivery Service
service DeliveryService {
  rpc SelectCarrier(SelectCarrierRequest) returns (SelectCarrierResponse);
  rpc TrackDelivery(TrackDeliveryRequest) returns (Tracking);
  rpc StreamTracking(TrackDeliveryRequest) returns (stream Tracking);
}

message SelectCarrierRequest {
  string from_pid = 1;
  string to_pid = 2;
  double weight = 3;
  Dimensions dimensions = 4;
}

message Dimensions {
  double length = 1;
  double width = 2;
  double height = 3;
}

message SelectCarrierResponse {
  repeated Carrier carriers = 1;
}

message Carrier {
  string id = 1;
  string name = 2;
  string service = 3;
  double price = 4;
  int32 estimated_days = 5;
  double rating = 6;
}

message TrackDeliveryRequest {
  string tracking_number = 1;
}

message Tracking {
  string tracking_number = 1;
  Carrier carrier = 2;
  DeliveryStatus status = 3;
  repeated TrackingEvent events = 4;
  google.protobuf.Timestamp estimated_delivery = 5;
  Location current_location = 6;
}

enum DeliveryStatus {
  DELIVERY_STATUS_UNSPECIFIED = 0;
  DELIVERY_STATUS_PENDING = 1;
  DELIVERY_STATUS_PICKED_UP = 2;
  DELIVERY_STATUS_IN_TRANSIT = 3;
  DELIVERY_STATUS_OUT_FOR_DELIVERY = 4;
  DELIVERY_STATUS_DELIVERED = 5;
  DELIVERY_STATUS_FAILED = 6;
}

message TrackingEvent {
  google.protobuf.Timestamp timestamp = 1;
  DeliveryStatus status = 2;
  string location = 3;
  string description = 4;
}

message Location {
  double latitude = 1;
  double longitude = 2;
  google.protobuf.Timestamp timestamp = 3;
}
```

---

## 🔔 Webhook統合 / Webhook Integration

### イベント型 / Event Types

```
vey.address.created
vey.address.updated
vey.address.deleted
vey.order.created
vey.order.updated
vey.order.shipped
vey.order.delivered
vey.order.cancelled
vey.delivery.picked_up
vey.delivery.in_transit
vey.delivery.delivered
vey.delivery.failed
vey.payment.succeeded
vey.payment.failed
```

### Webhookペイロード例 / Webhook Payload Example

```json
{
  "id": "evt_1234567890",
  "type": "vey.order.shipped",
  "created_at": "2025-12-03T10:30:00Z",
  "data": {
    "object": {
      "id": "order_123",
      "status": "shipped",
      "tracking_number": "1234-5678-9012",
      "carrier": "yamato",
      "estimated_delivery": "2025-12-04T16:00:00Z"
    }
  },
  "metadata": {
    "user_id": "user_abc",
    "environment": "production"
  }
}
```

### Webhook署名検証 / Webhook Signature Verification

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express middleware例
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-vey-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  const event = req.body;
  console.log('Event:', event.type);
  
  res.status(200).send('OK');
});
```

---

## 🔐 認証・認可 / Authentication & Authorization

### OAuth 2.0フロー / OAuth 2.0 Flow

```
1. Authorization Request
   GET https://auth.vey.com/oauth/authorize
     ?client_id=your_client_id
     &redirect_uri=https://yourapp.com/callback
     &response_type=code
     &scope=address:read order:write
     &state=random_state

2. User Authorization
   [ユーザーがログイン・許可]

3. Authorization Code
   Redirect to: https://yourapp.com/callback
     ?code=authorization_code
     &state=random_state

4. Token Exchange
   POST https://auth.vey.com/oauth/token
   Request:
   {
     "grant_type": "authorization_code",
     "code": "authorization_code",
     "client_id": "your_client_id",
     "client_secret": "your_client_secret",
     "redirect_uri": "https://yourapp.com/callback"
   }
   Response:
   {
     "access_token": "eyJhbGciOiJSUzI1NiIs...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "refresh_token_here",
     "scope": "address:read order:write"
   }

5. API Call
   GET https://api.vey.com/v1/addresses
   Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### スコープ定義 / Scope Definition

```
address:read      - 住所の読み取り
address:write     - 住所の作成・更新・削除
order:read        - 注文の読み取り
order:write       - 注文の作成・キャンセル
delivery:read     - 配送情報の読み取り
delivery:write    - 配送の手配
payment:read      - 決済情報の読み取り
payment:write     - 決済の実行
analytics:read    - 分析データの読み取り
admin:*           - 管理者権限
```

---

## 📊 SDK使用例 / SDK Usage Examples

### JavaScript/TypeScript SDK

```typescript
import { VeyClient } from '@vey/core';

const client = new VeyClient({
  apiKey: process.env.VEY_API_KEY,
  environment: 'production'
});

// 住所作成
const address = await client.addresses.create({
  type: 'home',
  country: 'JP',
  postalCode: '150-0001',
  admin1: '東京都',
  admin2: '渋谷区',
  locality: '神宮前',
  addressLine1: '1-2-3',
  label: '自宅'
});

console.log('PID:', address.pid);

// 注文作成
const order = await client.orders.create({
  items: [
    { productId: 'prod_123', quantity: 2, price: 1000 }
  ],
  shippingAddressId: address.id,
  paymentMethod: 'credit_card',
  paymentToken: 'tok_xyz789'
});

// 配送追跡
const tracking = await client.deliveries.track('1234-5678-9012');
console.log('Status:', tracking.status);

// リアルタイム追跡
client.deliveries.streamTracking('1234-5678-9012', (update) => {
  console.log('Location:', update.currentLocation);
  console.log('ETA:', update.estimatedDelivery);
});
```

### Python SDK

```python
from vey import VeyClient

client = VeyClient(
    api_key=os.getenv('VEY_API_KEY'),
    environment='production'
)

# 住所作成
address = client.addresses.create(
    type='home',
    country='JP',
    postal_code='150-0001',
    admin1='東京都',
    admin2='渋谷区',
    locality='神宮前',
    address_line1='1-2-3',
    label='自宅'
)

print(f'PID: {address.pid}')

# 注文作成
order = client.orders.create(
    items=[
        {'product_id': 'prod_123', 'quantity': 2, 'price': 1000}
    ],
    shipping_address_id=address.id,
    payment_method='credit_card',
    payment_token='tok_xyz789'
)

# 配送追跡
tracking = client.deliveries.track('1234-5678-9012')
print(f'Status: {tracking.status}')

# リアルタイム追跡
for update in client.deliveries.stream_tracking('1234-5678-9012'):
    print(f'Location: {update.current_location}')
    print(f'ETA: {update.estimated_delivery}')
```

### PHP SDK

```php
<?php
require_once 'vendor/autoload.php';

use Vey\VeyClient;

$client = new VeyClient([
    'api_key' => getenv('VEY_API_KEY'),
    'environment' => 'production'
]);

// 住所作成
$address = $client->addresses->create([
    'type' => 'home',
    'country' => 'JP',
    'postal_code' => '150-0001',
    'admin1' => '東京都',
    'admin2' => '渋谷区',
    'locality' => '神宮前',
    'address_line1' => '1-2-3',
    'label' => '自宅'
]);

echo "PID: {$address->pid}\n";

// 注文作成
$order = $client->orders->create([
    'items' => [
        ['product_id' => 'prod_123', 'quantity' => 2, 'price' => 1000]
    ],
    'shipping_address_id' => $address->id,
    'payment_method' => 'credit_card',
    'payment_token' => 'tok_xyz789'
]);

// 配送追跡
$tracking = $client->deliveries->track('1234-5678-9012');
echo "Status: {$tracking->status}\n";
```

---

## 関連ドキュメント / Related Documentation

- [システム全体図](./system-overview.md)
- [データフロー図](./data-flows.md)
- [ユーザージャーニー](./user-journeys.md)
- [セキュリティアーキテクチャ](./security-architecture.md)

---

**最終更新 / Last Updated**: 2025-12-03
