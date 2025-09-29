/**
 * Portfolio Management Component
 * Handles user portfolio display, position tracking, and performance calculations
 */

import { fetchPositions, calculatePortfolioValue, formatCurrency, formatPercentage, formatDate } from '../data/mock-data.js';
import { showToast } from './toast.js';
import authManager from './auth.js';

/**
 * Portfolio Manager
 * Manages user portfolio display and updates
 */
class PortfolioManager {
  constructor() {
    this.positions = [];
    this.markets = [];
    this.portfolioSummary = {
      totalValue: 0,
      totalInvested: 0,
      pnl: 0,
      pnlPercentage: 0
    };

    // Bind methods
    this.loadPortfolio = this.loadPortfolio.bind(this);
    this.renderPortfolio = this.renderPortfolio.bind(this);
    this.updatePortfolioSummary = this.updatePortfolioSummary.bind(this);
  }

  /**
   * Initialize the portfolio manager
   */
  init() {
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Listen for authentication events
    window.addEventListener('userLoggedIn', () => {
      this.loadPortfolio();
    });

    window.addEventListener('userLoggedOut', () => {
      this.clearPortfolio();
    });

    // Listen for bet completion events
    window.addEventListener('betCompleted', () => {
      this.loadPortfolio();
    });

    // Listen for market updates
    window.addEventListener('marketsUpdated', (event) => {
      this.markets = event.detail.markets || [];
      this.updatePortfolioValues();
    });

    // Go to markets button
    const goToMarketsBtn = document.querySelector('[data-action="go-to-markets"]');
    if (goToMarketsBtn) {
      goToMarketsBtn.addEventListener('click', () => {
        this.switchToMarketsSection();
      });
    }
  }

  /**
   * Load user portfolio data
   */
  async loadPortfolio() {
    if (!authManager.getIsAuthenticated()) {
      this.clearPortfolio();
      return;
    }

    try {
      const positions = await fetchPositions();
      this.positions = positions;
      this.updatePortfolioValues();
      this.renderPortfolio();
    } catch (error) {
      console.error('Error loading portfolio:', error);
      showToast('Failed to load portfolio data', 'error');
    }
  }

  /**
   * Update portfolio values with current market prices
   */
  updatePortfolioValues() {
    if (!this.positions.length || !this.markets.length) return;

    this.portfolioSummary = calculatePortfolioValue(this.positions, this.markets);
    this.updatePortfolioSummary();
  }

  /**
   * Update portfolio summary display
   */
  updatePortfolioSummary() {
    const totalValueElement = document.querySelector('[data-total-value]');
    const totalInvestedElement = document.querySelector('[data-total-invested]');
    const totalPnlElement = document.querySelector('[data-total-pnl]');

    if (totalValueElement) {
      totalValueElement.textContent = formatCurrency(this.portfolioSummary.totalValue);
    }

    if (totalInvestedElement) {
      totalInvestedElement.textContent = formatCurrency(this.portfolioSummary.totalInvested);
    }

    if (totalPnlElement) {
      const pnl = this.portfolioSummary.pnl;
      totalPnlElement.textContent = `${formatCurrency(Math.abs(pnl))} (${formatPercentage(this.portfolioSummary.pnlPercentage)})`;

      // Update color based on performance
      totalPnlElement.className = 'portfolio-stat__value';
      if (pnl > 0) {
        totalPnlElement.classList.add('portfolio-stat__value--positive');
      } else if (pnl < 0) {
        totalPnlElement.classList.add('portfolio-stat__value--negative');
      } else {
        totalPnlElement.classList.add('portfolio-stat__value--neutral');
      }
    }
  }

  /**
   * Render portfolio positions
   */
  renderPortfolio() {
    const container = document.querySelector('[data-portfolio-container]');
    const emptyState = document.querySelector('[data-empty-portfolio]');

    if (!container) return;

    if (!this.positions.length) {
      if (emptyState) {
        emptyState.style.display = 'flex';
      }
      container.innerHTML = '';
      return;
    }

    if (emptyState) {
      emptyState.style.display = 'none';
    }

    const positionsHTML = this.positions.map(position => {
      const market = this.markets.find(m => m.id === position.marketId);
      return this.createPositionCardHTML(position, market);
    }).join('');

    container.innerHTML = positionsHTML;
  }

  /**
   * Create HTML for a single position card
   * @param {Object} position - Position data
   * @param {Object} market - Market data
   * @returns {string} HTML string for position card
   */
  createPositionCardHTML(position, market) {
    if (!market) {
      return this.createPositionCardPlaceholderHTML(position);
    }

    const currentPrice = position.side === 'yes' ? market.yesPrice : market.noPrice;
    const currentValue = position.shares * currentPrice;
    const pnl = currentValue - position.invested;
    const pnlPercentage = position.invested > 0 ? (pnl / position.invested) * 100 : 0;
    const purchaseDate = formatDate(position.purchaseDate);

    const pnlClass = pnl > 0 ? 'positive' : pnl < 0 ? 'negative' : 'neutral';
    const pnlSign = pnl >= 0 ? '+' : '';

    return `
      <div class="position-card" data-position-id="${position.id}">
        <div class="position-card__header">
          <h4 class="position-card__title">${this.escapeHtml(market.title)}</h4>
          <span class="position-card__side position-card__side--${position.side}">${position.side.toUpperCase()}</span>
        </div>

        <div class="position-card__stats">
          <div class="position-stat">
            <span class="position-stat__label">Shares</span>
            <span class="position-stat__value">${position.shares.toFixed(2)}</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Avg Price</span>
            <span class="position-stat__value">${position.avgPrice.toFixed(2)}¢</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Current Price</span>
            <span class="position-stat__value">${currentPrice.toFixed(2)}¢</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Invested</span>
            <span class="position-stat__value">${formatCurrency(position.invested)}</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Current Value</span>
            <span class="position-stat__value">${formatCurrency(currentValue)}</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">P&L</span>
            <span class="position-stat__value portfolio-stat__value--${pnlClass}">
              ${pnlSign}${formatCurrency(Math.abs(pnl))}
              <br>
              <small>(${pnlSign}${pnlPercentage.toFixed(1)}%)</small>
            </span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Purchase Date</span>
            <span class="position-stat__value">${purchaseDate}</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Market Status</span>
            <span class="position-stat__value">${this.getMarketStatusDisplay(market.status)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create placeholder HTML for position with missing market data
   * @param {Object} position - Position data
   * @returns {string} HTML string for position card placeholder
   */
  createPositionCardPlaceholderHTML(position) {
    const purchaseDate = formatDate(position.purchaseDate);

    return `
      <div class="position-card" data-position-id="${position.id}">
        <div class="position-card__header">
          <h4 class="position-card__title">Market #${position.marketId} (Data Unavailable)</h4>
          <span class="position-card__side position-card__side--${position.side}">${position.side.toUpperCase()}</span>
        </div>

        <div class="position-card__stats">
          <div class="position-stat">
            <span class="position-stat__label">Shares</span>
            <span class="position-stat__value">${position.shares.toFixed(2)}</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Avg Price</span>
            <span class="position-stat__value">${position.avgPrice.toFixed(2)}¢</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Invested</span>
            <span class="position-stat__value">${formatCurrency(position.invested)}</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Purchase Date</span>
            <span class="position-stat__value">${purchaseDate}</span>
          </div>

          <div class="position-stat">
            <span class="position-stat__label">Status</span>
            <span class="position-stat__value">Market data unavailable</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get market status display text
   * @param {string} status - Market status
   * @returns {string} Display text for status
   */
  getMarketStatusDisplay(status) {
    const statusMap = {
      'active': 'Active',
      'closed': 'Closed',
      'resolved': 'Resolved',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  /**
   * Clear portfolio data
   */
  clearPortfolio() {
    this.positions = [];
    this.portfolioSummary = {
      totalValue: 0,
      totalInvested: 0,
      pnl: 0,
      pnlPercentage: 0
    };
    this.updatePortfolioSummary();
    this.renderPortfolio();
  }

  /**
   * Switch to markets section
   */
  switchToMarketsSection() {
    // Trigger navigation to markets
    const marketsNavBtn = document.querySelector('[data-section="markets"]');
    if (marketsNavBtn) {
      marketsNavBtn.click();
    }
  }

  /**
   * Update market data for portfolio calculations
   * @param {Array} markets - Updated market data
   */
  updateMarkets(markets) {
    this.markets = markets;
    this.updatePortfolioValues();
    this.renderPortfolio();
  }

  /**
   * Get portfolio summary
   * @returns {Object} Portfolio summary data
   */
  getPortfolioSummary() {
    return { ...this.portfolioSummary };
  }

  /**
   * Get positions count
   * @returns {number} Number of positions
   */
  getPositionsCount() {
    return this.positions.length;
  }

  /**
   * Check if user has positions in a specific market
   * @param {number} marketId - Market ID to check
   * @returns {boolean} True if user has positions in the market
   */
  hasPositionInMarket(marketId) {
    return this.positions.some(position => position.marketId === marketId);
  }

  /**
   * Get position for a specific market and side
   * @param {number} marketId - Market ID
   * @param {string} side - Position side (yes/no)
   * @returns {Object|null} Position data or null if not found
   */
  getPosition(marketId, side) {
    return this.positions.find(position =>
      position.marketId === marketId && position.side === side
    ) || null;
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
   * Destroy the portfolio manager
   */
  destroy() {
    this.positions = [];
    this.markets = [];
    this.portfolioSummary = {
      totalValue: 0,
      totalInvested: 0,
      pnl: 0,
      pnlPercentage: 0
    };
  }
}

// Create and export singleton instance
const portfolioManager = new PortfolioManager();

export default portfolioManager;