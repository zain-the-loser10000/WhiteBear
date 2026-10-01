/**
 * @file otp.controller.js
 * @module controllers/otpController
 * @description Handles OTP generation, verification, and management for user authentication
 */

const crypto = require('crypto');
const AppError = require('../errors/app-error');
const { generateAlphanumericOTP } = require('../utils/otp.util');
const emailUtil = require('../utils/email.util');
const User = require('../models/user.schema');

/**
 * @description Generate and send a 6-digit alphanumeric OTP to user's email
 * @access Public
 */
exports.sendVerificationOTP = async (req, res, next) => {
  try {
    let email;

    // Get email from authenticated user or request body
    if (req.user && req.user.email) {
      email = req.user.email;
    } else {
      email = req.body.email?.trim().toLowerCase();
    }

    if (!email) {
      return next(
        new AppError(
          'Please provide a valid email address to request an OTP.',
          400
        )
      );
    }

    // Find user directly from MongoDB
    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError('No user account associated with this email address.', 404)
      );
    }

    // Generate OTP
    const plainOTP = generateAlphanumericOTP(6);

    // Hash OTP for secure storage
    const hashedOTP = crypto
      .createHash('sha256')
      .update(plainOTP)
      .digest('hex');

    // Store verification data directly on the User document
    user.emailVerificationToken = hashedOTP;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email
    const emailSent = await emailUtil.sendEmailVerificationOtp(
      email,
      user.fullName,
      plainOTP
    );

    if (!emailSent) {
      // Rollback on email failure
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();
      return next(
        new AppError('Email delivery failed. Please try again.', 500)
      );
    }

    return res.status(200).json({
      success: true,
      message:
        '6-digit code has been sent to your email & dont forget to check Your SPAM in your gmail!',
    });
  } catch (error) {
    console.error('💥 Send OTP Controller Crash: ', error.message);
    return next(new AppError('Failed to send verification code.', 500));
  }
};

/**
 * @description Verify email address using the alphanumeric OTP
 * @access Public
 */
exports.verifyEmailOTP = async (req, res, next) => {
  try {
    const { otp, email: bodyEmail } = req.body;
    const providedEmail = bodyEmail?.trim().toLowerCase() || req.user?.email;

    if (!otp) {
      return next(
        new AppError('Please provide the 6-digit verification code.', 400)
      );
    }

    if (!providedEmail) {
      return next(
        new AppError('Email address is required for verification.', 400)
      );
    }

    // Hash the incoming OTP
    const hashedIncomingOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // 🔥 Fetch user directly from MongoDB
    const user = await User.findOne({ email: providedEmail });
    if (!user) {
      return next(new AppError('Invalid or expired verification code.', 400));
    }

    console.log('🔍 Fresh Data from MongoDB:', user);

    // Validate OTP and expiration
    if (
      user.emailVerificationToken !== hashedIncomingOTP ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < Date.now()
    ) {
      return next(new AppError('Invalid or expired verification code.', 400));
    }

    // Mark as verified and clear verification fields
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    console.error('💥 Verify OTP Controller Crash: ', error.message);
    return next(new AppError('Verification failed. Please try again.', 500));
  }
};
