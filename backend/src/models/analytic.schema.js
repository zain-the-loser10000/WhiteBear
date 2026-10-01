/**
 * @file analytics.schema.js
 * @module models/Analytics
 * @description Persisted cache and snapshot storage layer for Gemini-generated behavioral insights.
 */

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 🟢 YEH FIELD MISSING THA! Isay add kar diya:
  analyticsType: {
    type: String,
    enum: ['JOURNALS', 'TODOS', 'GOALS', 'HABITS', 'ALL'],
    required: true,
  },

  rangeMode: {
    type: String,
    enum: ['biweekly', 'monthly', 'quarterly'],
    required: true,
  },
  windowStartDate: { type: Date, required: true },
  windowEndDate: { type: Date, required: true },

  data: {
    journals: { type: mongoose.Schema.Types.Mixed },
    todos: { type: mongoose.Schema.Types.Mixed },
    goals: { type: mongoose.Schema.Types.Mixed },
    habits: { type: mongoose.Schema.Types.Mixed },
  },
  computedAt: { type: Date, default: Date.now },
});

analyticsSchema.index({
  userId: 1,
  analyticsType: 1,
  rangeMode: 1,
  computedAt: -1,
});

module.exports = mongoose.model('Analytics', analyticsSchema);
