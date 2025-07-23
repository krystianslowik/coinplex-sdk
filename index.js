/**
 * CoinPlex SDK - Main Entry Point
 * 
 * Official JavaScript SDK for interacting with the CoinPlex platform.
 * Provides a comprehensive, easy-to-use interface for all CoinPlex APIs.
 * 
 * @version 1.0.0
 * @author krystianslowik
 */

// Core SDK components
const CoinPlexClient = require('./src/core/CoinPlexClient');
const AuthenticationManager = require('./src/core/authentication');
const { calculateSignature, prepareSignedPayload, verifySignature } = require('./src/core/signature');
const { 
  decryptRSAResponse, 
  decryptAESString, 
  encryptAESString, 
  processApiResponse,
  DECRYPTION_CONFIG 
} = require('./src/core/decryption');

// API Modules
const WalletAPI = require('./src/api/wallet');
const FinancialAPI = require('./src/api/financial');
const UserAPI = require('./src/api/user');
const IncomeAPI = require('./src/api/income');
const QuantifyAPI = require('./src/api/quantify');
const AdsAPI = require('./src/api/ads');

// Automation
const DailyExecutor = require('./src/automation/DailyExecutor');

// Utilities
const { createLogger, createFileLogger, getDailyLogFilename } = require('./src/utils/logger');
const { loadConfig, createSampleConfig, validateConfig } = require('./src/utils/config');
const { 
  ENDPOINTS, 
  API_CONFIG, 
  ENCRYPTION, 
  STATUS_CODES, 
  COINS, 
  USER_LEVELS,
  TRANSACTION_TYPES,
  SDK_INFO 
} = require('./src/utils/constants');

/**
 * Main CoinPlex SDK Class
 * 
 * @example
 * const CoinPlex = require('coinplex-sdk');
 * 
 * const client = new CoinPlex({
 *   apiKey: 'your-api-key',
 *   apiSecret: 'your-secret',
 *   credentials: {
 *     prefix: '49',
 *     account: 'your-account',
 *     code: 'your-code'
 *   }
 * });
 * 
 * await client.authenticate();
 * const balance = await client.wallet.getOverview();
 */
class CoinPlex extends CoinPlexClient {
  constructor(config) {
    super(config);
  }

  /**
   * Create a daily executor for automated quantify operations
   * 
   * @param {Object} [options={}] - Executor options
   * @returns {DailyExecutor} Daily executor instance
   */
  createDailyExecutor(options = {}) {
    return new DailyExecutor(this, options);
  }

  /**
   * Get SDK version information
   * 
   * @returns {Object} SDK version and info
   */
  static getVersion() {
    return {
      name: SDK_INFO.NAME,
      version: SDK_INFO.VERSION,
      description: SDK_INFO.DESCRIPTION,
      author: SDK_INFO.AUTHOR
    };
  }

  /**
   * Create a logger instance
   * 
   * @param {string} [name='CoinPlex'] - Logger name
   * @param {string} [level='info'] - Log level
   * @param {Object} [options={}] - Logger options
   * @returns {Object} Logger instance
   */
  static createLogger(name, level, options) {
    return createLogger(name, level, options);
  }

  /**
   * Load configuration from file or environment
   * 
   * @param {Object} [options={}] - Configuration options
   * @returns {Object} Loaded configuration
   */
  static loadConfig(options) {
    return loadConfig(options);
  }

  /**
   * Create a sample configuration file
   * 
   * @param {string} filePath - Path where to create the config file
   * @param {Object} [customConfig={}] - Custom configuration values
   */
  static createSampleConfig(filePath, customConfig) {
    return createSampleConfig(filePath, customConfig);
  }

  /**
   * Validate configuration object
   * 
   * @param {Object} config - Configuration to validate
   * @throws {Error} If configuration is invalid
   */
  static validateConfig(config) {
    return validateConfig(config);
  }
}

// Export the main class as default
module.exports = CoinPlex;

// Named exports for advanced usage
module.exports.CoinPlexClient = CoinPlexClient;
module.exports.AuthenticationManager = AuthenticationManager;
module.exports.DailyExecutor = DailyExecutor;

// API Modules
module.exports.WalletAPI = WalletAPI;
module.exports.FinancialAPI = FinancialAPI;
module.exports.UserAPI = UserAPI;
module.exports.IncomeAPI = IncomeAPI;
module.exports.QuantifyAPI = QuantifyAPI;
module.exports.AdsAPI = AdsAPI;

// Utilities
module.exports.utils = {
  signature: { calculateSignature, prepareSignedPayload, verifySignature },
  decryption: { decryptRSAResponse, decryptAESString, encryptAESString, processApiResponse },
  logger: { createLogger, createFileLogger, getDailyLogFilename },
  config: { loadConfig, createSampleConfig, validateConfig },
  constants: { ENDPOINTS, API_CONFIG, ENCRYPTION, STATUS_CODES, COINS, USER_LEVELS, TRANSACTION_TYPES }
};

// Version information
module.exports.version = SDK_INFO.VERSION;
module.exports.name = SDK_INFO.NAME;