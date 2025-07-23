/**
 * Test Income API Decryption
 * 
 * Focused test to verify income API methods return properly decrypted data
 */

// Load environment variables
require('dotenv').config();

const CoinPlex = require('../index');

// Load configuration from environment variables
const config = CoinPlex.loadConfig();

async function testIncomeDecryption() {
  console.log('🧪 Testing Income API Automatic Decryption');
  console.log('==========================================\n');

  const client = new CoinPlex(config);
  await client.authenticate();

  // Test income methods that should return decrypted data
  const testMethods = [
    { name: 'getIncomeData(7)', method: () => client.income.getIncomeData(7) },
    { name: 'getIncomeData(30)', method: () => client.income.getIncomeData(30) },
    { name: 'getTodayIncome', method: () => client.income.getTodayIncome() },
    { name: 'getWeeklyIncome', method: () => client.income.getWeeklyIncome() },
    { name: 'getMonthlyIncome', method: () => client.income.getMonthlyIncome() },
    { name: 'getIncomeTrends', method: () => client.income.getIncomeTrends([7, 30]) }
  ];

  for (const test of testMethods) {
    console.log(`🔍 Testing ${test.name}...`);
    
    try {
      const result = await test.method();
      
      // Check if result contains readable data vs encrypted strings
      if (typeof result === 'string' && result.length > 100 && /^[A-Za-z0-9+/=]+$/.test(result)) {
        console.log(`❌ ENCRYPTED DATA RETURNED:`);
        console.log(`   ${result.substring(0, 100)}...`);
      } else if (typeof result === 'object') {
        console.log(`✅ DECRYPTED DATA RETURNED:`);
        console.log(`   ${JSON.stringify(result, null, 2)}`);
      } else {
        console.log(`📋 OTHER DATA TYPE: ${typeof result}`);
        console.log(`   ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
}

if (require.main === module) {
  testIncomeDecryption().catch(console.error);
}

module.exports = testIncomeDecryption;