/**
 * @file webhook.route.js
 * @module routes/webHookRoutes
 * @description Defines the Stripe webhook endpoint routing for handling billing and subscription events.
 */

const express = require('express');
const router = express.Router();
const webHookController = require('../controllers/webhook.controller');

/**
 * @route   POST /api/v1/webhook/stripe-webhook
 * @access  Private
 */

router.post(
  '/stripe-webhook',
  express.raw({
    type: 'application/json',
  }),
  webHookController.handleWebhook
);

module.exports = router;
