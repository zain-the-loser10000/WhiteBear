
/**
 * @file password.helper.js
 * @module helpers/passwordHelper
 * @description Provides functions for validating password strength, hashing passwords, and comparing plaintext passwords to hashed versions using bcrypt.
 */

const bcrypt = require("bcrypt");

/**
 * Regex for strong password validation
 * Requires: min 6 chars, uppercase, lowercase, number, special character
 */
exports.passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/;

/**
 * Validate password strength 
 */
exports.validatePasswordStrength = (password) => {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password must be a non-empty string" };
  }

  if (!exports.passwordRegex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 6 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
    };
  }

  return { valid: true, message: "Password meets strength requirements" };
};

/** Recommended bcrypt salt rounds */
const SALT_ROUNDS = 12;

/**
 * Hash a password with bcrypt 
 */
exports.hashPassword = async (password) => {
  if (!password) throw new Error("Password is required for hashing");
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plaintext password against hashed version 
 */
exports.comparePassword = async (plain, hashed) => {
  if (!plain || !hashed) return false;
  return bcrypt.compare(plain, hashed);
};
