# 住所ステータス / Address Status

住所の正規化・照合状況・利用サイト数を一覧表示。

Display normalization, verification status, and number of linked sites for addresses.

---

## 📊 表示される情報 / Displayed Information

### 正規化状況 / Normalization Status

住所がAMF（Address Mapping Framework）により正規化されているかを確認。

| ステータス | 説明 | アイコン |
|-----------|------|---------|
| ✅ 正規化済み | AMFで正規化完了 | 🟢 |
| ⏳ 処理中 | 正規化処理中 | 🟡 |
| ❌ 失敗 | 正規化失敗（手動修正必要） | 🔴 |

### 照合状況 / Verification Status

PID生成とVerifiable Credential（VC）発行の状態。

| ステータス | 説明 | アイコン |
|-----------|------|---------|
| ✅ 検証済み | PID生成・VC発行完了 | 🟢 |
| ⏳ 検証中 | 検証処理中 | 🟡 |
| ❌ 未検証 | 検証未実施 | 🔴 |
| 🔄 再検証必要 | PID更新推奨 | 🟠 |

### 利用サイト数 / Linked Sites Count

クラウド住所帳を利用しているECサイト・サービスの数。

```
┌─────────────────────────────┐
│ 利用サイト数: 12サイト        │
│                             │
│ ECサイト:    8              │
│ フードデリバリー: 2          │
│ その他:      2              │
└─────────────────────────────┘
```

---

## 🔍 詳細情報 / Details

### 住所ごとのステータス

```typescript
interface AddressStatus {
  addressId: string;
  label: string;
  
  // 正規化
  normalized: boolean;
  normalizedAt?: Date;
  normalizationError?: string;
  
  // 検証
  verified: boolean;
  verifiedAt?: Date;
  pidGenerated: boolean;
  vcIssued: boolean;
  
  // 利用状況
  linkedSitesCount: number;
  linkedSites: string[];
  lastUsedAt?: Date;
}
```

### 使用例

```typescript
import { getAddressStatus } from '@/cloud-address-book-app/dashboard/status';

const status = await getAddressStatus(addressId);

console.log(`正規化: ${status.normalized ? '済' : '未'}`);
console.log(`検証: ${status.verified ? '済' : '未'}`);
console.log(`利用サイト: ${status.linkedSitesCount}件`);
```

---

## 🔔 アラート / Alerts

### 正規化失敗

住所の正規化に失敗した場合、手動修正を促すアラートを表示。

### PID更新推奨

PIDの有効期限が近い場合、再検証を促すアラートを表示。

---

**🌐 World Address YAML / JSON** - Address Status
