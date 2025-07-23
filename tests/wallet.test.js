/**
 * CoinPlex SDK Wallet API Tests
 */

require('dotenv').config();
const CoinPlex = require('../index');

describe('Wallet API', () => {
  let client;

  beforeAll(async () => {
    const config = CoinPlex.loadConfig();
    client = new CoinPlex(config);
    await client.authenticate();
  }, 30000);

  test('should get wallet overview', async () => {
    const overview = await client.wallet.getOverview();
    expect(overview).toBeDefined();
  }, 10000);

  test('should get wallet records', async () => {
    const records = await client.wallet.getRecords({ page: 1, limit: 10 });
    expect(records).toBeDefined();
  }, 10000);

  test('should get recent records', async () => {
    const recent = await client.wallet.getRecentRecords(5);
    expect(recent).toBeDefined();
  }, 10000);

  test('should get USDT balance', async () => {
    const balance = await client.wallet.getCoinBalance('USDT');
    expect(balance).toBeDefined();
  }, 10000);

  test('should get total value', async () => {
    const total = await client.wallet.getTotalValue();
    expect(total).toBeDefined();
  }, 10000);

  test('should get flexible balance', async () => {
    const flexible = await client.wallet.getFlexibleBalance();
    expect(flexible).toBeDefined();
  }, 10000);

  test('should get CPLX balance', async () => {
    const balance = await client.wallet.getCoinBalance('CPLX');
    expect(balance).toBeDefined();
  }, 10000);

  test('should get pending balance', async () => {
    const pending = await client.wallet.getPendingBalance();
    expect(pending).toBeDefined();
  }, 10000);

  test('should check sufficient balance', async () => {
    const hasSufficient = await client.wallet.hasSufficientBalance(1, 'USDT');
    expect(hasSufficient).toBeDefined();
    expect(typeof hasSufficient).toBe('boolean');
  }, 10000);
});