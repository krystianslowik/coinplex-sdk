/**
 * CoinPlex User API Module
 * 
 * Handles user profile information, settings, and account management.
 */

class UserAPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get personal user information
   * 
   * @returns {Promise<Object>} User profile data
   * @example
   * const profile = await client.user.getProfile();
   * console.log(`User: ${profile.nickname}, Level: ${profile.levelName}`);
   */
  async getProfile() {
    const response = await this.client.request('/api/user/info/personal');
    return response.data;
  }

  /**
   * Get user's current level and rank information
   * 
   * @returns {Promise<Object>} Level information
   */
  async getLevel() {
    const profile = await this.getProfile();
    return {
      level: profile.level,
      levelName: profile.levelName,
      nextLevel: profile.level + 1,
      requirements: {
        totalBalance: profile.totalBalance,
        totalRecharge: profile.totalRecharge,
        totalIncome: profile.totalIncome,
        teamCount: profile.teamCount,
        effectiveCount: profile.effectiveCount
      }
    };
  }

  /**
   * Get user's financial summary
   * 
   * @returns {Promise<Object>} Financial summary
   */
  async getFinancialSummary() {
    const profile = await this.getProfile();
    return {
      totalBalance: parseFloat(profile.totalBalance || '0'),
      totalRecharge: parseFloat(profile.totalRecharge || '0'),
      totalWithdraw: parseFloat(profile.totalWithdraw || '0'),
      totalIncome: parseFloat(profile.totalIncome || '0'),
      flexibleAmount: parseFloat(profile.flexibleAmount || '0'),
      pendingAmount: parseFloat(profile.pendingAmount || '0'),
      experienceGoldAmount: parseFloat(profile.experienceGoldAmount || '0')
    };
  }

  /**
   * Get user's team information
   * 
   * @returns {Promise<Object>} Team statistics
   */
  async getTeamInfo() {
    const profile = await this.getProfile();
    return {
      teamCount: profile.teamCount || 0,
      effectiveCount: profile.effectiveCount || 0,
      oneAddTeamCount: profile.oneAddTeamCount || 0,
      twoThreeAddTeamCount: profile.twoThreeAddTeamCount || 0,
      teamActivityGrowthPercent: profile.teamActivityGrowthPercent || '0',
      teamActivityGrowthPercentBoolean: profile.teamActivityGrowthPercentBoolean || false
    };
  }

  /**
   * Get user's security settings
   * 
   * @returns {Promise<Object>} Security settings
   */
  async getSecuritySettings() {
    const profile = await this.getProfile();
    return {
      hasSetPassword: profile.hasSetPassword || false,
      hasBindGoogleAuth: profile.hasBindGoogleAuth || false,
      hasOpenGoogleAuth: profile.hasOpenGoogleAuth || false,
      identityStatus: profile.identityStatus || -2,
      mobile: profile.mobile,
      mobilePrefix: profile.mobilePrefix,
      email: profile.email
    };
  }

  /**
   * Get user's invite information
   * 
   * @returns {Promise<Object>} Invite code and referral info
   */
  async getInviteInfo() {
    const profile = await this.getProfile();
    return {
      inviteCode: profile.inviteCode,
      registerTime: profile.registerTime,
      teamCount: profile.teamCount || 0
    };
  }

  /**
   * Get user's chat/AI service information
   * 
   * @returns {Promise<Object>} Chat service info
   */
  async getChatInfo() {
    const profile = await this.getProfile();
    return {
      chatCount: profile.chatCount || 0,
      useChatCount: profile.useChatCount || 0,
      hasShowAI: profile.hasShowAI || false,
      remainingChats: (profile.chatCount || 0) - (profile.useChatCount || 0)
    };
  }

  /**
   * Check if user meets requirements for a specific level
   * 
   * @param {number} targetLevel - Target level to check
   * @returns {Promise<Object>} Requirement check results
   */
  async checkLevelRequirements(targetLevel) {
    const profile = await this.getProfile();
    const currentLevel = profile.level || 0;
    
    if (targetLevel <= currentLevel) {
      return {
        eligible: true,
        currentLevel,
        targetLevel,
        message: 'Already at or above target level'
      };
    }
    
    // This is a simplified check - actual requirements would need to be defined
    const requirements = {
      eligible: false,
      currentLevel,
      targetLevel,
      checks: {
        balance: parseFloat(profile.totalBalance || '0'),
        income: parseFloat(profile.totalIncome || '0'),
        team: profile.teamCount || 0
      },
      missing: []
    };
    
    // Add specific requirement checks based on your business logic
    // This is a placeholder implementation
    
    return requirements;
  }

  /**
   * Get user activity summary
   * 
   * @returns {Promise<Object>} User activity data
   */
  async getActivitySummary() {
    const profile = await this.getProfile();
    const financial = await this.getFinancialSummary();
    const team = await this.getTeamInfo();
    
    return {
      profile: {
        userId: profile.userId,
        nickname: profile.nickname,
        level: profile.level,
        levelName: profile.levelName,
        registerTime: profile.registerTime
      },
      financial,
      team,
      lastUpdate: new Date().toISOString()
    };
  }
}

module.exports = UserAPI;