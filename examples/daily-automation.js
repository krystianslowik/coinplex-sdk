/**
 * CoinPlex SDK - Daily Automation Example
 * 
 * Demonstrates how to set up automated daily quantify operations
 * using the DailyExecutor with proper logging and error handling.
 */

// Load environment variables from .env file
require('dotenv').config();

const CoinPlex = require('../index');

// Load configuration from environment variables
const config = CoinPlex.loadConfig();

async function dailyAutomationDemo() {
  console.log('🤖 CoinPlex SDK Daily Automation Demo');
  console.log('====================================\n');

  try {
    // 1. Initialize client
    console.log('1. Initializing CoinPlex client...');
    const client = new CoinPlex(config);
    
    // 2. Authenticate
    console.log('2. Authenticating...');
    const authenticated = await client.authenticate();
    
    if (!authenticated) {
      throw new Error('Authentication failed');
    }
    console.log('✅ Authentication successful\n');

    // 3. Create daily executor with custom settings
    console.log('3. Creating daily executor...');
    const executor = client.createDailyExecutor({
      iterations: 5,           // Run 5 times for demo
      intervalMinutes: 1,      // 1 minute intervals for demo
      logLevel: 'info',
      retryFailures: true,
      maxRetries: 2,
      stopOnError: false
    });
    
    console.log('✅ Daily executor created\n');

    // 4. Set up event handlers
    console.log('4. Setting up monitoring...');
    
    // Monitor progress every 10 seconds
    const progressMonitor = setInterval(() => {
      const status = executor.getStatus();
      
      if (status.isRunning) {
        console.log(`📊 Progress: ${status.currentIteration}/${status.totalIterations} (${status.progress.toFixed(1)}%)`);
        console.log(`✅ Successful: ${status.successfulIterations}, ❌ Failed: ${status.failedIterations}`);
        
        if (status.nextExecution) {
          const nextTime = new Date(status.nextExecution);
          console.log(`⏰ Next execution: ${nextTime.toLocaleTimeString()}\n`);
        }
      }
    }, 10000);

    // 5. Start the automation
    console.log('5. Starting automated execution...');
    console.log('   (This will run for about 5 minutes with 1-minute intervals)\n');
    
    await executor.start();
    
    // 6. Wait for completion and monitor
    const checkCompletion = () => {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const status = executor.getStatus();
          
          if (!status.isRunning) {
            clearInterval(interval);
            clearInterval(progressMonitor);
            resolve(status);
          }
        }, 1000);
      });
    };

    // Wait for completion
    const finalStatus = await checkCompletion();
    
    // 7. Show final results
    console.log('🎉 Automation completed!\n');
    console.log('📈 Final Statistics:');
    console.log('===================');
    
    const stats = executor.getStats();
    console.log(`Total Executions: ${stats.total}`);
    console.log(`Successful: ${stats.successful}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Success Rate: ${stats.successRate}%`);
    console.log(`Average Interval: ${stats.averageInterval}s`);
    
    if (stats.firstExecution && stats.lastExecution) {
      const startTime = new Date(stats.firstExecution);
      const endTime = new Date(stats.lastExecution);
      const duration = endTime - startTime;
      console.log(`Total Runtime: ${Math.round(duration / 1000)}s`);
    }
    
    console.log('\n📋 Execution Results:');
    console.log('=====================');
    
    finalStatus.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const time = new Date(result.timestamp).toLocaleTimeString();
      console.log(`${status} Execution ${result.iteration}: ${time}`);
      
      if (result.success && result.result) {
        console.log(`   └─ Has Tips: ${result.result.hasTip}, Completion Time: ${result.result.expectedCompletionTime}`);
      } else if (!result.success) {
        console.log(`   └─ Error: ${result.error}`);
      }
    });

    // 8. Export results
    console.log('\n💾 Exporting results...');
    const exportData = executor.exportResults();
    
    // In a real application, you might save this to a file
    console.log('✅ Results exported (shown below):');
    console.log('===================================');
    console.log(exportData.substring(0, 500) + '...');

    console.log('\n🎉 Daily automation demo completed successfully!');
    console.log('💡 In production, this would run continuously with longer intervals.');

  } catch (error) {
    console.error('❌ Automation demo failed:', error.message);
    console.error(error.stack);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received shutdown signal, stopping automation...');
  process.exit(0);
});

// Run the demo if this file is executed directly
if (require.main === module) {
  dailyAutomationDemo();
}

module.exports = { dailyAutomationDemo };