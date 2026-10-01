/**
 * @file goal.route.js
 * @module routes/goalRoutes
 * @description Endpoint routing mapping for mental wellness wizard workflows and Gemini AI pipelines.
 */

const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const { opaqueAuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/goal/generate-ai-description
 * @access  Private
 */
router.post(
  '/generate-ai-description',
  opaqueAuthMiddleware,
  goalController.generateAiDescription
);

/**
 * @route   POST /api/v1/goal/generate-new-goal
 * @access  Private
 */
router.post(
  '/generate-new-goal',
  opaqueAuthMiddleware,
  goalController.generateNewGoal
);

/**
 * @route   PATCH /api/v1/goal/:goalId/task/:taskId
 * @access  Private
 */
router.patch(
  '/:goalId/task/:taskId',
  opaqueAuthMiddleware,
  goalController.toggleTaskStatus
);

/**
 * @route   PATCH /api/v1/goal/mark-goal-completed/:goalId
 * @access  Private
 */
router.patch(
  '/mark-goal-completed/:goalId',
  opaqueAuthMiddleware,
  goalController.markGoalCompleted
);

/**
 * @route   GET /api/v1/goal/get-user-goals
 * @access  Private
 */
router.get('/get-user-goals', opaqueAuthMiddleware, goalController.getAllGoals);

/**
 * @route   PATCH /api/v1/goal/update-goal/:goalId
 * @access  Private
 */
router.patch(
  '/update-goal/:goalId',
  opaqueAuthMiddleware,
  goalController.updateGoal
);

/**
 * @route   DELETE /api/v1/goal/delete-goal/:goalId
 * @access  Private
 */
router.delete(
  '/delete-goal/:goalId',
  opaqueAuthMiddleware,
  goalController.deleteGoal
);

/**
 * @route   GET /api/v1/goal/get-goals-categories
 * @access  Private
 */
router.get(
  '/get-goals-categories',
  opaqueAuthMiddleware,
  goalController.getGoalConstants
);

module.exports = router;
