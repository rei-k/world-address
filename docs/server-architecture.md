# サーバーサイドアーキテクチャ / Server-Side Architecture

## 概要 / Overview

世界中の住所フォームとチェックアウトを成立させるために、サーバーサイドとクライアントSDKの役割を明確に整理しました。

## アーキテクチャ構成 / Architecture Components

```
Server Core (必ず作る / Must Build)
 ├── Address Normalization API
 ├── GAP/PID Verify API
 ├── Payment Token API
 └── Waybill/Webhook API

Client SDK (ラッパーで作る / Wrapper SDKs)
 ├── Web Backend (Node.js, Django, Flask, FastAPI, Laravel, Symfony, Rails, Spring Boot, .NET, Go, Rust)
 └── Scientific/Native (R, Julia, C, C++)
```

## 1. サーバーコア（コアシステム）/ Server Core (Core System)

サーバーサイドで必ず作るコンポーネント群。これらは住所データの正規化、検証、決済トークン管理、送り状生成を担当します。

### 1.1 Address Normalization API（住所正規化API）

**役割**: 各国住所 → PID へ変換

世界各国の住所を受け取り、国ごとの並びや言語が違っても内部でPIDに変換して統一できるWeb API。

**エンドポイント**:
```
POST /api/v1/address/normalize
```

**リクエスト**:
```json
{
  "raw_address": {
    "country": "JP",
    "postal_code": "150-0001",
    "address_line1": "東京都渋谷区神宮前1-1-1",
    "address_line2": "ビル名 101号室"
  },
  "language": "ja"
}
```

**レスポンス**:
```json
{
  "pid": "JP-13-113-01-T07-B12-BN02-R101",
  "normalized_address": {
    "country": "JP",
    "admin1": "13",
    "admin1_name": "東京都",
    "admin2": "113",
    "admin2_name": "渋谷区",
    "locality": "01",
    "locality_name": "神宮前",
    "sublocality": "T07",
    "block": "B12",
    "building": "BN02",
    "building_name": "ビル名",
    "unit": "R101"
  },
  "validation": {
    "valid": true,
    "confidence": 0.95
  }
}
```

**機能**:
- 国ごとの住所文法ルール適用
- 住所の正規化とPID生成
- バリデーション精度の向上
- 自動修正提案

### 1.2 GAP/PID Verify API（住所存在照合API）

**役割**: GAP ID / ハッシュで一致判定

QRやIDから登録済住所が本当に存在するかを一致判定する照合エンドポイント。ソーシャルログインとは別に住所の一致を確定させる。

**エンドポイント**:
```
POST /api/v1/address/verify
```

**リクエスト**:
```json
{
  "pid": "JP-13-113-01-T07-B12-BN02-R101",
  "verification_type": "qr_code",
  "proof": {
    "qr_data": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
    "signature": "...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**レスポンス**:
```json
{
  "verified": true,
  "pid": "JP-13-113-01-T07-B12-BN02-R101",
  "verification_result": {
    "exists": true,
    "active": true,
    "verification_method": "qr_code",
    "verified_at": "2024-01-15T10:30:05Z"
  },
  "credential": {
    "type": "VerifiableCredential",
    "issuer": "did:web:vey.example",
    "issuanceDate": "2024-01-15T10:30:05Z"
  }
}
```

**機能**:
- PID存在確認
- QR/NFC証明検証
- デジタル署名検証
- 住所の一致判定

### 1.3 Payment Token API（決済トークン管理API）

**役割**: カード/決済IDの事前保存・引用

Google Wallet や Apple Wallet と連携し、決済トークンを管理するAPI。

**エンドポイント**:
```
POST /api/v1/payment/token/create
GET /api/v1/payment/token/{token_id}
DELETE /api/v1/payment/token/{token_id}
```

**リクエスト（作成）**:
```json
{
  "user_did": "did:key:user123",
  "payment_method": {
    "type": "card",
    "provider": "stripe",
    "token": "tok_visa_4242",
    "last4": "4242",
    "brand": "visa",
    "exp_month": 12,
    "exp_year": 2025
  },
  "wallet_integration": {
    "google_wallet": true,
    "apple_wallet": false
  }
}
```

**レスポンス**:
```json
{
  "payment_token_id": "pt_abc123xyz",
  "user_did": "did:key:user123",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "wallet_passes": {
    "google_wallet_url": "https://pay.google.com/...",
    "apple_wallet_url": null
  }
}
```

**機能**:
- 決済トークンの安全な保存
- Google Wallet / Apple Wallet 連携
- トークンの暗号化管理
- PCI DSS準拠

### 1.4 Waybill/Webhook API（送り状生成/Webhook管理API）

**役割**: 自分住所 × 相手住所 → Waybill構築、住所変更・配送通知など

**送り状生成エンドポイント**:
```
POST /api/v1/waybill/create
```

**リクエスト**:
```json
{
  "sender_pid": "JP-13-113-01-T07-B12-BN02-R101",
  "recipient_pid": "JP-27-141-05-T03-B05-BN01-R203",
  "parcel": {
    "weight": 2.5,
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15
    },
    "value": 5000,
    "currency": "JPY"
  },
  "carrier": "yamato",
  "service_type": "standard"
}
```

**レスポンス**:
```json
{
  "waybill_id": "WB-2024011500001",
  "tracking_number": "1234-5678-9012",
  "sender": {
    "pid": "JP-13-113-01-T07-B12-BN02-R101",
    "display_address": "東京都渋谷区..." // ラストワンマイルのみ表示
  },
  "recipient": {
    "pid": "JP-27-141-05-T03-B05-BN01-R203",
    "display_address": "大阪府大阪市..." // ラストワンマイルのみ表示
  },
  "carrier_info": {
    "name": "ヤマト運輸",
    "service": "宅急便",
    "estimated_delivery": "2024-01-17"
  },
  "label_url": "https://api.vey.example/waybill/WB-2024011500001/label.pdf"
}
```

**Webhook管理エンドポイント**:
```
POST /api/v1/webhook/register
GET /api/v1/webhook/list
DELETE /api/v1/webhook/{webhook_id}
```

**サポートするWebhookイベント**:
- `address.updated` - 住所変更時
- `delivery.status_changed` - 配送ステータス変更時
- `delivery.delivered` - 配達完了時
- `delivery.failed` - 配達失敗時
- `payment.authorized` - 決済承認時
- `payment.captured` - 決済確定時

**Webhookペイロード例**:
```json
{
  "event": "delivery.status_changed",
  "timestamp": "2024-01-16T14:30:00Z",
  "data": {
    "waybill_id": "WB-2024011500001",
    "tracking_number": "1234-5678-9012",
    "status": "in_transit",
    "location": {
      "pid_level": "JP-27-141",
      "facility": "大阪配送センター"
    },
    "estimated_delivery": "2024-01-17T18:00:00Z"
  }
}
```

## 2. クライアントSDK / Client SDKs

各言語・フレームワークでHTTP/gRPCを叩くラッパーとして提供します。

### 2.1 Web Backend SDKs

#### Node.js SDK

```typescript
import { VeyClient } from '@vey/nodejs';

const client = new VeyClient({
  apiKey: process.env.VEY_API_KEY,
  environment: 'production'
});

// 住所正規化
const normalized = await client.address.normalize({
  raw_address: {
    country: 'JP',
    postal_code: '150-0001',
    address_line1: '東京都渋谷区神宮前1-1-1'
  }
});

// 送り状作成
const waybill = await client.waybill.create({
  sender_pid: normalized.pid,
  recipient_pid: 'JP-27-141-05-T03-B05-BN01-R203',
  parcel: { weight: 2.5 }
});
```

#### Django SDK

```python
from vey import VeyClient

client = VeyClient(
    api_key=settings.VEY_API_KEY,
    environment='production'
)

# 住所正規化
normalized = client.address.normalize({
    'raw_address': {
        'country': 'JP',
        'postal_code': '150-0001',
        'address_line1': '東京都渋谷区神宮前1-1-1'
    }
})

# PID検証
verified = client.address.verify(
    pid=normalized['pid'],
    verification_type='qr_code',
    proof={'qr_data': qr_token}
)
```

#### Flask SDK

```python
from flask import Flask
from vey.flask import VeyFlask

app = Flask(__name__)
vey = VeyFlask(app, api_key=os.getenv('VEY_API_KEY'))

@app.route('/checkout', methods=['POST'])
def checkout():
    # 住所正規化
    normalized = vey.address.normalize(request.json['address'])
    
    # 送り状生成
    waybill = vey.waybill.create(
        sender_pid=normalized['pid'],
        recipient_pid=request.json['recipient_pid']
    )
    
    return jsonify({'waybill_id': waybill['waybill_id']})
```

#### FastAPI SDK

```python
from fastapi import FastAPI
from vey.fastapi import VeyFastAPI

app = FastAPI()
vey = VeyFastAPI(api_key=os.getenv('VEY_API_KEY'))

@app.post('/address/normalize')
async def normalize_address(address: AddressInput):
    result = await vey.address.normalize_async(address.dict())
    return result
```

#### Laravel SDK

```php
<?php

use Vey\VeyClient;

$vey = new VeyClient([
    'api_key' => env('VEY_API_KEY'),
    'environment' => 'production'
]);

// 住所正規化
$normalized = $vey->address->normalize([
    'raw_address' => [
        'country' => 'JP',
        'postal_code' => '150-0001',
        'address_line1' => '東京都渋谷区神宮前1-1-1'
    ]
]);

// 決済トークン作成
$paymentToken = $vey->payment->createToken([
    'user_did' => 'did:key:user123',
    'payment_method' => [
        'type' => 'card',
        'provider' => 'stripe',
        'token' => 'tok_visa_4242'
    ]
]);
```

#### Ruby on Rails SDK

```ruby
require 'vey'

vey = Vey::Client.new(
  api_key: ENV['VEY_API_KEY'],
  environment: 'production'
)

# 住所正規化
normalized = vey.address.normalize(
  raw_address: {
    country: 'JP',
    postal_code: '150-0001',
    address_line1: '東京都渋谷区神宮前1-1-1'
  }
)

# Webhook登録
webhook = vey.webhook.register(
  url: 'https://myapp.example/webhook',
  events: ['delivery.status_changed', 'address.updated']
)
```

#### Spring Boot SDK

```java
import com.vey.VeyClient;
import com.vey.model.*;

@Service
public class AddressService {
    private final VeyClient veyClient;
    
    public AddressService() {
        this.veyClient = new VeyClient.Builder()
            .apiKey(System.getenv("VEY_API_KEY"))
            .environment("production")
            .build();
    }
    
    public NormalizedAddress normalizeAddress(RawAddress rawAddress) {
        return veyClient.address().normalize(rawAddress);
    }
    
    public Waybill createWaybill(String senderPid, String recipientPid, Parcel parcel) {
        return veyClient.waybill().create(
            new WaybillRequest()
                .senderPid(senderPid)
                .recipientPid(recipientPid)
                .parcel(parcel)
        );
    }
}
```

#### .NET SDK

```csharp
using Vey;
using Vey.Models;

var client = new VeyClient(new VeyClientOptions
{
    ApiKey = Environment.GetEnvironmentVariable("VEY_API_KEY"),
    Environment = "production"
});

// 住所正規化
var normalized = await client.Address.NormalizeAsync(new RawAddress
{
    Country = "JP",
    PostalCode = "150-0001",
    AddressLine1 = "東京都渋谷区神宮前1-1-1"
});

// PID検証
var verified = await client.Address.VerifyAsync(new VerifyRequest
{
    Pid = normalized.Pid,
    VerificationType = "qr_code",
    Proof = new Proof { QrData = qrToken }
});
```

#### Go SDK

```go
package main

import (
    "github.com/vey/vey-go"
)

func main() {
    client := vey.NewClient(&vey.Config{
        APIKey:      os.Getenv("VEY_API_KEY"),
        Environment: "production",
    })
    
    // 住所正規化
    normalized, err := client.Address.Normalize(&vey.RawAddress{
        Country:      "JP",
        PostalCode:   "150-0001",
        AddressLine1: "東京都渋谷区神宮前1-1-1",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // 送り状作成
    waybill, err := client.Waybill.Create(&vey.WaybillRequest{
        SenderPID:    normalized.PID,
        RecipientPID: "JP-27-141-05-T03-B05-BN01-R203",
        Parcel: &vey.Parcel{
            Weight: 2.5,
        },
    })
}
```

#### Rust SDK

```rust
use vey::{VeyClient, Config, RawAddress};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = VeyClient::new(Config {
        api_key: std::env::var("VEY_API_KEY")?,
        environment: "production".to_string(),
    });
    
    // 住所正規化
    let normalized = client.address().normalize(RawAddress {
        country: "JP".to_string(),
        postal_code: Some("150-0001".to_string()),
        address_line1: "東京都渋谷区神宮前1-1-1".to_string(),
        ..Default::default()
    }).await?;
    
    // PID検証
    let verified = client.address().verify(
        &normalized.pid,
        "qr_code",
        serde_json::json!({ "qr_data": qr_token })
    ).await?;
    
    Ok(())
}
```

### 2.2 Scientific/Native SDKs

#### R SDK

```r
library(vey)

# クライアント初期化
client <- vey_client(
  api_key = Sys.getenv("VEY_API_KEY"),
  environment = "production"
)

# 住所正規化
normalized <- vey_normalize_address(
  client,
  raw_address = list(
    country = "JP",
    postal_code = "150-0001",
    address_line1 = "東京都渋谷区神宮前1-1-1"
  )
)

# データフレームとして取得
addresses_df <- vey_get_addresses(client)
print(addresses_df)
```

#### Julia SDK

```julia
using Vey

# クライアント初期化
client = VeyClient(
    api_key = ENV["VEY_API_KEY"],
    environment = "production"
)

# 住所正規化
normalized = normalize_address(client,
    RawAddress(
        country = "JP",
        postal_code = "150-0001",
        address_line1 = "東京都渋谷区神宮前1-1-1"
    )
)

# PID検証
verified = verify_address(client,
    pid = normalized.pid,
    verification_type = "qr_code",
    proof = Dict("qr_data" => qr_token)
)
```

#### C SDK

**用途**: オフラインでのPID生成と高速な住所処理

```c
#include <vey/vey.h>

int main() {
    // クライアント初期化
    vey_client_t* client = vey_client_new(
        getenv("VEY_API_KEY"),
        VEY_ENV_PRODUCTION
    );
    
    // 住所正規化（オフライン対応）
    vey_raw_address_t raw = {
        .country = "JP",
        .postal_code = "150-0001",
        .address_line1 = "東京都渋谷区神宮前1-1-1"
    };
    
    vey_normalized_address_t* normalized = NULL;
    int result = vey_normalize_address_offline(client, &raw, &normalized);
    
    if (result == VEY_OK) {
        printf("PID: %s\n", normalized->pid);
        
        // Ed25519署名生成
        uint8_t signature[64];
        vey_sign_pid(client, normalized->pid, signature);
        
        vey_normalized_address_free(normalized);
    }
    
    vey_client_free(client);
    return 0;
}
```

**特徴**:
- 軽量HTTPクライアント（正規化API / 送り状APIを直接コール）
- PID生成ライブラリ（ローカル / オフラインでID生成可能）
- 署名実装（Ed25519など / 住所の改ざん耐性）
- 高速バイナリ処理

#### C++ SDK

**用途**: 組込み・高速処理・オフラインPID生成

```cpp
#include <vey/client.hpp>
#include <vey/crypto.hpp>

int main() {
    // クライアント初期化
    vey::Client client(
        std::getenv("VEY_API_KEY"),
        vey::Environment::Production
    );
    
    // 住所正規化（オフライン）
    vey::RawAddress raw{
        .country = "JP",
        .postal_code = "150-0001",
        .address_line1 = "東京都渋谷区神宮前1-1-1"
    };
    
    auto normalized = client.address().normalize_offline(raw);
    std::cout << "PID: " << normalized.pid << std::endl;
    
    // Ed25519署名生成
    vey::crypto::Ed25519Signer signer;
    auto signature = signer.sign(normalized.pid);
    
    // PID検証（オンライン）
    auto verified = client.address().verify(
        normalized.pid,
        vey::VerificationType::QrCode,
        vey::Proof{.qr_data = qr_token}
    );
    
    return 0;
}
```

**特徴**:
- モダンC++17/20サポート
- ヘッダーオンリーライブラリオプション
- RAII対応のメモリ管理
- 高速なPID生成とキャリア提出

## 3. 統合フロー / Integration Flow

### 3.1 ECサイトでのチェックアウトフロー

1. **住所入力またはQR照合**
   - ユーザーが住所を入力、またはQRコードで既存住所を照合
   - Address Normalization APIでPID生成

2. **ソーシャルログイン**
   - Google認証またはオリジナルID認証
   - ユーザーDID生成

3. **住所・決済登録**
   - 登録済住所一覧画面に遷移
   - Default住所、新規住所、決済トークンを登録
   - Payment Token APIで決済情報を保存

4. **権限付与**
   - 認証完了と同時に住所＋決済の権限リンクが付与
   - GAP/PID Verify APIで住所を検証

5. **配送準備**
   - Waybill APIで送り状生成
   - 物流業者にはPID変換済の住所が最終的にフル公開提出（ラストワンマイル）

### 3.2 Next.js SSR環境での使用例

```typescript
// pages/api/checkout.ts
import { VeyClient } from '@vey/nodejs';

const vey = new VeyClient({
  apiKey: process.env.VEY_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address, payment, recipient_pid } = req.body;
    
    try {
      // 1. 住所正規化
      const normalized = await vey.address.normalize({
        raw_address: address
      });
      
      // 2. 住所検証
      const verified = await vey.address.verify({
        pid: normalized.pid,
        verification_type: 'did',
        proof: {
          user_did: req.session.userDid,
          signature: req.body.signature
        }
      });
      
      if (!verified.verified) {
        return res.status(400).json({ error: '住所を検証できませんでした' });
      }
      
      // 3. 決済トークン作成
      const paymentToken = await vey.payment.createToken({
        user_did: req.session.userDid,
        payment_method: payment
      });
      
      // 4. 送り状生成
      const waybill = await vey.waybill.create({
        sender_pid: normalized.pid,
        recipient_pid: recipient_pid,
        parcel: req.body.parcel
      });
      
      res.status(200).json({
        waybill_id: waybill.waybill_id,
        tracking_number: waybill.tracking_number
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

## 4. 追加機能 / Additional Features

### 4.1 国ごとの住所文法ルール管理

各国の住所バリデーションルールをデータベースで管理し、Address Normalization APIで適用。

### 4.2 Rate Limit / API Key管理

Stripeのようなモデルで、API Keyベースのレート制限とサンドボックス/本番環境の切り替えをサポート。

### 4.3 エラー/修正提案モデル

住所入力時の自動修正提案を機械学習モデルで実現。

### 4.4 権限付与UI

住所照合後、ログイン手段に関係なく一度だけ同意でOKなUI。

## 5. セキュリティ / Security

### 5.1 認証・認可

- DIDベース認証
- Ed25519デジタル署名
- OAuth 2.0 / OpenID Connect対応

### 5.2 データ保護

- エンドツーエンド暗号化
- PID化による生住所の非公開
- ラストワンマイルのみ住所開示

### 5.3 監査ログ

- すべてのAPI呼び出しを記録
- Webhookイベントの完全トレーサビリティ

## まとめ / Summary

このアーキテクチャにより：

✅ **1つのコアAPIとして作る**（住所PID化・決済トークン・送り状・権限・Webhook）

✅ **各言語はSDK使用者用のラッパーとして作る**（HTTP/gRPC/GraphQLを叩けるクライアントライブラリ）

✅ **C/C++は"組込・高速・オフラインPID生成"だけに役割を絞る**（住所保存はクラウド側の責務）

世界中の住所フォームとチェックアウトを統一的に扱えるシステムが実現できます。
