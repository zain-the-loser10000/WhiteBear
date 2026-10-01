/**
 * @file journal.controller.js
 * @module controllers/journalController
 * @description Processes daily journal entries and weekly reviews with automatic calendar week detection and trial logic.
 */

const mongoose = require('mongoose');
const Journal = require('../models/journal.schema'); // 🌟 Matches your .schema naming convention
const User = require('../models/user.schema');
const AppError = require('../errors/app-error');
const {
  JOURNAL_TYPES,
  DAILY_PROMPTS,
  WEEKLY_PROMPTS,
} = require('../constants/journal.constants');

/**
 * 🗓️ Helper: Automatically shifts any target date to its week's Sunday-Saturday bracket
 * Crucial for keeping weekly reviews single-instance per calendar block.
 */
const calculateWeekBoundaries = (incomingDate) => {
  const referenceDate = new Date(incomingDate);
  const dayOfWeek = referenceDate.getUTCDay(); // Sunday = 0, Monday = 1, etc.

  // Snap backward to Sunday midnight UTC
  const weekStart = new Date(referenceDate);
  weekStart.setUTCDate(referenceDate.getUTCDate() - dayOfWeek);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Snap forward 6 days to Saturday 23:59 UTC
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};

/**
 * @description   Saves (Creates or Updates) a daily log or a week-locked review
 * @access        Private
 */
exports.createJournal = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(
        new AppError(
          'Authentication required. Missing user identity credentials.',
          401
        )
      );
    }

    // 🌟 FIX: Destructure both Daily and Weekly parameters from the request body
    const {
      targetDate,
      journalType,
      mood,
      memorableMoment,
      challenges,
      bigWins,
      whatCouldBeBetter,
      didYouGrow,
    } = req.body;

    // Validate journal type against constants
    const normalizedType = journalType
      ? journalType.toUpperCase()
      : JOURNAL_TYPES.DAILY;
    if (!Object.values(JOURNAL_TYPES).includes(normalizedType)) {
      return next(
        new AppError(
          'Invalid journal type specified. Use DAILY or WEEKLY.',
          400
        )
      );
    }

    // Parse the baseline input calendar date
    let parsedTargetDate = targetDate ? new Date(targetDate) : new Date();
    if (isNaN(parsedTargetDate.getTime())) {
      return next(new AppError('Invalid target date provided.', 400));
    }
    parsedTargetDate.setUTCHours(0, 0, 0, 0);

    const updateFields = { challenges: challenges?.trim() };

    /* -------------------------------------------------------------------------- */
    /* POLYMORPHIC CONDITIONAL VALIDATION                                         */
    /* -------------------------------------------------------------------------- */
    if (normalizedType === JOURNAL_TYPES.DAILY) {
      if (!mood?.trim() || !memorableMoment?.trim() || !challenges?.trim()) {
        return next(
          new AppError(
            'All daily journal reflection fields must be filled out.',
            400
          )
        );
      }
      updateFields.mood = mood.trim();
      updateFields.memorableMoment = memorableMoment.trim();
    } else {
      // WEEKLY Review mode: Automatically extract dates matching WhatsApp Image 2026-06-06 at 3.07.37 PM.jpeg
      if (
        !bigWins?.trim() ||
        !whatCouldBeBetter?.trim() ||
        !didYouGrow?.trim() ||
        !challenges?.trim()
      ) {
        return next(
          new AppError(
            'All weekly review response fields must be filled out.',
            400
          )
        );
      }

      const { weekStart, weekEnd } = calculateWeekBoundaries(parsedTargetDate);

      updateFields.weekStart = weekStart;
      updateFields.weekEnd = weekEnd;
      updateFields.bigWins = bigWins.trim();
      updateFields.whatCouldBeBetter = whatCouldBeBetter.trim();
      updateFields.didYouGrow = didYouGrow.trim();

      // Overwrite targetDate key to Sunday to ensure any date within this week updates the same document
      parsedTargetDate = weekStart;
    }

    // Enforce front-end UI character limits (0/150) across active inputs
    if (
      mood?.length > 150 ||
      memorableMoment?.length > 150 ||
      challenges?.length > 150 ||
      bigWins?.length > 150 ||
      whatCouldBeBetter?.length > 150 ||
      didYouGrow?.length > 150
    ) {
      return next(
        new AppError(
          'Journal entries cannot exceed the 150-character limit.',
          400
        )
      );
    }

    // 🟢 Fetch user directly from MongoDB
    const sensitiveData = await User.findById(userId).select('-password -__v');
    if (!sensitiveData) {
      return next(
        new AppError('User account record could not be verified.', 404)
      );
    }

    /* -------------------------------------------------------------------------- */
    /* FREE TRIAL SUBSCRIPTION WALL & POLICIES                                    */
    /* -------------------------------------------------------------------------- */
    if (sensitiveData.subscriptionPlan === 'free_trial') {
      const trialExpiry = sensitiveData.trialExpiresAt
        ? new Date(sensitiveData.trialExpiresAt)
        : null;

      if (trialExpiry && new Date() > trialExpiry) {
        return next(
          new AppError(
            'Your 15-day free trial has expired. Please upgrade to a premium subscription to continue logging journals.',
            403
          )
        );
      }
    }

    const mongoUserId = new mongoose.Types.ObjectId(userId);

    // Save/Update Journal in MongoDB (Source of Truth via Upsert using compound rules)
    const savedJournal = await Journal.findOneAndUpdate(
      {
        userId: mongoUserId,
        targetDate: parsedTargetDate,
        journalType: normalizedType,
      },
      { $set: updateFields },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    // === Build response payload ===
    const journalForSession = {
      id: savedJournal._id.toString(),
      targetDate: savedJournal.targetDate.toISOString(),
      journalType: savedJournal.journalType,
      challenges: savedJournal.challenges,
      createdAt: savedJournal.createdAt.toISOString(),
      updatedAt: savedJournal.updatedAt.toISOString(),
      ...(normalizedType === JOURNAL_TYPES.DAILY
        ? {
            mood: savedJournal.mood,
            memorableMoment: savedJournal.memorableMoment,
          }
        : {
            bigWins: savedJournal.bigWins,
            whatCouldBeBetter: savedJournal.whatCouldBeBetter,
            didYouGrow: savedJournal.didYouGrow,
            weekStart: savedJournal.weekStart.toISOString(),
            weekEnd: savedJournal.weekEnd.toISOString(),
          }),
    };

    return res.status(200).json({
      success: true,
      message: `${normalizedType === JOURNAL_TYPES.WEEKLY ? 'Weekly Review' : 'Daily Journal'} created successfully!`,
      newJournal: journalForSession,
    });
  } catch (error) {
    console.error('💥 Save Journal Error:', error.message);
    return next(
      new AppError('Failed to save journal entry. Please try again.', 500)
    );
  }
};

/**
 * @description   Retrieve all journals for the authenticated user (Supports optional filtering: ?type=WEEKLY)
 * @access        Private
 */
exports.getAllJournals = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(
        new AppError(
          'Authentication required. Missing user identity credentials.',
          401
        )
      );
    }

    const { type } = req.query;
    const filterQuery = { userId };

    // Apply type constraints if provided in the URL query parameters
    if (type) {
      const normalizedQueryType = type.toUpperCase();
      if (Object.values(JOURNAL_TYPES).includes(normalizedQueryType)) {
        filterQuery.journalType = normalizedQueryType;
      }
    }

    // Sort by chronological target dates (newest logs appear first)
    const journals = await Journal.find(filterQuery).sort({ targetDate: -1 });

    return res.status(200).json({
      success: true,
      message: 'Journals retrieved successfully.',
      count: journals.length,
      allJournals: journals,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description   Get all journal constants (types, prompts, configurations)
 */
exports.getJournalConstants = async (req, res, next) => {
  try {
    // Return all constants in a structured format
    const constants = {
      journalTypes: {
        DAILY: JOURNAL_TYPES.DAILY,
        WEEKLY: JOURNAL_TYPES.WEEKLY,
        all: Object.values(JOURNAL_TYPES),
      },
      dailyPrompts: {
        MOOD: DAILY_PROMPTS.MOOD,
        MEMORABLE_MOMENT: DAILY_PROMPTS.MEMORABLE_MOMENT,
        CHALLENGES: DAILY_PROMPTS.CHALLENGES,
        all: Object.values(DAILY_PROMPTS),
      },
      weeklyPrompts: {
        BIG_WINS: WEEKLY_PROMPTS.BIG_WINS,
        WHAT_COULD_BE_BETTER: WEEKLY_PROMPTS.WHAT_COULD_BE_BETTER,
        DID_YOU_GROW: WEEKLY_PROMPTS.DID_YOU_GROW,
        CHALLENGES: WEEKLY_PROMPTS.CHALLENGES,
        all: Object.values(WEEKLY_PROMPTS),
      },
      metadata: {
        version: '1.0.0',
        description:
          'Journal configuration constants for daily and weekly entries',
        characterLimit: 150,
      },
    };

    return res.status(200).json({
      success: true,
      message: 'Journal categories retrieved successfully.',
      journalCategories: constants,
    });
  } catch (error) {
    console.error('💥 Get Journal Constants Error:', error.message);
    return next(
      new AppError(
        'Failed to retrieve journal constants. Please try again.',
        500
      )
    );
  }
};
