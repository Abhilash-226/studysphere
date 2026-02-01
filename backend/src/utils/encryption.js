const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-cbc';
// Key must be 32 bytes (64 hex characters)
const key = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, 'hex');
const ivLength = 16; // AES block size

/**
 * Encrypts a string using AES-256-CBC
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text in format "iv:encryptedData"
 */
const encrypt = (text) => {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback: return original text if encryption fails
    return text;
  }
};

/**
 * Decrypts a string using AES-256-CBC
 * @param {string} text - The encrypted text in format "iv:encryptedData"
 * @returns {string} - The decrypted text
 */
const decrypt = (text) => {
  if (!text) return text;
  
  try {
    const textParts = text.split(':');
    
    // Check if text matches the encrypted format (iv:content)
    // If not, assume it's legacy plain text and return as is
    if (textParts.length !== 2 || textParts[0].length !== 32) {
      return text;
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    // If decryption fails (e.g. wrong key or not actually encrypted), 
    // return original text to be safe/compatible
    return text;
  }
};

module.exports = { encrypt, decrypt };
