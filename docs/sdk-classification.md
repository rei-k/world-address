# SDK言語・エコシステム分類 / SDK Language & Ecosystem Classification

## 概要 / Overview

Vey World Address システムのSDKを、対象言語・エコシステムごとに整理し、それぞれの役割と使い方を明確にします。

## SDK分類 / SDK Classification

### 1. Web Backend SDKs（Webバックエンド向けSDK）

サーバーサイドWebアプリケーションフレームワーク向けのSDK群。HTTP/gRPC/GraphQLでコアAPIを呼び出すラッパーとして機能します。

| 言語/Framework | SDK名 | 主な用途 | インストール |
|---------------|-------|---------|-------------|
| Node.js | `@vey/nodejs` | Express, Koa, Hapi等 | `npm install @vey/nodejs` |
| Django | `vey-django` | Django REST Framework | `pip install vey-django` |
| Flask | `vey-flask` | Flaskアプリケーション | `pip install vey-flask` |
| FastAPI | `vey-fastapi` | FastAPI async対応 | `pip install vey-fastapi` |
| Laravel | `vey/laravel` | Laravelアプリケーション | `composer require vey/laravel` |
| Symfony | `vey/symfony` | Symfonyバンドル | `composer require vey/symfony` |
| Ruby on Rails | `vey-rails` | Railsアプリケーション | `gem install vey-rails` |
| Spring Boot | `vey-spring-boot` | Spring Bootアプリケーション | Maven/Gradle |
| .NET | `Vey.AspNetCore` | ASP.NET Core | `dotnet add package Vey.AspNetCore` |
| Go | `github.com/vey/vey-go` | Goサーバー | `go get github.com/vey/vey-go` |
| Rust | `vey-rs` | Actix, Rocket等 | `cargo add vey` |

### 2. Scientific/Native SDKs（科学計算・ネイティブ向けSDK）

データ分析、機械学習、組込みシステム向けのSDK群。

| 言語 | SDK名 | 主な用途 | インストール |
|-----|-------|---------|-------------|
| R | `vey` | データ分析・統計処理 | `install.packages("vey")` |
| Julia | `Vey.jl` | 科学計算・機械学習 | `]add Vey` |
| C | `libvey` | 組込み・高速処理 | ビルドから |
| C++ | `vey-cpp` | 高性能アプリケーション | CMake/vcpkg |

### 3. Frontend SDKs（フロントエンド向けSDK）

クライアントサイドWebアプリケーション向けのSDK群。

| Framework | SDK名 | インストール |
|-----------|-------|-------------|
| React | `@vey/react` | `npm install @vey/react` |
| Vue | `@vey/vue` | `npm install @vey/vue` |
| Angular | `@vey/angular` | `npm install @vey/angular` |
| Svelte | `@vey/svelte` | `npm install @vey/svelte` |
| Next.js | `@vey/next` | `npm install @vey/next` |
| Nuxt | `@vey/nuxt` | `npm install @vey/nuxt` |

### 4. Mobile SDKs（モバイルアプリ向けSDK）

| Platform | SDK名 | インストール |
|----------|-------|-------------|
| React Native | `@vey/react-native` | `npm install @vey/react-native` |
| Flutter | `vey_flutter` | `flutter pub add vey_flutter` |
| iOS (Swift) | `VeySDK` | CocoaPods/SPM |
| Android (Kotlin) | `com.vey:vey-android` | Gradle |

## 詳細仕様 / Detailed Specifications

## 1. Web Backend SDKs

### 1.1 Node.js SDK

**パッケージ**: `@vey/nodejs`

**対応フレームワーク**:
- Express
- Koa
- Hapi
- Fastify
- NestJS

**機能**:
- 住所正規化・検証
- 送り状生成
- Webhook処理
- 決済トークン管理
- TypeScript完全サポート

**インストール**:
```bash
npm install @vey/nodejs
```

**基本使用例**:
```typescript
import { VeyClient } from '@vey/nodejs';

const vey = new VeyClient({
  apiKey: process.env.VEY_API_KEY,
  environment: 'production'
});

// 住所正規化
const normalized = await vey.address.normalize({
  raw_address: {
    country: 'JP',
    postal_code: '150-0001',
    address_line1: '東京都渋谷区神宮前1-1-1'
  }
});
```

**Express統合**:
```typescript
import express from 'express';
import { createVeyMiddleware } from '@vey/nodejs';

const app = express();

// Webhook用ミドルウェア
app.use('/webhook', createVeyMiddleware({
  secret: process.env.VEY_WEBHOOK_SECRET
}));
```

### 1.2 Django SDK

**パッケージ**: `vey-django`

**対応バージョン**: Django 3.2+

**機能**:
- Django REST Framework統合
- モデルフィールド（AddressField, PIDField）
- Django Admin統合
- シグナルサポート

**インストール**:
```bash
pip install vey-django
```

**settings.py**:
```python
INSTALLED_APPS = [
    ...
    'vey_django',
]

VEY_CONFIG = {
    'API_KEY': os.getenv('VEY_API_KEY'),
    'ENVIRONMENT': 'production',
}
```

**モデル定義**:
```python
from django.db import models
from vey_django.fields import AddressField, PIDField

class Order(models.Model):
    sender_address = AddressField()
    sender_pid = PIDField()
    recipient_address = AddressField()
    recipient_pid = PIDField()
    
    def save(self, *args, **kwargs):
        # 自動的にPID生成
        if not self.sender_pid and self.sender_address:
            self.sender_pid = self.sender_address.normalize().pid
        super().save(*args, **kwargs)
```

**ビュー**:
```python
from rest_framework.decorators import api_view
from vey_django import VeyClient

vey = VeyClient()

@api_view(['POST'])
def normalize_address(request):
    result = vey.address.normalize(request.data)
    return Response(result)
```

### 1.3 Flask SDK

**パッケージ**: `vey-flask`

**インストール**:
```bash
pip install vey-flask
```

**使用例**:
```python
from flask import Flask
from vey_flask import VeyFlask

app = Flask(__name__)
vey = VeyFlask(app, api_key=os.getenv('VEY_API_KEY'))

@app.route('/normalize', methods=['POST'])
def normalize():
    result = vey.address.normalize(request.json)
    return jsonify(result)

# Webhookハンドラー
@vey.webhook('delivery.status_changed')
def on_delivery_status(event, data):
    print(f"Delivery status: {data['status']}")
```

### 1.4 FastAPI SDK

**パッケージ**: `vey-fastapi`

**特徴**: 完全async対応

**インストール**:
```bash
pip install vey-fastapi
```

**使用例**:
```python
from fastapi import FastAPI
from vey_fastapi import VeyFastAPI
from pydantic import BaseModel

app = FastAPI()
vey = VeyFastAPI(api_key=os.getenv('VEY_API_KEY'))

class AddressInput(BaseModel):
    country: str
    postal_code: str
    address_line1: str

@app.post('/normalize')
async def normalize_address(address: AddressInput):
    result = await vey.address.normalize_async(address.dict())
    return result

# Webhookエンドポイント
@app.post('/webhook')
async def webhook_handler(request: Request):
    event = await vey.webhook.handle_async(request)
    return {'status': 'ok'}
```

### 1.5 Laravel SDK

**パッケージ**: `vey/laravel`

**対応バージョン**: Laravel 9.x, 10.x, 11.x

**インストール**:
```bash
composer require vey/laravel
php artisan vendor:publish --tag=vey-config
```

**config/vey.php**:
```php
<?php

return [
    'api_key' => env('VEY_API_KEY'),
    'environment' => env('VEY_ENVIRONMENT', 'production'),
];
```

**使用例**:
```php
<?php

namespace App\Http\Controllers;

use Vey\Laravel\Facades\Vey;

class AddressController extends Controller
{
    public function normalize(Request $request)
    {
        $normalized = Vey::address()->normalize([
            'raw_address' => $request->input('address')
        ]);
        
        return response()->json($normalized);
    }
}
```

**Eloquentモデル**:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Vey\Laravel\Traits\HasAddress;

class Order extends Model
{
    use HasAddress;
    
    protected $fillable = ['sender_address', 'recipient_address'];
    
    // 自動的にPID生成
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($order) {
            if ($order->sender_address && !$order->sender_pid) {
                $order->sender_pid = Vey::address()
                    ->normalize(['raw_address' => $order->sender_address])
                    ->pid;
            }
        });
    }
}
```

### 1.6 Ruby on Rails SDK

**パッケージ**: `vey-rails`

**対応バージョン**: Rails 6.1+

**インストール**:
```ruby
# Gemfile
gem 'vey-rails'
```

```bash
bundle install
rails generate vey:install
```

**config/initializers/vey.rb**:
```ruby
Vey.configure do |config|
  config.api_key = ENV['VEY_API_KEY']
  config.environment = :production
end
```

**モデル**:
```ruby
class Order < ApplicationRecord
  include Vey::Addressable
  
  vey_address :sender_address
  vey_address :recipient_address
  
  before_save :normalize_addresses
  
  def normalize_addresses
    self.sender_pid = Vey::Address.normalize(sender_address).pid if sender_address_changed?
    self.recipient_pid = Vey::Address.normalize(recipient_address).pid if recipient_address_changed?
  end
end
```

**コントローラー**:
```ruby
class AddressesController < ApplicationController
  def normalize
    result = Vey::Address.normalize(params[:address])
    render json: result
  end
  
  def verify
    result = Vey::Address.verify(
      pid: params[:pid],
      verification_type: params[:type],
      proof: params[:proof]
    )
    render json: result
  end
end
```

### 1.7 Spring Boot SDK

**パッケージ**: `com.vey:vey-spring-boot-starter`

**Maven**:
```xml
<dependency>
    <groupId>com.vey</groupId>
    <artifactId>vey-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

**application.properties**:
```properties
vey.api-key=${VEY_API_KEY}
vey.environment=production
```

**サービス**:
```java
package com.example.service;

import com.vey.client.VeyClient;
import com.vey.model.*;
import org.springframework.stereotype.Service;

@Service
public class AddressService {
    
    private final VeyClient veyClient;
    
    public AddressService(VeyClient veyClient) {
        this.veyClient = veyClient;
    }
    
    public NormalizedAddress normalizeAddress(RawAddress rawAddress) {
        return veyClient.address().normalize(rawAddress);
    }
    
    public VerifyResult verifyAddress(String pid, String verificationType, Proof proof) {
        return veyClient.address().verify(
            new VerifyRequest()
                .pid(pid)
                .verificationType(verificationType)
                .proof(proof)
        );
    }
}
```

**コントローラー**:
```java
package com.example.controller;

import com.example.service.AddressService;
import com.vey.model.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/address")
public class AddressController {
    
    private final AddressService addressService;
    
    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }
    
    @PostMapping("/normalize")
    public NormalizedAddress normalize(@RequestBody RawAddress rawAddress) {
        return addressService.normalizeAddress(rawAddress);
    }
}
```

### 1.8 .NET SDK

**パッケージ**: `Vey.AspNetCore`

**インストール**:
```bash
dotnet add package Vey.AspNetCore
```

**Program.cs**:
```csharp
using Vey;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddVey(options =>
{
    options.ApiKey = builder.Configuration["Vey:ApiKey"];
    options.Environment = "production";
});

var app = builder.Build();
```

**コントローラー**:
```csharp
using Microsoft.AspNetCore.Mvc;
using Vey;
using Vey.Models;

[ApiController]
[Route("api/[controller]")]
public class AddressController : ControllerBase
{
    private readonly IVeyClient _veyClient;
    
    public AddressController(IVeyClient veyClient)
    {
        _veyClient = veyClient;
    }
    
    [HttpPost("normalize")]
    public async Task<ActionResult<NormalizedAddress>> Normalize([FromBody] RawAddress rawAddress)
    {
        var result = await _veyClient.Address.NormalizeAsync(rawAddress);
        return Ok(result);
    }
    
    [HttpPost("verify")]
    public async Task<ActionResult<VerifyResult>> Verify([FromBody] VerifyRequest request)
    {
        var result = await _veyClient.Address.VerifyAsync(request);
        return Ok(result);
    }
}
```

### 1.9 Go SDK

**パッケージ**: `github.com/vey/vey-go`

**インストール**:
```bash
go get github.com/vey/vey-go
```

**使用例**:
```go
package main

import (
    "context"
    "log"
    "os"
    
    "github.com/vey/vey-go"
)

func main() {
    client := vey.NewClient(&vey.Config{
        APIKey:      os.Getenv("VEY_API_KEY"),
        Environment: "production",
    })
    
    // 住所正規化
    normalized, err := client.Address.Normalize(context.Background(), &vey.RawAddress{
        Country:      "JP",
        PostalCode:   "150-0001",
        AddressLine1: "東京都渋谷区神宮前1-1-1",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    log.Printf("PID: %s", normalized.PID)
}
```

**Ginフレームワーク統合**:
```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/vey/vey-go"
)

func main() {
    r := gin.Default()
    
    veyClient := vey.NewClient(&vey.Config{
        APIKey: os.Getenv("VEY_API_KEY"),
    })
    
    r.POST("/address/normalize", func(c *gin.Context) {
        var req vey.RawAddress
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }
        
        result, err := veyClient.Address.Normalize(c.Request.Context(), &req)
        if err != nil {
            c.JSON(500, gin.H{"error": err.Error()})
            return
        }
        
        c.JSON(200, result)
    })
    
    r.Run()
}
```

### 1.10 Rust SDK

**パッケージ**: `vey`

**Cargo.toml**:
```toml
[dependencies]
vey = "1.0"
tokio = { version = "1", features = ["full"] }
```

**使用例**:
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
    
    println!("PID: {}", normalized.pid);
    
    Ok(())
}
```

**Actix-web統合**:
```rust
use actix_web::{web, App, HttpServer, HttpResponse};
use vey::{VeyClient, RawAddress};

async fn normalize_address(
    data: web::Data<VeyClient>,
    req: web::Json<RawAddress>
) -> HttpResponse {
    match data.address().normalize(req.into_inner()).await {
        Ok(result) => HttpResponse::Ok().json(result),
        Err(e) => HttpResponse::InternalServerError().json(e.to_string()),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let vey_client = web::Data::new(VeyClient::new(Config {
        api_key: std::env::var("VEY_API_KEY").unwrap(),
        environment: "production".to_string(),
    }));
    
    HttpServer::new(move || {
        App::new()
            .app_data(vey_client.clone())
            .route("/address/normalize", web::post().to(normalize_address))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

## 2. Scientific/Native SDKs

### 2.1 R SDK

**パッケージ**: `vey`

**用途**: データ分析、地理統計、配送データの可視化

**インストール**:
```r
install.packages("vey")
```

**使用例**:
```r
library(vey)
library(ggplot2)

# クライアント初期化
client <- vey_client(
  api_key = Sys.getenv("VEY_API_KEY"),
  environment = "production"
)

# 住所データのバッチ正規化
addresses <- data.frame(
  country = c("JP", "JP", "JP"),
  postal_code = c("150-0001", "100-0001", "530-0001"),
  address_line1 = c(
    "東京都渋谷区神宮前1-1-1",
    "東京都千代田区千代田1-1",
    "大阪府大阪市北区梅田1-1"
  )
)

# バッチ正規化
normalized <- vey_normalize_batch(client, addresses)

# PID別の配送数を集計
delivery_counts <- normalized %>%
  group_by(admin1) %>%
  summarise(count = n())

# 可視化
ggplot(delivery_counts, aes(x = admin1, y = count)) +
  geom_bar(stat = "identity") +
  labs(title = "都道府県別配送数", x = "都道府県", y = "件数")
```

### 2.2 Julia SDK

**パッケージ**: `Vey.jl`

**用途**: 科学計算、機械学習、最適化

**インストール**:
```julia
using Pkg
Pkg.add("Vey")
```

**使用例**:
```julia
using Vey
using DataFrames

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

println("PID: ", normalized.pid)

# バッチ処理
addresses = DataFrame(
    country = ["JP", "JP", "JP"],
    postal_code = ["150-0001", "100-0001", "530-0001"],
    address_line1 = [
        "東京都渋谷区神宮前1-1-1",
        "東京都千代田区千代田1-1",
        "大阪府大阪市北区梅田1-1"
    ]
)

results = normalize_batch(client, addresses)
```

### 2.3 C SDK

**パッケージ**: `libvey`

**用途**: 
- 組込みシステム
- オフラインPID生成
- 高速バイナリ処理
- Ed25519署名実装

**ビルド**:
```bash
git clone https://github.com/vey/libvey
cd libvey
mkdir build && cd build
cmake ..
make
sudo make install
```

**使用例**:
```c
#include <vey/vey.h>
#include <stdio.h>
#include <stdlib.h>

int main() {
    // クライアント初期化
    vey_client_t* client = vey_client_new(
        getenv("VEY_API_KEY"),
        VEY_ENV_PRODUCTION
    );
    
    if (!client) {
        fprintf(stderr, "Failed to create client\n");
        return 1;
    }
    
    // オフラインPID生成（ネットワーク不要）
    vey_raw_address_t raw = {
        .country = "JP",
        .postal_code = "150-0001",
        .address_line1 = "東京都渋谷区神宮前1-1-1"
    };
    
    vey_normalized_address_t* normalized = NULL;
    int result = vey_normalize_address_offline(client, &raw, &normalized);
    
    if (result == VEY_OK && normalized) {
        printf("PID: %s\n", normalized->pid);
        printf("Country: %s\n", normalized->country);
        printf("Admin1: %s\n", normalized->admin1);
        
        // Ed25519署名生成
        uint8_t signature[64];
        if (vey_sign_pid(client, normalized->pid, signature) == VEY_OK) {
            printf("Signature generated successfully\n");
        }
        
        vey_normalized_address_free(normalized);
    } else {
        fprintf(stderr, "Normalization failed\n");
    }
    
    vey_client_free(client);
    return 0;
}
```

**CMakeLists.txt**:
```cmake
cmake_minimum_required(VERSION 3.10)
project(my_app)

find_package(Vey REQUIRED)

add_executable(my_app main.c)
target_link_libraries(my_app Vey::vey)
```

### 2.4 C++ SDK

**パッケージ**: `vey-cpp`

**用途**:
- 高性能アプリケーション
- 組込みシステム
- オフラインPID生成
- モダンC++17/20機能

**CMakeLists.txt**:
```cmake
cmake_minimum_required(VERSION 3.15)
project(my_app)

find_package(vey REQUIRED)

add_executable(my_app main.cpp)
target_link_libraries(my_app vey::vey)
target_compile_features(my_app PRIVATE cxx_std_17)
```

**使用例**:
```cpp
#include <vey/client.hpp>
#include <vey/crypto.hpp>
#include <iostream>

int main() {
    // クライアント初期化
    vey::Client client(
        std::getenv("VEY_API_KEY"),
        vey::Environment::Production
    );
    
    // オフライン住所正規化
    vey::RawAddress raw{
        .country = "JP",
        .postal_code = "150-0001",
        .address_line1 = "東京都渋谷区神宮前1-1-1"
    };
    
    try {
        auto normalized = client.address().normalize_offline(raw);
        std::cout << "PID: " << normalized.pid << std::endl;
        
        // Ed25519署名生成
        vey::crypto::Ed25519Signer signer;
        auto signature = signer.sign(normalized.pid);
        std::cout << "Signature: " << signature.hex() << std::endl;
        
        // オンライン検証（必要に応じて）
        auto verified = client.address().verify(
            normalized.pid,
            vey::VerificationType::Signature,
            vey::Proof{.signature = signature.bytes()}
        );
        
        if (verified.verified) {
            std::cout << "Address verified successfully" << std::endl;
        }
    } catch (const vey::VeyException& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

**ヘッダーオンリー使用**:
```cpp
#define VEY_HEADER_ONLY
#include <vey/vey.hpp>

int main() {
    // すべての機能がヘッダーから利用可能
    vey::PID pid = vey::encode_pid({
        .country = "JP",
        .admin1 = "13",
        .admin2 = "113"
    });
    
    std::cout << "PID: " << pid.to_string() << std::endl;
    return 0;
}
```

## SDK選択ガイド / SDK Selection Guide

### Web Backend開発

| ユースケース | 推奨SDK |
|-------------|---------|
| Node.js Express API | `@vey/nodejs` |
| Python REST API | `vey-django` または `vey-flask` |
| Python async API | `vey-fastapi` |
| PHP Laravel | `vey/laravel` |
| Ruby on Rails | `vey-rails` |
| Java Spring Boot | `vey-spring-boot` |
| C# ASP.NET Core | `Vey.AspNetCore` |
| Go microservices | `github.com/vey/vey-go` |
| Rust高性能API | `vey` (Rust crate) |

### データ分析・科学計算

| ユースケース | 推奨SDK |
|-------------|---------|
| 統計分析・可視化 | `vey` (R) |
| 機械学習・最適化 | `Vey.jl` (Julia) |
| 高速バッチ処理 | `libvey` (C/C++) |

### 組込み・エッジコンピューティング

| ユースケース | 推奨SDK |
|-------------|---------|
| IoTデバイス | `libvey` (C) |
| 高性能組込み | `vey-cpp` (C++) |
| オフラインPID生成 | `libvey` / `vey-cpp` |

## まとめ / Summary

各SDKは以下の責務を持ちます：

✅ **Web Backend SDKs**: サーバーコアAPIへのHTTP/gRPC呼び出しをラップ

✅ **Scientific SDKs**: データ分析・機械学習向けの高レベルAPI提供

✅ **Native SDKs (C/C++)**: オフラインPID生成・高速処理・署名実装に特化

すべてのSDKは統一されたAPIインターフェースを提供し、言語・エコシステムに合わせた最適な開発体験を実現します。
