// utils/key.js
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

/**
 * Generate a random 4-digit numeric key as a string (e.g. "4821")
 */
function generateFourDigitKey() {
  return String(Math.floor(1000 + Math.random() * 9000)); // 1000–9999
}

/**
 * Hash the key for storage
 */
async function hashKey(plainKey) {
  return bcrypt.hash(plainKey, SALT_ROUNDS);
}

/**
 * Verify a plain key against a hash
 */
async function verifyKey(plainKey, keyHash) {
  return bcrypt.compare(plainKey, keyHash);
}

module.exports = { generateFourDigitKey, hashKey, verifyKey };
