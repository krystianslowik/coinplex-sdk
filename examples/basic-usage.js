/**
 * CoinPlex SDK - Basic Usage Example
 * 
 * Demonstrates the basic functionality of the CoinPlex SDK including
 * authentication, wallet operations, and simple API calls.
 */

// Load environment variables from .env file
require('dotenv').config();

const CoinPlex = require('../index');

// Load configuration from environment variables
const config = CoinPlex.loadConfig();

async function basicUsageDemo() {
  console.log('🚀 CoinPlex SDK Basic Usage Demo');
  console.log('================================\n');

  try {
    // 1. Initialize the client
    console.log('1. Initializing CoinPlex client...');
    const client = new CoinPlex(config);
    console.log('✅ Client initialized\n');

    // 2. Authenticate
    console.log('2. Authenticating...');
    const authenticated = await client.authenticate();
    
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    console.log('✅ Authentication successful\n');

    // 3. Get user profile
    console.log('3. Getting user profile...');
    const profile = await client.user.getProfile();
    console.log(`✅ User: ${profile.nickname} (Level: ${profile.levelName})`);
    console.log(`📧 Email: ${profile.email}`);
    console.log(`📱 Mobile: +${profile.mobilePrefix} ${profile.mobile}\n`);

    // 4. Get wallet overview
    console.log('4. Getting wallet overview...');
    const wallet = await client.wallet.getOverview();
    console.log(`✅ Total Balance: ${wallet.totalBalance} USDT`);
    console.log(`💰 Available: ${wallet.totalFlexibleAmount} USDT`);
    console.log(`🔒 Locked: ${wallet.totalPendingAmount} USDT\n`);

    // 5. Get income data
    console.log('5. Getting team income data...');
    const teamIncome = await client.income.getTeamData();
    console.log(`✅ Team Count: ${teamIncome.teamCount}`);
    console.log(`💵 Total Team Income: ${teamIncome.totalTeamIncome} USDT`);
    console.log(`📈 Today's Team Income: ${teamIncome.todayTeamIncome} USDT\n`);

    // 6. Test quantify operation
    console.log('6. Testing quantify operation...');
    const quantifyResult = await client.quantify.execute();
    console.log(`✅ Quantify executed`);
    console.log(`🎯 Has Tips: ${quantifyResult.hasTip}`);
    console.log(`⏱️ Expected Completion: ${quantifyResult.expectedCompletionTime}\n`);

    // 7. Get recent wallet transactions
    console.log('7. Getting recent transactions...');
    const recentTransactions = await client.wallet.getRecentRecords(5);
    console.log(`✅ Found ${recentTransactions.length} recent transactions:`);
    
    recentTransactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount} ${tx.coinName} on ${tx.date}`);
    });
    console.log();

    // 8. Show client statistics
    console.log('8. Client statistics:');
    const stats = client.getStats();
    console.log(`📊 Total Requests: ${stats.requests}`);
    console.log(`✅ Successful: ${stats.successful}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`🔐 Encrypted Responses: ${stats.encrypted}\n`);

    console.log('🎉 Basic usage demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  basicUsageDemo();
}

module.exports = { basicUsageDemo };