/**
 * @file journal.schema.js
 * @module models/journalSchema
 * @description Mongoose schema for user journal entries. Each entry is tied to a calendar date (targetDate) and contains short reflections: mood, memorableMoment, and challenges. A unique compound index ensures a user can only have one entry per day.
 */

const mongoose = require('mongoose');
const { JOURNAL_TYPES } = require('../constants/journal.constants');

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Journal entry must belong to a user.'],
      index: true,
    },

    targetDate: {
      type: Date,
      required: [true, 'Journal entry must be anchored to a calendar date.'],
    },

    journalType: {
      type: String,
      enum: Object.values(JOURNAL_TYPES),
      required: [true, 'Journal type specification is required.'],
    },

    /* ☀️ DAILY JOURNAL SPECIFIC FIELDS */
    mood: {
      type: String,
      trim: true,
      maxlength: [150, 'Mood reflection cannot exceed 150 characters.'],
      required: [
        function () {
          return this.journalType === JOURNAL_TYPES.DAILY;
        },
        'Mood reflection is required for daily entries.',
      ],
    },
    memorableMoment: {
      type: String,
      trim: true,
      maxlength: [
        150,
        'Memorable moment summary cannot exceed 150 characters.',
      ],
      required: [
        function () {
          return this.journalType === JOURNAL_TYPES.DAILY;
        },
        'Memorable moment summary is required for daily entries.',
      ],
    },

    /* 📊 WEEKLY REVIEW SPECIFIC FIELDS */
    weekStart: {
      type: Date,
      required: [
        function () {
          return this.journalType === JOURNAL_TYPES.WEEKLY;
        },
        'Week start date is required for weekly reviews.',
      ],
    },
    weekEnd: {
      type: Date,
      required: [
        function () {
          return this.journalType === JOURNAL_TYPES.WEEKLY;
        },
        'Week end date is required for weekly reviews.',
      ],
    },
    bigWins: {
      type: String,
      trim: true,
      maxlength: [150, 'Big wins response cannot exceed 150 characters.'],
      required: [
        function () {
          return this.journalType === JOURNAL_TYPES.WEEKLY;
        },
        'Big wins response is required for weekly reviews.',
      ],
    },
    whatCouldBeBetter: {
      type: String,
      trim: true,
      maxlength: [150, 'Improvement reflection cannot exceed 150 characters.'],
      required: [
        function () {
          return this.journalType === JOURNAL_TYPES.WEEKLY;
        },
        'What could be better section is required for weekly reviews.',
      ],
    },
    didYouGrow: {
      type: String,
      trim: true,
      maxlength: [150, 'Growth summary cannot exceed 150 characters.'],
      required: [
        function () {
          return this.journalType === JOURNAL_TYPES.WEEKLY;
        },
        'Growth validation summary is required for weekly reviews.',
      ],
    },

    /* 🛑 SHARED FIELDS */
    challenges: {
      type: String,
      required: [true, 'Challenges description is required.'],
      trim: true,
      maxlength: [150, 'Challenges description cannot exceed 150 characters.'],
    },
  },
  {
    timestamps: true,
  }
);

journalSchema.index(
  { userId: 1, targetDate: 1, journalType: 1 },
  { unique: true }
);

module.exports = mongoose.model('Journal', journalSchema);
