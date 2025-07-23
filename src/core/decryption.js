/**
 * CoinPlex API Response Decryption Module
 * 
 * Handles RSA and AES decryption of API responses using the exact
 * frontend logic extracted from the CoinPlex web application.
 */

const CryptoJS = require('crypto-js');

// JSEncrypt needs a DOM environment in Node.js
global.window = global.window || {};
global.navigator = global.navigator || { appName: 'Netscape' };
global.document = global.document || { 
  createElement: () => ({ style: {} }),
  head: { appendChild: () => {} }
};

const JSEncrypt = require('jsencrypt');

/**
 * Configuration for decryption operations
 */
const DECRYPTION_CONFIG = {
  // RSA private key extracted from frontend
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAMnobdlsbevAtCpS
6GktlxN+Taoyb+3qDnDR60tjsw41KalL/NwgCqCB1NLPm6UWJlRn7GAmVh0GOFef
7NRs7yBtTgkaK7dbwalbmiaDS63sHgbaDLUpnYA4IhDouQLpzVScKZzM+uHFaLrV
dVx1MOH0sOyXMclFcC8V66BnIZblAgMBAAECgYBKY7plSw/MtnkqxtUeO0/YPMa8
mEyo6X1cj9sTMa5845Vv7LFDIQMJVAxnh1ofHuQMYSWz3ywHEY2cqy2EroYDUqMK
8iXuCxl2Diktd2nI9+5D+bOOlEshjqBEtcv0f+LVgOjNFbpxEx/s/YLGDt8cISyP
1q3srSUr21xoeQfHmQJBAPJcfKdAdvbg24K3uYiYRPLu4BOjS9yRxz4SKmUrgHM3
YtNN/sn7JMdAEyLPVf1D5BPqaJupXYey8EBz0Lv4S8MCQQDVRSlpeUazuJwQPGZQ
m4eouMoyfshG23EeLMms33uCh+R4kzRYSbDDMzwc7Vx6Hl2yiuuuCJYzvjXQ/bfn
jHA3AkBLUpMrJ83RTHDsX006Npi3J6ZcdBPPqT7S+7JRXwO8yynbohHdlEAJ7NAF
sYp3+/GWfvOj7S80TVh9r4Df6nshAkAQmlfE/EoCx8ZuhSU59UG0Yt5q2+/fhEnk
HXx91tAYs1eYA225ydLW/3AYmGnwn9iPg70hSU3YLWCnKnlcr1Q1AkEAsLjQenVE
G1JRISG0EWTnQBXsDg5ACqE2NCaeDXkLKj7LynBmj8ewoMS38cpQco9eDNnEFUSx
3na1KhTGVj3hag==
-----END RSA PRIVATE KEY-----`,
  
  // AES encryption key
  encryptionKey: "$mu%!242:=en",
  
  // RSA block size for chunked decryption
  maxDecryptBlock: 128
};

/**
 * Decrypt RSA-encrypted API response data
 * 
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {number} maxDecryptBlock - Maximum block size for chunked decryption
 * @returns {Object|null} Decrypted and parsed JSON object, or null if failed
 */
function decryptRSAResponse(encryptedData, maxDecryptBlock = DECRYPTION_CONFIG.maxDecryptBlock) {
  try {
    // Create JSEncrypt instance and set the private key
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPrivateKey(DECRYPTION_CONFIG.privateKey);
    
    let decryptedResult;
    
    // Try single block decryption first (most common case)
    decryptedResult = jsEncrypt.decrypt(encryptedData);
    
    if (decryptedResult === false || decryptedResult === null) {
      // If single block fails, try chunked decryption
      // Base64 decode the encrypted data to get raw bytes
      const rawData = Buffer.from(encryptedData, 'base64');
      
      // For RSA 1024-bit, max block size is 128 bytes
      const chunkSize = 128;
      const chunks = [];
      
      // Split raw data into chunks
      for (let i = 0; i < rawData.length; i += chunkSize) {
        const chunk = rawData.slice(i, i + chunkSize);
        chunks.push(chunk.toString('base64'));
      }
      
      const decryptedChunks = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const decryptedChunk = jsEncrypt.decrypt(chunks[i]);
        
        if (decryptedChunk === false || decryptedChunk === null) {
          throw new Error(`Chunk ${i + 1} decryption failed`);
        }
        decryptedChunks.push(decryptedChunk);
      }
      
      decryptedResult = decryptedChunks.join('');
    }
    
    // Check if decryption actually succeeded
    if (!decryptedResult || decryptedResult === false) {
      throw new Error('RSA decryption returned null or false');
    }
    
    // URL decode and handle + characters (exact frontend logic)
    let urlDecoded = decodeURIComponent(decryptedResult.replace(/\+/g, '%20'));
    
    // Parse as JSON
    return JSON.parse(urlDecoded);
    
  } catch (error) {
    console.log('RSA decryption error:', error.message);
    console.log('Input data length:', encryptedData.length);
    console.log('First 100 chars:', encryptedData.substring(0, 100));
    return null;
  }
}

/**
 * Decrypt AES-encrypted string data
 * 
 * @param {string} encryptedData - AES encrypted string
 * @param {string} key - AES encryption key
 * @returns {string|null} Decrypted string, or null if failed
 */
function decryptAESString(encryptedData, key = DECRYPTION_CONFIG.encryptionKey) {
  try {
    // Try direct AES decryption first
    let decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    let result = decrypted.toString(CryptoJS.enc.Utf8);
    
    // If that fails, try treating the input as base64-encoded AES ciphertext
    if (!result) {
      // Convert base64 to CryptoJS format
      const ciphertext = CryptoJS.enc.Base64.parse(encryptedData);
      const decryptedWords = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key);
      result = decryptedWords.toString(CryptoJS.enc.Utf8);
    }
    
    return result || null;
  } catch (error) {
    console.log('AES decryption error:', error.message);
    console.log('Input data length:', encryptedData.length);
    console.log('First 100 chars:', encryptedData.substring(0, 100));
    return null;
  }
}

/**
 * Encrypt string data using AES
 * 
 * @param {string} text - Text to encrypt
 * @param {string} key - AES encryption key
 * @returns {string|null} Encrypted string, or null if failed
 */
function encryptAESString(text, key = DECRYPTION_CONFIG.encryptionKey) {
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.log('AES encryption error:', error.message);
    return null;
  }
}

/**
 * Process API response and attempt decryption
 * 
 * @param {Object} response - Raw API response object
 * @returns {Object} Processed response with decrypted data
 */
function processApiResponse(response) {
  // Return as-is if no encrypted data field
  if (!response.data || typeof response.data !== 'string') {
    return response;
  }
  
  // Try RSA decryption first (most common for API responses)
  const rsaDecrypted = decryptRSAResponse(response.data);
  if (rsaDecrypted) {
    return {
      ...response,
      data: rsaDecrypted,
      _originalEncryptedData: response.data,
      _decryptionMethod: 'RSA'
    };
  }
  
  // Fallback to AES decryption
  const aesDecrypted = decryptAESString(response.data);
  if (aesDecrypted) {
    let parsed;
    try {
      parsed = JSON.parse(aesDecrypted);
    } catch (e) {
      parsed = aesDecrypted; // Return as string if not JSON
    }
    
    return {
      ...response,
      data: parsed,
      _originalEncryptedData: response.data,
      _decryptionMethod: 'AES'
    };
  }
  
  // Return original if decryption fails
  console.log('Failed to decrypt response data');
  return response;
}

module.exports = {
  decryptRSAResponse,
  decryptAESString,
  encryptAESString,
  processApiResponse,
  DECRYPTION_CONFIG
};