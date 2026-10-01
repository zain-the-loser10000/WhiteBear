/**
 * @file analytic.route.js
 * @module routes/analyticRoutes
 * @description Endpoint routing mapping for mental wellness wizard workflows and Gemini AI pipelines.
 */

const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { opaqueAuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/subscription/create-subscription-checkout
 * @access  Private
 */
router.post(
  '/create-subscription-checkout',
  opaqueAuthMiddleware,
  subscriptionController.createCheckoutSession
);

module.exports = router;
