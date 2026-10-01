/**
 * @file otp.route.js
 * @module routes/otpRoutes
 * @description Secure endpoint routing mapping for otp operations.
 */

const express = require('express');
const router = express.Router();
const {
  opaqueAuthMiddleware,
  otpRateLimiter,
} = require('../middlewares/auth.middleware');
const otpController = require('../controllers/otp.controller')

/**
 * @route   POST /api/v1/otp/request-email
 * @access  Public
 */
router.post(
  '/request-email',
  otpRateLimiter,
  otpController.sendVerificationOTP
);

/**
 * @route   POST /api/v1/otp/verify-email
 * @access  Public
 */
router.post('/verify-email', otpController.verifyEmailOTP);

module.exports = router;
