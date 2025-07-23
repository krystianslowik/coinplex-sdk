# CoinPlex SDK

Official JavaScript SDK for CoinPlex API - Build applications on top of the CoinPlex platform with automatic encryption/decryption, authentication, and comprehensive API coverage.

## Features

- 🔐 **Automatic Encryption/Decryption**: Built-in RSA and AES handling for encrypted API responses
- 🔑 **HMAC-SHA256 Authentication**: Secure request signing with automatic token management
- 📊 **Complete API Coverage**: Access to all CoinPlex APIs (Wallet, Financial, User, Income, Quantify, Ads)
- 🤖 **Automation Support**: Built-in daily executor for scheduled quantify operations
- 📈 **Comprehensive Analytics**: Income tracking, team performance, and financial analytics
- 🛡️ **Error Handling**: Automatic retries, response validation, and structured error handling

## Quick Start

### 1. Installation

```bash
npm install coinplex-sdk
```

### 2. Configuration

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your CoinPlex credentials:

```bash
COINPLEX_API_KEY=your-api-key-here
COINPLEX_API_SECRET=your-api-secret-here
COINPLEX_PREFIX=your-country-code
COINPLEX_ACCOUNT=your-phone-number
COINPLEX_CODE=your-authentication-code
```

### 3. Basic Usage

```javascript
// Load environment variables
require('dotenv').config();

const CoinPlex = require('coinplex-sdk');

async function main() {
  // Initialize client with environment config
  const client = new CoinPlex(CoinPlex.loadConfig());
  
  // Authenticate
  await client.authenticate();
  
  // Get wallet overview
  const wallet = await client.wallet.getOverview();
  console.log(`Total Balance: ${wallet.totalBalance} USDT`);
  
  // Get user profile
  const profile = await client.user.getProfile();
  console.log(`User: ${profile.nickname} (Level: ${profile.levelName})`);
  
  // Execute quantify operation
  const quantify = await client.quantify.execute();
  console.log('Quantify executed successfully');
}

main().catch(console.error);
```

## API Documentation

### Core APIs

- **WalletAPI**: Asset overview, transaction history, balance management
- **FinancialAPI**: Investment products, financial operations
- **UserAPI**: Profile management, security settings, team information
- **IncomeAPI**: Income tracking, analytics, team performance
- **QuantifyAPI**: Automated trading operations
- **AdsAPI**: Advertisement management

### Authentication

All API calls require authentication. The SDK handles:
- Phone-based login with prefix/account/code
- JWT token management and refresh
- HMAC-SHA256 request signing
- Automatic response decryption

## Examples

### Daily Automation

```javascript
const client = new CoinPlex(CoinPlex.loadConfig());
await client.authenticate();

// Create daily executor
const executor = client.createDailyExecutor({
  iterations: 10,
  intervalMinutes: 30,
  logLevel: 'info'
});

// Start automated quantify operations
await executor.start();
```

### Income Analytics

```javascript
// Get comprehensive income analytics
const analytics = await client.income.getIncomeAnalytics();
console.log('Team Performance:', analytics.team);
console.log('Personal Income:', analytics.personal);

// Get income trends
const trends = await client.income.getIncomeTrends([7, 30]);
console.log('7-day income:', trends['7d']);
console.log('30-day income:', trends['30d']);
```

### Investment Products

```javascript
// Get all available products
const products = await client.financial.getAllProducts();

// Get best products by return rate
const bestProducts = await client.financial.getBestProducts(1000);

// Check investment eligibility
const eligible = await client.financial.checkInvestmentEligibility(1);
```

## Testing

The SDK includes comprehensive tests covering all 37 API functions:

```bash
# Run comprehensive test suite
node comprehensive-test.js

# Run quick smoke test
node test-quick.js

# Run Jest unit tests
npm test

# Run with coverage
npm run test:coverage
```

## Documentation

- [API Reference](docs/API_REFERENCE.md) - Complete API documentation with examples
- [Test Guide](tests/README.md) - Testing setup and troubleshooting

## Project Structure

```
coinplex-sdk/
├── src/
│   ├── api/           # API modules (wallet, financial, user, etc.)
│   ├── core/          # Core functionality (auth, encryption, client)
│   ├── automation/    # Daily executor and scheduling
│   └── utils/         # Configuration, logging, constants
├── examples/          # Usage examples
├── tests/            # Test suite and utilities
├── docs/             # API documentation
└── README.md
```

## Security

- All sensitive data is managed through environment variables
- API keys and credentials are never hardcoded
- HMAC-SHA256 request signing prevents tampering
- Automatic encryption/decryption for sensitive responses

## Requirements

- Node.js 14.0.0 or higher
- Valid CoinPlex API credentials

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- [GitHub Issues](https://github.com/krystianslowik/coinplex-sdk/issues)
- [API Documentation](docs/API_REFERENCE.md)

---

*Built with security and reliability in mind for the CoinPlex ecosystem.*