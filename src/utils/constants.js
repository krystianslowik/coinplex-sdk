/**
 * CoinPlex SDK Constants
 * 
 * Contains all API endpoints, configuration constants,
 * and other static values used throughout the SDK.
 */

/**
 * API Endpoints
 */
const ENDPOINTS = {
  // Authentication
  LOGIN: '/api/user/login',
  
  // User Information
  USER_PROFILE: '/api/user/info/personal',
  
  // Wallet Operations
  WALLET_OVERVIEW: '/api/wallet/asset/overview',
  WALLET_RECORDS: '/api/v2/wallet/record',
  
  // Financial Products
  FINANCIAL_VIEW: '/api/financial/view',
  FINANCIAL_PRODUCT_DETAIL: '/api/financial/product/detail',
  
  // Income & Earnings
  INCOME_DATA: '/api/income/data',
  INCOME_TEAM_DATA: '/api/income/team/dataNew',
  
  // Quantify Operations
  QUANTIFY_EXECUTE: '/api/quantify/execute',
  
  // CPLX Token
  CPLX_BUY_STATUS: '/api/cplx/buy/isOpen',
  
  // Advertisements
  ADS_LIST: '/api/ads/list'
};

/**
 * API Configuration
 */
const API_CONFIG = {
  DEFAULT_BASE_URL: 'api.coinplex.online',
  DEFAULT_ORIGIN: 'https://coinplex.online',
  DEFAULT_REFERER: 'https://coinplex.online/',
  DEFAULT_TIMEOUT: 30000,
  DEFAULT_USER_AGENT: 'Mozilla/5.0 (compatible; CoinPlexSDK/1.0)',
  
  // Standard headers for all requests
  STANDARD_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Lang': 'en_US',
    'System': 'android',
    'DNT': '1',
    'Priority': 'u=1, i',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site'
  }
};

/**
 * Encryption Constants
 */
const ENCRYPTION = {
  // RSA key configuration
  RSA_KEY_SIZE: 1024,
  MAX_DECRYPT_BLOCK: 128,
  CHUNK_SIZE: 128,
  
  // AES configuration
  AES_KEY: '$mu%!242:=en',
  
  // RSA Private Key (extracted from frontend)
  RSA_PRIVATE_KEY: `-----BEGIN RSA PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAMnobdlsbevAtCpS
6GktlxN+Taoyb+3qDnDR60tjsw41KalL/NwgCqCB1NLPm6UWJlRn7GAmVh0GOFef
7NRs7yBtTgkaK7dbwalbmiaDS63sHgbaDLUpnYA4IhDouQLpzVScKZzM+uHFaLrV
dVx1MOH0sOyXMclFcC8V66BnIZblAgMBAAECgYBKY7plSw/MtnkqxtUeO0/YPMa8
mEyo6X1cj9sTMa5845Vv7LFDIQMJVAxnh1ofHuQMYSWz3ywHEY2cqy2EroYDUqMK
8iXuCxl2Diktd2nI9+5D+bOOlEshjqBEtcv0f+LVgOjNFbpxEx/s/YLGDt8cISyP
1q3srSUr21xoeQfHmQJBAPJcfKdAdvbg24K3uYiYRPLu4BOjS9yRxz4SKmUrgHM3
YtNN/sn7JMdAEyLPVf1D5BPqaJupXYey8EBz0Lv4S8MCQQDVRSlpeUazuJwQPGZQ
m4eouMoyfshG23EeLMms33uCh+R4kzRYSbDDMzwc7Vx6Hl2yiuuuCJYzvjXQ/bfn
jHA3AkBLUpMrJ83RTHDsX006Npi3J6ZcdBPPqT7S+7JRXwO8yynbohHdlEAJ7NAF
sYp3+/GWfvOj7S80TVh9r4Df6nshAkAQmlfE/EoCx8ZuhSU59UG0Yt5q2+/fhEnk
HXx91tAYs1eYA225ydLW/3AYmGnwn9iPg70hSU3YLWCnKnlcr1Q1AkEAsLjQenVE
G1JRISG0EWTnQBXsDg5ACqE2NCaeDXkLKj7LynBmj8ewoMS38cpQco9eDNnEFUSx
3na1KhTGVj3hag==
-----END RSA PRIVATE KEY-----`
};

/**
 * Response Status Codes
 */
const STATUS_CODES = {
  SUCCESS: 0,
  ERROR: 1,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  SERVER_ERROR: 500
};

/**
 * Coin Information
 */
const COINS = {
  USDT: {
    ID: 1,
    NAME: 'USDT',
    FULL_NAME: 'Tether USDT',
    DECIMALS: 8
  },
  CPLX: {
    ID: 5,
    NAME: 'CPLX',
    FULL_NAME: 'CPLX',
    DECIMALS: 8
  }
};

/**
 * User Levels
 */
const USER_LEVELS = {
  0: 'Unverified',
  1: 'G0',
  2: 'G1',
  3: 'G2',
  4: 'G3',
  5: 'G4',
  6: 'G5',
  7: 'G6'
};

/**
 * Transaction Types
 */
const TRANSACTION_TYPES = {
  101: 'Quantify payment',
  102: 'Quantify capital return',
  10002: 'Quantify income',
  201: 'Deposit',
  202: 'Withdrawal',
  301: 'Transfer in',
  302: 'Transfer out',
  401: 'Bonus',
  402: 'Commission'
};

/**
 * Advertisement Positions
 */
const AD_POSITIONS = {
  NODE_CPLX_OPEN: 'NODE_CPLX_OPEN',
  MAIN_BANNER: 'MAIN_BANNER',
  SIDEBAR: 'SIDEBAR'
};

/**
 * Automation Settings
 */
const AUTOMATION = {
  DEFAULT_ITERATIONS: 10,
  DEFAULT_INTERVAL_MINUTES: 5,
  MIN_INTERVAL_MINUTES: 1,
  MAX_INTERVAL_MINUTES: 60,
  MAX_ITERATIONS: 100,
  
  // Retry settings
  DEFAULT_MAX_RETRIES: 3,
  DEFAULT_RETRY_DELAY: 1000,
  EXPONENTIAL_BACKOFF: true
};

/**
 * Logging Configuration
 */
const LOGGING = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },
  
  DEFAULT_LEVEL: 'info',
  DEFAULT_LOG_DIR: './logs',
  
  // Log file naming
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  
  // Colors for console output
  COLORS: {
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    info: '\x1b[36m',    // Cyan
    debug: '\x1b[35m',   // Magenta
    reset: '\x1b[0m'     // Reset
  }
};

/**
 * Error Messages
 */
const ERROR_MESSAGES = {
  AUTHENTICATION_FAILED: 'Authentication failed - check your credentials',
  NETWORK_ERROR: 'Network error - check your connection',
  INVALID_RESPONSE: 'Invalid response from server',
  DECRYPTION_FAILED: 'Failed to decrypt response data',
  RATE_LIMITED: 'Rate limit exceeded - please wait before retrying',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this operation',
  INVALID_CONFIGURATION: 'Invalid configuration provided',
  TOKEN_EXPIRED: 'Authentication token has expired',
  API_ERROR: 'API request failed',
  TIMEOUT: 'Request timeout exceeded'
};

/**
 * Success Messages
 */
const SUCCESS_MESSAGES = {
  AUTHENTICATION_SUCCESS: 'Successfully authenticated',
  OPERATION_COMPLETE: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  EXECUTION_SUCCESS: 'Execution completed successfully'
};

/**
 * SDK Metadata
 */
const SDK_INFO = {
  NAME: 'CoinPlex SDK',
  VERSION: '1.0.0',
  AUTHOR: 'krystianslowik',
  DESCRIPTION: 'Official JavaScript SDK for CoinPlex API',
  HOMEPAGE: 'https://github.com/krystianslowik/coinplex-sdk',
  
  // User agent components
  USER_AGENT_BASE: 'CoinPlexSDK',
  USER_AGENT_VERSION: '1.0.0',
  
  // Supported Node.js versions
  MIN_NODE_VERSION: '14.0.0'
};

/**
 * Rate Limiting
 */
const RATE_LIMITS = {
  DEFAULT_REQUESTS_PER_MINUTE: 60,
  BURST_LIMIT: 10,
  COOLDOWN_PERIOD: 60000, // 1 minute
  
  // Endpoint-specific limits
  ENDPOINTS: {
    [ENDPOINTS.QUANTIFY_EXECUTE]: {
      requests: 12, // Every 5 minutes = 12 per hour
      window: 3600000 // 1 hour
    },
    [ENDPOINTS.LOGIN]: {
      requests: 5,
      window: 300000 // 5 minutes
    }
  }
};

module.exports = {
  ENDPOINTS,
  API_CONFIG,
  ENCRYPTION,
  STATUS_CODES,
  COINS,
  USER_LEVELS,
  TRANSACTION_TYPES,
  AD_POSITIONS,
  AUTOMATION,
  LOGGING,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SDK_INFO,
  RATE_LIMITS
};