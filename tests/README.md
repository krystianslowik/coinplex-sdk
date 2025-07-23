# CoinPlex SDK Test Suite

This directory contains test files and utilities for the CoinPlex SDK.

## Test Files

### Core Test Files

- **`comprehensive-test.js`** - Main test suite that exercises all 37 SDK functions across 6 API modules
- **`test-quick.js`** - Quick smoke test to verify basic SDK functionality

### Specialized Test Files

- **`test-income-decryption.js`** - Focused test for income API decryption verification
- **`debug-decryption.js`** - Debug utility for troubleshooting decryption pipeline
- **`decrypt-test-data.js`** - Standalone decryption test for encrypted response strings

### Test Data

- **`decrypted-data.json`** - Results from decryption tests with original and decrypted data
- **`test-report-*.json`** - Comprehensive test results with timing and response data

### Test Directories

- **`fixtures/`** - Test data fixtures and mock responses
- **`integration/`** - Integration tests for API workflows
- **`unit/`** - Unit tests for individual components

## Running Tests

### Full Test Suite
```bash
# Run comprehensive test of all SDK functions
node comprehensive-test.js

# Run quick smoke test
node test-quick.js
```

### Specialized Tests
```bash
# Test income API decryption specifically
node tests/test-income-decryption.js

# Test standalone decryption of encrypted strings
node tests/decrypt-test-data.js

# Debug decryption pipeline issues
node tests/debug-decryption.js
```

### Jest Tests
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Results

The comprehensive test suite provides:
- **Coverage**: All 37 SDK functions across 6 API modules
- **Performance**: Request timing and success rates
- **Decryption**: Automatic verification of encrypted response handling
- **Documentation**: Real API response examples for documentation

### Latest Results
- ✅ **45/46 tests passed** (97.8% success rate)
- 🔓 **55 encrypted responses** automatically decrypted
- ⏱️ **Average response time**: 250-400ms
- 📊 **100% API success rate** (all requests successful)

## Test Configuration

Tests load configuration from environment variables using a `.env` file. 

### Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual CoinPlex credentials:
   ```bash
   COINPLEX_API_KEY=your-api-key-here
   COINPLEX_API_SECRET=your-api-secret-here
   COINPLEX_PREFIX=your-country-code
   COINPLEX_ACCOUNT=your-phone-number  
   COINPLEX_CODE=your-authentication-code
   ```

3. Tests will automatically load configuration:
   ```javascript
   require('dotenv').config();
   const config = CoinPlex.loadConfig();
   ```

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Verify credentials are current and valid
2. **Decryption Errors**: Use `debug-decryption.js` to troubleshoot pipeline
3. **Network Timeouts**: Check network connectivity and API availability
4. **Rate Limits**: Add delays between test requests if needed

### Debug Tools

- `debug-decryption.js` - Analyze decryption pipeline step-by-step
- `decrypt-test-data.js` - Test decryption of specific encrypted strings
- Browser network tab - Monitor raw API requests/responses

---

*Tests are designed to be comprehensive, reliable, and provide real examples for API documentation.*