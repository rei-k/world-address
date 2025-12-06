# 配送システム機能 / Delivery System Features

このドキュメントは、配送業者への住所伝達、印刷/PDF、顧客リスト管理機能について説明します。

This document describes the address transmission to delivery companies, printing/PDF, and customer list management features.

## 📑 目次 / Table of Contents

1. [顧客リスト管理 / Customer List Management](#顧客リスト管理--customer-list-management)
2. [PDF印刷機能 / PDF Printing Features](#pdf印刷機能--pdf-printing-features)
3. [配送業者への住所送信 / Address Transmission to Carriers](#配送業者への住所送信--address-transmission-to-carriers)
4. [使用方法 / Usage](#使用方法--usage)
5. [API Reference](#api-reference)

---

## 顧客リスト管理 / Customer List Management

### 概要 / Overview

配送先顧客を一元管理し、検索、フィルタリング、エクスポートが可能です。

Centrally manage delivery recipients with search, filtering, and export capabilities.

### 主な機能 / Key Features

- ✅ 顧客情報の表示と管理 / Display and manage customer information
- 🔍 名前、メール、会社名での検索 / Search by name, email, or company name
- 🏷️ タグによるフィルタリング / Filter by tags
- 📊 並び替え機能（名前、配送回数、最終配送日など）/ Sort by name, delivery count, last delivery date, etc.
- 📥 CSV形式でのエクスポート / Export to CSV format
- 🖨️ 印刷用PDF生成 / Generate printable PDF

### アクセス方法 / Access

```
/customers
```

ナビゲーションメニューから「顧客リスト / Customer List」を選択してください。

Select "Customer List" from the navigation menu.

### データ構造 / Data Structure

```typescript
interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  addressId?: string;
  address?: Address;
  companyName?: string;
  notes?: string;
  tags?: string[];
  totalDeliveries?: number;
  lastDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 使用例 / Usage Example

```typescript
import { getCustomerList, exportCustomersToCSV } from '@/src/services/customer.service';

// 顧客リストを取得 / Get customer list
const customers = await getCustomerList(userId, {
  search: '山田',
  tags: ['regular', 'business'],
  sortBy: 'totalDeliveries',
  sortOrder: 'desc',
});

// CSVエクスポート / Export to CSV
const csvContent = exportCustomersToCSV(customers);
downloadCSV(csvContent, 'customers.csv');
```

---

## PDF印刷機能 / PDF Printing Features

### 概要 / Overview

配送伝票と顧客リストをブラウザの印刷機能を使用してPDF化できます。

Convert waybills and customer lists to PDF using the browser's print functionality.

### 主な機能 / Key Features

- 📄 配送伝票の印刷 / Print waybills
- 👥 顧客リストの印刷 / Print customer lists
- 🎨 プロフェッショナルなレイアウト / Professional layout
- 📱 QRコード・バーコード対応 / QR code and barcode support
- 🌐 多言語対応（日本語・英語）/ Multilingual support (Japanese/English)

### 配送伝票印刷 / Waybill Printing

#### 機能 / Features

- ✅ 送り主・受取人情報 / Sender and recipient information
- ✅ 荷物情報（重量、サイズ、内容物）/ Package information (weight, size, contents)
- ✅ 配送情報（ステータス、配送予定日）/ Delivery information (status, estimated delivery)
- ✅ QRコード / QR code
- ✅ バーコード / Barcode
- ✅ 追跡番号 / Tracking number

#### 使用例 / Usage Example

```typescript
import { generateWaybillHTML, openPrintPreview } from '@/src/services/pdf.service';

// 配送伝票のHTML生成 / Generate waybill HTML
const html = generateWaybillHTML({
  waybill,
  delivery,
  senderAddress,
  recipientAddress,
  carrier,
}, {
  format: 'A4',
  orientation: 'portrait',
  includeQRCode: true,
  includeBarcode: true,
});

// 印刷プレビューを開く / Open print preview
openPrintPreview(html);
```

### 顧客リスト印刷 / Customer List Printing

#### 機能 / Features

- ✅ 表形式での顧客情報表示 / Display customer information in table format
- ✅ フィルタリング後のリスト印刷 / Print filtered lists
- ✅ 選択した顧客のみ印刷 / Print selected customers only
- ✅ 自動ページネーション / Automatic pagination

#### 使用例 / Usage Example

```typescript
import { generateCustomerListHTML, openPrintPreview } from '@/src/services/pdf.service';

// 顧客リストのHTML生成 / Generate customer list HTML
const html = generateCustomerListHTML({
  customers,
  title: '顧客リスト / Customer List',
  generatedAt: new Date(),
  generatedBy: 'John Doe',
}, {
  format: 'A4',
  orientation: 'landscape',
});

// 印刷プレビューを開く / Open print preview
openPrintPreview(html);
```

---

## 配送業者への住所送信 / Address Transmission to Carriers

### 概要 / Overview

配送業者のAPIに住所データを直接送信し、配送依頼を自動化します。

Automatically send address data directly to carrier APIs for delivery requests.

### 主な機能 / Key Features

- 📤 配送業者への住所自動送信 / Automatic address transmission to carriers
- 🔄 送信ステータスの追跡 / Track transmission status
- ✅ 送信前の住所検証 / Validate addresses before transmission
- 🔁 失敗時の自動リトライ / Automatic retry on failure
- 📊 送信履歴の管理 / Manage transmission history

### 対応配送業者 / Supported Carriers

- ✅ **UPS** (United Parcel Service)
- ✅ **FedEx**
- ✅ **DHL Express**
- ✅ **Yamato Transport** (ヤマト運輸)
- ✅ **SF Express** (顺丰速运)
- ✅ **JD Logistics** (京东物流)

### 使用方法 / Usage

#### 単一送信 / Single Transmission

```typescript
import { transmitAddress } from '@/src/services/transmission.service';

const result = await transmitAddress({
  waybillId: 'wb-123',
  carrierId: 'yamato-transport',
  addressData: {
    sender: senderAddress,
    recipient: recipientAddress,
  },
  packageInfo: {
    weight: 2.5,
    dimensions: { length: 30, width: 20, height: 10 },
    description: 'Electronics',
    value: 5000,
    currency: 'JPY',
  },
});

if (result.status === 'confirmed') {
  console.log(`送信成功: ${result.trackingNumber}`);
}
```

#### 一括送信 / Batch Transmission

```typescript
import { batchTransmitAddresses } from '@/src/services/transmission.service';

const batchResult = await batchTransmitAddresses({
  waybillIds: ['wb-123', 'wb-124', 'wb-125'],
  carrierId: 'yamato-transport',
  options: {
    pickupDate: new Date('2024-12-10'),
    notifyOnCompletion: true,
  },
});

console.log(`成功: ${batchResult.successful}件`);
console.log(`失敗: ${batchResult.failed}件`);
```

#### 送信前検証 / Pre-transmission Validation

```typescript
import { validateAddressForTransmission } from '@/src/services/transmission.service';

const validation = await validateAddressForTransmission(address, 'yamato-transport');

if (!validation.isValid) {
  console.error('検証エラー:', validation.errors);
} else if (validation.warnings) {
  console.warn('警告:', validation.warnings);
}
```

### データフロー / Data Flow

```
┌─────────────┐
│   Waybill   │
│   Detail    │
│    Page     │
└──────┬──────┘
       │
       │ 📤 住所送信ボタンクリック
       │    Click "Transmit Address"
       ▼
┌──────────────────┐
│  Transmission    │
│    Service       │
└──────┬───────────┘
       │
       │ 1. 住所検証 / Validate address
       │ 2. フォーマット変換 / Format conversion
       │ 3. API送信 / Send to API
       │
       ▼
┌──────────────────┐
│  Carrier API     │
│  (UPS, FedEx,    │
│   Yamato, etc.)  │
└──────┬───────────┘
       │
       │ 追跡番号返却 / Return tracking number
       ▼
┌──────────────────┐
│  Transmission    │
│    Result        │
└──────────────────┘
```

---

## 使用方法 / Usage

### 1. 顧客リストの表示 / Display Customer List

1. ナビゲーションメニューから「顧客リスト」を選択
2. 検索ボックスで顧客を検索
3. タグでフィルタリング
4. 並び替え条件を選択

### 2. 配送伝票の印刷 / Print Waybill

1. 配送伝票詳細ページを開く (`/waybills/[id]`)
2. 「伝票を印刷」ボタンをクリック
3. 印刷プレビューが表示される
4. ブラウザの印刷機能でPDF保存または印刷

### 3. 配送業者への住所送信 / Transmit Address to Carrier

1. 配送伝票詳細ページを開く (`/waybills/[id]`)
2. 「配送業者へ送信」ボタンをクリック
3. 送信完了メッセージと追跡番号を確認

---

## API Reference

### Customer Service

#### `getCustomerList(userId: string, filter?: CustomerListFilter): Promise<Customer[]>`

顧客リストを取得します。

Get customer list.

#### `exportCustomersToCSV(customers: Customer[]): string`

顧客リストをCSV形式で出力します。

Export customer list to CSV format.

#### `downloadCSV(csvContent: string, filename: string): void`

CSVファイルをダウンロードします。

Download CSV file.

### PDF Service

#### `generateWaybillHTML(data: WaybillPDFData, options?: PDFGenerationOptions): string`

配送伝票の印刷用HTMLを生成します。

Generate printable HTML for waybill.

#### `generateCustomerListHTML(data: CustomerListPDFData, options?: PDFGenerationOptions): string`

顧客リストの印刷用HTMLを生成します。

Generate printable HTML for customer list.

#### `openPrintPreview(html: string): void`

印刷プレビューウィンドウを開きます。

Open print preview window.

### Transmission Service

#### `transmitAddress(request: AddressTransmissionRequest): Promise<AddressTransmissionResult>`

配送業者に住所を送信します。

Transmit address to carrier.

#### `batchTransmitAddresses(request: BatchTransmissionRequest): Promise<BatchTransmissionResult>`

複数の住所を一括送信します。

Batch transmit addresses.

#### `validateAddressForTransmission(address: Address, carrierId: string): Promise<ValidationResult>`

送信前に住所を検証します。

Validate address before transmission.

---

## トラブルシューティング / Troubleshooting

### 印刷プレビューが表示されない

ポップアップブロッカーを無効にしてください。

Disable popup blocker.

### CSV出力が文字化けする

UTF-8対応のアプリケーション（Excel、Google Sheets等）で開いてください。

Open with UTF-8 compatible applications (Excel, Google Sheets, etc.).

### 配送業者への送信が失敗する

1. 住所情報が正しいか確認
2. 配送業者のAPIキーが設定されているか確認
3. ネットワーク接続を確認

---

## 今後の拡張予定 / Future Enhancements

- [ ] カスタムPDFテンプレート / Custom PDF templates
- [ ] 一括印刷機能 / Bulk printing
- [ ] メール送信機能 / Email delivery
- [ ] 配送業者の追加（USPS, Canada Post等）/ Add more carriers (USPS, Canada Post, etc.)
- [ ] リアルタイム追跡通知 / Real-time tracking notifications
- [ ] 配送コスト最適化 / Delivery cost optimization

---

## サポート / Support

ご質問やバグ報告は、GitHubのIssueまでお願いします。

For questions or bug reports, please create an issue on GitHub.

---

**Last Updated**: December 6, 2024  
**Version**: 1.0.0
