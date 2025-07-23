/**
 * CoinPlex API Authentication Module
 * 
 * Handles user authentication, token management, and session lifecycle
 */

const https = require('https');
const { prepareSignedPayload } = require('./signature');
const { processApiResponse } = require('./decryption');

/**
 * Authentication manager for CoinPlex API
 */
class AuthenticationManager {
  constructor(config) {
    this.config = config;
    this.token = null;
    this.tokenExpiry = null;
    this.isAuthenticated = false;
  }

  /**
   * Authenticate with the CoinPlex API
   * 
   * @returns {Promise<string|null>} JWT token on success, null on failure
   */
  async authenticate() {
    console.log('🔐 Authenticating with CoinPlex API...');
    
    const loginData = {
      accountType: 0,
      prefix: this.config.credentials.prefix,
      account: this.config.credentials.account,
      code: this.config.credentials.code
    };
    
    const payload = prepareSignedPayload(
      loginData,
      this.config.apiKey,
      this.config.apiSecret
    );
    
    try {
      const response = await this._makeRequest('/api/user/login', payload);
      
      // Try to extract token from decrypted response
      const token = this._extractTokenFromResponse(response);
      
      if (token) {
        this.token = token;
        this.isAuthenticated = true;
        // JWT tokens typically have expiry info, but we'll set a reasonable default
        this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        console.log('✅ Authentication successful');
        return token;
      } else {
        console.log('❌ Failed to extract token from response');
        return null;
      }
      
    } catch (error) {
      console.log('❌ Authentication error:', error.message);
      return null;
    }
  }

  /**
   * Get current authentication token
   * 
   * @returns {string|null} Current JWT token or null if not authenticated
   */
  getToken() {
    if (!this.isAuthenticated || this._isTokenExpired()) {
      return null;
    }
    return this.token;
  }

  /**
   * Check if user is currently authenticated
   * 
   * @returns {boolean} True if authenticated and token is valid
   */
  isTokenValid() {
    return this.isAuthenticated && !this._isTokenExpired();
  }

  /**
   * Logout and clear authentication state
   */
  logout() {
    this.token = null;
    this.tokenExpiry = null;
    this.isAuthenticated = false;
    console.log('🔓 Logged out successfully');
  }

  /**
   * Extract JWT token from API response
   * 
   * @private
   * @param {Object} response - API response object
   * @returns {string|null} Extracted token or null
   */
  _extractTokenFromResponse(response) {
    // Check direct token access in decrypted data
    if (response.data && typeof response.data === 'object' && response.data.token) {
      return response.data.token;
    }
    
    // Check nested structure
    if (response.data && response.data.data && response.data.data.token) {
      return response.data.data.token;
    }
    
    // Try to find token in any nested structure
    const findToken = (obj) => {
      if (typeof obj !== 'object' || obj === null) return null;
      if (obj.token) return obj.token;
      for (const key in obj) {
        const result = findToken(obj[key]);
        if (result) return result;
      }
      return null;
    };
    
    if (response.data) {
      return findToken(response.data);
    }
    
    return null;
  }

  /**
   * Check if current token is expired
   * 
   * @private
   * @returns {boolean} True if token is expired
   */
  _isTokenExpired() {
    if (!this.tokenExpiry) return true;
    return new Date() >= this.tokenExpiry;
  }

  /**
   * Make HTTP request to CoinPlex API
   * 
   * @private
   * @param {string} endpoint - API endpoint path
   * @param {Object} payload - Request payload
   * @returns {Promise<Object>} API response
   */
  _makeRequest(endpoint, payload) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.baseUrl || 'api.coinplex.online',
        port: 443,
        path: endpoint,
        method: 'POST',
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
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site'
        }
      };

      const req = https.request(options, (res) => {
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
              data: data
            });
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(JSON.stringify(payload));
      req.end();
    });
  }
}

module.exports = AuthenticationManager;