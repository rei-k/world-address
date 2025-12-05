/**
 * Simple toast notification utility
 * Replace browser alert() with better UX
 */

let toastContainer: HTMLDivElement | null = null;

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

/**
 * Show a toast notification
 */
export function showToast(message: string, options: ToastOptions = {}): void {
  const { type = 'info', duration = 3000 } = options;

  // Create toast container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    min-width: 250px;
    max-width: 400px;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-family: system-ui, -apple-system, sans-serif;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
  `;

  // Set colors based on type
  const colors = {
    success: { bg: '#10b981', text: 'white' },
    error: { bg: '#ef4444', text: 'white' },
    info: { bg: '#3b82f6', text: 'white' },
    warning: { bg: '#f59e0b', text: 'white' },
  };

  const color = colors[type];
  toast.style.background = color.bg;
  toast.style.color = color.text;

  // Add icon based on type
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 20px;">${icons[type]}</span>
      <span>${message}</span>
    </div>
  `;

  // Add click to dismiss
  toast.addEventListener('click', () => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toastContainer?.removeChild(toast);
    }, 300);
  });

  // Add to container
  toastContainer.appendChild(toast);

  // Auto dismiss
  setTimeout(() => {
    if (toastContainer?.contains(toast)) {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (toastContainer?.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }
  }, duration);
}

// Add CSS animations if not already present
if (typeof document !== 'undefined') {
  const styleId = 'toast-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
