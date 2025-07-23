/**
 * CoinPlex Quantify API Module
 * 
 * Handles quantify operations, automated execution, and related services.
 */

class QuantifyAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Execute quantify operation
   * 
   * @param {Object} [options={}] - Execution options
   * @param {string} [options.executionId] - Custom execution ID
   * @param {string} [options.nonce] - Custom nonce for uniqueness
   * @returns {Promise<Object>} Execution result
   * @example
   * const result = await client.quantify.execute();
   * console.log(`Has tip: ${result.hasTip}, Expected completion: ${result.expectedCompletionTime}`);
   */
  async execute(options = {}) {
    const params = {
      timestamp: new Date().getTime(),
      nonce: options.nonce || Math.random().toString(36).substring(2, 15),
      executionId: options.executionId || `exec-${new Date().toISOString().split('T')[0]}-${Date.now()}`,
      ...options
    };

    const response = await this.client.request('/api/quantify/execute', params);
    return response.data;
  }

  /**
   * Execute quantify with retry logic
   * 
   * @param {number} [maxRetries=3] - Maximum number of retries
   * @param {number} [retryDelay=1000] - Delay between retries in milliseconds
   * @returns {Promise<Object>} Execution result
   */
  async executeWithRetry(maxRetries = 3, retryDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.execute({
          executionId: `retry-exec-${attempt}-${Date.now()}`
        });
        
        // Check if execution was successful
        if (result && (result.hasTip || result.expectedCompletionTime > 0)) {
          return {
            ...result,
            attempt,
            success: true
          };
        }
        
        // If no tips available but no error, return the result
        return {
          ...result,
          attempt,
          success: true,
          message: 'No tips available at this time'
        };
        
      } catch (error) {
        lastError = error;
        console.log(`Quantify execution attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          await this._delay(retryDelay * attempt);
        }
      }
    }
    
    throw new Error(`Quantify execution failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Check quantify status and availability
   * 
   * @returns {Promise<Object>} Quantify status information
   */
  async getStatus() {
    try {
      const result = await this.execute({
        executionId: `status-check-${Date.now()}`
      });
      
      return {
        available: true,
        hasTips: result.hasTip || false,
        expectedCompletionTime: result.expectedCompletionTime || 0,
        lastChecked: new Date().toISOString(),
        status: result.hasTip ? 'tips_available' : 'no_tips'
      };
      
    } catch (error) {
      return {
        available: false,
        error: error.message,
        lastChecked: new Date().toISOString(),
        status: 'error'
      };
    }
  }

  /**
   * Schedule repeated quantify executions
   * 
   * @param {Object} schedule - Schedule configuration
   * @param {number} schedule.iterations - Number of executions
   * @param {number} schedule.intervalMinutes - Interval between executions in minutes
   * @param {Function} [schedule.onSuccess] - Callback for successful executions
   * @param {Function} [schedule.onError] - Callback for failed executions
   * @param {Function} [schedule.onComplete] - Callback when all executions complete
   * @returns {Promise<Object>} Scheduler control object
   */
  async scheduleExecutions(schedule) {
    const {
      iterations,
      intervalMinutes,
      onSuccess,
      onError,
      onComplete
    } = schedule;

    const results = [];
    let currentIteration = 0;
    let isRunning = true;

    const scheduler = {
      stop: () => {
        isRunning = false;
        console.log('Quantify scheduler stopped');
      },
      getResults: () => [...results],
      isRunning: () => isRunning,
      getCurrentIteration: () => currentIteration
    };

    // Start execution loop
    (async () => {
      try {
        for (let i = 1; i <= iterations && isRunning; i++) {
          currentIteration = i;
          
          try {
            console.log(`Executing quantify operation ${i}/${iterations}...`);
            
            const result = await this.execute({
              executionId: `scheduled-${i}-${Date.now()}`
            });
            
            const executionResult = {
              iteration: i,
              timestamp: new Date().toISOString(),
              success: true,
              result
            };
            
            results.push(executionResult);
            
            if (onSuccess) {
              onSuccess(executionResult);
            }
            
            console.log(`✅ Quantify execution ${i} completed successfully`);
            
          } catch (error) {
            const executionResult = {
              iteration: i,
              timestamp: new Date().toISOString(),
              success: false,
              error: error.message
            };
            
            results.push(executionResult);
            
            if (onError) {
              onError(executionResult);
            }
            
            console.log(`❌ Quantify execution ${i} failed:`, error.message);
          }
          
          // Wait for next iteration (except for the last one)
          if (i < iterations && isRunning) {
            console.log(`Waiting ${intervalMinutes} minutes until next execution...`);
            await this._delay(intervalMinutes * 60 * 1000);
          }
        }
        
        currentIteration = 0;
        isRunning = false;
        
        if (onComplete) {
          onComplete({
            totalIterations: iterations,
            completedIterations: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
          });
        }
        
        console.log(`🎉 Quantify schedule completed: ${results.filter(r => r.success).length}/${iterations} successful`);
        
      } catch (error) {
        console.log('❌ Quantify scheduler error:', error.message);
        isRunning = false;
      }
    })();

    return scheduler;
  }

  /**
   * Get execution statistics
   * 
   * @param {Array} results - Array of execution results
   * @returns {Object} Execution statistics
   */
  getExecutionStats(results) {
    if (!results || results.length === 0) {
      return {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        averageInterval: 0
      };
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    const successRate = (successful / results.length) * 100;

    // Calculate average interval between executions
    let averageInterval = 0;
    if (results.length > 1) {
      const intervals = [];
      for (let i = 1; i < results.length; i++) {
        const prev = new Date(results[i - 1].timestamp);
        const curr = new Date(results[i].timestamp);
        intervals.push(curr - prev);
      }
      averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    return {
      total: results.length,
      successful,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      averageInterval: Math.round(averageInterval / 1000), // Convert to seconds
      firstExecution: results[0]?.timestamp,
      lastExecution: results[results.length - 1]?.timestamp
    };
  }

  /**
   * Delay helper for scheduling
   * 
   * @private
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise<void>}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = QuantifyAPI;