# PokeBet - Pokemon Prediction Markets

A modern, accessible Pokemon prediction market platform built with vanilla HTML, CSS, and JavaScript following industry best practices.

## 🎯 Overview

PokeBet allows users to trade on prediction markets related to Pokemon Trading Card Game events, card prices, and set performance. The platform features a clean, responsive design with comprehensive accessibility support and production-ready code architecture.

## ✨ Features

### Core Functionality
- **🔐 Authentication System**: Mock login/logout with session management
- **📊 Market Display**: Grid layout of prediction markets with filtering
- **💰 Trading Interface**: Buy YES/NO shares with real-time balance updates
- **📈 Portfolio Management**: Track positions and performance
- **💳 Add Funds**: Mock payment system with quick deposit options

### Market Categories
- **💎 Card Prices**: Individual card value predictions
- **🎯 Events**: Tournament and announcement markets
- **📈 Set Performance**: Booster box and set market performance

### Technical Features
- **♿ Accessibility**: WCAG AA compliant with screen reader support
- **📱 Responsive Design**: Mobile-first approach (320px to 1920px+)
- **🎨 Modern CSS**: Custom properties, CSS Grid, Flexbox
- **⚡ Performance**: Efficient DOM manipulation and event delegation
- **🔧 Modular Architecture**: ES6 modules with clean separation of concerns

## 🏗️ Project Structure

```
pokemon-markets/
├── index.html                 # Main HTML file with semantic structure
├── css/
│   ├── styles.css            # Base styles, layout, and design system
│   └── components.css        # Component-specific styles
├── js/
│   ├── app.js               # Main application orchestrator
│   ├── components/
│   │   ├── auth.js          # Authentication and session management
│   │   ├── market-card.js   # Market display and trading interface
│   │   ├── portfolio.js     # Portfolio management and tracking
│   │   └── toast.js         # Notification system
│   └── data/
│       └── mock-data.js     # Mock API and data management
├── assets/
│   └── icons/               # Icon assets (placeholder)
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Local web server (for ES6 modules support)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd pokemon-markets
   ```

2. **Start a local web server**

   **Option A: Using Python (if installed)**
   ```bash
   # Python 3
   python -m http.server 8000

   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Using Node.js (if installed)**
   ```bash
   npx serve .
   # or
   npx http-server
   ```

   **Option C: Using VS Code Live Server extension**
   - Install the "Live Server" extension
   - Right-click on `index.html` → "Open with Live Server"

3. **Open your browser**
   - Navigate to `http://localhost:8000` (or the port shown by your server)

### Demo Credentials
- **Username**: Any text (e.g., "demo_user")
- **Password**: Any text (e.g., "password")
- **Starting Balance**: $1000 (mock currency)

## 💻 Usage

### Navigation
- **Markets Tab**: Browse and trade on active prediction markets
- **Portfolio Tab**: View positions, performance, and P&L (login required)

### Trading
1. **Login**: Click "Login" and enter any credentials
2. **Browse Markets**: Filter by category or view all markets
3. **Place Trade**: Click YES/NO buttons on market cards
4. **Confirm Trade**: Enter investment amount and confirm

### Portfolio Management
- View all positions with current values and performance
- Track total invested vs. current value
- Monitor profit/loss across all positions

### Adding Funds
- Click "Add Funds" button (login required)
- Use quick amount buttons ($25, $50, $100, $250)
- Or enter custom amount ($1 - $10,000)

## 🎨 Design System

### Colors
- **Primary**: #3B82F6 (Blue)
- **Success**: #10B981 (Green)
- **Danger**: #EF4444 (Red)
- **Warning**: #F59E0B (Orange)
- **Neutrals**: Gray scale from #F9FAFB to #111827

### Typography
- **Font Stack**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', ...)
- **Fluid Typography**: Uses clamp() for responsive text sizing
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing & Layout
- **CSS Custom Properties**: Consistent spacing scale (0.25rem to 6rem)
- **Grid System**: CSS Grid for card layouts
- **Flexbox**: For component internal layouts
- **Container**: Max-width 1200px with responsive padding

## 🔧 Architecture

### Component Architecture
Each component follows a consistent pattern:
- **Initialization**: `init()` method for setup
- **Event Binding**: `bindEvents()` for event listeners
- **State Management**: Local state with update methods
- **Cleanup**: `destroy()` method for teardown

### State Management
- **Authentication**: Managed by AuthManager singleton
- **Market Data**: Centralized in mock-data.js with API simulation
- **User Portfolio**: Tracked by PortfolioManager
- **UI State**: Component-level state with event communication

### Event System
Components communicate via custom events:
- `userLoggedIn` / `userLoggedOut`: Authentication state changes
- `tradeCompleted`: Trade execution notifications
- `marketsUpdated`: Market data refresh
- `balanceUpdated`: User balance changes

### Data Flow
1. **App.js** orchestrates all components
2. **Mock API** simulates real backend responses with delays
3. **Components** maintain local state and emit events
4. **LocalStorage** persists user sessions and preferences

## ♿ Accessibility Features

### WCAG AA Compliance
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Comprehensive labeling and roles
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader Support**: Descriptive text and live regions

### Responsive Design
- **Mobile-First**: Optimized for small screens first
- **Breakpoints**: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- **Touch Targets**: Minimum 44px click targets
- **Readable Text**: Minimum 16px base font size

### Performance
- **Event Delegation**: Efficient event handling for dynamic content
- **Lazy Loading**: Images and content loaded as needed
- **Minimal Reflows**: Optimized DOM manipulation
- **CSS Optimization**: Reduced specificity and efficient selectors

## 🔄 Future Enhancements

### API Integration
The codebase is structured for easy API integration:

```javascript
// Replace mock functions in mock-data.js with real API calls
export async function fetchMarkets(category = null) {
  const response = await fetch(`/api/markets?category=${category}`);
  return response.json();
}
```

### Potential Features
- **Real-time Updates**: WebSocket integration for live prices
- **User Registration**: Full authentication system
- **Payment Integration**: Real payment processing
- **Advanced Analytics**: Charts and market analysis
- **Mobile App**: PWA or native mobile application
- **Social Features**: Market comments and social trading

### Scalability Considerations
- **State Management**: Consider Redux or similar for complex state
- **Routing**: Add client-side routing for multi-page feel
- **Testing**: Unit and integration test suites
- **Build Process**: Webpack or similar for optimization
- **Database**: Backend API with proper data persistence

## 🛠️ Development

### Code Style
- **ES6+ Features**: Modules, arrow functions, async/await
- **Consistent Naming**: camelCase for JS, kebab-case for CSS
- **Documentation**: JSDoc comments for all functions
- **Error Handling**: Comprehensive try/catch blocks

### CSS Methodology
- **BEM Naming**: Block__element--modifier structure
- **Component Scoping**: Each component has dedicated CSS
- **Custom Properties**: CSS variables for theming
- **Mobile-First**: Progressive enhancement approach

### JavaScript Architecture
- **Module Pattern**: Each file exports a single responsibility
- **Singleton Components**: Shared instances for managers
- **Event-Driven**: Loose coupling through custom events
- **Async Patterns**: Proper async/await usage

## 🐛 Troubleshooting

### Common Issues

**Markets not loading**
- Ensure you're running a local web server (not opening HTML directly)
- Check browser console for ES6 module errors
- Verify browser supports ES6 modules

**Authentication not working**
- Any username/password combination works in demo mode
- Check if localStorage is enabled in your browser
- Clear localStorage if experiencing session issues

**Styling issues**
- Ensure CSS files are loading correctly
- Check for conflicting browser extensions
- Verify browser supports CSS custom properties

### Browser Support
- **Chrome**: 80+ (ES6 modules, CSS custom properties)
- **Firefox**: 75+ (ES6 modules, CSS Grid)
- **Safari**: 13+ (ES6 modules, CSS custom properties)
- **Edge**: 80+ (Chromium-based Edge)

### Performance Tips
- Use browser dev tools to monitor network requests
- Check console for JavaScript errors
- Monitor memory usage during extended use

## 📄 License

This project is created for demonstration purposes. See LICENSE file for details.

## 🤝 Contributing

This is a demo project, but contributions for improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Maintain accessibility standards
- Follow existing code style
- Add JSDoc comments for new functions
- Test across multiple browsers
- Ensure responsive design works on all devices

---

**Built with ❤️ for the Pokemon TCG community**