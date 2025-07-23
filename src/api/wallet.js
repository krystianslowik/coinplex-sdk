/**
 * CoinPlex Wallet API Module
 * 
 * Handles wallet-related operations including asset overview,
 * transaction records, and balance management.
 */

class WalletAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get wallet asset overview
   * Shows all coins, balances, and amounts in different states
   * 
   * @returns {Promise<Object>} Wallet asset overview
   * @example
   * const overview = await client.wallet.getOverview();
   * console.log(`Total balance: ${overview.totalBalance} USDT`);
   */
  async getOverview() {
    const response = await this.client.request('/api/wallet/asset/overview');
    return response.data;
  }

  /**
   * Get wallet transaction records with pagination
   * 
   * @param {Object} [options={}] - Query options
   * @param {number} [options.filter=0] - Transaction filter (0=all)
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.pageSize=10] - Items per page
   * @param {string} [options.yearMonth] - Year-month filter (YYYYMM format)
   * @returns {Promise<Object>} Transaction records with pagination
   * @example
   * const records = await client.wallet.getRecords({
   *   page: 1,
   *   pageSize: 20,
   *   yearMonth: '202507'
   * });
   */
  async getRecords(options = {}) {
    const params = {
      filter: 0,
      page: 1,
      pageSize: 10,
      yearMonth: new Date().toISOString().slice(0, 7).replace('-', ''),
      ...options
    };
    
    const response = await this.client.request('/api/v2/wallet/record', params);
    return response.data;
  }

  /**
   * Get recent transaction records (last 30 days)
   * 
   * @param {number} [limit=10] - Maximum number of records to return
   * @returns {Promise<Array>} Array of recent transactions
   */
  async getRecentRecords(limit = 10) {
    const records = await this.getRecords({ pageSize: limit });
    return records.list || [];
  }

  /**
   * Get balance for a specific coin
   * 
   * @param {string} coinName - Coin name (e.g., 'USDT', 'CPLX')
   * @returns {Promise<Object|null>} Coin balance info or null if not found
   */
  async getCoinBalance(coinName) {
    const overview = await this.getOverview();
    const coin = overview.list?.find(c => c.coinName === coinName.toUpperCase());
    return coin || null;
  }

  /**
   * Get total portfolio value in USDT
   * 
   * @returns {Promise<number>} Total portfolio value
   */
  async getTotalValue() {
    const overview = await this.getOverview();
    return parseFloat(overview.totalAmount || '0');
  }

  /**
   * Get flexible (available) balance
   * 
   * @returns {Promise<number>} Available balance in USDT
   */
  async getFlexibleBalance() {
    const overview = await this.getOverview();
    return parseFloat(overview.totalFlexibleAmount || '0');
  }

  /**
   * Get pending (locked) balance
   * 
   * @returns {Promise<number>} Pending balance in USDT
   */
  async getPendingBalance() {
    const overview = await this.getOverview();
    return parseFloat(overview.totalPendingAmount || '0');
  }

  /**
   * Check if sufficient balance exists for an operation
   * 
   * @param {number} amount - Required amount
   * @param {string} [coinName='USDT'] - Coin to check
   * @returns {Promise<boolean>} True if sufficient balance exists
   */
  async hasSufficientBalance(amount, coinName = 'USDT') {
    const coin = await this.getCoinBalance(coinName);
    if (!coin) return false;
    
    const available = parseFloat(coin.balance || '0');
    return available >= amount;
  }
}

module.exports = WalletAPI;