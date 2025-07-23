/**
 * CoinPlex Financial API Module
 * 
 * Handles financial products, investment opportunities,
 * and financial data operations.
 */

class FinancialAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get general financial view/statistics
   * 
   * @returns {Promise<Object>} Financial overview data
   */
  async getView() {
    const response = await this.client.request('/api/financial/view');
    return response.data;
  }

  /**
   * Get detailed information about a financial product
   * 
   * @param {string|number} productId - Product ID to get details for
   * @returns {Promise<Object>} Product details
   * @example
   * const product = await client.financial.getProductDetail('6');
   * console.log(`Product: ${product.name}, Min: ${product.min}, Max: ${product.max}`);
   */
  async getProductDetail(productId) {
    const response = await this.client.request('/api/financial/product/detail', {
      productId: productId.toString()
    });
    return response.data;
  }

  /**
   * Get all available financial products
   * Note: This method attempts to fetch common product IDs
   * 
   * @param {Array<string>} [productIds=['1','2','3','4','5','6']] - Product IDs to fetch
   * @returns {Promise<Array>} Array of product details
   */
  async getAllProducts(productIds = ['1', '2', '3', '4', '5', '6']) {
    const products = [];
    
    for (const id of productIds) {
      try {
        const product = await this.getProductDetail(id);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        // Skip products that don't exist or cause errors
        console.log(`Could not fetch product ${id}:`, error.message);
      }
    }
    
    return products;
  }

  /**
   * Check if user can invest in a specific product
   * 
   * @param {string|number} productId - Product ID to check
   * @returns {Promise<Object>} Investment eligibility info
   */
  async checkInvestmentEligibility(productId) {
    const product = await this.getProductDetail(productId);
    
    if (!product) {
      return { canInvest: false, reason: 'Product not found' };
    }
    
    const eligibility = {
      canInvest: product.hasBuy === true,
      product: product,
      reasons: []
    };
    
    if (!product.hasBuy) {
      eligibility.reasons.push('Product not available for purchase');
    }
    
    if (product.hasBuyToLevelLimit && product.userLevel < product.limitLevelMin) {
      eligibility.canInvest = false;
      eligibility.reasons.push(`Minimum level required: ${product.limitLevelMinName}`);
    }
    
    if (product.hasBuyToLevelLimit && product.userLevel > product.limitLevelMax) {
      eligibility.canInvest = false;
      eligibility.reasons.push(`Maximum level exceeded: ${product.limitLevelMaxName}`);
    }
    
    const minAmount = parseFloat(product.min || '0');
    const userBalance = parseFloat(product.userBalance || '0');
    
    if (userBalance < minAmount) {
      eligibility.canInvest = false;
      eligibility.reasons.push(`Insufficient balance. Required: ${minAmount}, Available: ${userBalance}`);
    }
    
    return eligibility;
  }

  /**
   * Get user's investment capacity for a product
   * 
   * @param {string|number} productId - Product ID
   * @returns {Promise<Object>} Investment capacity info
   */
  async getInvestmentCapacity(productId) {
    const product = await this.getProductDetail(productId);
    
    if (!product) {
      return null;
    }
    
    const capacity = {
      productId: product.productId,
      productName: product.name,
      minAmount: parseFloat(product.min || '0'),
      maxAmount: parseFloat(product.max || '0'),
      userBalance: parseFloat(product.userBalance || '0'),
      currentInvestment: parseFloat(product.userOrderAmount || '0'),
      incomeRate: {
        min: parseFloat(product.incomeRateMin || '0'),
        max: parseFloat(product.incomeRateMax || '0')
      },
      duration: {
        min: parseInt(product.daysMin || '0'),
        max: parseInt(product.daysMax || '0')
      },
      incomeCoin: {
        id: product.incomeCoinId,
        name: product.incomeCoinName,
        price: parseFloat(product.incomeCoinPrice || '0')
      }
    };
    
    // Calculate available investment amount
    capacity.availableAmount = Math.min(
      capacity.userBalance,
      capacity.maxAmount - capacity.currentInvestment
    );
    
    return capacity;
  }

  /**
   * Get best available financial products based on return rate
   * 
   * @param {number} [minAmount] - Minimum investment amount filter
   * @returns {Promise<Array>} Products sorted by maximum return rate
   */
  async getBestProducts(minAmount) {
    const products = await this.getAllProducts();
    
    let filtered = products.filter(p => p.hasBuy === true);
    
    if (minAmount) {
      filtered = filtered.filter(p => parseFloat(p.userBalance || '0') >= minAmount);
    }
    
    // Sort by maximum income rate (descending)
    filtered.sort((a, b) => {
      const rateA = parseFloat(a.incomeRateMax || '0');
      const rateB = parseFloat(b.incomeRateMax || '0');
      return rateB - rateA;
    });
    
    return filtered;
  }
}

module.exports = FinancialAPI;