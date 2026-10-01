/**
 * @file otp.util.js
 * @module utils/otp.util
 * @description Utility module for generating cryptographically secure OTP strings.
 */

const crypto = require("crypto");

/**
 * Generates a cryptographically secure mixed alphanumeric OTP.
 *
 * @param {number} [length=6] - Length of the OTP string.
 * @returns {string} Random alphanumeric string containing digits, uppercase and lowercase letters.
 *
 * @example
 * const otp = generateAlphanumericOTP(8);
 * console.log(otp); // e.g. "aZ3F9kL1"
 */
exports.generateAlphanumericOTP = (length = 6) => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let otp = "";
  
  for (let i = 0; i < length; i++) {
    // crypto.randomInt ensures true uniform distribution (unlike Math.random)
    const randomIndex = crypto.randomInt(0, characters.length);
    otp += characters[randomIndex];
  }
  
  return otp;
};