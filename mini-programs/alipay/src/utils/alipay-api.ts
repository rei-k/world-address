/**
 * Alipay API Utilities
 * Alipay-specific API helpers
 */

/**
 * Initialize Alipay Mini-Program
 */
export function initAlipay(config: {
  appId: string;
  apiBaseUrl: string;
}) {
  console.log('Alipay Mini-Program initialized:', config);
  // Store config in global state or storage
  my.setStorageSync({ key: 'vey_config', data: config });
}

/**
 * Get Alipay user info
 */
export async function getAlipayUserInfo(): Promise<any> {
  return new Promise((resolve, reject) => {
    my.getAuthCode({
      scopes: ['auth_user'],
      success: (res: any) => {
        // In production, exchange auth code for user info on backend
        resolve({ authCode: res.authCode });
      },
      fail: reject,
    });
  });
}

/**
 * Alipay login
 */
export async function loginAlipay(): Promise<string> {
  return new Promise((resolve, reject) => {
    my.getAuthCode({
      scopes: ['auth_base'],
      success: (res: any) => {
        if (res.authCode) {
          resolve(res.authCode);
        } else {
          reject(new Error('ログインに失敗しました'));
        }
      },
      fail: reject,
    });
  });
}

/**
 * Alipay Payment
 */
export async function payWithAlipay(tradeNo: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    my.tradePay({
      tradeNO: tradeNo,
      success: () => resolve(true),
      fail: (err: any) => {
        if (err.resultCode === '6001') {
          // User cancelled
          resolve(false);
        } else {
          reject(err);
        }
      },
    });
  });
}

/**
 * Navigate to Alipay mini-program page
 */
export function navigateToPage(url: string) {
  my.navigateTo({ url });
}

/**
 * Show Alipay toast
 */
export function showToast(
  content: string,
  type: 'success' | 'fail' | 'exception' | 'none' = 'none'
) {
  my.showToast({ content, type });
}

/**
 * Show Alipay alert
 */
export async function showAlert(title: string, content: string): Promise<void> {
  return new Promise((resolve) => {
    my.alert({
      title,
      content,
      success: resolve,
    });
  });
}

/**
 * Show Alipay confirm
 */
export async function showConfirm(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    my.confirm({
      title,
      content,
      success: (res: any) => resolve(res.confirm),
      fail: () => resolve(false),
    });
  });
}

/**
 * Get Alipay system info
 */
export function getSystemInfo(): Promise<any> {
  return new Promise((resolve, reject) => {
    my.getSystemInfo({
      success: resolve,
      fail: reject,
    });
  });
}

/**
 * Set Alipay navigation bar title
 */
export function setNavigationBarTitle(title: string) {
  my.setNavigationBar({ title });
}

/**
 * Alipay storage helpers
 */
export const storage = {
  set: (key: string, data: any) => {
    my.setStorageSync({ key, data });
  },
  get: <T = any>(key: string): T | null => {
    try {
      const res = my.getStorageSync({ key });
      return res.data;
    } catch {
      return null;
    }
  },
  remove: (key: string) => {
    my.removeStorageSync({ key });
  },
  clear: () => {
    my.clearStorageSync();
  },
};

/**
 * Open Alipay customer service
 */
export function openCustomerService() {
  my.showToast({
    content: 'カスタマーサービス',
    type: 'none',
  });
}

/**
 * Get Sesame Credit authorization
 */
export async function getSesameCredit(): Promise<number | null> {
  // In production, integrate with Sesame Credit API
  // This is a placeholder
  return new Promise((resolve) => {
    my.showToast({
      content: '芝麻信用機能は準備中です',
      type: 'none',
    });
    resolve(null);
  });
}

/**
 * Alipay-specific: Open location picker
 */
export async function chooseLocation(): Promise<any> {
  return new Promise((resolve, reject) => {
    my.chooseLocation({
      success: resolve,
      fail: reject,
    });
  });
}
