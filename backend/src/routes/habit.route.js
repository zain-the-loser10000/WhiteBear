/**
 * @file goal.route.js
 * @module routes/goalRoutes
 * @description Endpoint routing mapping for mental wellness wizard workflows and Gemini AI pipelines.
 */

const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habit.controller');
const { opaqueAuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/habit/generate-ai-habit-actionable
 * @access  Private
 */
router.post(
  '/generate-ai-habit-actionable',
  opaqueAuthMiddleware,
  habitController.generateAiAssistedActionables
);

/**
 * @route   POST /api/v1/habit/generate-new-habit
 * @access  Private
 */
router.post(
  '/generate-new-habit',
  opaqueAuthMiddleware,
  habitController.createHabit
);

/**
 * @route   GET /api/v1/habit/get-all-habits
 * @access  Private
 */
router.get(
  '/get-all-habits',
  opaqueAuthMiddleware,
  habitController.getAllHabits
);

/**
 * @route   PATCH /api/v1/habit/update-habit/:habitId
 * @access  Private
 */
router.patch(
  '/update-habit/:habitId',
  opaqueAuthMiddleware,
  habitController.updateHabit
);

/**
 * @route   DELETE /api/v1/habit/delete-habit/:habitId
 * @access  Private
 */
router.delete(
  '/delete-habit/:habitId',
  opaqueAuthMiddleware,
  habitController.deleteHabit
);

/**
 * @route   PATCH /api/v1/habit/:habitId/mark-actionable-complete
 * @access  Private
 */
router.patch(
  '/mark-actionable-complete/:habitId',
  opaqueAuthMiddleware,
  habitController.toggleActionableCompletion
);

/**
 * @route   GET /api/v1/habit/get-habits-categories
 * @access  Public
 */
router.get(
  '/get-habit-categories',
  opaqueAuthMiddleware,
  habitController.getHabitsConstants
);

module.exports = router;
