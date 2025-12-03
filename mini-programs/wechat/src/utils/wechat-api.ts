/**
 * WeChat API Utilities
 * WeChat-specific API helpers
 */

/**
 * Initialize WeChat Mini-Program
 */
export function initWeChat(config: {
  appId: string;
  apiBaseUrl: string;
}) {
  console.log('WeChat Mini-Program initialized:', config);
  // Store config in global state or storage
  wx.setStorageSync('vey_config', config);
}

/**
 * Get WeChat user info
 */
export async function getWeChatUserInfo(): Promise<any> {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        resolve(res.userInfo);
      },
      fail: reject,
    });
  });
}

/**
 * WeChat login
 */
export async function loginWeChat(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(new Error('ログインに失敗しました'));
        }
      },
      fail: reject,
    });
  });
}

/**
 * WeChat Pay
 */
export async function payWithWeChat(paymentParams: any): Promise<boolean> {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      ...paymentParams,
      success: () => resolve(true),
      fail: (err) => {
        if (err.errMsg === 'requestPayment:fail cancel') {
          resolve(false);
        } else {
          reject(err);
        }
      },
    });
  });
}

/**
 * Navigate to WeChat mini-program page
 */
export function navigateToPage(url: string) {
  wx.navigateTo({ url });
}

/**
 * Show WeChat toast
 */
export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none') {
  wx.showToast({ title, icon });
}

/**
 * Show WeChat modal
 */
export async function showModal(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false),
    });
  });
}

/**
 * Get WeChat system info
 */
export function getSystemInfo(): Promise<WechatMiniprogram.SystemInfo> {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: resolve,
      fail: reject,
    });
  });
}

/**
 * Set WeChat navigation bar title
 */
export function setNavigationBarTitle(title: string) {
  wx.setNavigationBarTitle({ title });
}

/**
 * WeChat storage helpers
 */
export const storage = {
  set: (key: string, data: any) => {
    wx.setStorageSync(key, data);
  },
  get: <T = any>(key: string): T | null => {
    try {
      return wx.getStorageSync(key);
    } catch {
      return null;
    }
  },
  remove: (key: string) => {
    wx.removeStorageSync(key);
  },
  clear: () => {
    wx.clearStorageSync();
  },
};

/**
 * Open WeChat customer service
 */
export function openCustomerService() {
  // In production, configure customer service contact button
  wx.showToast({
    title: 'カスタマーサービス',
    icon: 'none',
  });
}
