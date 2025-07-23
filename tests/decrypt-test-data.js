/**
 * Decrypt Test Data Script
 * 
 * Decodes all the encrypted strings from the comprehensive test results
 * to reveal the actual data behind the encrypted responses.
 */

const { decryptRSAResponse, decryptAESString } = require('../src/core/decryption');
const fs = require('fs');
const path = require('path');

class TestDataDecryptor {
  constructor() {
    this.decryptedData = {};
  }

  /**
   * Attempt to decrypt data using both RSA and AES methods
   */
  attemptDecryption(encryptedString, label) {
    console.log(`\n🔓 Decrypting: ${label}`);
    console.log(`📝 Original: ${encryptedString.substring(0, 100)}...`);

    // Try RSA first
    const rsaResult = decryptRSAResponse(encryptedString);
    if (rsaResult) {
      console.log(`✅ RSA Decryption Success:`);
      console.log(JSON.stringify(rsaResult, null, 2));
      this.decryptedData[label] = {
        method: 'RSA',
        decrypted: rsaResult,
        original: encryptedString
      };
      return rsaResult;
    }

    // Try AES
    const aesResult = decryptAESString(encryptedString);
    if (aesResult) {
      console.log(`✅ AES Decryption Success:`);
      try {
        const parsed = JSON.parse(aesResult);
        console.log(JSON.stringify(parsed, null, 2));
        this.decryptedData[label] = {
          method: 'AES',
          decrypted: parsed,
          original: encryptedString
        };
        return parsed;
      } catch (e) {
        console.log(aesResult);
        this.decryptedData[label] = {
          method: 'AES',
          decrypted: aesResult,
          original: encryptedString
        };
        return aesResult;
      }
    }

    console.log(`❌ Both RSA and AES decryption failed`);
    this.decryptedData[label] = {
      method: 'failed',
      decrypted: null,
      original: encryptedString,
      error: 'Both decryption methods failed'
    };
    return null;
  }

  /**
   * Decrypt all known encrypted strings from the test report
   */
  decryptTestData() {
    console.log('🔐 CoinPlex SDK - Test Data Decryption');
    console.log('=====================================\n');

    // Financial View encrypted response
    const financialView = "SZxLzkhCwbXGzG6PPzyH7QJrhCrFI4PiX33WNt9sHbilQ1+4GRZF7Vp8TvtTO6aIxckfjZAi+De9WoXMeS14lAiVAqH34+p8jZ9VCli6MoNM1GtE1kJvLHvQAldN1xlsvLqcI0gCQ7IhOuwkXigQPmPbCzYal7ibrDMYlStQ1St0g/oep6aOAjJJXhz5D1kxLX+QkJp1dqIlt8LXgi1eI37uwfV3/df2Fi+24iGXqAs7Lca/XRHpmprs1Tv2jCk25Yvs/dYXcXTs/ea3oag1u5KvusIpDzGYnmA6EXeO/jGhEewB2Vls8Y8Bpj7uus4z//RqDQFRx92uBkehjJ9uvg==";
    this.attemptDecryption(financialView, 'Financial View');

    // Income Data - 7 days
    const income7d = "A0x23rcksUnItY8oafW7hsY4ZNpjbrX1RlJv3dud3fDqtBo0ApLvHYkZ4nijor6qtFEwLJwk8Fj0tOprcrZ2NJJdzYceBRTF50PovZ2L7Q2k/Opp1nPLOSAQAO3GB6W9NGbNo0p7QMKWLh9Oil4UYqKhqXNQaQJyCVVCQi+O4k6KSK8swzhn4xNF/6h6VII09QQ4b4DOmLk7YI+9FhPwKPw1zE0RP6DlSn+bCCSqSgS6C5ssO+xNjNZW0NSh1lphsEFbQiTIWsb8ES09mHnfU7sm7gk9Pv6MLeYr3IpbKD5uciXkvOgFhjr9/eIfk2jrWefOSkxWJi/l21K7BF/8Sg==";
    this.attemptDecryption(income7d, 'Income Data - 7 Days');

    // Income Data - 30 days
    const income30d = "K81qIglnLtM8NpxySMfPXJvELi7aUT/9xHWRp6r7uE0J3ZENltgQPTICWXwz0Lrqh7eps0sC4M0YtbnP1itMmPJR+DoqBjvMfAqRqnMrPPTBMaGg1N4lpPVrIMVep+4gCjCRnFi5aHnZR1kDlQGlrfzy59+vtEK3BVXmpA7s5NgXDzSbFfAy+lPIiligXiHE2XTRBS+o/EZq689qJ5Kfig3cUQKfTKiWKTeFBJ+VX7vKKO9emgJ2SIp/BW0rYYC+IDJMB2x98QG2xIWTnHN4l3mZ5VLa6oE/AbONyvzL6voJlSPkGXsaRQiWC41XQmlqURBxBFyRC5ow8qGFB7ED3g==";
    this.attemptDecryption(income30d, 'Income Data - 30 Days');

    // Today's Income
    const todayIncome = "o3/OitaYlNZRdps+4m2n+w8LyhTlrDOXFcxhNyNUUaPz0VFTi8v0bMAZrjGLtvUcYiGhpASxQQ8ySEZTZekkK57EQuQn2PDflLuyzgtoOLWinUtAtFNwRpJTZdjAqe+qqcwN4REoWHzeW8Pd2ZaKQGvHN4aJRiPfTZwm/WAATTt2XA9YgI/HaTuKn/TdQA4ZYRqlWxU/dyMq7R/2A7OFvzKAIKBgChMVu/2MWD+MtDDfOPwMEGJboNwgh1dJ1eoZDF77bJTQgmN05IIvAbD4/QtjM3/FX1pfaIjq8af11xcWpdfOKhoYZo0KbUxnHvcw4208M8va2xL1bkIxAvgUvw==";
    this.attemptDecryption(todayIncome, 'Today Income');

    // Weekly Income
    const weeklyIncome = "B5ImNwHZNyW9589Ll/+ydBfH5lzbjvynEuq9QNyyS2eAEccZkQlaRlzoF2ieyCi1PvbKQU32+jz9jPAzPmGu/fytakhEv4Zw2JKJk5vM4V/k9xv5JAQz5Nn+KfU3lWSAtIE/67pnv4N8dbhGUguqakpHt9y8ExaciOwmWt1OiGhutTYkayjhKFzg96K+EFOe9IX078mbKLDu4lZ38QbYBSFWx3U1pDFoX1N3lGWa1T0wLuNioKKBWjCmeIW6vW9QXtwivJCt7KEWDjAGfRiXF35YdsKnvibeY9ByEbojziEqPAqrPGIqFUkWs27x6lJk3WMoXDQLTc4uue7rNMumWg==";
    this.attemptDecryption(weeklyIncome, 'Weekly Income');

    // Monthly Income
    const monthlyIncome = "LUEzGhwlcoTMv+gaD28FMgDmt4Cmeb1luEDPXwevnWvnx82GViQdja/61o12zanKXncvZlVOfXrnZBA5AmN26+qwcGk5guLBgLinkt889MI0Fv+Xidm2nK/Oxw3QEsW/Ay8Esc2JrH943Nm2ktnxWfwsMnbvp8QxIZmjpdVULKeqTQfUbNJqNw1DMYgrp4OZpdnVW9Fa3LydqdV+89YhEA4RglwKxuieIi4nYfEJhVtQen/VMLZjRPXjd5G3LBi1988uM/3V3O2PN0xe7Ge9RN7mSHi9U3n9UX1HezcY7Vtvj4WGD1184CNxV92xuXiLEmVXCfjopwomzwYUa69USg==";
    this.attemptDecryption(monthlyIncome, 'Monthly Income');

    // Income Analytics encrypted periods
    const analyticsToday = "oZvoex06W3oj6/+XfCBDYYCKyTDSYQya4Sr0Jqpty78MBMj0yCRTkOI6gyTaJ/wQ0IkC4MlQzbKr+IUr7MfZ/Rog4Ck8FKj+RXcn/Jx+twR7yM25+DH0qiLJq1wFB0DmdUzDbhQkbgS6J2M0+7d4oH6j52A+tF4JwCcU4nbmLFEyPnKRyiuxUm9bnmkP7UoDvTpjzvhoy7kQox1ipwNIIqiOAGYhU6IGhnQK2z3iTa+L4ObCTMkJsMZAzfZBqW45YWo/gTa9oQVZNwIeP79Fn8a9BnK7qvRIK9AgJjVviVOEm2w0R6VwJbYMFRkXCXGiM/slxed7bjpMd+p815dBgg==";
    this.attemptDecryption(analyticsToday, 'Income Analytics - Today');

    const analyticsWeekly = "Z6DIzZ2ak/5blJlhvXlf3F1QTkJNzA9QDk91bfGpw4LsNu3VoRz/g9So9Ku9gtWbX2QswYyp1wwStaTyo3gt9Ay2O6icBHys7OU7D9cI90rtJ3ybGqqLxEbpRlb/PQ0zzM9tERslzmDmYyNkyYgaBem2bEf5lOnQDbG5aJlEeCusRICuGEfQOWgHGl4TaQK1T0H3NcPEbOXvU5q+6kBbZH6cAoqpFU7aHjLAPTf6zMCX9I7RRCyKYPhWriq8VkcAxe5q9R6xdS0l8UaUxbbZpUDTTvaS8THkk0w3pbXDeQAoQPRuGfqPVAUS+wOzqkQ90H8zPpULi8II54J6N3Unkw==";
    this.attemptDecryption(analyticsWeekly, 'Income Analytics - Weekly');

    const analyticsMonthly = "itvxoNfHbRzwOK5xPVTZa2xFqjImQ1mSpkw1sinTyjloaYXdeBs7fc8u/POYFBFsRCKyD3NoNw47N+b75B+fYkKFYn/WYb6Jn/Zw9OVNXpSPoMeayrsbNcNq/RuQ90d/8oZU3B0bxQtcwJmlHRYUYRgzpM+DL90wOUEft9axnQcbVPlu/ignM3MTeUECXhfYtB2hjXb4Vo41Q+QLrNMRcJ6oBeB7c6U3ZcVr4XWYBAHUtL5910AQ6qu2SqRBwyoiM8bhmPebj+2vyjxB4Wug+aOfmNcdVF+ksEgzrTP/8W4okgl1mRJvUGeRCoC1QHpRMYTTgkOynqxQKZxPHj4yFg==";
    this.attemptDecryption(analyticsMonthly, 'Income Analytics - Monthly');

    // Income Trends
    const trends7d = "K0mgWpuSkH7g2A43HRwfYbQ5FJYZ+Trg+iNQm1tE6X1hbyz0rmdu8WN13RBQLa6D/N0s+sy27CfiOndvhboUnSM+kNdiTHYUzGTFTtVV9/wTs1ER81KFGMfWnzpUS1lzKnHrfawSJR+5c657KF69cXb7wBwhpWNuQpxFPlgXaToD36jYaAnyUEWtBK0XG/sFrHCSydEU4cEabPY7F/OGMNyVVNYqdEWM5MfIA+pc8Nh8ArY9ARGK3hg4L/MsEgyCUu9hMtUvUKXUs7p8YZQznHNzR1IgK/r+KGdQ81dAABSvE70SjQLzQ4XIcySOxlzABkJoQPg/hIoHrtz16GgwmQ==";
    this.attemptDecryption(trends7d, 'Income Trends - 7 Days');

    const trends30d = "geSDBErTrtQNGAOIIe+SMp3PGXfQ4CKTci+0+k1QnuvcW7SReWl23RH/ic2bLQkTOWbnqgkGvtmX70rCBMQ6XCLCKpNd9IOc/CoxVrKvNWCsSLdmwMeEUSFJ9pFx5DoMJgyX9p21hHgLhv4c0nrnnO1uqJnYQAqSk2qoSBQxD/NbPXfiEPMUqVFrQqaw9oUKgCd6f0Nabs4RNJXKtsVM0lsu3FNHOjIptU88PIAkQ8kerTFTIKPyrwQsHuLKX5APRSOmxCzJNpqexmW1v/xpKiH/AXxbn9TcfSczX0DA1F5znuq24X5rvD1mmQHQECBMEJtDHZEPaJduflyAvVDg9A==";
    this.attemptDecryption(trends30d, 'Income Trends - 30 Days');
  }

  /**
   * Save decrypted data to a file for further analysis
   */
  saveResults() {
    const outputPath = path.join(__dirname, 'decrypted-data.json');
    const report = {
      timestamp: new Date().toISOString(),
      totalDecrypted: Object.keys(this.decryptedData).length,
      successful: Object.values(this.decryptedData).filter(d => d.method !== 'failed').length,
      failed: Object.values(this.decryptedData).filter(d => d.method === 'failed').length,
      data: this.decryptedData
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 DECRYPTION SUMMARY');
    console.log('=====================');
    console.log(`✅ Successfully decrypted: ${report.successful}`);
    console.log(`❌ Failed to decrypt: ${report.failed}`);
    console.log(`📄 Full report saved to: ${outputPath}`);
  }

  /**
   * Run the complete decryption process
   */
  run() {
    this.decryptTestData();
    this.saveResults();
  }
}

// Run if executed directly
if (require.main === module) {
  const decryptor = new TestDataDecryptor();
  decryptor.run();
}

module.exports = TestDataDecryptor;