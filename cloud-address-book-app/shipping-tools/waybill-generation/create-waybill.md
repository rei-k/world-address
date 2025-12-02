# 送り状生成 / Waybill Generation

クラウド住所帳の住所情報を使って送り状を簡単に作成。

Easily create waybills using Cloud Address Book address information.

---

## 📝 送り状の作成 / Creating a Waybill

### 基本的な使い方

```typescript
import { createWaybill } from '@/cloud-address-book-app/shipping-tools';

const waybill = await createWaybill({
  sender: {
    addressId: 'addr-123',
    name: '山田太郎',
    phone: '090-1234-5678'
  },
  recipient: {
    gapId: 'gap:user:xyz789'  // 友達のGAP ID
  },
  carrier: 'yamato',
  items: [{
    name: '書籍',
    quantity: 3,
    weight: 500,
    value: 3000
  }]
});

// 送り状番号
console.log(waybill.trackingNumber);
```

---

## 📋 送り状に含まれる情報 / Waybill Information

### 必須項目

- ✅ 送り主情報（名前、住所、電話番号）
- ✅ 受取人情報（名前、住所、電話番号）
- ✅ 荷物情報（品名、数量、重量）
- ✅ 配送業者

### 任意項目

- 📦 保険
- ⏰ 配達時間帯指定
- 📝 受取サイン
- 💴 代金引換

---

## 🖨️ 印刷 / Printing

送り状はPDF形式でダウンロードして印刷できます。

```typescript
import { downloadWaybill } from '@/cloud-address-book-app/shipping-tools';

await downloadWaybill(waybillId, 'pdf');
```

---

## 💡 活用例 / Use Cases

### 個人間配送
友達にプレゼントを送る際、GAP IDだけで送り状作成

### ビジネス配送
取引先への定期配送をテンプレート化

### フリマ配送
メルカリなどで売れた商品の発送

---

**🌐 World Address YAML / JSON** - Waybill Generation
