/**
 * CoinPlex SDK - Main Client Class
 * 
 * The primary interface for interacting with the CoinPlex API platform.
 * Provides a clean, organized way to access all CoinPlex services.
 */

const https = require('https');
const AuthenticationManager = require('./authentication');
const { prepareSignedPayload } = require('./signature');
const { processApiResponse } = require('./decryption');

// Import API modules
const WalletAPI = require('../api/wallet');
const FinancialAPI = require('../api/financial');
const UserAPI = require('../api/user');
const IncomeAPI = require('../api/income');
const QuantifyAPI = require('../api/quantify');
const AdsAPI = require('../api/ads');

/**
 * Main CoinPlex SDK Client
 */
class CoinPlexClient {
  /**
   * Initialize the CoinPlex client
   * 
   * @param {Object} config - Configuration object
   * @param {string} config.apiKey - CoinPlex API key
   * @param {string} config.apiSecret - CoinPlex API secret
   * @param {Object} config.credentials - Login credentials
   * @param {string} config.credentials.prefix - Phone prefix
   * @param {string} config.credentials.account - Account identifier
   * @param {string} config.credentials.code - Authentication code
   * @param {string} [config.baseUrl='api.coinplex.online'] - API base URL
   * @param {boolean} [config.autoRetry=true] - Auto-retry failed requests
   * @param {number} [config.timeout=30000] - Request timeout in milliseconds
   */
  constructor(config) {
    // Validate required configuration
    this._validateConfig(config);
    
    this.config = {
      baseUrl: 'api.coinplex.online',
      autoRetry: true,
      timeout: 30000,
      ...config
    };
    
    // Initialize authentication manager
    this.auth = new AuthenticationManager(this.config);
    
    // Initialize API modules
    this.wallet = new WalletAPI(this);
    this.financial = new FinancialAPI(this);
    this.user = new UserAPI(this);
    this.income = new IncomeAPI(this);
    this.quantify = new QuantifyAPI(this);
    this.ads = new AdsAPI(this);
    
    // Track request statistics
    this.stats = {
      requests: 0,
      successful: 0,
      failed: 0,
      encrypted: 0
    };
  }

  /**
   * Authenticate with the CoinPlex API
   * This must be called before making any API requests
   * 
   * @returns {Promise<boolean>} True if authentication successful
   */
  async authenticate() {
    const token = await this.auth.authenticate();
    return !!token;
  }

  /**
   * Check if client is authenticated
   * 
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return this.auth.isTokenValid();
  }

  /**
   * Get current authentication token
   * 
   * @returns {string|null} JWT token or null if not authenticated
   */
  getToken() {
    return this.auth.getToken();
  }

  /**
   * Logout and clear authentication
   */
  logout() {
    this.auth.logout();
  }

  /**
   * Make authenticated API request
   * 
   * @param {string} endpoint - API endpoint path
   * @param {Object} [params={}] - Request parameters
   * @param {Object} [options={}] - Request options
   * @returns {Promise<Object>} API response
   */
  async request(endpoint, params = {}, options = {}) {
    // Check authentication
    if (!this.isAuthenticated()) {
      throw new Error('Client not authenticated. Call authenticate() first.');
    }
    
    // Prepare signed payload
    const payload = prepareSignedPayload(
      params,
      this.config.apiKey,
      this.config.apiSecret
    );
    
    // Make request with retry logic
    let attempts = 0;
    const maxAttempts = this.config.autoRetry ? 3 : 1;
    
    while (attempts < maxAttempts) {
      try {
        this.stats.requests++;
        const response = await this._makeHttpRequest(endpoint, payload, options);
        
        // Update statistics
        if (response.statusCode >= 200 && response.statusCode < 300) {
          this.stats.successful++;
        } else {
          this.stats.failed++;
        }
        
        if (response._decryptionMethod) {
          this.stats.encrypted++;
        }
        
        return response;
        
      } catch (error) {
        attempts++;
        this.stats.failed++;
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Wait before retry
        await this._delay(1000 * attempts);
      }
    }
  }

  /**
   * Get client statistics
   * 
   * @returns {Object} Request statistics
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset client statistics
   */
  resetStats() {
    this.stats = {
      requests: 0,
      successful: 0,
      failed: 0,
      encrypted: 0
    };
  }

  /**
   * Validate configuration object
   * 
   * @private
   * @param {Object} config - Configuration to validate
   */
  _validateConfig(config) {
    if (!config) {
      throw new Error('Configuration object is required');
    }
    
    const required = ['apiKey', 'apiSecret', 'credentials'];
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required configuration: ${field}`);
      }
    }
    
    const credentialFields = ['prefix', 'account', 'code'];
    for (const field of credentialFields) {
      if (!config.credentials[field]) {
        throw new Error(`Missing required credential: ${field}`);
      }
    }
  }

  /**
   * Make HTTP request to CoinPlex API
   * 
   * @private
   * @param {string} endpoint - API endpoint
   * @param {Object} payload - Request payload
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response object
   */
  _makeHttpRequest(endpoint, payload, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        hostname: this.config.baseUrl,
        port: 443,
        path: endpoint,
        method: 'POST',
        timeout: options.timeout || this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://coinplex.online',
          'Referer': 'https://coinplex.online/',
          'Lang': 'en_US',
          'System': 'android',
          'User-Agent': 'Mozilla/5.0 (compatible; CoinPlexSDK/1.0)',
          'DNT': '1',
          'Priority': 'u=1, i',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          ...options.headers
        }
      };
      
      // Add authentication token
      const token = this.getToken();
      if (token) {
        requestOptions.headers['Token'] = token;
      }

      const req = https.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            const decryptedResponse = processApiResponse(responseData);
            
            resolve({ 
              statusCode: res.statusCode,
              headers: res.headers,
              data: decryptedResponse.data,
              _originalData: responseData,
              _decryptionMethod: decryptedResponse._decryptionMethod
            });
          } catch (error) {
            resolve({ 
              statusCode: res.statusCode,
              headers: res.headers,
              data: data,
              error: error.message
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${requestOptions.timeout}ms`));
      });
      
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  /**
   * Delay helper for retry logic
   * 
   * @private
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = CoinPlexClient;