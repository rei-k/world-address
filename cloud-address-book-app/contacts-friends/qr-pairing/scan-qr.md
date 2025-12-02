# QRペアリング / QR Pairing

QRコードで友達を登録。スキャンするだけで簡単に連絡先追加。

Register friends via QR code. Simply scan to add contacts.

---

## 📱 QRコードスキャン / Scan QR Code

### 使い方

1. 友達のQRコードをカメラでスキャン
2. プロフィール情報を確認
3. 「友達に追加」ボタンをタップ
4. 登録完了

### 実装例

```typescript
import { scanQRCode, addFriend } from '@/cloud-address-book-app/contacts-friends';

// QRコードをスキャン
const qrData = await scanQRCode();

// 友達として登録
const friend = await addFriend(userId, {
  gapId: qrData.gapId,
  name: qrData.name,
  avatar: qrData.avatar
});

console.log(`${friend.name}を友達に追加しました`);
```

---

## 🔐 セキュリティ / Security

### QRコードの種類

1. **パーソナルQR**: 永続的、公開プロフィール
2. **一時的QR**: 有効期限あり、限定情報
3. **配送専用QR**: 配送用のPIDのみ

### 暗号化

QRコードに含まれるデータは暗号化されています。

---

## 💡 活用シーン / Use Cases

- 👥 **イベント**: 名刺交換の代わりに
- 🎉 **パーティー**: 参加者同士で交換
- 🏢 **ビジネス**: 取引先との連絡先交換
- 📦 **配送**: 荷物の送り先登録

---

**🌐 World Address YAML / JSON** - QR Pairing
