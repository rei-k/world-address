/**
 * Alipay UI Utilities
 * Alipay-specific UI helpers following Ant Design Mini
 */

/**
 * Alipay theme colors (following Ant Design)
 */
export const AlipayTheme = {
  primary: '#1677FF',      // Ant Design blue
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#FF4D4F',
  info: '#1677FF',
  background: '#F5F5F5',
  border: '#D9D9D9',
  text: {
    primary: '#000000D9',
    secondary: '#00000073',
    disabled: '#00000040',
  },
};

/**
 * Show loading with Alipay style
 */
export function showLoading(content: string = '加载中...') {
  my.showLoading({
    content,
    delay: 0,
  });
}

/**
 * Hide loading
 */
export function hideLoading() {
  my.hideLoading();
}

/**
 * Show success message
 */
export function showSuccess(message: string) {
  my.showToast({
    content: message,
    type: 'success',
    duration: 2000,
  });
}

/**
 * Show error message
 */
export function showError(message: string) {
  my.alert({
    title: 'エラー',
    content: message,
    buttonText: '確認',
  });
}

/**
 * Show confirmation dialog
 */
export async function confirm(
  title: string,
  content: string,
  confirmText: string = '確認',
  cancelText: string = 'キャンセル'
): Promise<boolean> {
  return new Promise((resolve) => {
    my.confirm({
      title,
      content,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      success: (res: any) => resolve(res.confirm),
      fail: () => resolve(false),
    });
  });
}

/**
 * Show action sheet
 */
export async function showActionSheet(items: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    my.showActionSheet({
      items: items.map((title) => ({ title })),
      success: (res: any) => resolve(res.index),
      fail: reject,
    });
  });
}

/**
 * Vibrate device (for feedback)
 */
export function vibrate(type: 'short' | 'long' = 'short') {
  if (type === 'short') {
    my.vibrateShort();
  } else {
    my.vibrateLong();
  }
}

/**
 * Pull-to-refresh helper
 */
export function enablePullDownRefresh() {
  my.startPullDownRefresh();
}

export function disablePullDownRefresh() {
  my.stopPullDownRefresh();
}

/**
 * Page scroll helper
 */
export function scrollToTop(duration: number = 300) {
  my.pageScrollTo({
    scrollTop: 0,
    duration,
  });
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    my.setClipboard({
      text,
      success: () => {
        my.showToast({
          content: 'コピーしました',
          type: 'success',
        });
        resolve(true);
      },
      fail: () => resolve(false),
    });
  });
}

/**
 * Preview image
 */
export function previewImage(current: number, urls: string[]) {
  my.previewImage({
    current,
    urls,
  });
}

/**
 * Make phone call
 */
export async function makePhoneCall(phoneNumber: string): Promise<boolean> {
  return new Promise((resolve) => {
    my.makePhoneCall({
      number: phoneNumber,
      success: () => resolve(true),
      fail: () => resolve(false),
    });
  });
}

/**
 * Show native Alipay loading (different from showLoading)
 */
export function showNativeLoading(content: string = '处理中...') {
  my.showLoading({
    content,
    delay: 100,
  });
}

/**
 * Get location
 */
export async function getLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    my.getLocation({
      success: (res: any) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
        });
      },
      fail: reject,
    });
  });
}

/**
 * Open Alipay scan
 */
export async function openScan(): Promise<string> {
  return new Promise((resolve, reject) => {
    my.scan({
      type: 'qr',
      success: (res: any) => resolve(res.code),
      fail: reject,
    });
  });
}

/**
 * Show Ant Design style notification
 */
export function showNotification(title: string, content: string) {
  my.alert({
    title,
    content,
    buttonText: '知りました',
  });
}
