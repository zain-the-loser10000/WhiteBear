/**
 * @file user.controller.js
 * @module controllers/userController
 * @description Controller for user authentication, profile management, and billing state distribution
 */
const crypto = require('crypto');
const User = require('../models/user.schema');
const AppError = require('../errors/app-error');
const { hashPassword, comparePassword } = require('../helpers/password.helper');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinary.util');

const Goals = require('../models/goal.schema');
const Habits = require('../models/habit.schema');
const Todos = require('../models/todo.schema');
const Journals = require('../models/journal.schema');
const Analytics = require('../models/analytic.schema');

/**
 * @description Register a new user
 * @access Public
 */
exports.registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, isTermCondition } = req.body;

    // Check for required fields including terms acceptance
    if (!fullName || !email || !password || !isTermCondition) {
      return next(
        new AppError(
          'Please provide fullName, email and password, isTermCondition',
          400
        )
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return next(
        new AppError('An account with this email address already exists.', 400)
      );
    }

    const hashedPassword = await hashPassword(password);

    let profilePicture = null;
    if (req.files?.profilePicture?.[0]) {
      const result = await uploadToCloudinary(
        req.files.profilePicture[0],
        'profilePicture'
      );
      profilePicture = result.url;
    }

    // Create user in MongoDB
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 15);

    const newUser = await User.create({
      profilePicture,
      fullName,
      isTermCondition: true, // Explicitly set to true since we validated it
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isEmailVerified: false,
      isActive: true,
      subscriptionPlan: 'free_trial',
      subscriptionStatus: 'trialing',
      trialExpiresAt,
      goals: [],
      loginAttempts: 0,
    });

    const userId = newUser._id.toString();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: userId,
    });
  } catch (error) {
    console.error('💥 Registration Controller Crash: ', error.message);
    return next(
      new AppError('An internal error occurred during registration.', 500)
    );
  }
};

/**
 * @description Authenticate user
 * @access Public
 */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Fetch user from MongoDB (includes password for verification)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      await user.save();
      return next(new AppError('Invalid email or password', 401));
    }

    const opaqueToken = crypto.randomBytes(16).toString('hex');

    user.sessionId = opaqueToken;
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save();

    const sessionUserPayload = {
      userId: user._id.toString(),
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
    };

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    res.cookie('accessToken', opaqueToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: sessionUserPayload,
      token: opaqueToken,
    });
  } catch (error) {
    console.error('💥 Login Controller Crash: ', error.message);
    return next(new AppError('Authentication error', 500));
  }
};

/**
 * @description Get current authenticated user profile
 * @access Private
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return next(new AppError('Authentication required', 401));
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully!',
      user: {
        userId: user._id.toString(),
        profilePicture: user.profilePicture,
        fullName: user.fullName,
        isTermCondition: user.isTermCondition,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        trialExpiration: user.trialExpiresAt,
      },
    });
  } catch (error) {
    console.error('💥 Get Profile Controller Crash: ', error.message);
    return next(new AppError('Error retrieving profile', 500));
  }
};

/**
 * @description Update user profile
 * @access Private
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return next(new AppError('Authentication required', 401));
    }

    const user = await User.findById(req.user.userId);
    if (!user) return next(new AppError('User not found', 404));

    let updated = false;

    // Profile Picture
    if (
      req.files?.profilePicture?.[0] &&
      req.files.profilePicture[0].size > 0
    ) {
      if (user.profilePicture) {
        await deleteFromCloudinary(user.profilePicture);
      }
      const result = await uploadToCloudinary(
        req.files.profilePicture[0],
        'profilePicture'
      );
      user.profilePicture = result.url;
      updated = true;
    }

    // Full Name
    if (req.body.fullName !== undefined) {
      user.fullName = req.body.fullName.trim();
      updated = true;
    }

    if (updated) {
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        userId: user._id.toString(),
        fullName: user.fullName,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('💥 Update Profile Controller Crash: ', error.message);
    return next(new AppError('Error updating profile', 500));
  }
};

/**
 * @description Logout user
 * @access Private
 */
exports.logoutUser = async (req, res, next) => {
  try {
    let token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token && req.user?.sessionId) {
      token = req.user.sessionId;
    }

    // Clear sessionId on the user document in MongoDB
    if (token) {
      await User.findOneAndUpdate(
        { sessionId: token },
        { $set: { sessionId: null } }
      );
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('💥 Logout Controller Crash: ', error.message);
    return next(new AppError('Logout error', 500));
  }
};

/**
 * @description Change password
 * @access Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return next(new AppError('Authentication required', 401));
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new AppError('All password fields are required', 400));
    }

    if (newPassword !== confirmPassword) {
      return next(
        new AppError('New password and confirmation do not match', 400)
      );
    }

    if (newPassword.length < 6) {
      return next(new AppError('Password must be at least 6 characters', 400));
    }

    // Fetch user from MongoDB (includes password for verification)
    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    console.log(
      '🔑 Password from MongoDB (length):',
      user.password ? user.password.length : 'null'
    );

    const isCorrect = await comparePassword(currentPassword, user.password);
    console.log('🔍 Password comparison result:', isCorrect);

    if (!isCorrect) {
      return next(new AppError('Current password is incorrect', 401));
    }

    const hashedNewPassword = await hashPassword(newPassword);

    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('💥 Change Password Controller Crash: ', error.message);
    return next(new AppError('Error changing password', 500));
  }
};

/**
 * @description Completely delete user account and all associated collection data
 * @route DELETE /api/v1/users/delete-account
 * @access Private
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return next(new AppError('Authentication required', 401));
    }

    const userId = req.user.userId;

    // 1. Find the core user record in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found or already deleted', 404));
    }

    // 2. Remove assets from Cloudinary if profile picture exists
    if (user.profilePicture) {
      try {
        await deleteFromCloudinary(user.profilePicture);
      } catch (cloudinaryErr) {
        console.error(
          `⚠️ Cloudinary asset deletion failed for user ${userId}:`,
          cloudinaryErr.message
        );
      }
    }

    // 3. Parallel clear of all user-owned separate collections in MongoDB
    await Promise.all([
      User.findByIdAndDelete(userId),
      Goals.deleteMany({ userId }),
      Todos.deleteMany({ userId }),
      Journals.deleteMany({ userId }),
      Habits.deleteMany({ userId }),
      Analytics.deleteMany({ userId }),
    ]);

    // 4. Clear cookie token from client browser
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'User account deleted permenantly successfully!',
    });
  } catch (error) {
    console.error('💥 Delete Account Controller Crash: ', error.message);
    return next(
      new AppError(
        'An error occurred while permanently deleting your account.',
        500
      )
    );
  }
};