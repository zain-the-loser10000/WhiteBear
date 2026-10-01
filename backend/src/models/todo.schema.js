/**
 * @file todo.schema.js
 * @module models/todoSchema
 * @description Supports individual daily tasks and AI-generated goal milestones with auto-rollover logic.
 */

const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // Optional link to the Goals module for AI-generated trajectories
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
      index: true,
    },

    // Corresponds to the toggle button layout seen
    todoType: {
      type: String,
      enum: ['GOAL', 'DAILY'],
      default: 'DAILY',
      required: true,
    },

    // The task content string entered via the text input shown in image_9a7340.png
    title: {
      type: String,
      required: [true, 'Please provide a task description.'],
      trim: true,
      maxlength: [280, 'Task description cannot exceed 280 characters.'],
    },

    // Represents the active calendar slot day the task is assigned to
    targetDate: {
      type: Date,
      required: [true, 'A target calendar date is required.'],
      index: true,
    },

    // Keeps track of where the item originally started before any auto-rollovers occurred
    originalTargetDate: {
      type: Date,
      required: true,
    },

    // Interacted with via the "Mark Complete" button
    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // Interacted with via the "Repeat" badge modifier context
    isRepeating: {
      type: Boolean,
      default: false,
    },

    // Tracks how many times an uncompleted task has been bumped forward to the next day
    rolloverCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Auto-generates "createdAt" shown
  }
);

// Compound index to quickly fetch tasks for a specific user on a selected calendar day
todoSchema.index({ userId: 1, targetDate: 1, todoType: 1 });

module.exports = mongoose.model('Todo', todoSchema);
