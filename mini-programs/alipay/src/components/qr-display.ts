/**
 * Alipay QR Code Display Component
 * Component for displaying handshake QR codes
 */

import { HandshakeToken, generateHandshakeQRData } from '@vey/mini-common';

export interface QRDisplayProps {
  waybillNumber: string;
  pickupId: string;
  secret: string;
}

/**
 * QR Display component logic
 */
export class QRDisplayComponent {
  private token: HandshakeToken | null = null;
  private qrCodeUrl: string = '';
  
  constructor(private props: QRDisplayProps) {
    this.generateQRCode();
  }
  
  /**
   * Generate QR code
   */
  async generateQRCode(): Promise<void> {
    this.token = generateHandshakeQRData(
      this.props.waybillNumber,
      this.props.pickupId,
      this.props.secret
    );
    
    // Use Alipay's cloud function to generate QR code
    this.qrCodeUrl = await this.createAlipayQRCode(this.token.qrData);
  }
  
  /**
   * Create Alipay QR code (placeholder - would use cloud function)
   * TODO: Integrate with proper QR code generation library or cloud function
   * For production, use my.cloud.function to generate actual QR code image
   */
  private async createAlipayQRCode(data: string): Promise<string> {
    // In production, call cloud function to generate QR code
    // Example: my.cloud.function.invoke({ name: 'generateQR', data: { content: data } })
    return `data:image/png;base64,${data}`;
  }
  
  /**
   * Save QR code to album
   */
  async saveToAlbum(): Promise<boolean> {
    return new Promise((resolve) => {
      my.saveImage({
        url: this.qrCodeUrl,
        success: () => {
          my.showToast({
            content: '保存しました',
            type: 'success',
          });
          resolve(true);
        },
        fail: () => {
          my.showToast({
            content: '保存に失敗しました',
            type: 'fail',
          });
          resolve(false);
        },
      });
    });
  }
  
  /**
   * Share QR code via Alipay
   */
  shareQRCode(): void {
    my.showSharePanel({
      title: '集荷待ちQRコード',
      desc: `運送状番号: ${this.props.waybillNumber}`,
      success: () => {
        my.showToast({
          content: '共有しました',
          type: 'success',
        });
      },
    });
  }
  
  /**
   * Copy waybill number to clipboard
   */
  async copyWaybillNumber(): Promise<boolean> {
    return new Promise((resolve) => {
      my.setClipboard({
        text: this.props.waybillNumber,
        success: () => {
          my.showToast({
            content: '運送状番号をコピーしました',
            type: 'success',
          });
          resolve(true);
        },
        fail: () => resolve(false),
      });
    });
  }
}

/**
 * Component template helper (for AXML)
 */
export const QRDisplayTemplate = {
  name: 'qr-display',
  axml: `
    <view class="qr-display">
      <view class="qr-header">
        <text class="qr-title">集荷待ちQRコード</text>
        <text class="waybill-number">运单号: {{waybillNumber}}</text>
      </view>
      
      <view class="qr-code-container">
        <image 
          class="qr-code"
          src="{{qrCodeUrl}}"
          mode="aspectFit"
        />
      </view>
      
      <view class="qr-info">
        <text class="info-text">请向快递员展示此二维码</text>
      </view>
      
      <view class="qr-actions">
        <button class="btn-save" onTap="onSaveToAlbum">
          保存到相册
        </button>
        <button class="btn-share" onTap="onShare">
          分享
        </button>
        <button class="btn-copy" onTap="onCopyWaybill">
          复制运单号
        </button>
      </view>
    </view>
  `,
};
