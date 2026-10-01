/**
 * @file password.service.js
 * @module services/passwordService
 * @description Handles password reset operations with AES-256-GCM encryption and JWT validation
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AppError = require('../errors/app-error');
const {
  validatePasswordStrength,
  hashPassword,
} = require('../helpers/password.helper');

// Validate required secret and ensure it is cryptographically optimal for AES-256
if (!process.env.PASSWORD_RESET_SECRET) {
  throw new Error('Missing PASSWORD_RESET_SECRET in environment variables.');
}
if (process.env.PASSWORD_RESET_SECRET.length !== 64) {
  throw new Error(
    'PASSWORD_RESET_SECRET must be exactly 64 hex characters (32 bytes) for AES-256-GCM.'
  );
}

const SECRET = process.env.PASSWORD_RESET_SECRET;
const SECRET_BUFFER = Buffer.from(SECRET, 'hex');

/**
 * Encrypt data using AES-256-GCM
 */
const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', SECRET_BUFFER, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    ciphertext: encrypted.toString('hex'),
    authTag: authTag.toString('hex'),
  };
};

/**
 * Decrypt AES-256-GCM encrypted payload
 */
const decrypt = (payload) => {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    SECRET_BUFFER,
    Buffer.from(payload.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};

/**
 * Generate encrypted password reset token (AES-256-GCM + JWT)
 */
const generateResetToken = (payload, expiresIn = '1h') => {
  const token = jwt.sign(payload, SECRET, {
    algorithm: 'HS256',
    expiresIn,
  });

  const encrypted = encrypt(token);
  return Buffer.from(JSON.stringify(encrypted)).toString('base64url');
};

/**
 * Verify and decode encrypted password reset token
 */
const verifyResetToken = (token) => {
  try {
    if (!token) {
      throw new AppError('Reset token is missing.', 400);
    }

    const encryptedPayload = JSON.parse(
      Buffer.from(token, 'base64url').toString()
    );

    // Structural guard check before feeding inputs directly to buffers
    if (
      !encryptedPayload.iv ||
      !encryptedPayload.ciphertext ||
      !encryptedPayload.authTag
    ) {
      throw new AppError('Malformed reset token structural signature.', 400);
    }

    const decrypted = decrypt(encryptedPayload);
    return jwt.verify(decrypted, SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    // If it's already an AppError, rethrow it; otherwise map to standard token validation error
    if (err instanceof AppError) throw err;
    throw new AppError(
      'The reset token is invalid, tampered with, or has expired.',
      400
    );
  }
};

/**
 * Perform secure password reset on user document 
 */
const resetUserPassword = async (userDoc, newPassword) => {
  // Use the strength helper for comprehensive rule reporting instead of a raw regex check
  const strengthCheck = validatePasswordStrength(newPassword);
  if (!strengthCheck.valid) {
    throw new AppError(strengthCheck.message, 400);
  }

  const isSame = await bcrypt.compare(newPassword, userDoc.password);
  if (isSame) {
    throw new AppError(
      'Your new password cannot be the same as your old password.',
      400
    );
  }

  // Update properties cleanly on the mongoose object instance
  userDoc.password = await hashPassword(newPassword);
  userDoc.passwordChangedAt = new Date();

  // Rotates application-wide sessions to log out user completely across other devices/browsers
  userDoc.sessionId = crypto.randomBytes(32).toString('hex');

  await userDoc.save();
};

module.exports = {
  generateResetToken,
  verifyResetToken,
  resetUserPassword,
};
