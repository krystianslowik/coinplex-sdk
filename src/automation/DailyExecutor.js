/**
 * CoinPlex Daily Executor
 * 
 * Automated execution of daily quantify operations with configurable
 * scheduling, logging, and error handling.
 */

const { createLogger } = require('../utils/logger');

class DailyExecutor {
  constructor(client, options = {}) {
    this.client = client;
    this.options = {
      iterations: 10,
      intervalMinutes: 5,
      autoStart: false,
      logLevel: 'info',
      retryFailures: true,
      maxRetries: 3,
      stopOnError: false,
      ...options
    };
    
    this.logger = createLogger('DailyExecutor', this.options.logLevel);
    this.isRunning = false;
    this.currentIteration = 0;
    this.results = [];
    this.scheduler = null;
  }

  /**
   * Start the daily execution schedule
   * 
   * @returns {Promise<void>}
   */
  async start() {
    if (this.isRunning) {
      this.logger.warn('Daily executor is already running');
      return;
    }

    // Ensure client is authenticated
    if (!this.client.isAuthenticated()) {
      this.logger.info('Authenticating client...');
      const authenticated = await this.client.authenticate();
      
      if (!authenticated) {
        throw new Error('Failed to authenticate client');
      }
    }

    this.logger.info(`Starting daily executor: ${this.options.iterations} iterations, ${this.options.intervalMinutes}min intervals`);
    
    this.isRunning = true;
    this.currentIteration = 0;
    this.results = [];

    // Start the quantify scheduler
    this.scheduler = await this.client.quantify.scheduleExecutions({
      iterations: this.options.iterations,
      intervalMinutes: this.options.intervalMinutes,
      onSuccess: (result) => this._handleSuccess(result),
      onError: (result) => this._handleError(result),
      onComplete: (summary) => this._handleComplete(summary)
    });
  }

  /**
   * Stop the daily execution schedule
   */
  stop() {
    if (!this.isRunning) {
      this.logger.warn('Daily executor is not running');
      return;
    }

    this.logger.info('Stopping daily executor...');
    
    if (this.scheduler) {
      this.scheduler.stop();
    }
    
    this.isRunning = false;
    this.logger.info('Daily executor stopped');
  }

  /**
   * Get current execution status
   * 
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      currentIteration: this.currentIteration,
      totalIterations: this.options.iterations,
      completedIterations: this.results.length,
      successfulIterations: this.results.filter(r => r.success).length,
      failedIterations: this.results.filter(r => !r.success).length,
      progress: this.options.iterations > 0 ? (this.results.length / this.options.iterations) * 100 : 0,
      nextExecution: this._getNextExecutionTime(),
      results: [...this.results]
    };
  }

  /**
   * Get execution statistics
   * 
   * @returns {Object} Detailed statistics
   */
  getStats() {
    const stats = this.client.quantify.getExecutionStats(this.results);
    
    return {
      ...stats,
      configuration: {
        iterations: this.options.iterations,
        intervalMinutes: this.options.intervalMinutes,
        retryFailures: this.options.retryFailures,
        maxRetries: this.options.maxRetries
      },
      runtime: {
        isRunning: this.isRunning,
        startTime: this.results[0]?.timestamp,
        currentIteration: this.currentIteration,
        estimatedCompletion: this._getEstimatedCompletion()
      }
    };
  }

  /**
   * Export execution results to JSON
   * 
   * @returns {string} JSON string of results
   */
  exportResults() {
    const exportData = {
      configuration: this.options,
      executionTime: new Date().toISOString(),
      status: this.getStatus(),
      statistics: this.getStats(),
      results: this.results
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Handle successful execution
   * 
   * @private
   * @param {Object} result - Execution result
   */
  _handleSuccess(result) {
    this.currentIteration = result.iteration;
    this.results.push(result);
    
    const hasRevenue = result.result?.hasTip || result.result?.expectedCompletionTime > 0;
    
    if (hasRevenue) {
      this.logger.info(`✅ Execution ${result.iteration} completed with revenue`);
    } else {
      this.logger.info(`ℹ️ Execution ${result.iteration} completed - no revenue available`);
    }
  }

  /**
   * Handle failed execution
   * 
   * @private
   * @param {Object} result - Execution result
   */
  _handleError(result) {
    this.currentIteration = result.iteration;
    this.results.push(result);
    
    this.logger.error(`❌ Execution ${result.iteration} failed: ${result.error}`);
    
    if (this.options.stopOnError) {
      this.logger.warn('Stopping executor due to error (stopOnError=true)');
      this.stop();
    }
  }

  /**
   * Handle completion of all executions
   * 
   * @private
   * @param {Object} summary - Execution summary
   */
  _handleComplete(summary) {
    this.isRunning = false;
    this.currentIteration = 0;
    
    this.logger.info(`🎉 Daily execution completed: ${summary.successful}/${summary.totalIterations} successful`);
    this.logger.info(`📊 Success rate: ${((summary.successful / summary.totalIterations) * 100).toFixed(1)}%`);
    
    // Log final statistics
    const stats = this.getStats();
    this.logger.info(`📈 Total runtime: ${this._formatDuration(stats.averageInterval * stats.total)}`);
  }

  /**
   * Get estimated completion time
   * 
   * @private
   * @returns {string|null} ISO timestamp of estimated completion
   */
  _getEstimatedCompletion() {
    if (!this.isRunning || this.results.length === 0) {
      return null;
    }
    
    const remainingIterations = this.options.iterations - this.results.length;
    const estimatedMs = remainingIterations * this.options.intervalMinutes * 60 * 1000;
    
    return new Date(Date.now() + estimatedMs).toISOString();
  }

  /**
   * Get next execution time
   * 
   * @private
   * @returns {string|null} ISO timestamp of next execution
   */
  _getNextExecutionTime() {
    if (!this.isRunning || this.results.length === 0) {
      return null;
    }
    
    const lastExecution = this.results[this.results.length - 1];
    if (!lastExecution) return null;
    
    const nextMs = new Date(lastExecution.timestamp).getTime() + 
                   (this.options.intervalMinutes * 60 * 1000);
    
    return new Date(nextMs).toISOString();
  }

  /**
   * Format duration in milliseconds to human readable string
   * 
   * @private
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  _formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

module.exports = DailyExecutor;