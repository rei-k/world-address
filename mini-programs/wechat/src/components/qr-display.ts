/**
 * WeChat QR Code Display Component
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
    
    // Use WeChat's built-in QR code API
    // In production, you might want to use a cloud function
    this.qrCodeUrl = await this.createWXQRCode(this.token.qrData);
  }
  
  /**
   * Create WeChat QR code (placeholder - would use cloud function)
   * TODO: Integrate with proper QR code generation library or cloud function
   * For production, use wx.cloud.callFunction to generate actual QR code image
   */
  private async createWXQRCode(data: string): Promise<string> {
    // In production, call cloud function to generate QR code
    // Example: wx.cloud.callFunction({ name: 'generateQR', data: { content: data } })
    // For now, use a placeholder
    return `data:image/png;base64,${data}`;
  }
  
  /**
   * Save QR code to album
   */
  async saveToAlbum(): Promise<boolean> {
    return new Promise((resolve) => {
      wx.saveImageToPhotosAlbum({
        filePath: this.qrCodeUrl,
        success: () => {
          wx.showToast({
            title: '保存しました',
            icon: 'success',
          });
          resolve(true);
        },
        fail: () => {
          wx.showToast({
            title: '保存に失敗しました',
            icon: 'error',
          });
          resolve(false);
        },
      });
    });
  }
  
  /**
   * Share QR code
   */
  shareQRCode(): void {
    wx.showShareMenu({
      withShareTicket: true,
    });
  }
}

/**
 * Component template helper (for WXML)
 */
export const QRDisplayTemplate = {
  name: 'qr-display',
  wxml: `
    <view class="qr-display">
      <view class="qr-header">
        <text class="qr-title">集荷待ちQRコード</text>
        <text class="waybill-number">運送状番号: {{waybillNumber}}</text>
      </view>
      
      <view class="qr-code-container">
        <image 
          class="qr-code"
          src="{{qrCodeUrl}}"
          mode="aspectFit"
        />
      </view>
      
      <view class="qr-info">
        <text class="info-text">配達員にこのQRコードを見せてください</text>
      </view>
      
      <view class="qr-actions">
        <button class="btn-save" bindtap="onSaveToAlbum">
          アルバムに保存
        </button>
        <button class="btn-share" open-type="share">
          共有
        </button>
      </view>
    </view>
  `,
};
