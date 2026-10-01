/**
 * @file subscription.controller.js
 * @module controllers/subscriptionController
 * @description Controller for returning static Dashboard Payment Links with fine-tuned security overrides.
 */

const User = require('../models/user.schema');

class SubscriptionController {
  static async createCheckoutSession(req, res) {
    try {
      const userId = req.user?.userId;
      const { plan } = req.body;

      if (!['monthly', 'yearly'].includes(plan)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan choice. Use "monthly" or "yearly".',
        });
      }

      // 1. Fetch user directly from MongoDB
      const userCache = await User.findById(userId).select('-password -__v');

      // 2. 🛑 THE BLOCKER: Check if they are already on a paid premium subscription lifecycle
      if (userCache) {
        const hasPaidStatus = ['active', 'past_due'].includes(
          userCache.subscriptionStatus
        );
        const hasPremiumPlan = ['monthly', 'yearly'].includes(
          userCache.subscriptionPlan
        );

        // Block if they are actively on monthly/yearly plans to prevent overlapping double billing
        if (hasPaidStatus && hasPremiumPlan) {
          return res.status(400).json({
            success: false,
            message:
              'You already have an active premium subscription. You cannot purchase another plan simultaneously.',
            currentPlan: userCache.subscriptionPlan,
            status: userCache.subscriptionStatus,
          });
        }
      }

      // Map plans to dashboard links sourced from environment variables (with fallbacks)
      const paymentLinks = {
        monthly: process.env.PAYMENT_LINK_MONTHLY || 'null',
        yearly: process.env.PAYMENT_LINK_YEARLY || 'null',
      };

      // 3. 🟢 THE KEY: Dynamically append the userId so your webhook can capture it later
      const targetLink = `${paymentLinks[plan]}?client_reference_id=${userId}`;

      return res.status(200).json({
        success: true,
        checkoutUrl: targetLink,
      });
    } catch (error) {
      console.error('❌ SUBSCRIPTION CONTROLLER ERROR:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = SubscriptionController;
