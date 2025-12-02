# 住所データ / Address Data

このディレクトリには、世界各国・地域の住所形式をYAML形式とJSON形式で構造化したデータが含まれています。

## 📁 構成

データは大陸ごとに整理されています：

| ディレクトリ | 大陸 | 説明 |
|-------------|------|------|
| [africa/](./africa/) | アフリカ | 54か国・地域 |
| [americas/](./americas/) | アメリカ大陸 | 45か国・地域（北米・中米・南米・カリブ海） |
| [antarctica/](./antarctica/) | 南極 | 領有権主張地域・研究基地 |
| [asia/](./asia/) | アジア | 54か国・地域 |
| [europe/](./europe/) | ヨーロッパ | 73か国・地域 |
| [oceania/](./oceania/) | オセアニア | 22か国・地域 |

## 📝 ファイル形式とディレクトリ構造

全ての国は専用のディレクトリを持ち、その中に国コードと同じ名前のファイルが配置されています。各国・地域のデータは `.yaml` と `.json` の両方の形式で提供されています。

### ディレクトリ構造

```
data/{大陸}/{地域}/{国コード}/
  ├── {国コード}.yaml         # 国の基本データ（YAML形式）
  ├── {国コード}.json         # 国の基本データ（JSON形式）
  ├── overseas/               # 海外領土（該当する国のみ）
  │   ├── {領土コード}.yaml
  │   └── {領土コード}.json
  └── regions/                # 特別行政区画（該当する国のみ）
      ├── {地域名}.yaml
      └── {地域名}.json
```

### ファイル命名規則

- **国ファイル**: `{地域}/{ISO 3166-1 alpha-2コード}/{ISO 3166-1 alpha-2コード}.yaml` および `.json`
  - 例: `data/asia/east_asia/JP/JP.yaml`, `data/americas/north_america/US/US.yaml`
- **海外領土・特別地域**: `{国コード}/overseas/{地域名}.yaml` または `{国コード}/regions/{地域名}.yaml`
  - 例: `data/americas/north_america/US/overseas/PR.yaml` (プエルトリコ)
  - 例: `data/asia/southeast_asia/ID/regions/Papua.yaml` (パプア)

## 📊 収録状況

- **総ファイル数**: 279件（YAML + JSON = 558ファイル）
- **大陸**: 6大陸
- **特殊地域**: 海外領土、係争地域、研究基地なども収録

## 🔗 関連リンク

- [スキーマ定義](../docs/schema/) - データスキーマの型定義
- [サンプルデータ](../docs/examples/) - 各スキーマレベルの具体例
- [SDK](../sdk/) - 開発者向けツール
