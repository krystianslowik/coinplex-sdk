/**
 * Debug Decryption Pipeline
 * 
 * Helps identify where the automatic decryption pipeline breaks
 * by comparing direct decryption vs SDK pipeline decryption.
 */

const CoinPlex = require('../index');
const { processApiResponse, decryptRSAResponse } = require('../src/core/decryption');

// Load environment variables
require('dotenv').config();

// Load configuration from environment variables
const config = CoinPlex.loadConfig();

class DecryptionDebugger {
  async debugDecryptionPipeline() {
    console.log('🔍 Debugging CoinPlex SDK Decryption Pipeline');
    console.log('==============================================\n');

    const client = new CoinPlex(config);
    await client.authenticate();

    // Test with an API call that returns encrypted data
    console.log('📞 Making API call to getIncomeData(7)...');
    
    // Intercept the raw response before automatic processing
    const originalRequest = client.request.bind(client);
    let rawResponse = null;
    
    client.request = async function(endpoint, params, options) {
      const result = await originalRequest.call(this, endpoint, params, options);
      rawResponse = result._originalData || result;
      return result;
    };

    // Make the API call
    const result = await client.income.getIncomeData(7);
    
    console.log('📊 Raw API Response Structure:');
    console.log(JSON.stringify(rawResponse, null, 2));
    
    console.log('\n📊 Final SDK Result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Test direct decryption if we have encrypted data
    if (rawResponse && typeof rawResponse.data === 'string') {
      console.log('\n🔓 Testing Direct Decryption:');
      const directDecrypt = decryptRSAResponse(rawResponse.data);
      console.log('Direct RSA Result:', JSON.stringify(directDecrypt, null, 2));
      
      console.log('\n🔧 Testing processApiResponse:');
      const processedResponse = processApiResponse(rawResponse);
      console.log('Processed Response:', JSON.stringify(processedResponse, null, 2));
    }
    
    // Compare with working decryption test data
    console.log('\n🧪 Testing Known Working Encrypted String:');
    const knownEncrypted = "A0x23rcksUnItY8oafW7hsY4ZNpjbrX1RlJv3dud3fDqtBo0ApLvHYkZ4nijor6qtFEwLJwk8Fj0tOprcrZ2NJJdzYceBRTF50PovZ2L7Q2k/Opp1nPLOSAQAO3GB6W9NGbNo0p7QMKWLh9Oil4UYqKhqXNQaQJyCVVCQi+O4k6KSK8swzhn4xNF/6h6VII09QQ4b4DOmLk7YI+9FhPwKPw1zE0RP6DlSn+bCCSqSgS6C5ssO+xNjNZW0NSh1lphsEFbQiTIWsb8ES09mHnfU7sm7gk9Pv6MLeYr3IpbKD5uciXkvOgFhjr9/eIfk2jrWefOSkxWJi/l21K7BF/8Sg==";
    const knownDecrypted = decryptRSAResponse(knownEncrypted);
    console.log('Known String Decrypts To:', JSON.stringify(knownDecrypted, null, 2));
    
    // Test processApiResponse with mock structures
    console.log('\n🔬 Testing Different Response Structures:');
    
    const testStructures = [
      { data: knownEncrypted },
      { result: { data: knownEncrypted } },
      { data: { encrypted: knownEncrypted } },
      knownEncrypted
    ];
    
    testStructures.forEach((structure, index) => {
      console.log(`\nTest Structure ${index + 1}:`, JSON.stringify(structure).substring(0, 100) + '...');
      const processed = processApiResponse(structure);
      console.log('Processed Result:', processed.data ? 'DECRYPTED' : 'NOT DECRYPTED');
      if (processed._decryptionMethod) {
        console.log('Decryption Method:', processed._decryptionMethod);
      }
    });
  }
}

if (require.main === module) {
  const debug = new DecryptionDebugger();
  debug.debugDecryptionPipeline().catch(console.error);
}

module.exports = DecryptionDebugger;