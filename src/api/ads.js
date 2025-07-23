/**
 * CoinPlex Ads API Module
 * 
 * Handles advertisement-related operations and promotional content.
 */

class AdsAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get advertisement list for a specific position
   * 
   * @param {string} positionKey - Advertisement position key
   * @returns {Promise<Array>} Array of advertisements
   * @example
   * const ads = await client.ads.getList('NODE_CPLX_OPEN');
   * console.log(`Found ${ads.length} advertisements`);
   */
  async getList(positionKey) {
    const response = await this.client.request('/api/ads/list', { positionKey });
    return response.data || [];
  }

  /**
   * Get CPLX node opening advertisements
   * 
   * @returns {Promise<Array>} CPLX node advertisements
   */
  async getCPLXNodeAds() {
    return await this.getList('NODE_CPLX_OPEN');
  }

  /**
   * Get advertisements for all known positions
   * 
   * @param {Array<string>} [positions] - Array of position keys to fetch
   * @returns {Promise<Object>} Object with position keys as keys and ad arrays as values
   */
  async getAllAds(positions = ['NODE_CPLX_OPEN']) {
    const allAds = {};
    
    for (const position of positions) {
      try {
        const ads = await this.getList(position);
        allAds[position] = ads;
      } catch (error) {
        console.log(`Could not fetch ads for position ${position}:`, error.message);
        allAds[position] = [];
      }
    }
    
    return allAds;
  }

  /**
   * Check if advertisements are available for a position
   * 
   * @param {string} positionKey - Advertisement position key
   * @returns {Promise<boolean>} True if ads are available
   */
  async hasAds(positionKey) {
    try {
      const ads = await this.getList(positionKey);
      return Array.isArray(ads) && ads.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get advertisement statistics
   * 
   * @param {Array<string>} [positions] - Positions to check
   * @returns {Promise<Object>} Advertisement statistics
   */
  async getAdStats(positions = ['NODE_CPLX_OPEN']) {
    const stats = {
      totalPositions: positions.length,
      activePositions: 0,
      totalAds: 0,
      positions: {}
    };
    
    for (const position of positions) {
      try {
        const ads = await this.getList(position);
        const adCount = Array.isArray(ads) ? ads.length : 0;
        
        stats.positions[position] = {
          hasAds: adCount > 0,
          count: adCount,
          ads: ads
        };
        
        stats.totalAds += adCount;
        
        if (adCount > 0) {
          stats.activePositions++;
        }
        
      } catch (error) {
        stats.positions[position] = {
          hasAds: false,
          count: 0,
          error: error.message,
          ads: []
        };
      }
    }
    
    stats.activeRate = stats.totalPositions > 0 ? 
      (stats.activePositions / stats.totalPositions) * 100 : 0;
    
    return stats;
  }

  /**
   * Monitor advertisement changes over time
   * 
   * @param {string} positionKey - Position to monitor
   * @param {number} [intervalMinutes=30] - Check interval in minutes
   * @param {Function} [onChange] - Callback when ads change
   * @returns {Object} Monitor control object
   */
  monitorAds(positionKey, intervalMinutes = 30, onChange) {
    let isMonitoring = true;
    let lastAdsHash = null;
    
    const monitor = {
      stop: () => {
        isMonitoring = false;
        console.log(`Stopped monitoring ads for position: ${positionKey}`);
      },
      isRunning: () => isMonitoring
    };
    
    // Start monitoring loop
    (async () => {
      while (isMonitoring) {
        try {
          const ads = await this.getList(positionKey);
          const currentHash = this._hashAds(ads);
          
          if (lastAdsHash && lastAdsHash !== currentHash) {
            console.log(`Advertisement change detected for position: ${positionKey}`);
            
            if (onChange) {
              onChange({
                position: positionKey,
                ads,
                timestamp: new Date().toISOString(),
                previousHash: lastAdsHash,
                currentHash
              });
            }
          }
          
          lastAdsHash = currentHash;
          
          // Wait for next check
          if (isMonitoring) {
            await this._delay(intervalMinutes * 60 * 1000);
          }
          
        } catch (error) {
          console.log(`Error monitoring ads for position ${positionKey}:`, error.message);
          
          // Wait before retrying
          if (isMonitoring) {
            await this._delay(60000); // 1 minute retry delay
          }
        }
      }
    })();
    
    return monitor;
  }

  /**
   * Create a simple hash of ads array for change detection
   * 
   * @private
   * @param {Array} ads - Ads array to hash
   * @returns {string} Simple hash string
   */
  _hashAds(ads) {
    if (!Array.isArray(ads)) return 'no-ads';
    
    return ads.length.toString() + '-' + 
           JSON.stringify(ads).length.toString() + '-' +
           Date.now();
  }

  /**
   * Delay helper for monitoring
   * 
   * @private
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AdsAPI;