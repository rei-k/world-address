# PID生成アルゴリズムと数式モデル / PID Generation Algorithm

住所を一意に識別するPlace ID (PID) の生成アルゴリズムと数学的モデルを定義します。

## 📋 概要

PID (Place ID) は、世界中の任意の住所を階層的かつ一意に識別するための識別子です。

### 設計原則

1. **階層性**: 国→都道府県→市区町村→町→番地→建物→部屋の階層構造
2. **一意性**: 同じ住所は常に同じPIDを生成
3. **可逆性**: PIDから住所の階層構造を復元可能
4. **コンパクト性**: 可能な限り短い表現
5. **拡張性**: 将来的な住所体系の変更に対応可能

## 🔢 PIDフォーマット定義

### 基本フォーマット

```
PID = <Country>-<Admin1>-<Admin2>-<Locality>-<Sublocality>-<Block>-<Building>-<Unit>
```

### 各コンポーネントの定義

| レベル | フィールド名 | 説明 | 例 | 文字数 |
|--------|------------|------|-----|--------|
| 0 | Country | 国/地域 (ISO 3166-1 alpha-2) | `JP` | 2 |
| 1 | Admin1 | 第1行政階層（都道府県/州/省） | `13` | 2-3 |
| 2 | Admin2 | 第2行政階層（市区町村/県） | `113` | 2-4 |
| 3 | Locality | 第3行政階層（区/郡/市） | `01` | 2-4 |
| 4 | Sublocality | 町/丁目/通り | `T07` | 2-6 |
| 5 | Block | 番地/ブロック | `B12` | 2-6 |
| 6 | Building | 建物/ビル | `BN02` | 2-8 |
| 7 | Unit | 部屋/ユニット | `R342` | 2-6 |

### PIDの階層レベル

PIDは必要な粒度に応じて、異なるレベルで終了できます：

```
JP                              # 国レベル
JP-13                           # 都道府県レベル
JP-13-113                       # 市区町村レベル
JP-13-113-01                    # 区レベル
JP-13-113-01-T07                # 町レベル
JP-13-113-01-T07-B12            # 番地レベル
JP-13-113-01-T07-B12-BN02       # 建物レベル
JP-13-113-01-T07-B12-BN02-R342  # 部屋レベル（完全なPID）
```

## 🧮 数学的モデル

### 1. PID生成関数

PIDは住所の階層構造を受け取り、文字列を生成する関数として定義されます：

```
PID: Address → String

where Address = (c, a₁, a₂, l, s, b, bd, u)

c  : Country Code (ISO 3166-1 alpha-2)
a₁ : Administrative Level 1 Code
a₂ : Administrative Level 2 Code
l  : Locality Code
s  : Sublocality Code
b  : Block Code
bd : Building Code
u  : Unit Code
```

### 2. 正規化関数

住所を正規化してからPIDを生成します：

```
normalize: RawAddress → NormalizedAddress

normalize(raw) = (
  normalizeCountry(raw.country),
  normalizeAdmin1(raw.admin1, raw.country),
  normalizeAdmin2(raw.admin2, raw.admin1, raw.country),
  normalizeLocality(raw.locality, raw.admin2, raw.admin1, raw.country),
  normalizeSublocality(raw.sublocality),
  normalizeBlock(raw.block),
  normalizeBuilding(raw.building),
  normalizeUnit(raw.unit)
)
```

### 3. コード生成関数

各階層のコードを生成する関数：

#### Admin1コード生成（都道府県）

```
encodeAdmin1: (name: String, country: String) → String

encodeAdmin1("東京都", "JP") = "13"
encodeAdmin1("大阪府", "JP") = "27"
encodeAdmin1("California", "US") = "CA"
```

日本の場合：JIS X0401に基づく都道府県コード（2桁数字）

#### Admin2コード生成（市区町村）

```
encodeAdmin2: (name: String, admin1: String, country: String) → String

encodeAdmin2("渋谷区", "13", "JP") = "113"
encodeAdmin2("千代田区", "13", "JP") = "101"
```

日本の場合：総務省の市区町村コード（3桁）

#### Sublocalityコード生成（町丁目）

```
encodeSublocality: (name: String) → String

encodeSublocality("道玄坂1丁目") = "T01"  // T + 2桁数字
encodeSublocality("7丁目") = "T07"
encodeSublocality("Main Street") = "MS"
```

パターン：
- 丁目がある場合: `T` + 丁目番号（2桁ゼロパディング）
- 通り名の場合: 頭文字2文字の大文字

#### Blockコード生成（番地）

```
encodeBlock: (block: String) → String

encodeBlock("12番地") = "B12"
encodeBlock("1-2-3") = "B123"
encodeBlock("456") = "B456"
```

パターン：`B` + 番地番号（ハイフンを除去）

#### Buildingコード生成（建物）

```
encodeBuilding: (name: String, index?: Number) → String

encodeBuilding("渋谷ヒカリエ") = "BN01"  // Building Name + インデックス
encodeBuilding("タワーA") = "BNA"
encodeBuilding(null, 5) = "BN05"
```

パターン：
- 建物名がある場合: `BN` + アルファベット or 番号
- 建物番号のみの場合: `BN` + 番号（2桁ゼロパディング）

#### Unitコード生成（部屋番号）

```
encodeUnit: (unit: String) → String

encodeUnit("342号室") = "R342"
encodeUnit("3F-12") = "R312"
encodeUnit("A-101") = "RA101"
```

パターン：`R` + 部屋番号（アルファベット・数字）

### 4. PID連結関数

正規化されたコンポーネントを連結してPIDを生成：

```
concatenate: NormalizedAddress → PID

concatenate(c, a₁, a₂, l, s, b, bd, u) = 
  c + "-" + a₁ + "-" + a₂ + "-" + l + "-" + s + "-" + b + "-" + bd + "-" + u

// 空のコンポーネントは除外
concatenate(c, a₁, a₂, null, null, null, null, null) = c + "-" + a₁ + "-" + a₂
```

### 5. PID検証関数

PIDの妥当性を検証：

```
validate: PID → Boolean

validate(pid) = 
  matchesPattern(pid) ∧ 
  validCountryCode(getCountry(pid)) ∧
  validHierarchy(pid) ∧
  notRevoked(pid)

where
  matchesPattern(pid) = pid matches "^[A-Z]{2}(-[A-Z0-9]+)*$"
  validCountryCode(code) = code ∈ ISO3166Countries
  validHierarchy(pid) = コンポーネントの階層が正しい
  notRevoked(pid) = PIDが失効リストにない
```

## 🔄 PIDの可逆性（デコード）

PIDから住所の階層構造を復元：

```
decode: PID → AddressComponents

decode("JP-13-113-01-T07-B12-BN02-R342") = {
  country: "JP",
  admin1: "13",
  admin2: "113",
  locality: "01",
  sublocality: "T07",
  block: "B12",
  building: "BN02",
  unit: "R342"
}
```

### デコード後の名前解決

```
resolve: AddressComponents → HumanReadableAddress

resolve({country: "JP", admin1: "13", admin2: "113", ...}) = {
  country: "Japan",
  admin1: "Tokyo",
  admin2: "Shibuya-ku",
  locality: "Shibuya 1-chome",
  ...
}
```

## 📊 実装例

### TypeScript実装

```typescript
interface AddressComponents {
  country: string;
  admin1?: string;
  admin2?: string;
  locality?: string;
  sublocality?: string;
  block?: string;
  building?: string;
  unit?: string;
}

/**
 * 住所コンポーネントからPIDを生成
 */
function encodePID(components: AddressComponents): string {
  const parts: string[] = [components.country];
  
  if (components.admin1) parts.push(components.admin1);
  if (components.admin2) parts.push(components.admin2);
  if (components.locality) parts.push(components.locality);
  if (components.sublocality) parts.push(components.sublocality);
  if (components.block) parts.push(components.block);
  if (components.building) parts.push(components.building);
  if (components.unit) parts.push(components.unit);
  
  return parts.join('-');
}

/**
 * PIDから住所コンポーネントを復元
 */
function decodePID(pid: string): AddressComponents {
  const parts = pid.split('-');
  
  return {
    country: parts[0],
    admin1: parts[1],
    admin2: parts[2],
    locality: parts[3],
    sublocality: parts[4],
    block: parts[5],
    building: parts[6],
    unit: parts[7]
  };
}

/**
 * PIDの妥当性を検証
 */
function validatePID(pid: string): { valid: boolean; error?: string } {
  // 1. フォーマット検証
  const pattern = /^[A-Z]{2}(-[A-Z0-9]+)*$/;
  if (!pattern.test(pid)) {
    return { valid: false, error: 'Invalid PID format' };
  }
  
  // 2. 国コード検証
  const components = decodePID(pid);
  if (!isValidCountryCode(components.country)) {
    return { valid: false, error: 'Invalid country code' };
  }
  
  // 3. 階層検証
  if (!isValidHierarchy(components)) {
    return { valid: false, error: 'Invalid hierarchy' };
  }
  
  return { valid: true };
}

/**
 * 住所正規化してPID生成
 */
async function generatePID(rawAddress: RawAddress): Promise<string> {
  // 1. 住所正規化
  const normalized = await normalizeAddress(rawAddress);
  
  // 2. 各コンポーネントのエンコード
  const components: AddressComponents = {
    country: normalized.countryCode,
    admin1: encodeAdmin1(normalized.admin1, normalized.countryCode),
    admin2: encodeAdmin2(normalized.admin2, normalized.admin1, normalized.countryCode),
    locality: encodeLocality(normalized.locality),
    sublocality: encodeSublocality(normalized.sublocality),
    block: encodeBlock(normalized.block),
    building: encodeBuilding(normalized.building),
    unit: encodeUnit(normalized.unit)
  };
  
  // 3. PID生成
  return encodePID(components);
}
```

### Python実装

```python
from typing import Optional, Dict
import re

class AddressComponents:
    def __init__(
        self,
        country: str,
        admin1: Optional[str] = None,
        admin2: Optional[str] = None,
        locality: Optional[str] = None,
        sublocality: Optional[str] = None,
        block: Optional[str] = None,
        building: Optional[str] = None,
        unit: Optional[str] = None
    ):
        self.country = country
        self.admin1 = admin1
        self.admin2 = admin2
        self.locality = locality
        self.sublocality = sublocality
        self.block = block
        self.building = building
        self.unit = unit

def encode_pid(components: AddressComponents) -> str:
    """住所コンポーネントからPIDを生成"""
    parts = [components.country]
    
    if components.admin1:
        parts.append(components.admin1)
    if components.admin2:
        parts.append(components.admin2)
    if components.locality:
        parts.append(components.locality)
    if components.sublocality:
        parts.append(components.sublocality)
    if components.block:
        parts.append(components.block)
    if components.building:
        parts.append(components.building)
    if components.unit:
        parts.append(components.unit)
    
    return '-'.join(parts)

def decode_pid(pid: str) -> AddressComponents:
    """PIDから住所コンポーネントを復元"""
    parts = pid.split('-')
    
    return AddressComponents(
        country=parts[0],
        admin1=parts[1] if len(parts) > 1 else None,
        admin2=parts[2] if len(parts) > 2 else None,
        locality=parts[3] if len(parts) > 3 else None,
        sublocality=parts[4] if len(parts) > 4 else None,
        block=parts[5] if len(parts) > 5 else None,
        building=parts[6] if len(parts) > 6 else None,
        unit=parts[7] if len(parts) > 7 else None
    )

def validate_pid(pid: str) -> Dict[str, any]:
    """PIDの妥当性を検証"""
    # フォーマット検証
    pattern = r'^[A-Z]{2}(-[A-Z0-9]+)*$'
    if not re.match(pattern, pid):
        return {'valid': False, 'error': 'Invalid PID format'}
    
    # 国コード検証
    components = decode_pid(pid)
    if not is_valid_country_code(components.country):
        return {'valid': False, 'error': 'Invalid country code'}
    
    return {'valid': True}
```

## 🌍 国別PIDエンコーディング例

### 日本 (JP)

```
住所: 東京都渋谷区道玄坂1丁目12番地 渋谷ヒカリエ 342号室

PID: JP-13-113-01-T01-B12-BN01-R342

分解:
- JP: 日本
- 13: 東京都 (JIS X0401)
- 113: 渋谷区 (総務省市区町村コード)
- 01: 渋谷1丁目
- T01: 道玄坂1丁目
- B12: 12番地
- BN01: 渋谷ヒカリエ (Building Name 01)
- R342: 342号室 (Room 342)
```

### アメリカ (US)

```
住所: 1600 Pennsylvania Avenue NW, Washington, DC 20500, USA

PID: US-DC-WDC-01-PA-B1600-BN01

分解:
- US: アメリカ合衆国
- DC: District of Columbia
- WDC: Washington DC
- 01: Northwest quadrant
- PA: Pennsylvania Avenue
- B1600: 番地1600
- BN01: ホワイトハウス (Building 01)
```

### イギリス (GB)

```
住所: 10 Downing Street, Westminster, London SW1A 2AA, UK

PID: GB-ENG-LDN-WST-DS-B10

分解:
- GB: イギリス
- ENG: England
- LDN: London
- WST: Westminster
- DS: Downing Street
- B10: 番地10
```

## 🔒 PIDとゼロ知識証明 (ZKP)

PIDは階層的な構造を持つため、ZK証明で部分的な情報のみを開示できます：

### 証明レベル

```
Level 0: 国レベルの証明
  prove(PID, country == "JP") → true/false
  
Level 1: 都道府県レベルの証明
  prove(PID, admin1 == "13") → true/false
  
Level 2: 市区町村レベルの証明
  prove(PID, admin2 == "113") → true/false
  
...

Level N: 完全なPID証明
  prove(PID, pid == "JP-13-113-01-T07-B12-BN02-R342") → true/false
```

### ZK証明回路

```
circuit ProveCountry {
  // 公開入力
  public input countryCode;
  
  // 秘密入力
  private input fullPID;
  
  // 制約
  component extractor = ExtractCountry();
  extractor.pid <== fullPID;
  
  countryCode === extractor.country;
}
```

## 📐 PIDの数学的性質

### 1. 一意性 (Uniqueness)

```
∀ address₁, address₂ ∈ Addresses:
  address₁ = address₂ ⟺ PID(address₁) = PID(address₂)
```

同じ住所は常に同じPIDを生成し、異なる住所は異なるPIDを生成します。

### 2. 階層性 (Hierarchy)

```
isPrefixOf: PID × PID → Boolean

isPrefixOf(p₁, p₂) = p₂ starts with p₁

Example:
  isPrefixOf("JP-13", "JP-13-113-01") = true
  isPrefixOf("JP-27", "JP-13-113-01") = false
```

### 3. 比較可能性 (Comparability)

```
distance: PID × PID → ℕ

distance(p₁, p₂) = 共通プレフィックスのレベル数

Example:
  distance("JP-13-113-01", "JP-13-113-02") = 3 (admin2まで共通)
  distance("JP-13-113-01", "JP-27-100-01") = 1 (countryのみ共通)
```

### 4. 可逆性 (Reversibility)

```
∀ pid ∈ PIDs:
  encode(decode(pid)) = pid
```

PIDをデコードしてから再エンコードすると元のPIDに戻ります。

## 🧪 テストケース

```typescript
describe('PID Generation', () => {
  test('日本の住所からPID生成', () => {
    const address = {
      country: 'JP',
      admin1: '13',
      admin2: '113',
      locality: '01',
      sublocality: 'T07',
      block: 'B12',
      building: 'BN02',
      unit: 'R342'
    };
    
    const pid = encodePID(address);
    expect(pid).toBe('JP-13-113-01-T07-B12-BN02-R342');
  });
  
  test('PIDのデコード', () => {
    const pid = 'JP-13-113-01-T07-B12-BN02-R342';
    const components = decodePID(pid);
    
    expect(components.country).toBe('JP');
    expect(components.admin1).toBe('13');
    expect(components.unit).toBe('R342');
  });
  
  test('部分的なPID生成', () => {
    const address = {
      country: 'JP',
      admin1: '13'
    };
    
    const pid = encodePID(address);
    expect(pid).toBe('JP-13');
  });
  
  test('PIDの検証', () => {
    expect(validatePID('JP-13-113-01').valid).toBe(true);
    expect(validatePID('INVALID').valid).toBe(false);
    expect(validatePID('jp-13-113').valid).toBe(false); // 小文字はNG
  });
});
```

## 📚 関連資料

- [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) - 国名コード
- [JIS X 0401](https://www.jisc.go.jp/) - 都道府県コード
- [総務省 市区町村コード](https://www.soumu.go.jp/denshijiti/code.html)
- [クラウド住所帳システム](./cloud-address-book.md)
- [ZKPプロトコル](./zkp-protocol.md)

---

**🌐 World Address YAML / JSON** - Hierarchical Place ID for Global Addresses
