/**
 * PDF Generation Service
 * Generates printable HTML for waybills and customer lists
 * Uses browser's print-to-PDF functionality
 */

import type {
  WaybillPDFData,
  CustomerListPDFData,
  PDFGenerationOptions,
  Customer,
  Address,
} from '../types';

/**
 * Generate printable HTML for waybill
 */
export function generateWaybillHTML(
  data: WaybillPDFData,
  options: PDFGenerationOptions = {}
): string {
  const {
    format = 'A4',
    orientation = 'portrait',
    includeQRCode = true,
    includeBarcode = true,
    includeHeader = true,
    language = 'ja',
  } = options;

  const { waybill, delivery, senderAddress, recipientAddress, carrier } = data;

  const styles = `
    <style>
      @page {
        size: ${format} ${orientation};
        margin: 20mm;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-after: always;
        }
      }
      
      body {
        font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
      }
      
      .waybill-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #000;
        padding-bottom: 15px;
      }
      
      .header h1 {
        margin: 0 0 10px 0;
        font-size: 24pt;
        font-weight: bold;
      }
      
      .tracking-number {
        font-size: 18pt;
        font-weight: bold;
        margin: 10px 0;
      }
      
      .section {
        margin-bottom: 25px;
        border: 1px solid #ccc;
        padding: 15px;
      }
      
      .section-title {
        font-size: 14pt;
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 1px solid #000;
        padding-bottom: 5px;
      }
      
      .info-row {
        display: flex;
        margin-bottom: 8px;
      }
      
      .info-label {
        font-weight: bold;
        min-width: 120px;
      }
      
      .info-value {
        flex: 1;
      }
      
      .address-block {
        border: 2px solid #000;
        padding: 15px;
        margin: 10px 0;
        min-height: 120px;
      }
      
      .qr-code-section {
        text-align: center;
        margin: 20px 0;
      }
      
      .qr-code-section img {
        max-width: 200px;
        height: auto;
      }
      
      .barcode-section {
        text-align: center;
        margin: 15px 0;
      }
      
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 10pt;
        color: #666;
        border-top: 1px solid #ccc;
        padding-top: 10px;
      }
      
      .print-button {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14pt;
        z-index: 1000;
      }
      
      .print-button:hover {
        background: #0056b3;
      }
    </style>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>配送伝票 - ${waybill.id}</title>
      ${styles}
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ 印刷</button>
      
      <div class="waybill-container">
        ${includeHeader ? `
        <div class="header">
          <h1>📦 配送伝票 / Shipping Label</h1>
          ${delivery?.trackingNumber ? `
            <div class="tracking-number">
              追跡番号: ${delivery.trackingNumber}
            </div>
          ` : ''}
          ${carrier ? `<div>配送業者: ${carrier.name}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="section">
          <div class="section-title">📤 送り主 / Sender</div>
          <div class="address-block">
            <div class="info-row">
              <div class="info-label">郵便番号:</div>
              <div class="info-value">${senderAddress.pid || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">住所:</div>
              <div class="info-value">${formatAddress(senderAddress)}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">📥 受取人 / Recipient</div>
          <div class="address-block">
            <div class="info-row">
              <div class="info-label">郵便番号:</div>
              <div class="info-value">${recipientAddress.pid || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">住所:</div>
              <div class="info-value">${formatAddress(recipientAddress)}</div>
            </div>
          </div>
        </div>
        
        ${waybill.packageInfo ? `
        <div class="section">
          <div class="section-title">📦 荷物情報 / Package Information</div>
          ${waybill.packageInfo.weight ? `
            <div class="info-row">
              <div class="info-label">重量:</div>
              <div class="info-value">${waybill.packageInfo.weight} kg</div>
            </div>
          ` : ''}
          ${waybill.packageInfo.dimensions ? `
            <div class="info-row">
              <div class="info-label">サイズ:</div>
              <div class="info-value">
                ${waybill.packageInfo.dimensions.length} × 
                ${waybill.packageInfo.dimensions.width} × 
                ${waybill.packageInfo.dimensions.height} cm
              </div>
            </div>
          ` : ''}
          ${waybill.packageInfo.description ? `
            <div class="info-row">
              <div class="info-label">内容物:</div>
              <div class="info-value">${waybill.packageInfo.description}</div>
            </div>
          ` : ''}
          ${waybill.packageInfo.value ? `
            <div class="info-row">
              <div class="info-label">申告価格:</div>
              <div class="info-value">
                ${waybill.packageInfo.currency} ${waybill.packageInfo.value.toLocaleString()}
              </div>
            </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${delivery ? `
        <div class="section">
          <div class="section-title">🚚 配送情報 / Delivery Information</div>
          <div class="info-row">
            <div class="info-label">ステータス:</div>
            <div class="info-value">${getStatusLabel(delivery.status)}</div>
          </div>
          ${delivery.pickupScheduled ? `
            <div class="info-row">
              <div class="info-label">集荷予定:</div>
              <div class="info-value">${formatDate(delivery.pickupScheduled)}</div>
            </div>
          ` : ''}
          ${delivery.estimatedDelivery ? `
            <div class="info-row">
              <div class="info-label">配達予定:</div>
              <div class="info-value">${formatDate(delivery.estimatedDelivery)}</div>
            </div>
          ` : ''}
          ${delivery.cost ? `
            <div class="info-row">
              <div class="info-label">配送料:</div>
              <div class="info-value">
                ${delivery.cost.currency} ${delivery.cost.amount.toLocaleString()}
              </div>
            </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${includeQRCode && data.qrCodeDataUrl ? `
        <div class="qr-code-section">
          <div class="section-title">QRコード</div>
          <img src="${data.qrCodeDataUrl}" alt="QR Code" />
          <div style="margin-top: 10px; font-size: 10pt;">
            伝票ID: ${waybill.id}
          </div>
        </div>
        ` : ''}
        
        ${includeBarcode && data.barcodeDataUrl ? `
        <div class="barcode-section">
          <img src="${data.barcodeDataUrl}" alt="Barcode" />
        </div>
        ` : ''}
        
        <div class="footer">
          <p>発行日時: ${new Date().toLocaleString('ja-JP')}</p>
          <p>Powered by Vey Delivery System</p>
        </div>
      </div>
      
      <script>
        // Auto-focus print button for keyboard accessibility
        document.querySelector('.print-button')?.focus();
      </script>
    </body>
    </html>
  `;

  return html;
}

/**
 * Generate printable HTML for customer list
 */
export function generateCustomerListHTML(
  data: CustomerListPDFData,
  options: PDFGenerationOptions = {}
): string {
  const {
    format = 'A4',
    orientation = 'landscape',
    includeHeader = true,
  } = options;

  const { customers, title = '顧客リスト', generatedBy } = data;

  const styles = `
    <style>
      @page {
        size: ${format} ${orientation};
        margin: 15mm;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .no-print {
          display: none !important;
        }
      }
      
      body {
        font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
        font-size: 10pt;
        line-height: 1.4;
      }
      
      .container {
        max-width: 100%;
        padding: 10px;
      }
      
      .header {
        text-align: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      
      .header h1 {
        margin: 0 0 5px 0;
        font-size: 18pt;
        font-weight: bold;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      
      th {
        background-color: #f0f0f0;
        font-weight: bold;
      }
      
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 9pt;
        color: #666;
        border-top: 1px solid #ccc;
        padding-top: 10px;
      }
      
      .print-button {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14pt;
        z-index: 1000;
      }
      
      .print-button:hover {
        background: #0056b3;
      }
    </style>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${styles}
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ 印刷</button>
      
      <div class="container">
        ${includeHeader ? `
        <div class="header">
          <h1>${title}</h1>
          <div>総件数: ${customers.length}件</div>
          ${generatedBy ? `<div>作成者: ${generatedBy}</div>` : ''}
          <div>作成日時: ${new Date().toLocaleString('ja-JP')}</div>
        </div>
        ` : ''}
        
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>顧客名</th>
              <th>メールアドレス</th>
              <th>電話番号</th>
              <th>会社名</th>
              <th>配送回数</th>
              <th>最終配送日</th>
              <th>タグ</th>
            </tr>
          </thead>
          <tbody>
            ${customers.map((customer, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${customer.name}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.companyName || '-'}</td>
                <td>${customer.totalDeliveries || 0}</td>
                <td>${customer.lastDeliveryDate ? formatDate(customer.lastDeliveryDate) : '-'}</td>
                <td>${customer.tags?.join(', ') || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Powered by Vey Delivery System</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Open print preview window
 */
export function openPrintPreview(html: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('ポップアップがブロックされました。ポップアップを許可してください。');
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load before triggering print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
    }, 100);
  };
}

/**
 * Format address for display
 */
function formatAddress(address: Address): string {
  // This is a simplified version - real implementation would decrypt and format address data
  // In production, this would decrypt the encryptedData and format it properly
  return address.encryptedData || 'Address data encrypted';
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status label in Japanese
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: '新規',
    accepted: '受付済み',
    in_transit: '配送中',
    delivered: '配達完了',
    failed: '配達失敗',
  };
  return labels[status] || status;
}
