/**
 * @file habit.model.js
 * @module models/habitSchema
 * @description Model tracking the 4-step Make/Break Habit builder and daily Stop-Start-Continue triad tracking.
 */

const mongoose = require('mongoose');

const {
  HABIT_CATEGORY_VALUES,
  HABIT_TYPE_VALUES,
  HABIT_TIMELINES,
  WEEKDAYS,
  NOTIFICATION_SOUNDS,
} = require('../constants/habit.constant');

// Sub-schema to track daily progress for the 3 distinct actions (Stop, Start, Continue)
const dailyHabitLogSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    isStopCompleted: { type: Boolean, default: false },
    isStartCompleted: { type: Boolean, default: false },
    isContinueCompleted: { type: Boolean, default: false },
    dailyScorePercentage: {
      type: Number,
      default: 0, // Calculated dynamically (e.g., 1/3 = 33%, 3/3 = 100%)
    },
  },
  { _id: false }
);

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Step 1: Category Setup
    category: {
      type: String,
      required: true,
      enum: HABIT_CATEGORY_VALUES,
    },

    // Step 2: Habit Details
    habitType: {
      type: String,
      required: true,
      enum: HABIT_TYPE_VALUES, // 'make' or 'break'
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },

    whyFactor: {
      type: String,
      trim: true,
      maxLength: 500,
      default: null, // "What's your motivation for this habit?"
    },

    // The core execution triad
    actionables: {
      stop: { type: String, required: true, trim: true },
      start: { type: String, required: true, trim: true },
      continue: { type: String, required: true, trim: true },
    },

    isCustomHabit: {
      type: Boolean,
      default: false, // True if user created from scratch instead of picking a template
    },

    // Step 3: Timeline Setup
    timelineType: {
      type: String,
      required: true,
      enum: HABIT_TIMELINES,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null, // Calculated programmatically based on 21, 30, 66 days, or custom input
    },

    selectedDays: {
      type: [String],
      enum: WEEKDAYS,
      required: true,
    },

    // Step 4: Notifications Setup
    notifications: {
      isEveryDay: {
        type: Boolean,
        default: false,
      },
      times: {
        type: [String], // Array of time strings like ["08:00", "14:30"] for multiple reminders
        default: [],
      },
      sound: {
        type: String,
        enum: NOTIFICATION_SOUNDS,
        default: 'ding',
      },
    },

    // Tracking Execution
    status: {
      type: String,
      required: true,
      enum: ['active', 'paused', 'completed', 'abandoned'],
      default: 'active',
    },

    // Daily records for calculating streaks and rendering the Today's Completion Score UI
    trackingLogs: [dailyHabitLogSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries for "Today's Active Habits" on user dashboards
habitSchema.index({ userId: 1, status: 1 });
habitSchema.index({ userId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Habit', habitSchema);
