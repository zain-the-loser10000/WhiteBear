/**
 * @file user.route.js
 * @module routes/userRoutes
 * @description Secure endpoint routing mapping for core user authentication operations.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const cloudinaryUtility = require('../utils/cloudinary.util');
const {
  authLimiter,
  opaqueAuthMiddleware,
} = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/user/signup-user
 * @access Public
 */
router.post(
  '/signup-user',
  authLimiter,
  cloudinaryUtility.upload,
  userController.registerUser
);

/**
 * @route   POST /api/v1/user/signin-user
 * @access Public
 */
router.post('/signin-user', authLimiter, userController.loginUser);

/**
 * @route   GET /api/v1/user/get-user-profile
 * @access Private
 */
router.get(
  '/get-user-profile',
  opaqueAuthMiddleware,
  userController.getUserProfile
);

/**
 * @route   PATCH /api/v1/user/update-user-profile/:userId
 * @access Private
 */
router.patch(
  '/update-user-profile/:userId',
  opaqueAuthMiddleware,
  cloudinaryUtility.upload,
  userController.updateUserProfile
);

/**
 * @route   POST /api/v1/user/logout-user
 * @access Public
 */
router.post('/logout-user', opaqueAuthMiddleware, userController.logoutUser);

/**
 * @route   PATCH /api/v1/user/change-password
 * @access Private
 */
router.patch(
  '/change-password',
  opaqueAuthMiddleware,
  userController.changePassword
);

/**
 * @route   DELETE /api/v1/user/delete-user-account
 * @access Private
 */
router.delete(
  '/delete-user-account/:userId',
  opaqueAuthMiddleware,
  userController.deleteAccount
);

module.exports = router;
