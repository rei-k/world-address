# アジア地域の住所フォーマット / Asia Address Formats

アジア54カ国の住所フォーマット一覧。

Address formats for 54 countries in Asia.

---

## 🌏 東アジア / East Asia

### 日本 / Japan (JP)

```yaml
format:
  order: [postalCode, province, city, ward, streetAddress, building, room]
  postalCodeFormat: "^[0-9]{3}-[0-9]{4}$"
  example: "〒150-0043 東京都渋谷区道玄坂1-2-3"
```

### 中国 / China (CN)

```yaml
format:
  order: [province, city, district, streetAddress, building, room, postalCode]
  postalCodeFormat: "^[0-9]{6}$"
  example: "北京市朝阳区建国路1号 100020"
```

### 韓国 / South Korea (KR)

```yaml
format:
  order: [province, city, district, streetAddress, building, room, postalCode]
  postalCodeFormat: "^[0-9]{5}$"
  example: "서울특별시 강남구 테헤란로 123 12345"
```

---

## 🌏 東南アジア / Southeast Asia

### タイ / Thailand (TH)

```yaml
format:
  order: [building, streetAddress, subdistrict, district, province, postalCode]
  postalCodeFormat: "^[0-9]{5}$"
```

### シンガポール / Singapore (SG)

```yaml
format:
  order: [building, streetAddress, postalCode]
  postalCodeFormat: "^[0-9]{6}$"
```

---

## 🌏 南アジア / South Asia

### インド / India (IN)

```yaml
format:
  order: [building, streetAddress, locality, city, state, postalCode]
  postalCodeFormat: "^[0-9]{6}$"
```

---

## 📝 使用例 / Usage Example

```typescript
import { getCountryFormat } from '@/cloud-address-book-app/global-formats';

// 日本の住所フォーマットを取得
const jpFormat = await getCountryFormat('JP');

// 住所を正規化
const normalized = await normalizeAddress(rawAddress, jpFormat);
```

---

## 🔗 詳細データ / Detailed Data

完全な住所フォーマットデータは以下を参照：

- [データディレクトリ](../../../data/asia/)
- [スキーマドキュメント](../../../docs/schema/README.md)

---

**🌐 World Address YAML / JSON** - Asia Address Formats
