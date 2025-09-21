/**
 * Toast Notification System
 * Provides user feedback through temporary toast notifications
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.querySelector('.toast-container');
  if (!container) {
    console.warn('Toast container not found');
    return;
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Toast icon based on type
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  // Toast titles based on type
  const titles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  };

  toast.innerHTML = `
    <div class="toast__icon">${icons[type] || icons.info}</div>
    <div class="toast__content">
      <div class="toast__title">${titles[type] || titles.info}</div>
      <div class="toast__message">${escapeHtml(message)}</div>
    </div>
    <button class="toast__close" aria-label="Close notification" type="button">×</button>
  `;

  // Add click handler for close button
  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  // Add click handler for toast itself (optional close)
  toast.addEventListener('click', (e) => {
    if (!e.target.closest('.toast__close')) {
      removeToast(toast);
    }
  });

  // Add toast to container
  container.appendChild(toast);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(toast);
    }, duration);
  }

  // Focus management for accessibility
  toast.focus();

  return toast;
}

/**
 * Remove a toast notification
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
  if (!toast || !toast.parentNode) return;

  // Add exit animation
  toast.style.transform = 'translateX(100%)';
  toast.style.opacity = '0';

  // Remove from DOM after animation
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

/**
 * Clear all toast notifications
 */
export function clearAllToasts() {
  const container = document.querySelector('.toast-container');
  if (container) {
    const toasts = container.querySelectorAll('.toast');
    toasts.forEach(toast => {
      removeToast(toast);
    });
  }
}

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccess(message, duration = 4000) {
  return showToast(message, 'success', duration);
}

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds (0 = no auto-remove)
 */
export function showError(message, duration = 6000) {
  return showToast(message, 'error', duration);
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
export function showWarning(message, duration = 5000) {
  return showToast(message, 'warning', duration);
}

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
export function showInfo(message, duration = 4000) {
  return showToast(message, 'info', duration);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize toast system (if needed for global error handling)
 */
export function initToastSystem() {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please try again.');
  });

  // Global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please try again.');
    event.preventDefault(); // Prevent default browser behavior
  });
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.toast-container');
  if (container) {
    initToastSystem();
  }
});