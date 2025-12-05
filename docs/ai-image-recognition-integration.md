# AI Image Recognition Integration Guide

画像認識AIモジュールの統合ガイド

This guide explains how to integrate AI image recognition modules with VeyExpress and Veyform applications.

---

## 概要 / Overview

このドキュメントは、4つのAI画像認識モジュールをVeyエコシステムのアプリケーションと統合する方法を説明します。

This document explains how to integrate the four AI image recognition modules with Vey ecosystem applications:

1. **Package OCR** - 荷物ラベル自動読み取り
2. **Dimension Estimation** - 荷物寸法・重量推定
3. **Damage Detection** - 破損・異常検出
4. **Document OCR** - 書類住所OCR

---

## VeyExpress統合 / VeyExpress Integration

### 1. 荷物受付時の自動処理 / Automatic Package Processing

VeyExpressで荷物を受け付ける際、画像認識AIを使用して自動的に情報を抽出します。

```typescript
import { PackageOCR } from '@vey/package-ocr';
import { DimensionEstimator } from '@vey/dimension-estimation';
import { DamageDetector } from '@vey/damage-detection';
import { VeyExpress } from '@vey/veyexpress';

class VeyExpressPackageHandler {
  private ocr: PackageOCR;
  private estimator: DimensionEstimator;
  private damageDetector: DamageDetector;
  private veyexpress: VeyExpress;
  
  constructor() {
    this.ocr = new PackageOCR({
      language: 'auto',
      engine: 'google-vision'
    });
    
    this.estimator = new DimensionEstimator({
      calibrationMethod: 'reference-object',
      weightModel: 'ml-regression'
    });
    
    this.damageDetector = new DamageDetector({
      model: 'yolov8',
      severityThreshold: 0.7
    });
    
    this.veyexpress = new VeyExpress();
  }
  
  /**
   * 荷物の完全な自動処理
   * Complete automatic package processing
   */
  async processPackage(packageImages: {
    label: Buffer;
    overview: Buffer;
    allSides: Buffer[];
  }) {
    console.log('Step 1: Reading package label...');
    
    // 1. ラベル読み取り / Read label
    const labelResult = await this.ocr.scan(packageImages.label);
    if (!labelResult.success) {
      throw new Error('Failed to read package label');
    }
    
    console.log(`✓ Label read: ${labelResult.pid}`);
    console.log(`  Destination: ${labelResult.address.locality}, ${labelResult.address.administrativeArea}`);
    
    console.log('\nStep 2: Estimating dimensions and weight...');
    
    // 2. 寸法・重量推定 / Estimate dimensions
    const dimensionResult = await this.estimator.estimate(packageImages.overview, {
      referenceObject: {
        type: 'a4-paper',
        dimensions: { length: 29.7, width: 21.0 }
      }
    });
    
    console.log(`✓ Dimensions: ${dimensionResult.dimensions.length} × ${dimensionResult.dimensions.width} × ${dimensionResult.dimensions.height} cm`);
    console.log(`  Weight: ${dimensionResult.weight.estimated} kg`);
    console.log(`  VeyLocker Box: ${dimensionResult.veyLockerBox}`);
    
    console.log('\nStep 3: Checking for damage...');
    
    // 3. 破損検出 / Detect damage
    const damageResults = await this.damageDetector.detectBatch(packageImages.allSides);
    const anyDamage = damageResults.some(r => r.isDamaged);
    
    if (anyDamage) {
      console.log(`⚠ Damage detected!`);
      const worstDamage = damageResults.reduce((worst, current) => 
        current.qualityScore < worst.qualityScore ? current : worst
      );
      console.log(`  Severity: ${worstDamage.report?.severity}`);
      console.log(`  Quality Score: ${worstDamage.qualityScore}`);
    } else {
      console.log(`✓ No damage detected`);
    }
    
    console.log('\nStep 4: Creating waybill...');
    
    // 4. 送り状生成 / Create waybill
    const waybill = await this.veyexpress.createWaybill({
      destination: labelResult.address,
      pid: labelResult.pid,
      dimensions: dimensionResult.dimensions,
      weight: dimensionResult.weight.estimated,
      carrier: 'auto', // Auto-select best carrier
      damaged: anyDamage,
      damageReport: anyDamage ? damageResults.find(r => r.isDamaged)?.report : undefined
    });
    
    console.log(`✓ Waybill created: ${waybill.id}`);
    console.log(`  Carrier: ${waybill.carrier}`);
    console.log(`  Cost: ¥${waybill.cost}`);
    console.log(`  Estimated Delivery: ${waybill.estimatedDelivery}`);
    
    // 5. 結果を返す / Return result
    return {
      waybillId: waybill.id,
      address: labelResult.address,
      pid: labelResult.pid,
      dimensions: dimensionResult.dimensions,
      weight: dimensionResult.weight.estimated,
      veyLockerBox: dimensionResult.veyLockerBox,
      carrier: waybill.carrier,
      cost: waybill.cost,
      damaged: anyDamage,
      damageReport: anyDamage ? damageResults.find(r => r.isDamaged)?.report : undefined,
      estimatedDelivery: waybill.estimatedDelivery
    };
  }
  
  /**
   * VeyLocker連携での自動ボックス割り当て
   * Automatic box assignment with VeyLocker integration
   */
  async assignVeyLockerBox(packageImage: Buffer, lockerId: string) {
    // 寸法推定
    const estimation = await this.estimator.estimate(packageImage);
    
    // 利用可能なボックスを検索
    const availableBoxes = await this.veyexpress.findAvailableVeyLockerBoxes({
      lockerId,
      size: estimation.veyLockerBox
    });
    
    if (availableBoxes.length === 0) {
      throw new Error(`No available ${estimation.veyLockerBox} boxes at locker ${lockerId}`);
    }
    
    // ボックスを予約
    const reservation = await this.veyexpress.reserveVeyLockerBox({
      boxId: availableBoxes[0].id,
      duration: 24, // hours
      packageDimensions: estimation.dimensions,
      packageWeight: estimation.weight.estimated
    });
    
    return {
      boxId: reservation.boxId,
      boxSize: estimation.veyLockerBox,
      utilization: reservation.utilization,
      price: reservation.price,
      expiresAt: reservation.expiresAt
    };
  }
}

// 使用例 / Usage example
async function handleNewPackage() {
  const handler = new VeyExpressPackageHandler();
  
  // 荷物の写真を撮影
  const images = {
    label: await captureImage('label'),
    overview: await captureImage('overview'),
    allSides: await Promise.all([
      captureImage('front'),
      captureImage('back'),
      captureImage('left'),
      captureImage('right'),
      captureImage('top'),
      captureImage('bottom')
    ])
  };
  
  // 自動処理
  const result = await handler.processPackage(images);
  
  console.log('\n=== Package Processing Complete ===');
  console.log(result);
}
```

---

## Veyform統合 / Veyform Integration

### 2. 書類スキャンによる住所フォーム自動入力 / Auto-fill Address Forms from Document Scan

Veyformで住所入力フォームを書類スキャンで自動入力します。

```typescript
import { DocumentOCR } from '@vey/document-ocr';
import { Veyform } from '@vey/veyform';

class VeyformDocumentScanner {
  private ocr: DocumentOCR;
  private veyform: Veyform;
  
  constructor() {
    this.ocr = new DocumentOCR({
      language: 'auto',
      handwritingSupport: true,
      enableAMF: true
    });
    
    this.veyform = new Veyform();
  }
  
  /**
   * 書類から住所フォームを自動入力
   * Auto-fill address form from document
   */
  async autoFillFromDocument(documentImage: Buffer, formId: string) {
    console.log('Scanning document...');
    
    // 1. 書類をスキャン / Scan document
    const scanResult = await this.ocr.scan(documentImage);
    
    if (!scanResult.success) {
      throw new Error('Failed to scan document');
    }
    
    console.log(`✓ Document scanned: ${scanResult.documentType}`);
    console.log(`  Confidence: ${scanResult.confidence}`);
    
    // 2. 信頼度をチェック / Check confidence
    if (scanResult.confidence < 0.85) {
      // 低信頼度の場合、ユーザーに確認を求める
      const confirmed = await this.confirmWithUser(scanResult);
      if (!confirmed) {
        return { filled: false, reason: 'User cancelled due to low confidence' };
      }
    }
    
    console.log('\nFilling form...');
    
    // 3. フォームに自動入力 / Auto-fill form
    await this.veyform.fillForm(formId, {
      country: scanResult.address.country,
      postalCode: scanResult.address.postalCode,
      prefecture: scanResult.address.administrativeArea,
      city: scanResult.address.locality,
      addressLine1: scanResult.address.addressLine1,
      addressLine2: scanResult.address.addressLine2,
      recipient: scanResult.address.recipient,
      organization: scanResult.address.organization,
      phone: scanResult.contact?.phone,
      email: scanResult.contact?.email
    });
    
    console.log('✓ Form filled successfully');
    
    return {
      filled: true,
      confidence: scanResult.confidence,
      documentType: scanResult.documentType,
      fieldsPopulated: Object.keys(scanResult.address).filter(
        key => scanResult.address[key] !== undefined
      ).length
    };
  }
  
  /**
   * 名刺スキャン / Business card scan
   */
  async scanBusinessCard(cardImage: Buffer, formId: string) {
    const result = await this.ocr.scan(cardImage, {
      documentType: 'business-card'
    });
    
    // 名刺固有の情報も含めて入力
    await this.veyform.fillForm(formId, {
      ...result.address,
      phone: result.contact?.phone,
      email: result.contact?.email,
      website: result.contact?.website,
      companyName: result.address.organization
    });
    
    return result;
  }
  
  /**
   * 手書き住所スキャン / Handwritten address scan
   */
  async scanHandwritten(handwrittenImage: Buffer, formId: string) {
    console.log('Scanning handwritten address...');
    
    const result = await this.ocr.scanHandwritten(handwrittenImage);
    
    console.log(`✓ Handwriting confidence: ${result.handwritingConfidence}`);
    
    if (result.handwritingConfidence < 0.80) {
      console.warn('⚠ Low handwriting recognition confidence');
      console.warn('  Please verify the extracted information');
    }
    
    await this.veyform.fillForm(formId, result.address);
    
    return result;
  }
  
  /**
   * ユーザー確認 / User confirmation
   */
  private async confirmWithUser(scanResult: any): Promise<boolean> {
    // 実際の実装ではUIで確認ダイアログを表示
    console.log('\nPlease confirm the extracted address:');
    console.log(`Country: ${scanResult.address.country}`);
    console.log(`Postal Code: ${scanResult.address.postalCode}`);
    console.log(`Prefecture: ${scanResult.address.administrativeArea}`);
    console.log(`City: ${scanResult.address.locality}`);
    console.log(`Address: ${scanResult.address.addressLine1}`);
    console.log(`Recipient: ${scanResult.address.recipient}`);
    
    // シミュレート: ユーザーが確認
    return true;
  }
}

// 使用例 / Usage example
async function scanAndFillForm() {
  const scanner = new VeyformDocumentScanner();
  
  // 公共料金の書類をスキャン
  const utilityBill = await captureImage('utility-bill');
  await scanner.autoFillFromDocument(utilityBill, 'address-form-001');
  
  // 名刺をスキャン
  const businessCard = await captureImage('business-card');
  await scanner.scanBusinessCard(businessCard, 'contact-form-001');
  
  // 手書き住所をスキャン
  const handwritten = await captureImage('handwritten');
  await scanner.scanHandwritten(handwritten, 'address-form-002');
}
```

---

## 完全統合例 / Complete Integration Example

### 3. VeyExpressとVeyformの完全統合

```typescript
import { PackageOCR, DimensionEstimator, DamageDetector, DocumentOCR } from '@vey/ai-modules';
import { VeyExpress, Veyform, VeyLocker } from '@vey/ecosystem';

class VeyAIIntegration {
  private packageOCR: PackageOCR;
  private dimensionEstimator: DimensionEstimator;
  private damageDetector: DamageDetector;
  private documentOCR: DocumentOCR;
  private veyexpress: VeyExpress;
  private veyform: Veyform;
  private veylocker: VeyLocker;
  
  constructor() {
    // AI modules initialization
    this.packageOCR = new PackageOCR({ language: 'auto' });
    this.dimensionEstimator = new DimensionEstimator();
    this.damageDetector = new DamageDetector();
    this.documentOCR = new DocumentOCR({ handwritingSupport: true });
    
    // Vey ecosystem initialization
    this.veyexpress = new VeyExpress();
    this.veyform = new Veyform();
    this.veylocker = new VeyLocker();
  }
  
  /**
   * エンドツーエンドの配送フロー
   * End-to-end delivery flow
   */
  async completeDeliveryFlow(customerDocument: Buffer, packageImages: {
    label: Buffer;
    overview: Buffer;
    sides: Buffer[];
  }) {
    console.log('=== Complete Delivery Flow ===\n');
    
    // Phase 1: 顧客情報の登録 / Customer information registration
    console.log('Phase 1: Scanning customer document...');
    const customerInfo = await this.documentOCR.scan(customerDocument);
    
    // Veyformに顧客住所を登録
    const customerId = await this.veyform.registerCustomer({
      address: customerInfo.address,
      contact: customerInfo.contact,
      pid: await this.veyexpress.generatePID(customerInfo.address)
    });
    
    console.log(`✓ Customer registered: ${customerId}`);
    
    // Phase 2: 荷物の処理 / Package processing
    console.log('\nPhase 2: Processing package...');
    
    // ラベル読み取り
    const labelData = await this.packageOCR.scan(packageImages.label);
    console.log(`✓ Label scanned: ${labelData.pid}`);
    
    // 寸法推定
    const dimensions = await this.dimensionEstimator.estimate(packageImages.overview);
    console.log(`✓ Dimensions: ${dimensions.veyLockerBox}`);
    
    // 破損チェック
    const damageCheck = await this.damageDetector.detectBatch(packageImages.sides);
    const isDamaged = damageCheck.some(r => r.isDamaged);
    console.log(`✓ Damage check: ${isDamaged ? 'Damaged' : 'OK'}`);
    
    // Phase 3: VeyLockerボックス割り当て / VeyLocker box assignment
    console.log('\nPhase 3: Assigning VeyLocker box...');
    
    const lockerBox = await this.veylocker.findAndReserve({
      size: dimensions.veyLockerBox,
      location: 'Tokyo-Shibuya-01',
      customerId
    });
    
    console.log(`✓ Box reserved: ${lockerBox.id} (${lockerBox.size})`);
    
    // Phase 4: 配送の手配 / Arrange delivery
    console.log('\nPhase 4: Creating waybill and arranging delivery...');
    
    const waybill = await this.veyexpress.createWaybill({
      sender: customerInfo.address,
      destination: labelData.address,
      dimensions: dimensions.dimensions,
      weight: dimensions.weight.estimated,
      veylockerBox: lockerBox.id,
      damaged: isDamaged,
      carrier: 'auto'
    });
    
    console.log(`✓ Waybill: ${waybill.id}`);
    console.log(`✓ Carrier: ${waybill.carrier}`);
    console.log(`✓ Cost: ¥${waybill.cost}`);
    console.log(`✓ Delivery: ${waybill.estimatedDelivery}`);
    
    // Phase 5: 通知 / Notification
    console.log('\nPhase 5: Sending notifications...');
    
    await this.veyexpress.notify(customerId, {
      type: 'package-ready',
      waybillId: waybill.id,
      veylockerBox: lockerBox.id,
      pickupCode: lockerBox.accessCode,
      estimatedDelivery: waybill.estimatedDelivery
    });
    
    console.log('✓ Customer notified');
    
    console.log('\n=== Delivery Flow Complete ===');
    
    return {
      customerId,
      waybillId: waybill.id,
      veylockerBoxId: lockerBox.id,
      estimatedDelivery: waybill.estimatedDelivery,
      totalCost: waybill.cost + lockerBox.price,
      isDamaged
    };
  }
}

// 実行例 / Execution example
async function main() {
  const integration = new VeyAIIntegration();
  
  // 顧客の公共料金書類
  const customerDocument = await captureImage('customer-utility-bill.jpg');
  
  // 荷物の写真
  const packageImages = {
    label: await captureImage('package-label.jpg'),
    overview: await captureImage('package-overview.jpg'),
    sides: await Promise.all([
      captureImage('package-front.jpg'),
      captureImage('package-back.jpg'),
      captureImage('package-left.jpg'),
      captureImage('package-right.jpg'),
      captureImage('package-top.jpg'),
      captureImage('package-bottom.jpg')
    ])
  };
  
  // 完全な配送フロー実行
  const result = await integration.completeDeliveryFlow(customerDocument, packageImages);
  
  console.log('\nFinal Result:');
  console.log(JSON.stringify(result, null, 2));
}

// ヘルパー関数
async function captureImage(description: string): Promise<Buffer> {
  // 実際の実装ではカメラAPIを使用
  console.log(`Capturing: ${description}`);
  return Buffer.from(''); // Placeholder
}

// Export for testing
export { VeyAIIntegration, main };
```

---

## パフォーマンス最適化 / Performance Optimization

### 並列処理 / Parallel Processing

複数のAIモジュールを並列実行して処理時間を短縮:

```typescript
async function optimizedProcessing(images: {
  label: Buffer;
  overview: Buffer;
  sides: Buffer[];
}) {
  // 並列実行
  const [labelResult, dimensionResult, damageResults] = await Promise.all([
    packageOCR.scan(images.label),
    dimensionEstimator.estimate(images.overview),
    damageDetector.detectBatch(images.sides)
  ]);
  
  return { labelResult, dimensionResult, damageResults };
}
```

---

## エラーハンドリング / Error Handling

```typescript
async function robustProcessing(image: Buffer) {
  try {
    const result = await packageOCR.scan(image);
    
    if (!result.success) {
      // OCR失敗時の代替処理
      return await fallbackManualEntry();
    }
    
    if (result.confidence < 0.85) {
      // 低信頼度時の確認
      await requestManualVerification(result);
    }
    
    return result;
    
  } catch (error) {
    console.error('Processing error:', error);
    // エラー通知とフォールバック
    await notifyError(error);
    return await fallbackManualEntry();
  }
}
```

---

## セキュリティとプライバシー / Security and Privacy

### 個人情報の保護

```typescript
const documentOCR = new DocumentOCR({
  redactPII: true,           // 個人情報をマスク
  encryption: true,          // 暗号化
  deleteAfterProcessing: true, // 処理後に削除
  auditLog: true             // 監査ログ
});

// 住所のみ抽出、個人名はマスク
const result = await documentOCR.scan(idCard);
console.log(result.address.recipient); // "[REDACTED]"
```

---

## まとめ / Summary

このガイドでは、4つのAI画像認識モジュールをVeyエコシステムのアプリケーションと統合する方法を説明しました:

1. **VeyExpress**: 荷物の自動処理、VeyLocker連携
2. **Veyform**: 書類スキャンによる住所フォーム自動入力
3. **統合フロー**: エンドツーエンドの配送フロー
4. **最適化**: 並列処理、エラーハンドリング、セキュリティ

これらのAI機能により、配送プロセスが大幅に効率化され、ユーザー体験が向上します。

---

## 関連ドキュメント / Related Documentation

- [AI Modules Overview](../ai-modules/README.md)
- [Package OCR Documentation](../ai-modules/package-ocr/docs/README.md)
- [Dimension Estimation Documentation](../ai-modules/dimension-estimation/docs/README.md)
- [Damage Detection Documentation](../ai-modules/damage-detection/docs/README.md)
- [Document OCR Documentation](../ai-modules/document-ocr/docs/README.md)
- [VeyExpress Documentation](../Vey/apps/VeyExpress/README.md)
- [Veyform Documentation](../Vey/apps/Veyform/README.md)

---

**🤖 AI-Powered Logistics** - Making delivery smarter, faster, and safer
