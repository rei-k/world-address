/**
 * WeChat UI Utilities
 * WeChat-specific UI helpers following WeUI design system
 */

/**
 * WeChat theme colors
 */
export const WeChatTheme = {
  primary: '#07C160',      // WeChat green
  success: '#07C160',
  warning: '#FFC300',
  error: '#FA5151',
  info: '#10AEFF',
  background: '#F7F7F7',
  border: '#E5E5E5',
  text: {
    primary: '#000000',
    secondary: '#8C8C8C',
    disabled: '#CCCCCC',
  },
};

/**
 * Show loading with WeChat style
 */
export function showLoading(title: string = '加载中...') {
  wx.showLoading({
    title,
    mask: true,
  });
}

/**
 * Hide loading
 */
export function hideLoading() {
  wx.hideLoading();
}

/**
 * Show success message
 */
export function showSuccess(message: string) {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000,
  });
}

/**
 * Show error message
 */
export function showError(message: string) {
  wx.showModal({
    title: 'エラー',
    content: message,
    showCancel: false,
    confirmText: '確認',
    confirmColor: WeChatTheme.primary,
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
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      confirmColor: WeChatTheme.primary,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false),
    });
  });
}

/**
 * Show action sheet
 */
export async function showActionSheet(items: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: items,
      success: (res) => resolve(res.tapIndex),
      fail: reject,
    });
  });
}

/**
 * Vibrate device (for feedback)
 */
export function vibrate(type: 'short' | 'long' = 'short') {
  if (type === 'short') {
    wx.vibrateShort({ type: 'medium' });
  } else {
    wx.vibrateLong();
  }
}

/**
 * Pull-to-refresh helper
 */
export function enablePullDownRefresh() {
  wx.startPullDownRefresh();
}

export function disablePullDownRefresh() {
  wx.stopPullDownRefresh();
}

/**
 * Page scroll helper
 */
export function scrollToTop(duration: number = 300) {
  wx.pageScrollTo({
    scrollTop: 0,
    duration,
  });
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: 'コピーしました',
          icon: 'success',
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
export function previewImage(current: string, urls: string[]) {
  wx.previewImage({
    current,
    urls,
  });
}

/**
 * Make phone call
 */
export async function makePhoneCall(phoneNumber: string): Promise<boolean> {
  return new Promise((resolve) => {
    wx.makePhoneCall({
      phoneNumber,
      success: () => resolve(true),
      fail: () => resolve(false),
    });
  });
}

/**
 * Get WeChat theme (light/dark)
 */
export async function getTheme(): Promise<'light' | 'dark'> {
  const systemInfo = await new Promise<WechatMiniprogram.SystemInfo>((resolve) => {
    wx.getSystemInfo({ success: resolve });
  });
  return systemInfo.theme as 'light' | 'dark' || 'light';
}
