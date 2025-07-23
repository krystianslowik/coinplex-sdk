/**
 * CoinPlex SDK Income API Tests
 */

require('dotenv').config();
const CoinPlex = require('../index');

describe('Income API', () => {
  let client;

  beforeAll(async () => {
    const config = CoinPlex.loadConfig();
    client = new CoinPlex(config);
    await client.authenticate();
  }, 30000);

  test('should get team data', async () => {
    const teamData = await client.income.getTeamData();
    expect(teamData).toBeDefined();
  }, 10000);

  test('should get income data for 7 days', async () => {
    const incomeData = await client.income.getIncomeData(7);
    expect(incomeData).toBeDefined();
  }, 10000);

  test('should get income data for 30 days', async () => {
    const incomeData = await client.income.getIncomeData(30);
    expect(incomeData).toBeDefined();
  }, 10000);

  test('should get today income', async () => {
    const todayIncome = await client.income.getTodayIncome();
    expect(todayIncome).toBeDefined();
  }, 10000);

  test('should get weekly income', async () => {
    const weeklyIncome = await client.income.getWeeklyIncome();
    expect(weeklyIncome).toBeDefined();
  }, 10000);

  test('should get monthly income', async () => {
    const monthlyIncome = await client.income.getMonthlyIncome();
    expect(monthlyIncome).toBeDefined();
  }, 10000);

  test('should get income analytics', async () => {
    const analytics = await client.income.getIncomeAnalytics();
    expect(analytics).toBeDefined();
  }, 10000);

  test('should get income trends', async () => {
    const trends = await client.income.getIncomeTrends([7, 30]);
    expect(trends).toBeDefined();
  }, 10000);

  test('should get income growth rate', async () => {
    const growthRate = await client.income.getIncomeGrowthRate(7);
    expect(growthRate).toBeDefined();
  }, 10000);

  test('should get team performance', async () => {
    const teamPerformance = await client.income.getTeamPerformance();
    expect(teamPerformance).toBeDefined();
  }, 10000);
});