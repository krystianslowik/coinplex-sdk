/**
 * CoinPlex SDK Financial API Tests
 */

require('dotenv').config();
const CoinPlex = require('../index');

describe('Financial API', () => {
  let client;

  beforeAll(async () => {
    const config = CoinPlex.loadConfig();
    client = new CoinPlex(config);
    await client.authenticate();
  }, 30000);

  test('should get financial view', async () => {
    const view = await client.financial.getView();
    expect(view).toBeDefined();
  }, 10000);

  test('should get all products', async () => {
    const products = await client.financial.getAllProducts(['1', '2', '3']);
    expect(products).toBeDefined();
  }, 10000);

  test('should get best products', async () => {
    const best = await client.financial.getBestProducts(100);
    expect(best).toBeDefined();
  }, 10000);

  test('should get product detail', async () => {
    const detail = await client.financial.getProductDetail('1');
    expect(detail).toBeDefined();
  }, 10000);

  test('should check investment eligibility', async () => {
    const eligible = await client.financial.checkInvestmentEligibility('1');
    expect(eligible).toBeDefined();
  }, 10000);

  test('should get investment capacity', async () => {
    const capacity = await client.financial.getInvestmentCapacity('1');
    expect(capacity).toBeDefined();
  }, 10000);
});