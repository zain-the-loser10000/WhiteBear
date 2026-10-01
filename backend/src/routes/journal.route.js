/**
 * @file goal.route.js
 * @module routes/goalRoutes
 * @description Endpoint routing mapping for mental wellness wizard workflows and Gemini AI pipelines.
 */

const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journal.controller');
const { opaqueAuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/journal/create-new-journal
 * @access  Private
 */
router.post(
  '/create-new-journal',
  opaqueAuthMiddleware,
  journalController.createJournal
);

/**
 * @route   GET /api/v1/journal/get-all-journals
 * @access  Private
 */
router.get(
  '/get-all-journals',
  opaqueAuthMiddleware,
  journalController.getAllJournals
);

/**
 * @route   GET /api/v1/journal/get-journals-categories
 * @access  Public
 */
router.get(
  '/get-journals-categories',
  opaqueAuthMiddleware,
  journalController.getJournalConstants
);

module.exports = router;
