/**
 * Authentication Module
 * Handles user authentication, session management, and user state
 */

import { supabase } from '../config/supabase.js';
import { addFunds } from '../data/mock-data.js';
import { showToast } from './toast.js';

/**
 * Authentication state management
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;

    // Bind methods to preserve context
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
    this.handleAddFunds = this.handleAddFunds.bind(this);

    // Initialize from Supabase session
    this.loadSession();
  }

  /**
   * Initialize the authentication module
   */
  async init() {
    // Set up Supabase auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event);

      if (event === 'SIGNED_IN' && session) {
        this.handleSupabaseSession(session);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.updateUI();
      }
    });

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

    // Sign up button click
    const signupBtn = document.querySelector('[data-action="signup"]');
    if (signupBtn) {
      signupBtn.addEventListener('click', this.showSignupModal.bind(this));
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

    // Sign up form submission
    const signupForm = document.querySelector('[data-signup-form]');
    if (signupForm) {
      signupForm.addEventListener('submit', this.handleSignupSubmit.bind(this));
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
   * Load user session from Supabase
   */
  async loadSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error loading session:', error);
        return;
      }

      if (session) {
        await this.handleSupabaseSession(session);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  /**
   * Handle Supabase session data
   */
  async handleSupabaseSession(session) {
    const { user } = session;

    // Map Supabase user to our user format
    this.currentUser = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
      balance: user.user_metadata?.balance || 0 // We'll store balance in user metadata for now
    };

    this.isAuthenticated = true;
    this.updateUI();

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('userLoggedIn', {
      detail: { user: this.currentUser }
    }));
  }

  /**
   * Update user metadata in Supabase
   */
  async saveUserMetadata() {
    if (!this.currentUser) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username: this.currentUser.username,
          balance: this.currentUser.balance
        }
      });

      if (error) {
        console.error('Error saving user metadata:', error);
      }
    } catch (error) {
      console.error('Error saving user metadata:', error);
    }
  }

  /**
   * Show login modal
   */
  showLoginModal() {
    const modal = document.querySelector('[data-modal="login"]');
    const overlay = document.querySelector('[data-modal-overlay]');

    if (modal && overlay) {
      // Hide all modals first
      this.hideAllModals();

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
   * Show signup modal
   */
  showSignupModal() {
    const modal = document.querySelector('[data-modal="signup"]');
    const overlay = document.querySelector('[data-modal-overlay]');

    if (modal && overlay) {
      // Hide all modals first
      this.hideAllModals();

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
      // Hide all modals first
      this.hideAllModals();

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
    const email = formData.get('username'); // Using username field as email
    const password = formData.get('password');

    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      // Show loading state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Logging in...';
      submitBtn.disabled = true;

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        throw error;
      }

      // Session will be handled by onAuthStateChange listener
      this.closeModal();
      showToast(`Welcome back!`, 'success');

    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      // Reset button state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Login';
      submitBtn.disabled = false;
    }
  }

  /**
   * Handle signup form submission
   * @param {Event} event - Form submission event
   */
  async handleSignupSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const username = formData.get('username');
    const password = formData.get('password');

    if (!email || !username || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      // Show loading state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Creating account...';
      submitBtn.disabled = true;

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            balance: 1000 // Give new users $1000 starting balance
          }
        }
      });

      if (error) {
        throw error;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        showToast('Please check your email to confirm your account', 'info', 8000);
        this.closeModal();
      } else {
        // Auto-login successful
        showToast(`Welcome to PokeBet, ${username}!`, 'success');
        this.closeModal();
      }

    } catch (error) {
      console.error('Signup error:', error);
      showToast(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
      // Reset button state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Create Account';
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

      // Add funds (update balance)
      this.currentUser.balance += amount;
      await this.saveUserMetadata();
      this.updateUI();

      this.closeModal();
      showToast(`Successfully added ${this.formatCurrency(amount)}!`, 'success');

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('balanceUpdated', {
        detail: { newBalance: this.currentUser.balance }
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
   * Login user and update state (handled by Supabase now)
   * @param {Object} user - User data
   */
  async login(user) {
    // This is now handled by handleSupabaseSession
    // Keeping this method for backwards compatibility
    console.log('Login handled by Supabase auth state listener');
  }

  /**
   * Logout user and clear state
   */
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      this.currentUser = null;
      this.isAuthenticated = false;
      this.updateUI();

      showToast('Successfully logged out', 'success');

      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error logging out', 'error');
    }
  }

  /**
   * Update user balance
   * @param {number} newBalance - New balance amount
   */
  async updateBalance(newBalance) {
    if (this.currentUser) {
      this.currentUser.balance = newBalance;
      await this.saveUserMetadata();
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
   * Hide all modals without hiding the overlay
   */
  hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
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