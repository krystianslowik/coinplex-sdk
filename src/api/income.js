/**
 * CoinPlex Income API Module
 * 
 * Handles income tracking, team earnings, and revenue analytics.
 */

class IncomeAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get team income data (new format)
   * 
   * @returns {Promise<Object>} Team income statistics
   * @example
   * const teamIncome = await client.income.getTeamData();
   * console.log(`Team income: ${teamIncome.totalTeamIncome}`);
   */
  async getTeamData() {
    const response = await this.client.request('/api/income/team/dataNew');
    return response.data;
  }

  /**
   * Get income data for specific period
   * 
   * @param {number} [days=1] - Number of days to get income data for
   * @returns {Promise<Object>} Income data for the specified period
   */
  async getIncomeData(days = 1) {
    const response = await this.client.request('/api/income/data', { days });
    return response.data;
  }

  /**
   * Get today's income summary
   * 
   * @returns {Promise<Object>} Today's income breakdown
   */
  async getTodayIncome() {
    return await this.getIncomeData(1);
  }

  /**
   * Get weekly income summary
   * 
   * @returns {Promise<Object>} Weekly income breakdown
   */
  async getWeeklyIncome() {
    return await this.getIncomeData(7);
  }

  /**
   * Get monthly income summary
   * 
   * @returns {Promise<Object>} Monthly income breakdown
   */
  async getMonthlyIncome() {
    return await this.getIncomeData(30);
  }

  /**
   * Get comprehensive income analytics
   * 
   * @returns {Promise<Object>} Complete income analytics
   */
  async getIncomeAnalytics() {
    const [teamData, todayIncome, weeklyIncome, monthlyIncome] = await Promise.all([
      this.getTeamData(),
      this.getTodayIncome(),
      this.getWeeklyIncome(),
      this.getMonthlyIncome()
    ]);

    return {
      team: {
        newMemberCount: teamData.newMemberCount || 0,
        teamCount: teamData.teamCount || 0,
        teamTotalCount: teamData.teamTotalCount || 0,
        teamSumIncomeAmount: parseFloat(teamData.teamSumIncomeAmount || '0'),
        totalTeamIncome: parseFloat(teamData.totalTeamIncome || '0'),
        totalQuantifyAmount: parseFloat(teamData.totalQuantifyAmount || '0'),
        todayTeamIncome: parseFloat(teamData.todayTeamIncome || '0')
      },
      personal: {
        incomeAmount: parseFloat(teamData.incomeAmount || '0'),
        rechargeAmount: parseFloat(teamData.rechargeAmount || '0'),
        withdrawAmount: parseFloat(teamData.withdrawAmount || '0')
      },
      periods: {
        today: todayIncome,
        weekly: weeklyIncome,
        monthly: monthlyIncome
      },
      summary: {
        totalIncome: parseFloat(teamData.totalTeamIncome || '0') + parseFloat(teamData.incomeAmount || '0'),
        netFlow: parseFloat(teamData.rechargeAmount || '0') - parseFloat(teamData.withdrawAmount || '0'),
        teamGrowth: teamData.newMemberCount || 0
      }
    };
  }

  /**
   * Get income trends over time
   * 
   * @param {Array<number>} periods - Array of day periods to compare (e.g., [1, 7, 30])
   * @returns {Promise<Object>} Income trends data
   */
  async getIncomeTrends(periods = [1, 7, 30]) {
    const trends = {};
    
    for (const period of periods) {
      try {
        const data = await this.getIncomeData(period);
        trends[`${period}d`] = data;
      } catch (error) {
        console.log(`Could not fetch ${period}d income data:`, error.message);
        trends[`${period}d`] = null;
      }
    }
    
    return trends;
  }

  /**
   * Calculate income growth rate
   * 
   * @param {number} [compareDays=7] - Days to compare against
   * @returns {Promise<Object>} Growth rate calculation
   */
  async getIncomeGrowthRate(compareDays = 7) {
    try {
      const [current, previous] = await Promise.all([
        this.getIncomeData(1),
        this.getIncomeData(compareDays)
      ]);
      
      const currentAmount = this._extractIncomeAmount(current);
      const previousAmount = this._extractIncomeAmount(previous);
      
      if (previousAmount === 0) {
        return {
          growthRate: currentAmount > 0 ? 100 : 0,
          currentAmount,
          previousAmount,
          period: compareDays,
          message: previousAmount === 0 ? 'No previous income data' : 'Normal growth'
        };
      }
      
      const growthRate = ((currentAmount - previousAmount) / previousAmount) * 100;
      
      return {
        growthRate: Math.round(growthRate * 100) / 100,
        currentAmount,
        previousAmount,
        period: compareDays,
        trend: growthRate > 0 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable'
      };
      
    } catch (error) {
      return {
        error: error.message,
        growthRate: 0,
        currentAmount: 0,
        previousAmount: 0
      };
    }
  }

  /**
   * Get team performance metrics
   * 
   * @returns {Promise<Object>} Team performance data
   */
  async getTeamPerformance() {
    const teamData = await this.getTeamData();
    
    const performance = {
      teamSize: {
        total: teamData.teamTotalCount || 0,
        active: teamData.teamCount || 0,
        new: teamData.newMemberCount || 0,
        growth: teamData.teamCount > 0 ? (teamData.newMemberCount / teamData.teamCount * 100) : 0
      },
      income: {
        total: parseFloat(teamData.totalTeamIncome || '0'),
        today: parseFloat(teamData.todayTeamIncome || '0'),
        average: teamData.teamCount > 0 ? parseFloat(teamData.totalTeamIncome || '0') / teamData.teamCount : 0
      },
      activity: {
        quantifyAmount: parseFloat(teamData.totalQuantifyAmount || '0'),
        averagePerMember: teamData.teamCount > 0 ? parseFloat(teamData.totalQuantifyAmount || '0') / teamData.teamCount : 0
      }
    };
    
    // Calculate performance ratings
    performance.ratings = {
      teamGrowth: this._calculateRating(performance.teamSize.growth, [0, 5, 10, 20]),
      incomePerformance: this._calculateRating(performance.income.today, [0, 10, 50, 100]),
      teamActivity: this._calculateRating(performance.activity.averagePerMember, [0, 10, 50, 100])
    };
    
    return performance;
  }

  /**
   * Extract income amount from income data response
   * 
   * @private
   * @param {Object} incomeData - Income data response
   * @returns {number} Extracted income amount
   */
  _extractIncomeAmount(incomeData) {
    // This method handles different response formats
    if (typeof incomeData === 'string') {
      return 0; // Encrypted or invalid response
    }
    
    if (incomeData && typeof incomeData === 'object') {
      return parseFloat(incomeData.amount || incomeData.income || incomeData.total || '0');
    }
    
    return 0;
  }

  /**
   * Calculate performance rating based on thresholds
   * 
   * @private
   * @param {number} value - Value to rate
   * @param {Array<number>} thresholds - Rating thresholds [poor, fair, good, excellent]
   * @returns {string} Performance rating
   */
  _calculateRating(value, thresholds) {
    if (value >= thresholds[3]) return 'excellent';
    if (value >= thresholds[2]) return 'good';
    if (value >= thresholds[1]) return 'fair';
    return 'poor';
  }
}

module.exports = IncomeAPI;