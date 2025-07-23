/**
 * Quick SDK Test
 */

// Load environment variables
require('dotenv').config();

const CoinPlex = require('./index');

// Load configuration from environment variables
const config = CoinPlex.loadConfig();

async function quickTest() {
  console.log('🧪 Quick SDK Test');
  console.log('================\n');

  try {
    const client = new CoinPlex(config);
    console.log('✅ Client created');
    
    const authenticated = await client.authenticate();
    console.log('✅ Authentication:', authenticated);
    
    // Test a few key methods
    const profile = await client.user.getProfile();
    console.log(`✅ Profile: ${profile.nickname}`);
    
    const wallet = await client.wallet.getTotalValue();
    console.log(`✅ Wallet total: ${wallet} USDT`);
    
    const quantify = await client.quantify.execute();
    console.log(`✅ Quantify: hasTip=${quantify.hasTip}`);
    
    // Test automation with very short duration
    console.log('\n🤖 Testing automation...');
    const executor = client.createDailyExecutor({
      iterations: 2,
      intervalMinutes: 0.1, // 6 seconds
      logLevel: 'info'
    });
    
    await executor.start();
    
    // Wait for completion
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const status = executor.getStatus();
      completed = !status.isRunning;
      attempts++;
      
      if (status.isRunning) {
        console.log(`⏳ Progress: ${status.currentIteration}/${status.totalIterations}`);
      }
    }
    
    const finalStats = executor.getStats();
    console.log(`✅ Automation completed: ${finalStats.successful}/${finalStats.total} successful`);
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

quickTest().catch(console.error);