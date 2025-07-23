/**
 * CoinPlex SDK Configuration Utilities
 * 
 * Provides configuration management, environment variable loading,
 * and validation utilities for the SDK.
 */

const fs = require('fs');
const path = require('path');

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  // API Configuration
  apiKey: '',
  apiSecret: '',
  baseUrl: 'api.coinplex.online',
  timeout: 30000,
  autoRetry: true,
  maxRetries: 3,
  
  // Authentication
  credentials: {
    prefix: '',
    account: '',
    code: ''
  },
  
  // Logging
  logging: {
    level: 'info',
    enableFile: false,
    enableConsole: true,
    colorize: true
  },
  
  // Automation
  automation: {
    defaultIterations: 10,
    defaultInterval: 5,
    stopOnError: false,
    logResults: true
  }
};

/**
 * Environment variable mappings
 */
const ENV_MAPPINGS = {
  'COINPLEX_API_KEY': 'apiKey',
  'COINPLEX_API_SECRET': 'apiSecret',
  'COINPLEX_BASE_URL': 'baseUrl',
  'COINPLEX_TIMEOUT': 'timeout',
  'COINPLEX_PREFIX': 'credentials.prefix',
  'COINPLEX_ACCOUNT': 'credentials.account',
  'COINPLEX_CODE': 'credentials.code',
  'COINPLEX_LOG_LEVEL': 'logging.level',
  'COINPLEX_AUTO_RETRY': 'autoRetry',
  'COINPLEX_MAX_RETRIES': 'maxRetries'
};

/**
 * Load configuration from multiple sources
 * 
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.configFile] - Path to config file
 * @param {Object} [options.overrides] - Direct configuration overrides
 * @param {boolean} [options.loadEnv=true] - Load from environment variables
 * @returns {Object} Complete configuration object
 */
function loadConfig(options = {}) {
  const {
    configFile,
    overrides = {},
    loadEnv = true
  } = options;

  let config = { ...DEFAULT_CONFIG };

  // 1. Load from config file if specified
  if (configFile) {
    try {
      const fileConfig = loadConfigFile(configFile);
      config = mergeConfig(config, fileConfig);
    } catch (error) {
      console.warn(`Warning: Could not load config file ${configFile}:`, error.message);
    }
  }

  // 2. Load from environment variables
  if (loadEnv) {
    const envConfig = loadFromEnvironment();
    config = mergeConfig(config, envConfig);
  }

  // 3. Apply direct overrides
  config = mergeConfig(config, overrides);

  // 4. Validate configuration
  validateConfig(config);

  return config;
}

/**
 * Load configuration from a JSON file
 * 
 * @param {string} filePath - Path to configuration file
 * @returns {Object} Configuration object
 */
function loadConfigFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Configuration file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in configuration file: ${error.message}`);
  }
}

/**
 * Load configuration from environment variables
 * 
 * @returns {Object} Configuration object from environment
 */
function loadFromEnvironment() {
  const config = {};
  
  for (const [envVar, configPath] of Object.entries(ENV_MAPPINGS)) {
    const value = process.env[envVar];
    
    if (value !== undefined) {
      setNestedValue(config, configPath, parseEnvValue(value));
    }
  }
  
  return config;
}

/**
 * Parse environment variable value to appropriate type
 * 
 * @param {string} value - Environment variable value
 * @returns {any} Parsed value
 */
function parseEnvValue(value) {
  // Boolean values
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Numeric values
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  
  // String values
  return value;
}

/**
 * Set nested object value using dot notation
 * 
 * @param {Object} obj - Target object
 * @param {string} path - Dot-separated path (e.g., 'credentials.prefix')
 * @param {any} value - Value to set
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Merge two configuration objects deeply
 * 
 * @param {Object} base - Base configuration
 * @param {Object} override - Override configuration
 * @returns {Object} Merged configuration
 */
function mergeConfig(base, override) {
  const result = { ...base };
  
  for (const key in override) {
    if (override[key] !== undefined) {
      if (typeof override[key] === 'object' && 
          typeof result[key] === 'object' && 
          !Array.isArray(override[key])) {
        result[key] = mergeConfig(result[key], override[key]);
      } else {
        result[key] = override[key];
      }
    }
  }
  
  return result;
}

/**
 * Validate configuration object
 * 
 * @param {Object} config - Configuration to validate
 * @throws {Error} If configuration is invalid
 */
function validateConfig(config) {
  const errors = [];
  
  // Required fields
  if (!config.apiKey) {
    errors.push('apiKey is required');
  }
  
  if (!config.apiSecret) {
    errors.push('apiSecret is required');
  }
  
  if (!config.credentials.prefix) {
    errors.push('credentials.prefix is required');
  }
  
  if (!config.credentials.account) {
    errors.push('credentials.account is required');
  }
  
  if (!config.credentials.code) {
    errors.push('credentials.code is required');
  }
  
  // Numeric validations
  if (typeof config.timeout !== 'number' || config.timeout <= 0) {
    errors.push('timeout must be a positive number');
  }
  
  if (typeof config.maxRetries !== 'number' || config.maxRetries < 0) {
    errors.push('maxRetries must be a non-negative number');
  }
  
  // URL validation
  if (config.baseUrl && typeof config.baseUrl !== 'string') {
    errors.push('baseUrl must be a string');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Create a sample configuration file
 * 
 * @param {string} filePath - Path where to create the config file
 * @param {Object} [customConfig={}] - Custom configuration values
 */
function createSampleConfig(filePath, customConfig = {}) {
  const sampleConfig = {
    ...DEFAULT_CONFIG,
    ...customConfig,
    // Add comments as properties (will be ignored by JSON.parse but visible in file)
    _comment: "CoinPlex SDK Configuration File",
    _instructions: {
      apiKey: "Your CoinPlex API key",
      apiSecret: "Your CoinPlex API secret",
      credentials: {
        prefix: "Phone country prefix (e.g., '49')",
        account: "Your account identifier",
        code: "Your authentication code"
      }
    }
  };
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(sampleConfig, null, 2));
  console.log(`Sample configuration created at: ${filePath}`);
}

/**
 * Get configuration schema for validation
 * 
 * @returns {Object} Configuration schema
 */
function getConfigSchema() {
  return {
    type: 'object',
    required: ['apiKey', 'apiSecret', 'credentials'],
    properties: {
      apiKey: { type: 'string', minLength: 1 },
      apiSecret: { type: 'string', minLength: 1 },
      baseUrl: { type: 'string' },
      timeout: { type: 'number', minimum: 1000 },
      autoRetry: { type: 'boolean' },
      maxRetries: { type: 'number', minimum: 0 },
      credentials: {
        type: 'object',
        required: ['prefix', 'account', 'code'],
        properties: {
          prefix: { type: 'string', minLength: 1 },
          account: { type: 'string', minLength: 1 },
          code: { type: 'string', minLength: 1 }
        }
      },
      logging: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: ['error', 'warn', 'info', 'debug'] },
          enableFile: { type: 'boolean' },
          enableConsole: { type: 'boolean' },
          colorize: { type: 'boolean' }
        }
      },
      automation: {
        type: 'object',
        properties: {
          defaultIterations: { type: 'number', minimum: 1 },
          defaultInterval: { type: 'number', minimum: 1 },
          stopOnError: { type: 'boolean' },
          logResults: { type: 'boolean' }
        }
      }
    }
  };
}

module.exports = {
  loadConfig,
  loadConfigFile,
  loadFromEnvironment,
  mergeConfig,
  validateConfig,
  createSampleConfig,
  getConfigSchema,
  DEFAULT_CONFIG,
  ENV_MAPPINGS
};