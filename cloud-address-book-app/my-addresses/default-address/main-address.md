# デフォルト住所 / Default Address

高速チェックアウト用のメイン住所設定。ECサイトでの決済時に自動的に選択される住所。

Main address for quick checkout. Automatically selected during EC site checkout.

---

## 🎯 概要 / Overview

デフォルト住所は、ECサイトやサービスで配送先を選択する際に最初に表示される住所です。ワンクリックチェックアウトを実現するための重要な設定です。

---

## 📋 設定方法 / How to Set

### UIから設定

1. My Addresses画面を開く
2. デフォルトにしたい住所カードの「デフォルトに設定」ボタンをクリック
3. 確認ダイアログで「はい」を選択

### APIから設定

```typescript
import { setDefaultAddress } from '@/cloud-address-book-app/my-addresses';

await setDefaultAddress(userId, addressId);
```

---

## ⚡ 高速チェックアウト / Quick Checkout

デフォルト住所が設定されている場合、ECサイトでの決済時に住所入力をスキップできます。

### フロー

1. ECサイトでカートに商品を追加
2. チェックアウトボタンをクリック
3. クラウド住所帳が自動的にデフォルト住所を提供
4. 配送先確認画面で「この住所で決済」をクリック
5. 決済完了

### 例

```typescript
// ECサイト側の実装
import { getDefaultAddress } from '@cloud-address-book/sdk';

const defaultAddress = await getDefaultAddress(userId);

if (defaultAddress) {
  // デフォルト住所で自動入力
  fillShippingForm(defaultAddress);
}
```

---

## 🔒 セキュリティ / Security

デフォルト住所へのアクセスも完全に監査ログに記録されます。

```typescript
// アクセスログの例
{
  action: 'default_address_accessed',
  accessor: 'amazon-jp',
  timestamp: '2024-12-02T12:00:00Z',
  purpose: 'checkout'
}
```

---

## 💡 ベストプラクティス / Best Practices

- ✅ 最も頻繁に使う住所をデフォルトに設定
- ✅ 引越し後は速やかにデフォルト住所を更新
- ✅ 定期的にデフォルト住所の正確性を確認

---

**🌐 World Address YAML / JSON** - Default Address
