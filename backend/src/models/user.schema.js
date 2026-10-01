/**
 * @file user.model.js
 * @module models/userSchema
 * @description Streamlined Mongoose schema and model configuration for core application Users.
 */

/**
 * @file user.schema.js
 * @module models/userSchema
 */
const mongoose = require('mongoose');
const {
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
} = require('../constants/subscription.constant');

const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
      default: null,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    isTermCondition: {
      type: Boolean,
      default: false,
      required: true,
    },

    // ────────────────────────────────────────────────
    // Authentication & Identity
    // ────────────────────────────────────────────────
    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    password: {
      type: String,
      default: null,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // ────────────────────────────────────────────────
    // Session & Login Tracking
    // ────────────────────────────────────────────────
    sessionId: {
      type: String,
      default: null,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    // ────────────────────────────────────────────────
    // Subscription & Billing (Stripe)
    // ────────────────────────────────────────────────
    stripeCustomerId: {
      type: String,
      default: null,
    },

    stripeSubscriptionId: {
      type: String,
      default: null,
    },

    stripePriceId: {
      type: String,
      default: null,
    },

    subscriptionPlan: {
      type: String,
      enum: SUBSCRIPTION_PLANS,
      default: 'free_trial',
    },

    subscriptionStatus: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: 'trialing',
    },

    trialExpiresAt: {
      type: Date,
      default: null,
    },

    currentPeriodStart: {
      type: Date,
      default: null,
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
    },

    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    // ────────────────────────────────────────────────
    // User Content
    // ────────────────────────────────────────────────
    goals: {
      type: Array,
      default: [],
    },

    todos: {
      type: Array,
      default: [],
    },

    journals: {
      type: Array,
      default: [],
    },

    habits: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
