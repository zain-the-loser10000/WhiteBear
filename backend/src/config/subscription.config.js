/**
 * @file subscription.config.js
 * @module config/subscriptionConfig
 * @description Subscription configuration for the stripe account.
 */

exports.SUBSCRIPTION_CONFIG = {
  free_trial: {
    name: 'Free Trial',
    days: 14,
  },

  monthly: {
    plan: 'monthly',
    displayName: 'Monthly Premium',
    price: 500,
    currency: 'pkr',
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID,
  },

  yearly: {
    plan: 'yearly',
    displayName: 'Yearly Premium',
    price: 250,
    currency: 'pkr',
    stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID,
  },
};
