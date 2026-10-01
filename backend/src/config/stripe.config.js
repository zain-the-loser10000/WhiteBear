/**
 * @file stripe.config.js
 * @module config/stripeConfig
 * @description Stripe client configuration using the secret key from environment variables.
 */

const Stripe = require('stripe');

module.exports = new Stripe(process.env.STRIPE_SECRET_KEY);
