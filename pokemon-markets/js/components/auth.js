/**
 * Authentication Module
 * Handles user authentication, session management, and user state
 */

import { authenticateUser, addFunds } from '../data/mock-data.js';
import { showToast } from './toast.js';

/**
 * Authentication state management
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionKey = 'pokebet_session';

    // Bind methods to preserve context
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
    this.handleAddFunds = this.handleAddFunds.bind(this);

    // Initialize from stored session
    this.loadSession();
  }

  /**
   * Initialize the authentication module
   */
  init() {
    this.bindEvents();
    this.updateUI();
  }

  /**
   * Bind event listeners for authentication UI
   */
  bindEvents() {
    // Login button click
    const loginBtn = document.querySelector('[data-action="login"]');
    if (loginBtn) {
      loginBtn.addEventListener('click', this.showLoginModal.bind(this));
    }

    // Logout button click
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.logout);
    }

    // Add funds button click
    const addFundsBtn = document.querySelector('[data-action="add-funds"]');
    if (addFundsBtn) {
      addFundsBtn.addEventListener('click', this.showAddFundsModal.bind(this));
    }

    // Login form submission
    const loginForm = document.querySelector('[data-login-form]');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLoginSubmit.bind(this));
    }

    // Custom amount form submission
    const customAmountForm = document.querySelector('[data-custom-amount-form]');
    if (customAmountForm) {
      customAmountForm.addEventListener('submit', this.handleCustomAmountSubmit.bind(this));
    }

    // Quick amount buttons
    const amountButtons = document.querySelectorAll('[data-amount]');
    amountButtons.forEach(btn => {
      btn.addEventListener('click', this.handleQuickAmount.bind(this));
    });
  }

  /**
   * Load user session from localStorage
   */
  loadSession() {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (sessionData) {
        const session = JSON.parse(sessionData);

        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (sessionAge < maxAge) {
          this.currentUser = session.user;
          this.isAuthenticated = true;
        } else {
          // Session expired, remove it
          localStorage.removeItem(this.sessionKey);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      localStorage.removeItem(this.sessionKey);
    }
  }

  /**
   * Save user session to localStorage
   */
  saveSession() {
    if (this.currentUser) {
      const sessionData = {
        user: this.currentUser,
        timestamp: Date.now()
      };
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }
  }

  /**
   * Show login modal
   */
  showLoginModal() {
    const modal = document.querySelector('[data-modal="login"]');
    const overlay = document.querySelector('[data-modal-overlay]');

    if (modal && overlay) {
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';

      // Focus on first input
      const firstInput = modal.querySelector('input');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  /**
   * Show add funds modal
   */
  showAddFundsModal() {
    if (!this.isAuthenticated) {
      showToast('Please login first', 'error');
      return;
    }

    const modal = document.querySelector('[data-modal="add-funds"]');
    const overlay = document.querySelector('[data-modal-overlay]');

    if (modal && overlay) {
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';

      // Update available balance display
      const balanceDisplay = modal.querySelector('[data-available-balance]');
      if (balanceDisplay) {
        balanceDisplay.textContent = this.formatCurrency(this.currentUser.balance);
      }
    }
  }

  /**
   * Handle login form submission
   * @param {Event} event - Form submission event
   */
  async handleLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
      showToast('Please enter both username and password', 'error');
      return;
    }

    try {
      // Show loading state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Logging in...';
      submitBtn.disabled = true;

      // Authenticate user
      const user = await authenticateUser(username, password);

      await this.login(user);
      this.closeModal();
      showToast(`Welcome back, ${user.username}!`, 'success');

    } catch (error) {
      console.error('Login error:', error);
      showToast('Login failed. Please try again.', 'error');
    } finally {
      // Reset button state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Login';
      submitBtn.disabled = false;
    }
  }

  /**
   * Handle custom amount form submission
   * @param {Event} event - Form submission event
   */
  async handleCustomAmountSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const amount = parseFloat(formData.get('amount'));

    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    await this.handleAddFunds(amount);
  }

  /**
   * Handle quick amount button click
   * @param {Event} event - Button click event
   */
  async handleQuickAmount(event) {
    const amount = parseFloat(event.target.dataset.amount);
    if (amount) {
      await this.handleAddFunds(amount);
    }
  }

  /**
   * Handle adding funds to user account
   * @param {number} amount - Amount to add
   */
  async handleAddFunds(amount) {
    if (!this.isAuthenticated) {
      showToast('Please login first', 'error');
      return;
    }

    try {
      // Show loading state
      const allAmountBtns = document.querySelectorAll('[data-amount], [data-custom-amount-form] button[type="submit"]');
      allAmountBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.amount == amount) {
          btn.textContent = 'Adding...';
        }
      });

      // Add funds
      const updatedUser = await addFunds(amount);
      this.currentUser = updatedUser;
      this.saveSession();
      this.updateUI();

      this.closeModal();
      showToast(`Successfully added ${this.formatCurrency(amount)}!`, 'success');

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('balanceUpdated', {
        detail: { newBalance: updatedUser.balance }
      }));

    } catch (error) {
      console.error('Add funds error:', error);
      showToast(error.message || 'Failed to add funds. Please try again.', 'error');
    } finally {
      // Reset button states
      const allAmountBtns = document.querySelectorAll('[data-amount], [data-custom-amount-form] button[type="submit"]');
      allAmountBtns.forEach(btn => {
        btn.disabled = false;
        if (btn.dataset.amount) {
          btn.textContent = `$${btn.dataset.amount}`;
        } else {
          btn.textContent = 'Add Funds';
        }
      });
    }
  }

  /**
   * Login user and update state
   * @param {Object} user - User data
   */
  async login(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    this.saveSession();
    this.updateUI();

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('userLoggedIn', {
      detail: { user }
    }));
  }

  /**
   * Logout user and clear state
   */
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem(this.sessionKey);
    this.updateUI();

    showToast('Successfully logged out', 'success');

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
  }

  /**
   * Update user balance
   * @param {number} newBalance - New balance amount
   */
  updateBalance(newBalance) {
    if (this.currentUser) {
      this.currentUser.balance = newBalance;
      this.saveSession();
      this.updateUI();
    }
  }

  /**
   * Update authentication UI
   */
  updateUI() {
    const authButtons = document.querySelector('[data-auth-buttons]');
    const userInfo = document.querySelector('[data-user-info]');
    const balanceElement = document.querySelector('[data-balance]');

    if (this.isAuthenticated && this.currentUser) {
      // Show user info, hide auth buttons
      if (authButtons) authButtons.style.display = 'none';
      if (userInfo) userInfo.style.display = 'flex';

      // Update balance display
      if (balanceElement) {
        balanceElement.textContent = this.formatCurrency(this.currentUser.balance);
      }
    } else {
      // Show auth buttons, hide user info
      if (authButtons) authButtons.style.display = 'flex';
      if (userInfo) userInfo.style.display = 'none';
    }
  }

  /**
   * Close modal
   */
  closeModal() {
    const overlay = document.querySelector('[data-modal-overlay]');
    const modals = document.querySelectorAll('.modal');

    if (overlay) {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }

    modals.forEach(modal => {
      modal.style.display = 'none';
    });

    // Clear form inputs
    const forms = document.querySelectorAll('.modal form');
    forms.forEach(form => form.reset());
  }

  /**
   * Get current user
   * @returns {Object|null} Current user data or null if not authenticated
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  /**
   * Format currency for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Destroy the auth manager (cleanup)
   */
  destroy() {
    // Remove event listeners and cleanup
    this.currentUser = null;
    this.isAuthenticated = false;
  }
}

// Create and export singleton instance
const authManager = new AuthManager();

export default authManager;