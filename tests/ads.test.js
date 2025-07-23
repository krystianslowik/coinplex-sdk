/**
 * CoinPlex SDK Ads API Tests
 */

require('dotenv').config();
const CoinPlex = require('../index');

describe('Ads API', () => {
  let client;

  beforeAll(async () => {
    const config = CoinPlex.loadConfig();
    client = new CoinPlex(config);
    await client.authenticate();
  }, 30000);

  test('should get ads list for home position', async () => {
    const homeAds = await client.ads.getList('home');
    expect(homeAds).toBeDefined();
  }, 10000);

  test('should get ads list for wallet position', async () => {
    const walletAds = await client.ads.getList('wallet');
    expect(walletAds).toBeDefined();
  }, 10000);

  test('should get CPLX node ads', async () => {
    const nodeAds = await client.ads.getCPLXNodeAds();
    expect(nodeAds).toBeDefined();
  }, 10000);

  test('should get all ads for multiple positions', async () => {
    const positions = ['home', 'wallet', 'financial'];
    const allAds = await client.ads.getAllAds(positions);
    expect(allAds).toBeDefined();
  }, 10000);

  test('should check if ads exist for home position', async () => {
    const hasAds = await client.ads.hasAds('home');
    expect(hasAds).toBeDefined();
    expect(typeof hasAds).toBe('boolean');
  }, 10000);

  test('should get ad stats for multiple positions', async () => {
    const positions = ['home', 'wallet', 'financial'];
    const adStats = await client.ads.getAdStats(positions);
    expect(adStats).toBeDefined();
  }, 10000);
});