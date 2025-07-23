/**
 * CoinPlex SDK User API Tests
 */

require('dotenv').config();
const CoinPlex = require('../index');

describe('User API', () => {
  let client;

  beforeAll(async () => {
    const config = CoinPlex.loadConfig();
    client = new CoinPlex(config);
    await client.authenticate();
  }, 30000);

  test('should get user profile', async () => {
    const profile = await client.user.getProfile();
    expect(profile).toBeDefined();
  }, 10000);

  test('should get user level', async () => {
    const level = await client.user.getLevel();
    expect(level).toBeDefined();
  }, 10000);

  test('should get financial summary', async () => {
    const summary = await client.user.getFinancialSummary();
    expect(summary).toBeDefined();
  }, 10000);

  test('should get team info', async () => {
    const team = await client.user.getTeamInfo();
    expect(team).toBeDefined();
  }, 10000);

  test('should get security settings', async () => {
    const security = await client.user.getSecuritySettings();
    expect(security).toBeDefined();
  }, 10000);

  test('should get invite info', async () => {
    const invite = await client.user.getInviteInfo();
    expect(invite).toBeDefined();
  }, 10000);

  test('should get chat info', async () => {
    const chat = await client.user.getChatInfo();
    expect(chat).toBeDefined();
  }, 10000);

  test('should check level requirements', async () => {
    const requirements = await client.user.checkLevelRequirements(2);
    expect(requirements).toBeDefined();
  }, 10000);

  test('should get activity summary', async () => {
    const activity = await client.user.getActivitySummary();
    expect(activity).toBeDefined();
  }, 10000);
});