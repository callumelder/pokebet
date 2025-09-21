/**
 * Market Card Component
 * Handles display and interaction for individual prediction market cards
 */

import { formatCurrency, formatDate, placeTrade } from '../data/mock-data.js';
import { showToast } from './toast.js';
import authManager from './auth.js';

/**
 * Market Card Manager
 * Handles rendering and interaction for market cards
 */
class MarketCardManager {
  constructor() {
    this.currentMarkets = [];
    this.activeFilter = 'all';
    this.tradingModal = null;
    this.currentTradeData = null;

    // Bind methods
    this.renderMarkets = this.renderMarkets.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleTradeClick = this.handleTradeClick.bind(this);
    this.handleTradeSubmit = this.handleTradeSubmit.bind(this);
  }

  /**
   * Initialize the market card manager
   */
  init() {
    this.bindEvents();
    this.setupTradingModal();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', this.handleFilterChange);
    });

    // Use event delegation for market cards (since they're dynamically created)
    const marketsContainer = document.querySelector('[data-markets-container]');
    if (marketsContainer) {
      marketsContainer.addEventListener('click', this.handleTradeClick);
    }

    // Modal close events
    const modalOverlay = document.querySelector('[data-modal-overlay]');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });
    }

    const closeButtons = document.querySelectorAll('[data-action="close-modal"]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', this.closeModal.bind(this));
    });

    // Listen for authentication events
    window.addEventListener('userLoggedIn', () => {
      this.updateMarketInteractivity();
    });

    window.addEventListener('userLoggedOut', () => {
      this.updateMarketInteractivity();
    });
  }

  /**
   * Setup trading modal functionality
   */
  setupTradingModal() {
    const tradingModal = document.querySelector('[data-modal="trade"]');
    if (!tradingModal) return;

    this.tradingModal = tradingModal;

    // Trade side selection
    const tradeOptions = tradingModal.querySelectorAll('[data-trade-side]');
    tradeOptions.forEach(option => {
      option.addEventListener('click', this.handleTradeSideSelection.bind(this));
    });

    // Trade form submission
    const tradeForm = tradingModal.querySelector('[data-trade-input-form]');
    if (tradeForm) {
      tradeForm.addEventListener('submit', this.handleTradeSubmit);
    }

    // Amount input change for trade summary
    const amountInput = tradingModal.querySelector('#trade-amount');
    if (amountInput) {
      amountInput.addEventListener('input', this.updateTradeSummary.bind(this));
    }
  }

  /**
   * Render markets to the grid
   * @param {Array} markets - Array of market data
   */
  renderMarkets(markets) {
    this.currentMarkets = markets;
    const container = document.querySelector('[data-markets-container]');
    const loadingState = document.querySelector('[data-loading]');

    if (!container) return;

    // Hide loading state
    if (loadingState) {
      loadingState.style.display = 'none';
    }

    // Filter markets based on active filter
    const filteredMarkets = this.activeFilter === 'all'
      ? markets
      : markets.filter(market => market.category === this.activeFilter);

    if (filteredMarkets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">No markets found</h3>
          <p class="empty-state__message">Try adjusting your filters or check back later for new markets.</p>
        </div>
      `;
      return;
    }

    // Render market cards
    container.innerHTML = filteredMarkets.map(market => this.createMarketCardHTML(market)).join('');

    this.updateMarketInteractivity();
  }

  /**
   * Create HTML for a single market card
   * @param {Object} market - Market data
   * @returns {string} HTML string for market card
   */
  createMarketCardHTML(market) {
    const yesPercentage = Math.round(market.yesPrice * 100);
    const noPercentage = Math.round(market.noPrice * 100);
    const endDate = formatDate(market.endDate);
    const isAuthenticated = authManager.getIsAuthenticated();

    const categoryLabels = {
      'card-prices': 'Card Prices',
      'events': 'Events',
      'set-performance': 'Set Performance'
    };

    return `
      <article class="market-card" data-market-id="${market.id}">
        <header class="market-card__header">
          <span class="market-card__category">${categoryLabels[market.category] || market.category}</span>
          <h3 class="market-card__title">${this.escapeHtml(market.title)}</h3>
          <p class="market-card__description">${this.escapeHtml(market.description)}</p>
        </header>

        <div class="market-card__prices">
          <button
            class="price-option price-option--yes"
            data-trade-action="yes"
            data-market-id="${market.id}"
            ${!isAuthenticated ? 'disabled' : ''}
            aria-label="Buy YES shares at ${market.yesPrice.toFixed(2)}"
          >
            <span class="price-option__label">YES</span>
            <span class="price-option__price">${market.yesPrice.toFixed(2)}¢</span>
            <span class="price-option__percentage">${yesPercentage}%</span>
          </button>

          <button
            class="price-option price-option--no"
            data-trade-action="no"
            data-market-id="${market.id}"
            ${!isAuthenticated ? 'disabled' : ''}
            aria-label="Buy NO shares at ${market.noPrice.toFixed(2)}"
          >
            <span class="price-option__label">NO</span>
            <span class="price-option__price">${market.noPrice.toFixed(2)}¢</span>
            <span class="price-option__percentage">${noPercentage}%</span>
          </button>
        </div>

        <footer class="market-card__meta">
          <span class="market-card__volume">${formatCurrency(market.totalVolume)} volume</span>
          <span class="market-card__end-date">Ends ${endDate}</span>
        </footer>
      </article>
    `;
  }

  /**
   * Handle filter button clicks
   * @param {Event} event - Click event
   */
  handleFilterChange(event) {
    const newFilter = event.target.dataset.filter;
    if (newFilter === this.activeFilter) return;

    // Update active filter
    this.activeFilter = newFilter;

    // Update button states
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(btn => {
      btn.classList.toggle('filter-btn--active', btn.dataset.filter === newFilter);
      btn.setAttribute('aria-pressed', btn.dataset.filter === newFilter);
    });

    // Re-render markets with new filter
    this.renderMarkets(this.currentMarkets);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('marketFilterChanged', {
      detail: { filter: newFilter }
    }));
  }

  /**
   * Handle trade button clicks
   * @param {Event} event - Click event
   */
  handleTradeClick(event) {
    const tradeButton = event.target.closest('[data-trade-action]');
    if (!tradeButton) return;

    event.preventDefault();

    if (!authManager.getIsAuthenticated()) {
      showToast('Please login to start trading', 'warning');
      return;
    }

    const marketId = parseInt(tradeButton.dataset.marketId);
    const side = tradeButton.dataset.tradeAction;
    const market = this.currentMarkets.find(m => m.id === marketId);

    if (!market) {
      showToast('Market not found', 'error');
      return;
    }

    this.showTradingModal(market, side);
  }

  /**
   * Show trading modal for a specific market and side
   * @param {Object} market - Market data
   * @param {string} side - Trading side (yes/no)
   */
  showTradingModal(market, side) {
    if (!this.tradingModal) return;

    this.currentTradeData = { market, side };

    // Update market info in modal
    const marketInfo = this.tradingModal.querySelector('[data-trade-market-info]');
    if (marketInfo) {
      marketInfo.innerHTML = `
        <h4 class="trade-market-title">${this.escapeHtml(market.title)}</h4>
        <p class="trade-market-category">${this.getCategoryLabel(market.category)}</p>
      `;
    }

    // Update price displays
    const yesPrice = this.tradingModal.querySelector('[data-yes-price]');
    const noPrice = this.tradingModal.querySelector('[data-no-price]');
    if (yesPrice) yesPrice.textContent = `${market.yesPrice.toFixed(2)}¢`;
    if (noPrice) noPrice.textContent = `${market.noPrice.toFixed(2)}¢`;

    // Update trade option selection
    this.selectTradeSide(side);

    // Update available balance
    const user = authManager.getCurrentUser();
    const balanceDisplay = this.tradingModal.querySelector('[data-available-balance]');
    if (balanceDisplay && user) {
      balanceDisplay.textContent = formatCurrency(user.balance);
    }

    // Reset form
    const form = this.tradingModal.querySelector('[data-trade-input-form]');
    if (form) form.reset();

    // Hide trade summary
    const summary = this.tradingModal.querySelector('[data-trade-summary]');
    if (summary) summary.style.display = 'none';

    // Show modal
    const overlay = document.querySelector('[data-modal-overlay]');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      this.tradingModal.style.display = 'flex';

      // Focus on amount input
      const amountInput = this.tradingModal.querySelector('#trade-amount');
      if (amountInput) {
        setTimeout(() => amountInput.focus(), 100);
      }
    }
  }

  /**
   * Handle trade side selection in modal
   * @param {Event} event - Click event
   */
  handleTradeSideSelection(event) {
    const side = event.target.closest('[data-trade-side]').dataset.tradeSide;
    this.selectTradeSide(side);
  }

  /**
   * Select trade side in modal
   * @param {string} side - Trading side (yes/no)
   */
  selectTradeSide(side) {
    if (!this.currentTradeData) return;

    this.currentTradeData.side = side;

    // Update visual selection
    const tradeOptions = this.tradingModal.querySelectorAll('[data-trade-side]');
    tradeOptions.forEach(option => {
      const isSelected = option.dataset.tradeSide === side;
      option.classList.toggle('trade-option--selected', isSelected);
    });

    // Update trade summary
    this.updateTradeSummary();
  }

  /**
   * Update trade summary based on current inputs
   */
  updateTradeSummary() {
    if (!this.currentTradeData) return;

    const amountInput = this.tradingModal.querySelector('#trade-amount');
    const summary = this.tradingModal.querySelector('[data-trade-summary]');
    const submitBtn = this.tradingModal.querySelector('button[type="submit"]');

    if (!amountInput || !summary || !submitBtn) return;

    const investment = parseFloat(amountInput.value) || 0;
    const user = authManager.getCurrentUser();

    if (investment <= 0) {
      summary.style.display = 'none';
      submitBtn.disabled = true;
      return;
    }

    if (user && investment > user.balance) {
      showToast('Insufficient balance', 'error');
      submitBtn.disabled = true;
      return;
    }

    const { market, side } = this.currentTradeData;
    const price = side === 'yes' ? market.yesPrice : market.noPrice;
    const shares = investment / price;
    const potentialPayout = shares * 1.00; // Max payout is $1 per share
    const potentialProfit = potentialPayout - investment;

    // Update summary display
    const summaryData = {
      side: side.toUpperCase(),
      investment: formatCurrency(investment),
      payout: formatCurrency(potentialPayout),
      profit: formatCurrency(potentialProfit)
    };

    const sideElement = summary.querySelector('[data-summary-side]');
    const investmentElement = summary.querySelector('[data-summary-investment]');
    const payoutElement = summary.querySelector('[data-summary-payout]');
    const profitElement = summary.querySelector('[data-summary-profit]');

    if (sideElement) sideElement.textContent = summaryData.side;
    if (investmentElement) investmentElement.textContent = summaryData.investment;
    if (payoutElement) payoutElement.textContent = summaryData.payout;
    if (profitElement) profitElement.textContent = summaryData.profit;

    summary.style.display = 'block';
    submitBtn.disabled = false;
  }

  /**
   * Handle trade form submission
   * @param {Event} event - Form submission event
   */
  async handleTradeSubmit(event) {
    event.preventDefault();

    if (!this.currentTradeData) return;

    const formData = new FormData(event.target);
    const investment = parseFloat(formData.get('amount'));

    if (!investment || investment <= 0) {
      showToast('Please enter a valid investment amount', 'error');
      return;
    }

    const user = authManager.getCurrentUser();
    if (!user || investment > user.balance) {
      showToast('Insufficient balance', 'error');
      return;
    }

    try {
      // Show loading state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Placing Trade...';
      submitBtn.disabled = true;

      // Place trade
      const result = await placeTrade(
        this.currentTradeData.market.id,
        this.currentTradeData.side,
        investment
      );

      // Update user balance
      authManager.updateBalance(result.newBalance);

      // Close modal and show success
      this.closeModal();
      showToast(
        `Successfully purchased ${result.shares.toFixed(2)} ${this.currentTradeData.side.toUpperCase()} shares for ${formatCurrency(result.actualCost)}`,
        'success'
      );

      // Dispatch trade event for portfolio updates
      window.dispatchEvent(new CustomEvent('tradeCompleted', {
        detail: { trade: result, market: this.currentTradeData.market }
      }));

    } catch (error) {
      console.error('Trade error:', error);
      showToast(error.message || 'Failed to place trade. Please try again.', 'error');
    } finally {
      // Reset button state
      const submitBtn = event.target.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Place Trade';
      submitBtn.disabled = false;
    }
  }

  /**
   * Close trading modal
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

    // Clear trade data
    this.currentTradeData = null;

    // Reset form
    const forms = document.querySelectorAll('.modal form');
    forms.forEach(form => form.reset());
  }

  /**
   * Update market interactivity based on auth state
   */
  updateMarketInteractivity() {
    const tradeButtons = document.querySelectorAll('[data-trade-action]');
    const isAuthenticated = authManager.getIsAuthenticated();

    tradeButtons.forEach(btn => {
      btn.disabled = !isAuthenticated;
      if (!isAuthenticated) {
        btn.setAttribute('title', 'Login required to trade');
      } else {
        btn.removeAttribute('title');
      }
    });
  }

  /**
   * Get category label
   * @param {string} category - Category key
   * @returns {string} Human-readable category label
   */
  getCategoryLabel(category) {
    const labels = {
      'card-prices': 'Card Prices',
      'events': 'Events',
      'set-performance': 'Set Performance'
    };
    return labels[category] || category;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Destroy the market card manager
   */
  destroy() {
    this.currentMarkets = [];
    this.currentTradeData = null;
  }
}

// Create and export singleton instance
const marketCardManager = new MarketCardManager();

export default marketCardManager;