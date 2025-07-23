/**
 * Comprehensive CoinPlex SDK Test Suite
 * 
 * Tests all 37 available functions across all API modules:
 * - WalletAPI: 8 methods
 * - FinancialAPI: 6 methods  
 * - UserAPI: 9 methods
 * - IncomeAPI: 8 methods
 * - QuantifyAPI: 5 methods
 * - AdsAPI: 6 methods
 */

// Load environment variables
require('dotenv').config();

const CoinPlex = require('./index');
const fs = require('fs');
const path = require('path');

// Load configuration from environment variables
const config = CoinPlex.loadConfig();

class ComprehensiveSDKTester {
  constructor() {
    this.client = null;
    this.results = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
    this.startTime = Date.now();
  }

  /**
   * Initialize client and authenticate
   */
  async initialize() {
    console.log('🚀 CoinPlex SDK Comprehensive Test Suite');
    console.log('=========================================\n');

    try {
      this.client = new CoinPlex(config);
      console.log('✅ Client initialized');

      const authenticated = await this.client.authenticate();
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
      console.log('✅ Authentication successful\n');

      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  /**
   * Execute a test function with error handling and logging
   */
  async executeTest(testName, testFunction, category = 'General') {
    this.results.total++;
    const testStart = Date.now();

    try {
      console.log(`🧪 Testing ${category}.${testName}...`);
      const result = await testFunction();
      
      const duration = Date.now() - testStart;
      
      // Log the actual response data with decryption status
      if (result !== null && result !== undefined) {
        console.log(`📊 Response Data:`, JSON.stringify(result, null, 2));
        
        // Check if this data was automatically decrypted by the SDK
        if (typeof result === 'object' && result._decryptionMethod) {
          console.log(`🔓 Automatically decrypted using: ${result._decryptionMethod}`);
        } else if (typeof result === 'string' && result.length > 100 && /^[A-Za-z0-9+/=]+$/.test(result)) {
          console.log(`🟡 Warning: This appears to be encrypted data that wasn't automatically decrypted`);
        } else {
          console.log(`📋 Plain data (no decryption needed)`);
        }
      }
      
      console.log(`✅ ${testName} passed (${duration}ms)\n`);
      
      this.results.successful++;
      this.results.tests.push({
        name: testName,
        category,
        status: 'passed',
        duration,
        result: result ? JSON.stringify(result).substring(0, 200) + '...' : 'success',
        fullResult: result // Store full result for detailed report
      });

      // Small delay between tests
      await this.delay(800);
      return result;

    } catch (error) {
      const duration = Date.now() - testStart;
      console.log(`❌ ${testName} failed: ${error.message} (${duration}ms)`);
      console.log(`🔍 Error Details:`, error.stack);
      
      this.results.failed++;
      this.results.tests.push({
        name: testName,
        category,
        status: 'failed',
        duration,
        error: error.message,
        errorStack: error.stack
      });

      // Continue with other tests
      await this.delay(800);
      return null;
    }
  }

  /**
   * Test all WalletAPI functions (8 methods)
   */
  async testWalletAPI() {
    console.log('\n📊 Testing WalletAPI (8 methods)');
    console.log('================================');

    // Primary Methods
    const overview = await this.executeTest('getOverview', () => this.client.wallet.getOverview(), 'Wallet');
    await this.executeTest('getRecords', () => this.client.wallet.getRecords({page: 1, limit: 10}), 'Wallet');
    await this.executeTest('getRecentRecords', () => this.client.wallet.getRecentRecords(5), 'Wallet');

    // Balance Management
    await this.executeTest('getCoinBalance_USDT', () => this.client.wallet.getCoinBalance('USDT'), 'Wallet');
    await this.executeTest('getCoinBalance_CPLX', () => this.client.wallet.getCoinBalance('CPLX'), 'Wallet');
    await this.executeTest('getTotalValue', () => this.client.wallet.getTotalValue(), 'Wallet');
    await this.executeTest('getFlexibleBalance', () => this.client.wallet.getFlexibleBalance(), 'Wallet');
    await this.executeTest('getPendingBalance', () => this.client.wallet.getPendingBalance(), 'Wallet');
    
    // Use overview data for balance check if available
    const testAmount = overview?.totalFlexibleAmount > 0 ? parseFloat(overview.totalFlexibleAmount) / 2 : 1;
    await this.executeTest('hasSufficientBalance', () => this.client.wallet.hasSufficientBalance(testAmount, 'USDT'), 'Wallet');
  }

  /**
   * Test all FinancialAPI functions (6 methods)
   */
  async testFinancialAPI() {
    console.log('\n💰 Testing FinancialAPI (6 methods)');
    console.log('===================================');

    // Core Methods
    const view = await this.executeTest('getView', () => this.client.financial.getView(), 'Financial');
    
    // Get sample product IDs from view if available
    let sampleProductId = null;
    if (view && view.products && view.products.length > 0) {
      sampleProductId = view.products[0].id || view.products[0].productId;
    }

    if (sampleProductId) {
      await this.executeTest('getProductDetail', () => this.client.financial.getProductDetail(sampleProductId), 'Financial');
      await this.executeTest('checkInvestmentEligibility', () => this.client.financial.checkInvestmentEligibility(sampleProductId), 'Financial');
      await this.executeTest('getInvestmentCapacity', () => this.client.financial.getInvestmentCapacity(sampleProductId), 'Financial');
    } else {
      console.log('⚠️  Skipping product-specific tests (no products available)');
      this.results.skipped += 3;
    }

    // Test with sample product IDs array
    const productIds = sampleProductId ? [sampleProductId] : ['1', '2', '3'];
    await this.executeTest('getAllProducts', () => this.client.financial.getAllProducts(productIds), 'Financial');
    await this.executeTest('getBestProducts', () => this.client.financial.getBestProducts(100), 'Financial');
  }

  /**
   * Test all UserAPI functions (9 methods)
   */
  async testUserAPI() {
    console.log('\n👤 Testing UserAPI (9 methods)');
    console.log('==============================');

    // Profile Methods
    const profile = await this.executeTest('getProfile', () => this.client.user.getProfile(), 'User');
    await this.executeTest('getLevel', () => this.client.user.getLevel(), 'User');
    await this.executeTest('getFinancialSummary', () => this.client.user.getFinancialSummary(), 'User');
    await this.executeTest('getTeamInfo', () => this.client.user.getTeamInfo(), 'User');
    await this.executeTest('getSecuritySettings', () => this.client.user.getSecuritySettings(), 'User');
    await this.executeTest('getInviteInfo', () => this.client.user.getInviteInfo(), 'User');
    await this.executeTest('getChatInfo', () => this.client.user.getChatInfo(), 'User');

    // Analysis Methods
    const currentLevel = profile?.level || 1;
    const targetLevel = currentLevel + 1;
    await this.executeTest('checkLevelRequirements', () => this.client.user.checkLevelRequirements(targetLevel), 'User');
    await this.executeTest('getActivitySummary', () => this.client.user.getActivitySummary(), 'User');
  }

  /**
   * Test all IncomeAPI functions (8 methods)
   */
  async testIncomeAPI() {
    console.log('\n💵 Testing IncomeAPI (8 methods)');
    console.log('================================');

    // Core Income Methods
    await this.executeTest('getTeamData', () => this.client.income.getTeamData(), 'Income');
    await this.executeTest('getIncomeData_7days', () => this.client.income.getIncomeData(7), 'Income');
    await this.executeTest('getIncomeData_30days', () => this.client.income.getIncomeData(30), 'Income');
    await this.executeTest('getTodayIncome', () => this.client.income.getTodayIncome(), 'Income');
    await this.executeTest('getWeeklyIncome', () => this.client.income.getWeeklyIncome(), 'Income');
    await this.executeTest('getMonthlyIncome', () => this.client.income.getMonthlyIncome(), 'Income');

    // Analytics Methods
    await this.executeTest('getIncomeAnalytics', () => this.client.income.getIncomeAnalytics(), 'Income');
    await this.executeTest('getIncomeTrends', () => this.client.income.getIncomeTrends([7, 30]), 'Income');
    await this.executeTest('getIncomeGrowthRate', () => this.client.income.getIncomeGrowthRate(7), 'Income');
    await this.executeTest('getTeamPerformance', () => this.client.income.getTeamPerformance(), 'Income');
  }

  /**
   * Test all QuantifyAPI functions (5 methods)
   */
  async testQuantifyAPI() {
    console.log('\n⚡ Testing QuantifyAPI (5 methods)');
    console.log('=================================');

    // Check status first
    const status = await this.executeTest('getStatus', () => this.client.quantify.getStatus(), 'Quantify');

    // Execution Methods
    await this.executeTest('execute', () => this.client.quantify.execute(), 'Quantify');
    await this.executeTest('executeWithRetry', () => this.client.quantify.executeWithRetry(2, 1000), 'Quantify');

    // Mock results for statistics testing
    const mockResults = [
      { success: true, timestamp: Date.now() - 3600000 },
      { success: true, timestamp: Date.now() - 7200000 },
      { success: false, timestamp: Date.now() - 10800000, error: 'Test error' }
    ];
    await this.executeTest('getExecutionStats', () => this.client.quantify.getExecutionStats(mockResults), 'Quantify');

    // Schedule test (very short duration for testing)
    const testSchedule = {
      iterations: 2,
      intervalMinutes: 0.05, // 3 seconds
      startDelay: 1000
    };
    await this.executeTest('scheduleExecutions', () => this.client.quantify.scheduleExecutions(testSchedule), 'Quantify');
  }

  /**
   * Test all AdsAPI functions (6 methods)
   */
  async testAdsAPI() {
    console.log('\n📢 Testing AdsAPI (6 methods)');
    console.log('=============================');

    // Advertisement Methods
    await this.executeTest('getList_home', () => this.client.ads.getList('home'), 'Ads');
    await this.executeTest('getList_wallet', () => this.client.ads.getList('wallet'), 'Ads');
    await this.executeTest('getCPLXNodeAds', () => this.client.ads.getCPLXNodeAds(), 'Ads');
    
    const positions = ['home', 'wallet', 'financial'];
    await this.executeTest('getAllAds', () => this.client.ads.getAllAds(positions), 'Ads');
    await this.executeTest('hasAds_home', () => this.client.ads.hasAds('home'), 'Ads');
    await this.executeTest('getAdStats', () => this.client.ads.getAdStats(positions), 'Ads');

    // Note: monitorAds is excluded as it's a long-running operation
    console.log('ℹ️  Skipping monitorAds (long-running operation)');
    this.results.skipped += 1;
  }

  /**
   * Test automation features
   */
  async testAutomation() {
    console.log('\n🤖 Testing Automation Features');
    console.log('===============================');

    await this.executeTest('createDailyExecutor', () => {
      const executor = this.client.createDailyExecutor({
        iterations: 2,
        intervalMinutes: 0.05, // 3 seconds for testing
        logLevel: 'info'
      });
      return { created: true, isRunning: executor.getStatus().isRunning };
    }, 'Automation');

    // Test utility functions
    await this.executeTest('getVersion', () => CoinPlex.getVersion(), 'Utilities');
    await this.executeTest('loadConfig', () => CoinPlex.loadConfig({ 
      loadEnv: false, 
      overrides: {
        apiKey: 'test-key',
        apiSecret: 'test-secret',
        credentials: {
          prefix: '1',
          account: 'test-account',
          code: 'test-code'
        }
      }
    }), 'Utilities');
    await this.executeTest('getStats', () => this.client.getStats(), 'Utilities');
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const duration = Date.now() - this.startTime;
    const successRate = ((this.results.successful / this.results.total) * 100).toFixed(1);

    console.log('\n📊 COMPREHENSIVE TEST REPORT');
    console.log('============================');
    console.log(`🕒 Total Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`✅ Successful: ${this.results.successful}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Skipped: ${this.results.skipped}`);
    console.log(`📊 Total Tests: ${this.results.total}`);

    // Category breakdown
    console.log('\n📋 Results by Category:');
    const categories = {};
    this.results.tests.forEach(test => {
      if (!categories[test.category]) {
        categories[test.category] = { passed: 0, failed: 0 };
      }
      categories[test.category][test.status]++;
    });

    Object.entries(categories).forEach(([category, stats]) => {
      const total = stats.passed + stats.failed;
      const rate = ((stats.passed / total) * 100).toFixed(1);
      console.log(`   ${category}: ${stats.passed}/${total} (${rate}%)`);
    });

    // Save detailed report to file
    const reportData = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: this.results,
      clientStats: this.client.getStats(),
      sdkVersion: CoinPlex.getVersion()
    };

    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return this.results;
  }

  /**
   * Helper function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    try {
      // Initialize
      const initialized = await this.initialize();
      if (!initialized) {
        console.log('❌ Cannot proceed with tests - initialization failed');
        return;
      }

      // Run all API tests
      await this.testWalletAPI();
      await this.testFinancialAPI();
      await this.testUserAPI();
      await this.testIncomeAPI();
      await this.testQuantifyAPI();
      await this.testAdsAPI();
      await this.testAutomation();

      // Generate final report
      const results = this.generateReport();

      console.log('\n🎉 Comprehensive SDK test completed!');
      console.log(`Final Status: ${results.successful}/${results.total} tests passed`);

      return results;

    } catch (error) {
      console.error('💥 Test suite crashed:', error.message);
      console.error(error.stack);
      return this.results;
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new ComprehensiveSDKTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveSDKTester;