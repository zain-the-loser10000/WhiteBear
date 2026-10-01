/**
 * @file user.constants.js
 * @module constants/subscriptionConstant
 * @description Centralized constants and enum maps for user properties and Stripe billing layers.
 */

const SUBSCRIPTION_PLANS = ['free_trial', 'monthly', 'yearly'];

const SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'unpaid',
];

module.exports = {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
};
