/**
 * Mock data for Pokemon prediction markets platform
 * This file contains sample market data, user data, and trading information
 * In a production environment, this would be replaced with real API calls
 */

/**
 * Sample prediction markets data
 * @typedef {Object} Market
 * @property {number} id - Unique market identifier
 * @property {string} title - Market question/title
 * @property {string} description - Detailed market description
 * @property {string} category - Market category (card-prices, events, set-performance)
 * @property {number} yesPrice - Current YES price (0-1)
 * @property {number} noPrice - Current NO price (0-1)
 * @property {number} totalVolume - Total trading volume in USD
 * @property {string} endDate - Market resolution date (ISO string)
 * @property {string} status - Market status (active, closed, resolved)
 * @property {string} resolutionSource - Source for market resolution
 */
export const mockMarkets = [
  {
    id: 1,
    title: "Will PSA 10 Base Set Charizard exceed $15,000 by Jan 1, 2026?",
    description: "Based on TCGPlayer market price for PSA 10 Base Set Shadowless Charizard (Card #4/102). Price must be sustained for at least 7 consecutive days.",
    category: "card-prices",
    yesPrice: 0.68,
    noPrice: 0.32,
    totalVolume: 2450,
    endDate: "2026-01-01T00:00:00Z",
    status: "active",
    resolutionSource: "TCGPlayer API average of last 7 sales"
  },
  {
    id: 2,
    title: "Will Pokemon Worlds 2025 have over 1000 Masters Division players?",
    description: "The Pokemon World Championships 2025 Masters Division (18+) will have more than 1000 registered participants on the first day of competition.",
    category: "events",
    yesPrice: 0.45,
    noPrice: 0.55,
    totalVolume: 1820,
    endDate: "2025-08-15T00:00:00Z",
    status: "active",
    resolutionSource: "Official Pokemon World Championships registration data"
  },
  {
    id: 3,
    title: "Will Stellar Crown booster boxes stay above $120 after 6 months?",
    description: "Pokemon TCG Stellar Crown booster box market price (new, sealed) will remain above $120 USD six months after initial release date.",
    category: "set-performance",
    yesPrice: 0.72,
    noPrice: 0.28,
    totalVolume: 3100,
    endDate: "2025-03-20T00:00:00Z",
    status: "active",
    resolutionSource: "TCGPlayer and eBay sold listings average"
  },
  {
    id: 4,
    title: "Will Moonbreon (Umbreon VMAX Alt Art) hit $500 PSA 10 by end of 2025?",
    description: "PSA 10 graded Umbreon VMAX Alternate Art from Evolving Skies (Card #215/203) will reach or exceed $500 market value.",
    category: "card-prices",
    yesPrice: 0.38,
    noPrice: 0.62,
    totalVolume: 1950,
    endDate: "2025-12-31T23:59:59Z",
    status: "active",
    resolutionSource: "PSA certified population and recent sales data"
  },
  {
    id: 5,
    title: "Will the next Pokemon set introduce a new card rarity?",
    description: "The next major Pokemon TCG expansion will introduce a card rarity type that has never been used before in the English TCG.",
    category: "events",
    yesPrice: 0.25,
    noPrice: 0.75,
    totalVolume: 890,
    endDate: "2025-05-01T00:00:00Z",
    status: "active",
    resolutionSource: "Official Pokemon TCG announcements and set releases"
  },
  {
    id: 6,
    title: "Will Paradox Rift have better market performance than Paldea Evolved?",
    description: "Average booster box price of Paradox Rift will exceed average booster box price of Paldea Evolved 12 months post-release.",
    category: "set-performance",
    yesPrice: 0.58,
    noPrice: 0.42,
    totalVolume: 2680,
    endDate: "2025-09-15T00:00:00Z",
    status: "active",
    resolutionSource: "Market price comparison across major retailers"
  }
];

/**
 * Mock user data structure
 * @typedef {Object} User
 * @property {string} id - User identifier
 * @property {string} username - User display name
 * @property {number} balance - Current account balance in USD
 * @property {Date} lastLogin - Last login timestamp
 * @property {number} totalDeposited - Total amount deposited
 * @property {number} totalWithdrawn - Total amount withdrawn
 */
export const mockUser = {
  id: "user_123",
  username: "demo_trader",
  balance: 1000.00,
  lastLogin: new Date(),
  totalDeposited: 1000.00,
  totalWithdrawn: 0.00
};

/**
 * Mock user positions/portfolio data
 * @typedef {Object} Position
 * @property {string} id - Position identifier
 * @property {number} marketId - Associated market ID
 * @property {string} side - Position side (yes/no)
 * @property {number} shares - Number of shares owned
 * @property {number} avgPrice - Average price paid per share
 * @property {number} invested - Total amount invested
 * @property {Date} purchaseDate - When position was opened
 */
export const mockPositions = [
  {
    id: "pos_1",
    marketId: 1,
    side: "yes",
    shares: 25,
    avgPrice: 0.65,
    invested: 16.25,
    purchaseDate: new Date('2024-09-15T10:30:00Z')
  },
  {
    id: "pos_2",
    marketId: 3,
    side: "no",
    shares: 15,
    avgPrice: 0.30,
    invested: 4.50,
    purchaseDate: new Date('2024-09-18T14:20:00Z')
  }
];

/**
 * Mock transaction history
 * @typedef {Object} Transaction
 * @property {string} id - Transaction identifier
 * @property {string} type - Transaction type (trade, deposit, withdrawal)
 * @property {number} amount - Transaction amount
 * @property {Date} timestamp - When transaction occurred
 * @property {Object} details - Additional transaction details
 */
export const mockTransactions = [
  {
    id: "txn_1",
    type: "deposit",
    amount: 1000.00,
    timestamp: new Date('2024-09-10T09:00:00Z'),
    details: { method: "demo_funding" }
  },
  {
    id: "txn_2",
    type: "trade",
    amount: -16.25,
    timestamp: new Date('2024-09-15T10:30:00Z'),
    details: {
      marketId: 1,
      side: "yes",
      shares: 25,
      price: 0.65
    }
  },
  {
    id: "txn_3",
    type: "trade",
    amount: -4.50,
    timestamp: new Date('2024-09-18T14:20:00Z'),
    details: {
      marketId: 3,
      side: "no",
      shares: 15,
      price: 0.30
    }
  }
];

/**
 * Market categories configuration
 */
export const marketCategories = {
  'card-prices': {
    label: 'Card Prices',
    description: 'Markets on individual card values and price movements',
    icon: '💎'
  },
  'events': {
    label: 'Events',
    description: 'Markets on Pokemon events, tournaments, and announcements',
    icon: '🎯'
  },
  'set-performance': {
    label: 'Set Performance',
    description: 'Markets on booster box values and set market performance',
    icon: '📈'
  }
};

/**
 * API simulation functions
 * These functions simulate API responses with realistic delays
 */

/**
 * Simulates fetching markets data
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Promise resolving to markets array
 */
export async function fetchMarkets(category = null) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  let markets = [...mockMarkets];

  if (category && category !== 'all') {
    markets = markets.filter(market => market.category === category);
  }

  // Simulate slight price fluctuations
  markets = markets.map(market => ({
    ...market,
    yesPrice: Math.max(0.01, Math.min(0.99, market.yesPrice + (Math.random() - 0.5) * 0.02)),
    noPrice: Math.max(0.01, Math.min(0.99, market.noPrice + (Math.random() - 0.5) * 0.02))
  }));

  // Ensure prices sum to approximately 1.00
  markets = markets.map(market => {
    const total = market.yesPrice + market.noPrice;
    return {
      ...market,
      yesPrice: Number((market.yesPrice / total).toFixed(2)),
      noPrice: Number((market.noPrice / total).toFixed(2))
    };
  });

  return markets;
}

/**
 * Simulates user authentication
 * @param {string} username - Username
 * @param {string} password - Password (not validated in demo)
 * @returns {Promise<Object>} Promise resolving to user data
 */
export async function authenticateUser(username, password) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  // In demo mode, any credentials work
  return {
    ...mockUser,
    username: username || mockUser.username,
    lastLogin: new Date()
  };
}

/**
 * Simulates adding funds to user account
 * @param {number} amount - Amount to add
 * @returns {Promise<Object>} Promise resolving to updated user data
 */
export async function addFunds(amount) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

  if (amount <= 0 || amount > 10000) {
    throw new Error('Invalid amount. Must be between $1 and $10,000.');
  }

  const updatedUser = {
    ...mockUser,
    balance: mockUser.balance + amount,
    totalDeposited: mockUser.totalDeposited + amount
  };

  // Update mock data
  Object.assign(mockUser, updatedUser);

  return updatedUser;
}

/**
 * Simulates placing a trade
 * @param {number} marketId - Market ID
 * @param {string} side - yes or no
 * @param {number} investment - Amount to invest
 * @returns {Promise<Object>} Promise resolving to trade result
 */
export async function placeTrade(marketId, side, investment) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

  const market = mockMarkets.find(m => m.id === marketId);
  if (!market) {
    throw new Error('Market not found');
  }

  if (investment <= 0) {
    throw new Error('Investment amount must be greater than $0');
  }

  if (investment > mockUser.balance) {
    throw new Error('Insufficient balance');
  }

  const price = side === 'yes' ? market.yesPrice : market.noPrice;
  const shares = Math.floor((investment / price) * 100) / 100; // Round to 2 decimals
  const actualCost = shares * price;

  // Update user balance
  mockUser.balance -= actualCost;

  // Create new position or update existing
  const existingPositionIndex = mockPositions.findIndex(
    p => p.marketId === marketId && p.side === side
  );

  if (existingPositionIndex >= 0) {
    // Update existing position
    const existingPosition = mockPositions[existingPositionIndex];
    const totalShares = existingPosition.shares + shares;
    const totalInvested = existingPosition.invested + actualCost;
    const avgPrice = totalInvested / totalShares;

    mockPositions[existingPositionIndex] = {
      ...existingPosition,
      shares: totalShares,
      avgPrice: avgPrice,
      invested: totalInvested
    };
  } else {
    // Create new position
    const newPosition = {
      id: `pos_${Date.now()}`,
      marketId,
      side,
      shares,
      avgPrice: price,
      invested: actualCost,
      purchaseDate: new Date()
    };
    mockPositions.push(newPosition);
  }

  // Add transaction record
  const newTransaction = {
    id: `txn_${Date.now()}`,
    type: "trade",
    amount: -actualCost,
    timestamp: new Date(),
    details: { marketId, side, shares, price }
  };
  mockTransactions.push(newTransaction);

  return {
    success: true,
    shares,
    actualCost,
    price,
    newBalance: mockUser.balance,
    position: mockPositions[existingPositionIndex] || mockPositions[mockPositions.length - 1]
  };
}

/**
 * Simulates fetching user positions
 * @returns {Promise<Array>} Promise resolving to positions array
 */
export async function fetchPositions() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

  return [...mockPositions];
}

/**
 * Simulates fetching transaction history
 * @returns {Promise<Array>} Promise resolving to transactions array
 */
export async function fetchTransactions() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));

  return [...mockTransactions].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Utility function to calculate current position values
 * @param {Array} positions - User positions
 * @param {Array} markets - Current market data
 * @returns {Object} Portfolio summary
 */
export function calculatePortfolioValue(positions, markets) {
  let totalValue = 0;
  let totalInvested = 0;

  positions.forEach(position => {
    const market = markets.find(m => m.id === position.marketId);
    if (market) {
      const currentPrice = position.side === 'yes' ? market.yesPrice : market.noPrice;
      const currentValue = position.shares * currentPrice;
      totalValue += currentValue;
      totalInvested += position.invested;
    }
  });

  const pnl = totalValue - totalInvested;
  const pnlPercentage = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    pnl,
    pnlPercentage
  };
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage for display
 * @param {number} percentage - Percentage to format
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(percentage) {
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}