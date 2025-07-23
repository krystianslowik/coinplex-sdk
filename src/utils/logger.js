/**
 * CoinPlex SDK Logger Utility
 * 
 * Provides configurable logging functionality with different levels
 * and output formatting for the SDK.
 */

const fs = require('fs');
const path = require('path');

/**
 * Log levels with numeric priorities
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

/**
 * Create a logger instance
 * 
 * @param {string} [name='CoinPlex'] - Logger name
 * @param {string} [level='info'] - Log level (error, warn, info, debug)
 * @param {Object} [options={}] - Logger options
 * @returns {Object} Logger instance
 */
function createLogger(name = 'CoinPlex', level = 'info', options = {}) {
  const config = {
    name,
    level,
    enableFile: false,
    filePath: null,
    enableConsole: true,
    timestamp: true,
    colorize: true,
    ...options
  };

  const logger = {
    /**
     * Log error message
     */
    error: (message, ...args) => log('error', message, ...args),
    
    /**
     * Log warning message
     */
    warn: (message, ...args) => log('warn', message, ...args),
    
    /**
     * Log info message
     */
    info: (message, ...args) => log('info', message, ...args),
    
    /**
     * Log debug message
     */
    debug: (message, ...args) => log('debug', message, ...args),
    
    /**
     * Set log level
     */
    setLevel: (newLevel) => {
      if (LOG_LEVELS.hasOwnProperty(newLevel)) {
        config.level = newLevel;
      }
    },
    
    /**
     * Get current log level
     */
    getLevel: () => config.level,
    
    /**
     * Enable/disable file logging
     */
    setFileLogging: (enabled, filePath) => {
      config.enableFile = enabled;
      if (filePath) {
        config.filePath = filePath;
      }
    },
    
    /**
     * Enable/disable console logging
     */
    setConsoleLogging: (enabled) => {
      config.enableConsole = enabled;
    }
  };

  /**
   * Core logging function
   * 
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  function log(level, message, ...args) {
    // Check if this level should be logged
    if (LOG_LEVELS[level] > LOG_LEVELS[config.level]) {
      return;
    }

    const timestamp = config.timestamp ? new Date().toISOString() : null;
    const formattedMessage = formatMessage(level, message, timestamp, ...args);

    // Console output
    if (config.enableConsole) {
      const colorized = config.colorize ? colorizeMessage(level, formattedMessage) : formattedMessage;
      console.log(colorized);
    }

    // File output
    if (config.enableFile && config.filePath) {
      try {
        // Ensure directory exists
        const dir = path.dirname(config.filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.appendFileSync(config.filePath, formattedMessage + '\n');
      } catch (error) {
        console.error('Failed to write to log file:', error.message);
      }
    }
  }

  /**
   * Format log message
   * 
   * @param {string} level - Log level
   * @param {string} message - Message
   * @param {string} timestamp - Timestamp
   * @param {...any} args - Additional arguments
   * @returns {string} Formatted message
   */
  function formatMessage(level, message, timestamp, ...args) {
    let formatted = '';
    
    if (timestamp) {
      formatted += `[${timestamp}] `;
    }
    
    formatted += `[${level.toUpperCase()}] `;
    
    if (config.name) {
      formatted += `[${config.name}] `;
    }
    
    formatted += message;
    
    // Add additional arguments
    if (args.length > 0) {
      const additional = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg);
        }
        return String(arg);
      }).join(' ');
      
      formatted += ' ' + additional;
    }
    
    return formatted;
  }

  /**
   * Add colors to log messages
   * 
   * @param {string} level - Log level
   * @param {string} message - Message to colorize
   * @returns {string} Colorized message
   */
  function colorizeMessage(level, message) {
    const colors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[36m',    // Cyan
      debug: '\x1b[35m',   // Magenta
      reset: '\x1b[0m'     // Reset
    };

    if (colors[level]) {
      return colors[level] + message + colors.reset;
    }
    
    return message;
  }

  return logger;
}

/**
 * Create a file logger for specific operations
 * 
 * @param {string} filename - Log filename
 * @param {string} [directory='./logs'] - Log directory
 * @param {string} [level='info'] - Log level
 * @returns {Object} File logger instance
 */
function createFileLogger(filename, directory = './logs', level = 'info') {
  const logPath = path.join(directory, filename);
  
  return createLogger(path.basename(filename, '.log'), level, {
    enableFile: true,
    filePath: logPath,
    enableConsole: false
  });
}

/**
 * Create a daily log file name
 * 
 * @param {string} prefix - Log file prefix
 * @returns {string} Daily log filename
 */
function getDailyLogFilename(prefix) {
  const date = new Date().toISOString().split('T')[0];
  return `${prefix}_${date}.log`;
}

module.exports = {
  createLogger,
  createFileLogger,
  getDailyLogFilename,
  LOG_LEVELS
};