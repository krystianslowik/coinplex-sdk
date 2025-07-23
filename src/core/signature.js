/**
 * CoinPlex API Signature Calculation Module
 * 
 * Handles HMAC-SHA256 signature generation for API authentication
 * following the exact algorithm used by the CoinPlex platform.
 */

const crypto = require('crypto');

/**
 * Calculate HMAC-SHA256 signature for API request
 * 
 * Algorithm:
 * 1. Sort all parameters alphabetically by key
 * 2. Create signature base string: key1=value1&key2=value2&...
 * 3. Calculate HMAC-SHA256 with the provided secret
 * 4. Return hex-encoded signature
 * 
 * @param {Object} data - Request parameters object
 * @param {string} secret - API secret key for HMAC calculation
 * @returns {string} Hex-encoded HMAC-SHA256 signature
 */
function calculateSignature(data, secret) {
  // Sort parameter keys alphabetically
  const sortedKeys = Object.keys(data).sort();
  
  // Build signature base string
  let signatureBase = "";
  sortedKeys.forEach((key, index) => {
    if (index > 0) signatureBase += "&";
    signatureBase += `${key}=${data[key]}`;
  });
  
  // Calculate HMAC-SHA256
  return crypto.createHmac('sha256', secret)
    .update(signatureBase)
    .digest('hex');
}

/**
 * Prepare request payload with required parameters and signature
 * 
 * @param {Object} customParams - Custom parameters for the request
 * @param {string} apiKey - API key
 * @param {string} apiSecret - API secret for signature calculation
 * @returns {Object} Complete payload with signature
 */
function prepareSignedPayload(customParams = {}, apiKey, apiSecret) {
  const payload = { ...customParams };
  
  // Add required parameters if not present
  if (!payload.timestamp) {
    payload.timestamp = new Date().getTime();
  }
  
  if (!payload.apiKey) {
    payload.apiKey = apiKey;
  }
  
  // Remove empty/null/undefined values
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
      delete payload[key];
    }
  });
  
  // Calculate and add signature
  payload.sign = calculateSignature(payload, apiSecret);
  
  return payload;
}

/**
 * Verify signature of a received payload
 * 
 * @param {Object} payload - Payload to verify (must include 'sign' field)
 * @param {string} secret - API secret for verification
 * @returns {boolean} True if signature is valid
 */
function verifySignature(payload, secret) {
  if (!payload.sign) {
    return false;
  }
  
  const receivedSignature = payload.sign;
  const payloadWithoutSignature = { ...payload };
  delete payloadWithoutSignature.sign;
  
  const calculatedSignature = calculateSignature(payloadWithoutSignature, secret);
  
  return receivedSignature === calculatedSignature;
}

module.exports = {
  calculateSignature,
  prepareSignedPayload,
  verifySignature
};