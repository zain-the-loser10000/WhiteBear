/**
 * @file auth.middleware.js
 * @module middlewares/authMiddleware
 * @description Authentication middleware using opaque tokens and MongoDB session storage.
 */

const rateLimit = require('express-rate-limit');
const AppError = require('../errors/app-error');
const User = require('../models/user.schema');

/**
 * Rate Limiter to stop brute force attempts
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many attempts. Please try again later.', 429));
  },
});

/**
 * Protects routes by validating the client's random opaque token against MongoDB state
 */
exports.opaqueAuthMiddleware = async (req, res, next) => {
  try {
    let opaqueToken = null;
    const authHeader = req.header('Authorization');

    // 1. Extract token from Header or Cookie safely
    if (authHeader?.startsWith('Bearer ')) {
      opaqueToken = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      opaqueToken = req.cookies.accessToken;
    }

    if (!opaqueToken) {
      return next(
        new AppError('Authentication failed: Access token missing.', 401)
      );
    }

    // Validate structural length sanity (Hex string of 16 bytes = 32 chars)
    if (opaqueToken.length !== 32) {
      return next(
        new AppError('Malformed authentication token signature.', 401)
      );
    }

    // 2. Query MongoDB directly for the session
    const dbUser = await User.findOne({ sessionId: opaqueToken }).select(
      '-password -__v'
    );

    if (!dbUser) {
      return next(new AppError('Session has expired or been revoked.', 401));
    }

    // 3. Attach session identity payload onto request stack
    req.user = {
      userId: dbUser._id.toString(), // ✅ "id" → "userId" (controller isse match karta hai)
      fullName: dbUser.fullName,
      email: dbUser.email,
      isEmailVerified: dbUser.isEmailVerified,
      subscriptionPlan: dbUser.subscriptionPlan,
      subscriptionStatus: dbUser.subscriptionStatus,
    };

    next();
  } catch (error) {
    console.error('💥 Auth Middleware Crash:', error.message);
    return next(new AppError('Internal server verification error.', 500));
  }
};

/**
 * Restrict OTP requests to a maximum of 3 requests every 15 minutes per IP
 */
exports.otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: {
    success: false,
    message:
      'Too many OTP verification requests. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});