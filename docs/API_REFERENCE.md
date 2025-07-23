# CoinPlex SDK API Reference

Complete API reference for the CoinPlex SDK with detailed endpoint documentation, request/response structures, and real examples.

## Table of Contents

- [Authentication](#authentication)
- [WalletAPI](#walletapi)
- [FinancialAPI](#financialapi)
- [UserAPI](#userapi)
- [IncomeAPI](#incomeapi)
- [QuantifyAPI](#quantifyapi)
- [AdsAPI](#adsapi)
- [Error Handling](#error-handling)
- [Data Models](#data-models)

## Authentication

All API endpoints require authentication using:
- **JWT Token**: Obtained through phone-based login
- **HMAC-SHA256 Signature**: Request payload signed with API secret
- **API Key**: Included in request payload

### Authentication Flow

1. **Login Request**: Submit phone prefix, account, and code
2. **Token Receipt**: Receive JWT token for subsequent requests
3. **Request Signing**: Sign all requests with HMAC-SHA256
4. **Token Header**: Include JWT token in `Token` header

### Configuration Setup

Before using the SDK, set up your environment variables in a `.env` file:

```bash
COINPLEX_API_KEY=your-api-key-here
COINPLEX_API_SECRET=your-api-secret-here
COINPLEX_PREFIX=your-country-code
COINPLEX_ACCOUNT=your-phone-number
COINPLEX_CODE=your-authentication-code
```

Load configuration in your application:
```javascript
require('dotenv').config();
const config = CoinPlex.loadConfig();
const client = new CoinPlex(config);
```

### Required Headers

```json
{
  "Content-Type": "application/json",
  "Accept": "*/*",
  "Token": "your-jwt-token",
  "Lang": "en_US",
  "System": "android"
}
```

### Request Signing

All requests must include these parameters:
- `apiKey`: Your API key
- `timestamp`: Current timestamp in milliseconds
- `sign`: HMAC-SHA256 signature of sorted parameters

## WalletAPI

Manages user wallet operations, balances, and transaction history.

### Get Wallet Overview

**Endpoint**: `POST /api/wallet/overview`

**Description**: Retrieves complete wallet asset overview with all coin balances.

**Parameters**: None

**Response Structure**:
```json
{
  "totalAmount": "1000.50",        // Total portfolio value in USDT
  "totalBalance": "1000.50",       // Total balance across all coins
  "totalFrozen": "0",                   // Total frozen/locked amount
  "totalFlexibleAmount": "0.00002392",  // Available for trading/withdrawal
  "totalPendingAmount": "100.25", // Pending/locked in operations
  "list": [                             // Array of coin details
    {
      "coinId": 1,
      "coinFullName": "Tether USDT",
      "coinName": "USDT",
      "coinIcon": "https://...",
      "coinPrice": "1",
      "total": "1000.50",
      "balance": "1000.50",
      "frozen": "0",
      "totalAmount": "1000.50",
      "balanceAmount": "1000.50",
      "frozenAmount": "0",
      "hasOpen": true,
      "flexibleAmount": "0.00002392",
      "pendingAmount": "100.25"
    }
  ],
  "experienceGoldAmount": "0"           // Experience/bonus credits
}
```

**SDK Method**: `client.wallet.getOverview()`

### Get Transaction Records

**Endpoint**: `POST /api/wallet/records`

**Description**: Retrieves paginated transaction history.

**Parameters**:
```json
{
  "page": 1,        // Page number (optional, default: 1)
  "limit": 10,      // Records per page (optional, default: 10)
  "coinId": 1       // Filter by coin ID (optional)
}
```

**Response Structure**:
```json
{
  "list": [
    {
      "id": 39866376,
      "coinId": 1,
      "coinName": "USDT",
      "amount": "0.93180014",
      "typeCode": 10002,
      "type": "Quantify income",
      "typeIcon": "",
      "statusCode": 1,
      "status": "completed",
      "date": "07/23/2025 15:30:50",
      "dataSn": "SR202507231530451038LZL9LHDEEA"
    }
  ],
  "page": {
    "index": 1,
    "pageSize": 10,
    "count": 25,
    "totalPage": 3
  },
  "yearMonth": "202507"
}
```

**Transaction Type Codes**:
- `101`: Quantify payment (debit)
- `102`: Quantify capital return (credit)
- `10002`: Quantify income (credit)

**SDK Method**: `client.wallet.getRecords(options)`

### Get Recent Records

**Endpoint**: Same as records but filtered to last 30 days

**Description**: Retrieves recent transaction records (last 30 days).

**Parameters**:
```json
{
  "limit": 5    // Number of recent records (optional, default: 10)
}
```

**Response Structure**: Array of transaction objects (same structure as records list)

**SDK Method**: `client.wallet.getRecentRecords(limit)`

### Get Coin Balance

**Endpoint**: Same as overview but filtered

**Description**: Retrieves balance information for a specific coin.

**Parameters**: Coin name ('USDT', 'CPLX', etc.)

**Response Structure**: Single coin object from overview list

**SDK Methods**:
- `client.wallet.getCoinBalance(coinName)`
- `client.wallet.getTotalValue()` - Returns total portfolio value
- `client.wallet.getFlexibleBalance()` - Returns available balance
- `client.wallet.getPendingBalance()` - Returns locked balance
- `client.wallet.hasSufficientBalance(amount, coinName)` - Checks balance

## FinancialAPI

Manages investment products and financial operations.

### Get Financial View

**Endpoint**: `POST /api/financial/view`

**Description**: Retrieves financial overview and available products.

**Parameters**: None

**Response Structure** (RSA Encrypted):
```json
{
  "totalAmount": "0",           // Total investment amount
  "todayAmount": "0",          // Today's investment activity  
  "balance": "1000.50",   // Available balance for investment
  "orderAmount": "0",          // Current order amount
  "canRedeemAmount": "0",      // Amount available for redemption
  "myList": []                 // User's investment products
}
```

**SDK Method**: `client.financial.getView()`

### Get All Products

**Endpoint**: `POST /api/financial/products`

**Description**: Retrieves all available financial investment products.

**Parameters**:
```json
{
  "productIds": [1, 2, 3]    // Array of product IDs (optional)
}
```

**Response Structure**:
```json
[
  {
    "productId": 1,
    "name": "Zone 1",
    "introduce": "",
    "img": "https://...",
    "daysMin": 7,                    // Minimum investment period
    "daysMax": 8,                    // Maximum investment period
    "incomeRateMin": "0.01",         // Minimum return rate (1%)
    "incomeRateMax": "0.010",        // Maximum return rate (1.4%)
    "incomeCoinId": 5,
    "incomeCoinName": "CPLX",        // Return coin type
    "incomeCoinIcon": "https://...",
    "incomeCoinPrice": "1.10368",
    "min": "200",                    // Minimum investment amount
    "max": "5000",                   // Maximum investment amount
    "limitLevelMin": 2,              // Minimum user level required
    "limitLevelMinName": "G1",
    "limitLevelMax": 7,
    "limitLevelMaxName": "G6",
    "hasBuyToLevelLimit": true,
    "hasBuyToTime": true,
    "hasBuy": true,                  // User can purchase
    "userBalance": "1000.50",   // User's available balance
    "userLevel": 2,                  // User's current level
    "buyAmount": "2000",          // Total purchased by users
    "buyCount": 7296,                // Number of purchases
    "userOrderAmount": "0",          // User's current orders
    "oneGenCountLimit": 0,
    "twoThreeGenCountLimit": 0,
    "userOneGenCount": 1,
    "userTwoThreeGenCount": 0,
    "targetBuyAmount": "0",
    "useBuyAmount": "0",
    "canUseCardCount": 0
  }
]
```

**Investment Zones Available**:
- **Zone 1**: 7-8 days, 1.0-1.4% return, 200-5000 USDT
- **Zone 2**: 30-50 days, 1.4-1.8% return, 200-10000 USDT  
- **Zone 3**: 60-80 days, 1.8-2.2% return, 200-20000 USDT
- **Zone 4**: 90-110 days, 2.2-2.6% return, 200-30000 USDT
- **Zone 5**: 120-150 days, 2.6-3.0% return, 200-50000 USDT
- **Zone 6**: 180-360 days, 3.0-3.5% return, 200-100000 USDT

**SDK Methods**:
- `client.financial.getAllProducts(productIds)`
- `client.financial.getProductDetail(productId)`
- `client.financial.getBestProducts(minAmount)` - Returns products sorted by return rate
- `client.financial.checkInvestmentEligibility(productId)`
- `client.financial.getInvestmentCapacity(productId)`

## UserAPI

Manages user profile, security settings, and account information.

### Get User Profile

**Endpoint**: `POST /api/user/profile`

**Description**: Retrieves comprehensive user profile information.

**Parameters**: None

**Response Structure**:
```json
{
  "userId": 12345,
  "nickname": "user_phone_number",
  "c2cNickname": "",
  "avatar": "https://...",
  "gender": 0,                           // 0: not set, 1: male, 2: female
  "birth": "",
  "hasSetPassword": true,
  "hasBindGoogleAuth": false,
  "hasOpenGoogleAuth": false,
  "inviteCode": "ABC123",               // User's referral code
  "registerTime": "01/01/2024 10:00:00",
  "identityStatus": -2,                 // KYC verification status
  "unreadCount": 0,                     // Unread notifications
  "level": 2,                           // User level (1-7)
  "levelName": "G1",                    // Level name
  "totalBalance": "1000.50",       // Total portfolio balance
  "totalRecharge": "258.198542",        // Total deposits
  "totalWithdraw": "1700",              // Total withdrawals
  "totalIncome": "1649.45898206",       // Total earnings
  "startInfoStatusStr": "true",
  "startMonthAddPercentOpen": true,
  "startLevel": 0,
  "twoThreeAddTeamCount": 0,           // Level 2-3 team members
  "oneAddTeamCount": 1,                // Level 1 team members  
  "teamActivityGrowthPercent": "0",
  "teamActivityGrowthPercentBoolean": false,
  "defaultMonthlyPayment": "0",
  "teamCount": 1,                      // Total team size
  "effectiveCount": 1,                 // Active team members
  "mobilePrefix": "49",                // Phone country prefix
  "mobile": "1234567890",              // Phone number
  "email": "example@gmail.com",
  "flexibleAmount": "0.00002392",      // Available balance
  "pendingAmount": "100.25",     // Locked balance
  "experienceGoldAmount": "0",         // Bonus credits
  "chatCount": 10,                     // AI chat credits
  "useChatCount": 0,                   // Used chat credits
  "hasShowAI": true                    // AI features enabled
}
```

**User Levels**:
- **Level 1**: New user
- **Level 2 (G1)**: Basic verified user  
- **Level 3 (G2)**: Advanced user
- **Level 4 (G3)**: Premium user
- **Level 5 (G4)**: VIP user
- **Level 6 (G5)**: Elite user
- **Level 7 (G6)**: Master user

**SDK Methods**:
- `client.user.getProfile()`
- `client.user.getLevel()` - Returns level info and requirements
- `client.user.getFinancialSummary()` - Returns financial overview
- `client.user.getTeamInfo()` - Returns team statistics
- `client.user.getSecuritySettings()` - Returns security settings
- `client.user.getInviteInfo()` - Returns referral information
- `client.user.getChatInfo()` - Returns AI chat information
- `client.user.checkLevelRequirements(targetLevel)` - Checks upgrade eligibility
- `client.user.getActivitySummary()` - Returns comprehensive activity data

## IncomeAPI

Manages income tracking, team earnings, and analytics.

### Get Team Data

**Endpoint**: `POST /api/income/team/dataNew`

**Description**: Retrieves team income and statistics.

**Parameters**: None

**Response Structure**:
```json
{
  "newMemberCount": 0,              // New team members today
  "teamCount": 1,                   // Direct team members
  "teamTotalCount": 1,              // Total team size
  "teamSumIncomeAmount": "59.52480386",     // Team's total income
  "incomeAmount": "0",              // Personal income today
  "todayTeamIncome": "0",           // Team income today
  "totalTeamIncome": "496.04004453", // Total team earnings
  "totalQuantifyAmount": "403.04004453",    // Team quantify earnings
  "rechargeAmount": "150",          // Team recharge amount
  "withdrawAmount": "250"           // Team withdrawal amount
}
```

**SDK Method**: `client.income.getTeamData()`

### Get Income Data

**Endpoint**: `POST /api/income/data`

**Description**: Retrieves personal income data for specified period.

**Parameters**:
```json
{
  "days": 7    // Number of days (1, 7, 30, etc.)
}
```

**Response Structure** (RSA Encrypted):
```json
{
  "taskIncome": "0",                // Task-based income
  "quantifyIncome": "5.59080085",   // Quantify trading income
  "recommendQuantifyIncome": "0"    // Referral quantify income
}
```

**SDK Methods**:
- `client.income.getIncomeData(days)`
- `client.income.getTodayIncome()` - Returns today's income (1 day)
- `client.income.getWeeklyIncome()` - Returns weekly income (7 days)
- `client.income.getMonthlyIncome()` - Returns monthly income (30 days)
- `client.income.getIncomeAnalytics()` - Returns comprehensive analytics
- `client.income.getIncomeTrends(periods)` - Returns trends over multiple periods
- `client.income.getIncomeGrowthRate(compareDays)` - Calculates growth rate
- `client.income.getTeamPerformance()` - Returns team performance metrics

## QuantifyAPI

Manages automated quantify trading operations.

### Execute Quantify

**Endpoint**: `POST /api/quantify/execute`

**Description**: Executes a quantify trading operation.

**Parameters**: None

**Response Structure**:
```json
{
  "hasTip": true,                   // Whether operation was available
  "expectedCompletionTime": "2025-07-23T16:00:00Z",  // Expected completion
  "message": "Quantify executed successfully"
}
```

**SDK Methods**:
- `client.quantify.execute(options)` - Execute single operation
- `client.quantify.executeWithRetry(maxRetries, delay)` - Execute with retry logic
- `client.quantify.getStatus()` - Check availability status
- `client.quantify.scheduleExecutions(schedule)` - Schedule repeated executions
- `client.quantify.getExecutionStats(results)` - Get execution statistics

## AdsAPI

Manages advertisement content and placements.

### Get Advertisement List

**Endpoint**: `POST /api/ads/list`

**Description**: Retrieves advertisements for specific positions.

**Parameters**:
```json
{
  "positionKey": "home"    // Position: 'home', 'wallet', 'financial'
}
```

**Response Structure**:
```json
[]    // Currently returns empty array (no ads active)
```

**Advertisement Positions**:
- `home`: Homepage advertisements
- `wallet`: Wallet page advertisements  
- `financial`: Financial products page advertisements
- `cplx_node`: CPLX node opening advertisements

**SDK Methods**:
- `client.ads.getList(positionKey)`
- `client.ads.getCPLXNodeAds()` - Get CPLX node ads
- `client.ads.getAllAds(positions)` - Get ads for multiple positions
- `client.ads.hasAds(positionKey)` - Check if ads exist
- `client.ads.getAdStats(positions)` - Get advertisement statistics
- `client.ads.monitorAds(positionKey, interval, callback)` - Monitor ad changes

## Error Handling

### Standard Error Response

```json
{
  "code": 1001,
  "message": "Invalid authentication token",
  "error": "UNAUTHORIZED",
  "data": null
}
```

### Common Error Codes

- `0`: Success
- `1001`: Authentication failed
- `1002`: Invalid signature
- `1003`: Missing required parameters
- `1004`: Insufficient balance
- `1005`: Operation not available
- `2001`: User not found
- `2002`: Invalid user level
- `3001`: Product not available
- `3002`: Investment limit exceeded

### SDK Error Handling

The SDK automatically handles:
- Request retries (up to 3 attempts)
- Authentication token refresh
- Response decryption
- Error code translation

## Data Models

### Common Field Types

- **Amount Fields**: String representation of decimal numbers (e.g., "1000.50")
- **Timestamps**: ISO 8601 format or localized strings
- **IDs**: Integer identifiers
- **Status Codes**: Integer codes with string descriptions
- **Percentages**: String representation of decimal (e.g., "0.010" = 1.4%)

### Encryption Status

**RSA Encrypted Endpoints**:
- `/api/income/data` - Income data responses
- `/api/financial/view` - Financial view data

**Plain Text Endpoints**:
- `/api/wallet/overview` - Wallet overview
- `/api/user/profile` - User profile
- `/api/income/team/dataNew` - Team data
- `/api/quantify/execute` - Quantify operations
- `/api/ads/list` - Advertisement lists

---

*This documentation is generated from comprehensive SDK testing and real API responses. All response examples are based on actual API data.*