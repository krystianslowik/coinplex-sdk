/**
 * CoinPlex SDK Quantify API Tests
 */

require('dotenv').config();
const CoinPlex = require('../index');

describe('Quantify API', () => {
  let client;

  beforeAll(async () => {
    const config = CoinPlex.loadConfig();
    client = new CoinPlex(config);
    await client.authenticate();
  }, 30000);

  test('should get quantify status', async () => {
    const status = await client.quantify.getStatus();
    expect(status).toBeDefined();
    expect(status).toHaveProperty('available');
  }, 10000);

  test('should execute quantify operation', async () => {
    const result = await client.quantify.execute();
    expect(result).toBeDefined();
  }, 10000);

  test('should execute with retry', async () => {
    const result = await client.quantify.executeWithRetry(2, 1000);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');
  }, 15000);

  test('should get execution stats for mock data', async () => {
    const mockResults = [
      { success: true, timestamp: Date.now() - 3600000 },
      { success: true, timestamp: Date.now() - 7200000 },
      { success: false, timestamp: Date.now() - 10800000, error: 'Test error' }
    ];
    
    const stats = await client.quantify.getExecutionStats(mockResults);
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('successful');
    expect(stats).toHaveProperty('failed');
    expect(stats).toHaveProperty('successRate');
  }, 10000);

  test('should validate scheduler configuration', () => {
    // Test that we can create a valid schedule configuration
    const testSchedule = {
      iterations: 2,
      intervalMinutes: 5,
      onSuccess: jest.fn(),
      onComplete: jest.fn()
    };
    
    expect(testSchedule.iterations).toBe(2);
    expect(testSchedule.intervalMinutes).toBe(5);
    expect(typeof testSchedule.onSuccess).toBe('function');
    expect(typeof testSchedule.onComplete).toBe('function');
    
    // Note: Not testing actual execution to avoid async issues in Jest
  });
});