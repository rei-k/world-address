# AI Image Recognition & OCR Modules

このディレクトリは、画像認識AIとOCR機能を提供するモジュール群です。

This directory contains AI image recognition and OCR modules for the World Address system.

---

## 📋 概要 / Overview

### 目的 / Purpose

世界250+の住所体系に対応した画像認識AIとOCRシステムを提供し、以下の機能を実現します:

1. **荷物ラベル自動読み取り** - Package Label Auto-Reading
2. **荷物寸法・重量の自動推定** - Package Dimension/Weight Estimation  
3. **破損・異常検出** - Damage/Anomaly Detection
4. **書類住所OCR** - Document Address OCR

---

## 🗂️ モジュール構成 / Module Structure

### 1. package-ocr/ - 荷物ラベルOCR

**目的**: 荷物ラベルの自動読み取り（OCR + 住所正規化）

**機能**:
- 多言語OCR対応（アラビア語、中国語、タイ語など）
- AMF（Address Mapping Framework）による住所正規化
- PID（Place ID）自動生成
- 返送ラベル対応
- 誤配送・読み取りエラー激減

**主要技術**:
- Tesseract OCR / Google Cloud Vision API
- NLP-based address parsing
- AMF normalization engine
- Multi-language text detection

---

### 2. dimension-estimation/ - 寸法・重量推定

**目的**: 荷物画像からサイズ・重量を推定し、料金を自動算出

**機能**:
- 画像ベース寸法推定
- 重量予測モデル
- VeyLockerボックスサイズへの自動マッピング
- 料金自動算出
- 「サイズ間違い」「重量違い」による追加請求トラブルをほぼゼロに

**主要技術**:
- Computer Vision (OpenCV, YOLOv8)
- Deep Learning (CNN for size/weight estimation)
- Calibration algorithms
- Reference object detection

---

### 3. damage-detection/ - 破損・異常検出

**目的**: 破損している箱を自動検出し、証拠を残す

**機能**:
- 破損箱の自動検出
- 受け取り前の証拠残し
- 保険・返品処理の自動化
- ラストワンマイルでのトラブル減少
- 配送品質の可視化

**主要技術**:
- Object Detection (YOLOv8, Faster R-CNN)
- Anomaly Detection (Autoencoders, One-Class SVM)
- Image Segmentation
- Quality scoring algorithms

---

### 4. document-ocr/ - 書類住所OCR (Veyform連携)

**目的**: 書類や名刺の住所を撮るだけで入力完了

**機能**:
- 書類OCR（公共料金、保険証、在留カード、名刺など）
- 住所正規化（AMF）+ 国・地域・郵便番号の自動推定
- 多言語表記混在住所の統一形式整形
- 手書き住所の自動判読
- 日本の手書き宛名、アラビア数字＋漢字混在対応

**主要技術**:
- Document OCR (Tesseract, Google Cloud Vision)
- Handwriting Recognition (IAM Dataset, HTR models)
- Multi-language NER
- Address context understanding

---

## 🚀 クイックスタート / Quick Start

### インストール / Installation

```bash
# 全モジュールのインストール
npm install @vey/ai-modules

# 個別モジュールのインストール
npm install @vey/package-ocr
npm install @vey/dimension-estimation
npm install @vey/damage-detection
npm install @vey/document-ocr
```

### 基本使用例 / Basic Usage

```typescript
import { PackageOCR } from '@vey/package-ocr';
import { DimensionEstimator } from '@vey/dimension-estimation';
import { DamageDetector } from '@vey/damage-detection';
import { DocumentOCR } from '@vey/document-ocr';

// 1. 荷物ラベルOCR
const packageOCR = new PackageOCR();
const labelResult = await packageOCR.scan(imageBuffer);
console.log(labelResult.address); // 正規化された住所
console.log(labelResult.pid);     // JP-13-113-01-T07-B12

// 2. 寸法・重量推定
const estimator = new DimensionEstimator();
const dimensions = await estimator.estimate(imageBuffer);
console.log(dimensions.size);     // { length: 30, width: 20, height: 15 }
console.log(dimensions.weight);   // 2.5 kg
console.log(dimensions.boxSize);  // "VeyLocker-M"

// 3. 破損検出
const detector = new DamageDetector();
const damageResult = await detector.detect(imageBuffer);
console.log(damageResult.isDamaged);  // true/false
console.log(damageResult.confidence); // 0.95
console.log(damageResult.evidence);   // Base64 annotated image

// 4. 書類OCR
const docOCR = new DocumentOCR();
const docResult = await docOCR.scan(businessCardImage);
console.log(docResult.address);   // 正規化された住所
console.log(docResult.country);   // "JP"
console.log(docResult.postalCode); // "100-0001"
```

---

## 🔧 統合 / Integration

### VeyLocker統合 / VeyLocker Integration

```typescript
import { PackageOCR, DimensionEstimator } from '@vey/ai-modules';

// 荷物受付時の自動処理
async function processPackageAtLocker(image: Buffer) {
  // 1. ラベル読み取り
  const labelData = await new PackageOCR().scan(image);
  
  // 2. サイズ推定
  const dimensions = await new DimensionEstimator().estimate(image);
  
  // 3. 適切なボックスを自動選択
  const boxSize = mapToVeyLockerBox(dimensions.size);
  
  // 4. 料金計算
  const price = calculateShippingCost(dimensions, labelData.destination);
  
  return {
    address: labelData.address,
    pid: labelData.pid,
    boxSize,
    price,
    weight: dimensions.weight
  };
}
```

### Veyform統合 / Veyform Integration

```typescript
import { DocumentOCR } from '@vey/document-ocr';

// 住所フォーム自動入力
async function autoFillAddressForm(documentImage: Buffer) {
  const docOCR = new DocumentOCR();
  const result = await docOCR.scan(documentImage);
  
  // Veyformフィールドに自動入力
  return {
    country: result.country,
    postalCode: result.postalCode,
    prefecture: result.administrativeArea,
    city: result.locality,
    addressLine1: result.addressLine1,
    addressLine2: result.addressLine2,
    recipient: result.recipient
  };
}
```

---

## 📊 技術仕様 / Technical Specifications

### サポート言語 / Supported Languages

- 🇯🇵 日本語 (Japanese)
- 🇨🇳 中国語 (Chinese - Simplified/Traditional)
- 🇰🇷 韓国語 (Korean)
- 🇸🇦 アラビア語 (Arabic)
- 🇹🇭 タイ語 (Thai)
- 🇻🇳 ベトナム語 (Vietnamese)
- 🇮🇳 ヒンディー語 (Hindi)
- 🇬🇧 英語 (English)
- その他多数 (And more...)

### パフォーマンス指標 / Performance Metrics

| 機能 | 精度 | 処理時間 |
|------|------|----------|
| Package OCR | 95%+ | < 2秒 |
| 寸法推定 | 90%+ (±5cm) | < 1秒 |
| 重量推定 | 85%+ (±10%) | < 1秒 |
| 破損検出 | 93%+ | < 1.5秒 |
| Document OCR | 94%+ | < 2秒 |
| 手書き認識 | 88%+ | < 3秒 |

---

## 🛠️ 技術スタック / Technology Stack

### OCR Engines
- **Tesseract OCR** - オープンソースOCR
- **Google Cloud Vision API** - 商用高精度OCR
- **Azure Computer Vision** - Microsoft OCR
- **AWS Textract** - 手書き対応OCR

### Machine Learning
- **TensorFlow / PyTorch** - Deep Learning frameworks
- **YOLOv8** - Object detection
- **OpenCV** - Computer Vision
- **scikit-learn** - Traditional ML

### NLP & Text Processing
- **spaCy** - NLP library
- **Hugging Face Transformers** - BERT-based models
- **Custom Address NER** - Address entity recognition

---

## 📖 ドキュメント / Documentation

- [Package OCR Module](./package-ocr/docs/README.md)
- [Dimension Estimation Module](./dimension-estimation/docs/README.md)
- [Damage Detection Module](./damage-detection/docs/README.md)
- [Document OCR Module](./document-ocr/docs/README.md)

---

## 🔐 セキュリティ / Security

### プライバシー保護

- 画像データは処理後すぐに削除
- PII（個人識別情報）の暗号化
- GDPR / CCPA準拠
- E2E暗号化オプション

### データ保持ポリシー

- OCR結果のみ保存（元画像は削除）
- 証拠画像は暗号化して保存（破損検出時のみ）
- ユーザー削除リクエストに即時対応

---

## 📈 ロードマップ / Roadmap

### Phase 1: 基本機能 (Current)
- ✅ Package OCR基本実装
- ✅ Dimension Estimation基本実装
- ✅ Damage Detection基本実装
- ✅ Document OCR基本実装

### Phase 2: 精度向上 (Planned)
- 📋 Multi-language fine-tuning
- 📋 Handwriting recognition improvements
- 📋 Real-time processing optimization

### Phase 3: 高度な機能 (Future)
- 📋 Video-based dimension estimation
- 📋 3D reconstruction
- 📋 Real-time quality monitoring

---

## 🤝 貢献 / Contributing

プルリクエストを歓迎します！詳細は [CONTRIBUTING.md](../CONTRIBUTING.md) をご覧ください。

We welcome pull requests! See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## 📝 ライセンス / License

MIT License - 詳細は [LICENSE](../LICENSE) をご覧ください。

MIT License - See [LICENSE](../LICENSE) for details.

---

## 🔗 関連リンク / Related Links

- [World Address YAML](../)
- [Vey Ecosystem](../Vey/)
- [VeyExpress](../Vey/apps/VeyExpress/)
- [Veyform](../Vey/apps/Veyform/)
- [AI Capabilities](../docs/ai/ai-capabilities.md)

---

**🤖 AI-Powered Address Recognition** - Making logistics smarter and faster
