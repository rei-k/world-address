# クレジットカード - Visa / Credit Card - Visa

Visaカードの登録と管理。トークン化により安全に保存。

Register and manage Visa cards. Securely stored via tokenization.

---

## 💳 Visaカード登録 / Visa Card Registration

### 登録方法

```typescript
import { addCreditCard } from '@/cloud-address-book-app/payment-methods';

const card = await addCreditCard(userId, {
  cardNumber: '4111111111111111',
  cardholderName: '山田 太郎',
  expiryMonth: 12,
  expiryYear: 2026,
  cvv: '123',
  brand: 'visa',
  billingAddressId: 'addr-123'
});

// トークン化されたカード情報のみ返される
console.log(card.token);  // tok_visa_XXXXXX
console.log(card.last4);  // 1111
```

---

## 🔐 セキュリティ / Security

### トークン化

実際のカード番号は保存されず、トークンのみが保存されます。

| 保存されるもの | 保存されないもの |
|--------------|----------------|
| ✅ トークン | ❌ カード番号（全桁） |
| ✅ 下4桁 | ❌ CVV |
| ✅ 有効期限 | ❌ カード名義の完全形 |
| ✅ ブランド | ❌ 磁気ストライプデータ |

### PCI DSS準拠

クラウド住所帳はPCI DSS（Payment Card Industry Data Security Standard）に準拠しています。

---

## 🌍 対応地域 / Supported Regions

Visaは世界200カ国以上で利用可能です。

---

## 💡 使い方のヒント / Usage Tips

- ✅ 複数のVisaカードを登録可能
- ✅ デフォルトカードの設定で高速決済
- ✅ 有効期限切れアラートを有効化

---

**🌐 World Address YAML / JSON** - Visa Card Management
