/**
 * Main Application Module
 * Orchestrates all components and manages application state
 */

import { fetchMarkets } from './data/mock-data.js';
import { showToast } from './components/toast.js';
import authManager from './components/auth.js';
import marketCardManager from './components/market-card.js';
import portfolioManager from './components/portfolio.js';

/**
 * PokeBet Application
 * Main application class that coordinates all functionality
 */
class PokeBetApp {
  constructor() {
    this.currentMarkets = [];
    this.currentSection = 'markets';
    this.isLoading = false;

    // Bind methods to preserve context
    this.init = this.init.bind(this);
    this.loadMarkets = this.loadMarkets.bind(this);
    this.handleSectionNavigation = this.handleSectionNavigation.bind(this);
    this.handleKeyboardNavigation = this.handleKeyboardNavigation.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing PokeBet application...');

      // Initialize core components
      this.initializeComponents();

      // Setup global event listeners
      this.bindGlobalEvents();

      // Setup navigation
      this.initializeNavigation();

      // Setup keyboard navigation
      this.setupKeyboardNavigation();

      // Load initial data
      await this.loadInitialData();

      console.log('✅ PokeBet application initialized successfully');

      // Show welcome message if not authenticated
      if (!authManager.getIsAuthenticated()) {
        setTimeout(() => {
          showToast(
            'Welcome to PokeBet! Login to start trading Pokemon prediction markets.',
            'info',
            6000
          );
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      showToast('Failed to initialize application. Please refresh the page.', 'error', 0);
    }
  }

  /**
   * Initialize all component modules
   */
  initializeComponents() {
    // Initialize authentication manager
    authManager.init();

    // Initialize market card manager
    marketCardManager.init();

    // Initialize portfolio manager
    portfolioManager.init();

    console.log('✅ All components initialized');
  }

  /**
   * Bind global application events
   */
  bindGlobalEvents() {
    // Listen for component events
    window.addEventListener('userLoggedIn', this.handleUserLoggedIn.bind(this));
    window.addEventListener('userLoggedOut', this.handleUserLoggedOut.bind(this));
    window.addEventListener('betCompleted', this.handlebetCompleted.bind(this));
    window.addEventListener('marketFilterChanged', this.handleMarketFilterChanged.bind(this));

    // Listen for connection/visibility events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Error handling
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  /**
   * Initialize navigation between sections
   */
  initializeNavigation() {
    const navButtons = document.querySelectorAll('[data-section]');

    navButtons.forEach(button => {
      button.addEventListener('click', this.handleSectionNavigation);
    });

    // Set initial section
    this.showSection(this.currentSection);
  }

  /**
   * Setup keyboard navigation for accessibility
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', this.handleKeyboardNavigation);

    // Setup focus trap for modals
    document.addEventListener('keydown', this.handleModalFocusTrap.bind(this));
  }

  /**
   * Load initial application data
   */
  async loadInitialData() {
    await this.loadMarkets();

    // Load user portfolio if authenticated
    if (authManager.getIsAuthenticated()) {
      await portfolioManager.loadPortfolio();
    }
  }

  /**
   * Load markets data
   * @param {string} category - Optional category filter
   */
  async loadMarkets(category = null) {
    if (this.isLoading) return;

    this.isLoading = true;

    try {
      console.log('📊 Loading markets...');
      const markets = await fetchMarkets(category);

      this.currentMarkets = markets;

      // Update market card manager
      marketCardManager.renderMarkets(markets);

      // Update portfolio with new market data
      portfolioManager.updateMarkets(markets);

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('marketsUpdated', {
        detail: { markets }
      }));

      console.log(`✅ Loaded ${markets.length} markets`);

    } catch (error) {
      console.error('❌ Failed to load markets:', error);
      showToast('Failed to load markets. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Handle section navigation
   * @param {Event} event - Click event
   */
  handleSectionNavigation(event) {
    const section = event.target.dataset.section;
    if (!section || section === this.currentSection) return;

    this.showSection(section);
  }

  /**
   * Show a specific section
   * @param {string} sectionName - Section to show
   */
  showSection(sectionName) {
    const sections = document.querySelectorAll('[data-section-content]');
    const navButtons = document.querySelectorAll('[data-section]');

    // Hide all sections
    sections.forEach(section => {
      section.style.display = 'none';
    });

    // Show target section
    const targetSection = document.querySelector(`[data-section-content="${sectionName}"]`);
    if (targetSection) {
      targetSection.style.display = 'block';
    }

    // Update navigation states
    navButtons.forEach(button => {
      const isActive = button.dataset.section === sectionName;
      button.classList.toggle('nav__link--active', isActive);
      button.setAttribute('aria-pressed', isActive);
    });

    this.currentSection = sectionName;

    // Trigger section-specific actions
    this.handleSectionChange(sectionName);

    console.log(`📄 Switched to section: ${sectionName}`);
  }

  /**
   * Handle section change actions
   * @param {string} sectionName - New section name
   */
  handleSectionChange(sectionName) {
    switch (sectionName) {
      case 'portfolio':
        // Load portfolio data if authenticated
        if (authManager.getIsAuthenticated()) {
          portfolioManager.loadPortfolio();
        }
        break;

      case 'markets':
        // Refresh markets if they're stale
        const lastUpdate = this.marketsLastUpdated || 0;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now - lastUpdate > fiveMinutes) {
          this.loadMarkets();
        }
        break;
    }
  }

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyboardNavigation(event) {
    // ESC key - close modals
    if (event.key === 'Escape') {
      const overlay = document.querySelector('[data-modal-overlay]');
      if (overlay && overlay.style.display !== 'none') {
        marketCardManager.closeModal();
        authManager.closeModal();
      }
    }

    // Tab navigation improvements
    if (event.key === 'Tab') {
      this.handleTabNavigation(event);
    }

    // Quick navigation shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          this.showSection('markets');
          break;
        case '2':
          event.preventDefault();
          this.showSection('portfolio');
          break;
      }
    }
  }

  /**
   * Handle tab navigation improvements
   * @param {KeyboardEvent} event - Tab key event
   */
  handleTabNavigation(event) {
    // Improve focus management for dynamic content
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // If we're at the last element and tabbing forward, go to first
    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }

    // If we're at the first element and tabbing backward, go to last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  }

  /**
   * Handle focus trap for modals
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleModalFocusTrap(event) {
    const overlay = document.querySelector('[data-modal-overlay]');
    if (!overlay || overlay.style.display === 'none') return;

    const modal = overlay.querySelector('.modal[style*="flex"]');
    if (!modal) return;

    if (event.key === 'Tab') {
      const focusableElements = modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
  }

  /**
   * Handle user login event
   * @param {CustomEvent} event - Login event
   */
  handleUserLoggedIn(event) {
    console.log('👤 User logged in:', event.detail.user.username);

    // Load user data
    portfolioManager.loadPortfolio();

    // Update UI state
    this.updateAuthenticatedState();
  }

  /**
   * Handle user logout event
   */
  handleUserLoggedOut() {
    console.log('👤 User logged out');

    // Clear sensitive data
    portfolioManager.clearPortfolio();

    // Switch to markets section if on portfolio
    if (this.currentSection === 'portfolio') {
      this.showSection('markets');
    }

    // Update UI state
    this.updateAuthenticatedState();
  }

  /**
   * Handle bet completion event
   * @param {CustomEvent} event - bet event
   */
  handlebetCompleted(event) {
    console.log('💰 bet completed:', event.detail);

    // Refresh markets to get updated volumes/prices
    this.loadMarkets();

    // Portfolio will be updated automatically via the betCompleted event
  }

  /**
   * Handle market filter change event
   * @param {CustomEvent} event - Filter change event
   */
  handleMarketFilterChanged(event) {
    console.log('🔍 Market filter changed:', event.detail.filter);

    // Could implement analytics or additional filtering logic here
  }

  /**
   * Handle online event
   */
  handleOnline() {
    console.log('🌐 Connection restored');
    showToast('Connection restored', 'success');

    // Refresh data when coming back online
    this.loadMarkets();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('📡 Connection lost');
    showToast('You are currently offline. Some features may not work.', 'warning', 0);
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange() {
    if (!document.hidden) {
      // Page became visible - refresh data if stale
      const lastUpdate = this.marketsLastUpdated || 0;
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000;

      if (now - lastUpdate > tenMinutes) {
        console.log('🔄 Refreshing stale data...');
        this.loadMarkets();
      }
    }
  }

  /**
   * Handle global errors
   * @param {ErrorEvent} event - Error event
   */
  handleGlobalError(event) {
    console.error('🚨 Global error:', event.error);

    // Don't show toast for every error to avoid spam
    if (!this.lastErrorToast || Date.now() - this.lastErrorToast > 5000) {
      showToast('An unexpected error occurred. Please try refreshing the page.', 'error');
      this.lastErrorToast = Date.now();
    }
  }

  /**
   * Handle unhandled promise rejections
   * @param {PromiseRejectionEvent} event - Promise rejection event
   */
  handleUnhandledRejection(event) {
    console.error('🚨 Unhandled promise rejection:', event.reason);

    // Prevent default browser behavior
    event.preventDefault();

    // Don't show toast for every rejection to avoid spam
    if (!this.lastRejectionToast || Date.now() - this.lastRejectionToast > 5000) {
      showToast('An unexpected error occurred. Please try again.', 'error');
      this.lastRejectionToast = Date.now();
    }
  }

  /**
   * Update UI based on authentication state
   */
  updateAuthenticatedState() {
    const isAuthenticated = authManager.getIsAuthenticated();

    // Update market interactivity
    marketCardManager.updateMarketInteractivity();

    // Show/hide portfolio navigation based on auth state
    const portfolioNavBtn = document.querySelector('[data-section="portfolio"]');
    if (portfolioNavBtn) {
      portfolioNavBtn.style.display = isAuthenticated ? 'block' : 'none';
    }
  }

  /**
   * Get application state
   * @returns {Object} Current application state
   */
  getState() {
    return {
      currentSection: this.currentSection,
      marketsCount: this.currentMarkets.length,
      isAuthenticated: authManager.getIsAuthenticated(),
      user: authManager.getCurrentUser(),
      portfolioSummary: portfolioManager.getPortfolioSummary()
    };
  }

  /**
   * Destroy the application (cleanup)
   */
  destroy() {
    // Cleanup components
    authManager.destroy();
    marketCardManager.destroy();
    portfolioManager.destroy();

    // Remove event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);

    console.log('🧹 Application cleaned up');
  }
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Create and initialize the application
    window.pokeBetApp = new PokeBetApp();
    await window.pokeBetApp.init();

    // Make app available globally for debugging
    if (process?.env?.NODE_ENV === 'development') {
      window.debugApp = window.pokeBetApp;
    }

  } catch (error) {
    console.error('❌ Failed to start application:', error);

    // Show fallback error message
    const container = document.querySelector('[data-markets-container]');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚠️</div>
          <h3 class="empty-state__title">Application Error</h3>
          <p class="empty-state__message">Failed to start the application. Please refresh the page.</p>
          <button class="btn btn--primary" onclick="window.location.reload()">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
  // Could implement proper routing here if needed
  console.log('🔙 Browser navigation:', event.state);
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Future: Register service worker for offline functionality
    console.log('🔧 Service worker support detected');
  });
}

// Export for testing purposes
export default PokeBetApp;