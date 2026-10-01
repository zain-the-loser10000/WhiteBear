/**
 * @file analytic.route.js
 * @module routes/analyticRoutes
 * @description Endpoint routing mapping for mental wellness wizard workflows and Gemini AI pipelines.
 */

const express = require('express');
const router = express.Router();
const analyticController = require('../controllers/analytic.controller');
const { opaqueAuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/v1/analytic/get-goal-analytic
 * @access  Private
 */
router.get(
  '/get-goal-analytic',
  opaqueAuthMiddleware,
  analyticController.getGoalsAnalytics
);

/**
 * @route   GET /api/v1/analytic/get-journal-analytic
 * @access  Private
 */
router.get(
  '/get-journal-analytic',
  opaqueAuthMiddleware,
  analyticController.getJournalAnalytics
);

/**
 * @route   GET /api/v1/analytic/get-todo-analytic
 * @access  Private
 */
router.get(
  '/get-todo-analytic',
  opaqueAuthMiddleware,
  analyticController.getTodoAnalytics
);

/**
 * @route   GET /api/v1/analytic/get-habit-analytic
 * @access  Private
 */
router.get(
  '/get-habit-analytic',
  opaqueAuthMiddleware,
  analyticController.getHabitAnalytics
);

/**
 * @route   GET /api/v1/analytic/export-analytics?type=goals&range=quarterly&format=json
 * @access  Private
 */
router.get(
  '/export-analytics',
  opaqueAuthMiddleware,
  analyticController.exportAnalyticsData
);

module.exports = router;
