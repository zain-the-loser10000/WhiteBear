/**
 * @file habit.controller.js
 * @module controllers/habitController
 * @description Manages the 4-step Make/Break habit formation matrix, notification profiles, and daily scoring telemetry logs.
 */

const mongoose = require('mongoose');
const Habit = require('../models/habit.schema');
const User = require('../models/user.schema');
const AppError = require('../errors/app-error');
const geminiService = require('../services/gemini.service');
const {
  HABIT_CATEGORIES,
  HABIT_CATEGORY_VALUES,
  HABIT_TYPES,
  HABIT_TYPE_VALUES,
  HABIT_TEMPLATES,
  HABIT_TIMELINES,
  WEEKDAYS,
  NOTIFICATION_SOUNDS,
} = require('../constants/habit.constant');

/**
 * @description Generates behavioral Stop-Start-Continue action lines based on a custom title and vector type
 * @access      Private
 */
exports.generateAiAssistedActionables = async (req, res, next) => {
  try {
    const { title, category, habitType } = req.body;

    // 1. Structural inputs verification validation checks
    if (!title || !title.trim()) {
      return next(
        new AppError(
          'Please provide a descriptive habit title to generate blueprints.',
          400
        )
      );
    }
    if (!category) {
      return next(
        new AppError(
          'Please specify a target life focus area category tag.',
          400
        )
      );
    }
    if (!['make', 'break'].includes(habitType)) {
      return next(
        new AppError(
          'Please select whether you want to make or break this habit behavior.',
          400
        )
      );
    }

    // 2. Execute the AI generation pipeline logic
    const generatedTriad = await geminiService.generateHabitActionables({
      title: title.trim(),
      category,
      habitType,
    });

    // 3. Dispatch data back to the mobile client/web view interface
    return res.status(200).json({
      success: true,
      message: 'Actionables generated successfully!',
      actionables: {
        stop: generatedTriad.stop,
        start: generatedTriad.start,
        continue: generatedTriad.continue,
      },
    });
  } catch (error) {
    console.error('💥 AI Habit Generation Error:', error.message);
    return next(error);
  }
};

/**
 * @description Creates a new Habit
 * @access      Private
 */
exports.createHabit = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return next(new AppError('Authentication credentials missing.', 401));

    // Destructure properties from the 4-step wizard request body
    const {
      category,
      habitType,
      title,
      whyFactor,
      actionables, // Expected format: { stop: '...', start: '...', continue: '...' }
      timelineType,
      customDurationDays, // Only parsed if timelineType is 'custom'
      selectedDays,
      notifications, // Expected format: { isEveryDay: boolean, times: [...], sound: '...' }
      isCustomHabit,
    } = req.body;

    // 1. Core Parameter Validation
    if (!category || !habitType || !title || !actionables) {
      return next(
        new AppError(
          'Missing required properties to build out habit blueprint.',
          400
        )
      );
    }

    if (!actionables.stop || !actionables.start || !actionables.continue) {
      return next(
        new AppError(
          'The Stop-Start-Continue triad must be completely defined.',
          400
        )
      );
    }

    if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
      return next(
        new AppError(
          'Please select at least one active day for your routine cycle.',
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
    /* SUBSCRIPTION POLICY WALL - HABITS CREATION                                 */
    /* -------------------------------------------------------------------------- */
    if (sensitiveData.subscriptionPlan === 'free_trial') {
      const trialExpiry = sensitiveData.trialExpiresAt
        ? new Date(sensitiveData.trialExpiresAt)
        : null;

      if (trialExpiry && new Date() > trialExpiry) {
        return next(
          new AppError(
            'Your 15-day free trial has expired. Please upgrade to Premium.',
            403
          )
        );
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const habitsCreatedToday = await Habit.countDocuments({
        userId,
        createdAt: { $gte: startOfToday },
      });

      if (habitsCreatedToday >= 1) {
        return next(
          new AppError(
            'Free trial allows only 1 habit per day. Upgrade to Premium for unlimited access.',
            429
          )
        );
      }
    } else if (['monthly', 'yearly'].includes(sensitiveData.subscriptionPlan)) {
      // Premium users have unlimited access - no limit applied
    } else {
      return next(
        new AppError('Invalid subscription plan. Please contact support.', 403)
      );
    }

    // 3. Programmatic Timeline Horizon Date Target Tracking Calculations
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0); // Normalize calendar line to midnight UTC bounds safely

    let daysToExtend = 21; // Default to 21 days as shown in UI layout configurations
    if (timelineType === '30_days') daysToExtend = 30;
    if (timelineType === '66_days') daysToExtend = 66; // Scientifically validated habit lock window
    if (timelineType === 'custom') {
      daysToExtend = parseInt(customDurationDays, 10);
      if (isNaN(daysToExtend) || daysToExtend <= 0) {
        return next(
          new AppError(
            'Please specify a valid numeric custom duration field length.',
            400
          )
        );
      }
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToExtend);

    // 4. Persistence Entry Construction to MongoDB (Source of Truth)
    const newHabit = await Habit.create({
      userId,
      category,
      habitType,
      title: title.trim(),
      whyFactor: whyFactor ? whyFactor.trim() : null,
      actionables: {
        stop: actionables.stop.trim(),
        start: actionables.start.trim(),
        continue: actionables.continue.trim(),
      },
      isCustomHabit: Boolean(isCustomHabit),
      timelineType,
      startDate,
      endDate,
      selectedDays: selectedDays.map((d) => d.toLowerCase()),
      notifications: {
        isEveryDay: notifications?.isEveryDay || false,
        times: notifications?.times || [],
        sound: notifications?.sound || 'ding',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Habit generated successfully!',
      newHabit: newHabit,
    });
  } catch (error) {
    console.error('💥 Habit Creation Crash:', error.message);
    return next(error);
  }
};

/**
 * @description   Retrieve all habits for the authenticated user
 * @access        Private
 */
exports.getAllHabits = async (req, res, next) => {
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

    const habits = await Habit.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Habits retrieved successfully.',
      count: habits.length,
      allHabits: habits,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description Update the entire habit by id
 * @access      Private
 */
exports.updateHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const userId = req.user?.userId;

    // 1. Fetch source of truth document
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit)
      return next(
        new AppError(
          'Habit module document targeting references not matched.',
          404
        )
      );

    // Extract every single parameter option from the 4-step wizard schema
    const {
      category,
      habitType,
      title,
      whyFactor,
      actionables,
      timelineType,
      customDurationDays,
      selectedDays,
      notifications,
      status,
      isCustomHabit,
    } = req.body;

    // 2. Apply Core Parameter Updates
    if (category !== undefined) habit.category = category;
    if (habitType !== undefined) habit.habitType = habitType;
    if (title !== undefined) habit.title = title.trim();
    if (whyFactor !== undefined)
      habit.whyFactor = whyFactor ? whyFactor.trim() : null;
    if (status !== undefined) habit.status = status;
    if (isCustomHabit !== undefined)
      habit.isCustomHabit = Boolean(isCustomHabit);

    // 3. Handle Nested Stop-Start-Continue Triad Adjustments
    if (actionables) {
      if (actionables.stop !== undefined)
        habit.actionables.stop = actionables.stop.trim();
      if (actionables.start !== undefined)
        habit.actionables.start = actionables.start.trim();
      if (actionables.continue !== undefined)
        habit.actionables.continue = actionables.continue.trim();

      // Guard check to make sure mutations don't leave blank properties behind
      if (
        !habit.actionables.stop ||
        !habit.actionables.start ||
        !habit.actionables.continue
      ) {
        return next(
          new AppError(
            'The Stop-Start-Continue triad must remain completely defined.',
            400
          )
        );
      }
    }

    // 4. Handle Cycle Execution Weekday Adjustments
    if (selectedDays !== undefined) {
      if (!Array.isArray(selectedDays) || selectedDays.length === 0) {
        return next(
          new AppError(
            'Please select at least one active day for your routine cycle.',
            400
          )
        );
      }
      habit.selectedDays = selectedDays.map((d) => d.toLowerCase());
    }

    // 5. Handle Nested Notification Channel Adjustments
    if (notifications) {
      if (notifications.isEveryDay !== undefined)
        habit.notifications.isEveryDay = Boolean(notifications.isEveryDay);
      if (notifications.times !== undefined)
        habit.notifications.times = notifications.times;
      if (notifications.sound !== undefined)
        habit.notifications.sound = notifications.sound;
    }

    // 6. Dynamic Timeline Tracking Horizon Recalculation
    // If the user modifies their timeline duration strategy mid-cycle, compute a precise new endDate
    if (timelineType !== undefined || customDurationDays !== undefined) {
      const targetTimelineType =
        timelineType !== undefined ? timelineType : habit.timelineType;
      let daysToExtend = 21;

      if (targetTimelineType === '30_days') daysToExtend = 30;
      if (targetTimelineType === '66_days') daysToExtend = 66;
      if (targetTimelineType === 'custom') {
        const durationInput =
          customDurationDays !== undefined
            ? customDurationDays
            : customDurationDays;
        daysToExtend = parseInt(durationInput, 10);
        if (isNaN(daysToExtend) || daysToExtend <= 0) {
          return next(
            new AppError(
              'Please specify a valid numeric custom duration field length.',
              400
            )
          );
        }
      }

      // Project out the new calculation relative to the original tracking anchor startDate
      const revisedEndDate = new Date(habit.startDate);
      revisedEndDate.setDate(revisedEndDate.getDate() + daysToExtend);

      habit.timelineType = targetTimelineType;
      habit.endDate = revisedEndDate;
    }

    // 7. Save modifications to MongoDB
    await habit.save();

    return res.status(200).json({
      success: true,
      message: 'Habit updated successfully!',
      updatedHabit: habit,
    });
  } catch (error) {
    console.error('💥 Habit Complete Update Crash:', error.message);
    return next(error);
  }
};

/**
 * @description Delete the habit by id
 * @access      Private
 */
exports.deleteHabit = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return next(
        new AppError('Invalid habit identifier format provided.', 400)
      );
    }

    // 1. Delete source of truth document from MongoDB
    const processOutcome = await Habit.deleteOne({ _id: habitId, userId });
    if (processOutcome.deletedCount === 0) {
      return next(
        new AppError(
          'Target routine could not be verified or authorized to execute deletion.',
          404
        )
      );
    }

    // 2. Respond back to client interface
    return res.status(200).json({
      success: true,
      message: 'Habit deleted successfully.',
    });
  } catch (error) {
    console.error('💥 Habit Deletion Crash:', error.message);
    return next(error);
  }
};

/**
 * @description Mark actionable completed.
 * @access      Private
 */
exports.toggleActionableCompletion = async (req, res, next) => {
  try {
    const { habitId } = req.params;
    const { targetDate, actionKey } = req.body; // actionKey must be: 'stop' | 'start' | 'continue'
    const userId = req.user?.userId;

    // 1. Structural Parameter Validation Guards
    if (!['stop', 'start', 'continue'].includes(actionKey)) {
      return next(
        new AppError(
          "Invalid actionKey context choice. Must be 'stop', 'start', or 'continue'.",
          400
        )
      );
    }

    // Normalize calendar search bounds to standard midnight UTC to keep dates consistent across timezones
    const searchDate = targetDate ? new Date(targetDate) : new Date();
    searchDate.setUTCHours(0, 0, 0, 0);

    // 2. Fetch Source of Truth Document from MongoDB
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return next(
        new AppError('Target habit tracking blueprint could not be found.', 404)
      );
    }

    // 3. Locate or Instantiate the Sub-Document Telemetry Tracking Log for the Day
    const searchIsoString = searchDate.toISOString().split('T')[0];
    let dayLogIndex = habit.trackingLogs.findIndex(
      (log) => log.date.toISOString().split('T')[0] === searchIsoString
    );

    if (dayLogIndex === -1) {
      // Create a fresh tracking block container for this date if the user hasn't interacted with it yet
      habit.trackingLogs.push({
        date: searchDate,
        isStopCompleted: false,
        isStartCompleted: false,
        isContinueCompleted: false,
        dailyScorePercentage: 0,
      });
      dayLogIndex = habit.trackingLogs.length - 1;
    }

    const targetRecord = habit.trackingLogs[dayLogIndex];

    // ==========================================================================
    // 4. Strict One-Way Lock Guard: Verify state and enforce no unchecking
    // ==========================================================================
    if (actionKey === 'stop') {
      if (targetRecord.isStopCompleted) {
        return next(
          new AppError(
            "The 'Stop' actionable has already been checked and cannot be unchecked.",
            400
          )
        );
      }
      targetRecord.isStopCompleted = true;
    }

    if (actionKey === 'start') {
      if (targetRecord.isStartCompleted) {
        return next(
          new AppError(
            "The 'Start' actionable has already been checked and cannot be unchecked.",
            400
          )
        );
      }
      targetRecord.isStartCompleted = true;
    }

    if (actionKey === 'continue') {
      if (targetRecord.isContinueCompleted) {
        return next(
          new AppError(
            "The 'Continue' actionable has already been checked and cannot be unchecked.",
            400
          )
        );
      }
      targetRecord.isContinueCompleted = true;
    }

    // 5. Recalculate Dynamic Daily Execution Wheel Score Percentage
    let itemsAchieved = 0;
    if (targetRecord.isStopCompleted) itemsAchieved++;
    if (targetRecord.isStartCompleted) itemsAchieved++;
    if (targetRecord.isContinueCompleted) itemsAchieved++;

    targetRecord.dailyScorePercentage = Math.round((itemsAchieved / 3) * 100);

    // Persist changes directly down to MongoDB
    await habit.save();

    return res.status(200).json({
      success: true,
      message: `Successfully marked '${actionKey}' completed!`,
      dailyScorePercentage: targetRecord.dailyScorePercentage,
      currentDayLog: targetRecord,
      habit: habit, // Returns full updated layout object back to application state tree
    });
  } catch (error) {
    console.error('💥 Toggle Actionable Progress Crash:', error.message);
    return next(error);
  }
};

/**
 * @description   Get all habits constants
 */
exports.getHabitsConstants = async (req, res, next) => {
  try {
    const constants = {
      habitCategories: {
        ...HABIT_CATEGORIES,
        all: HABIT_CATEGORY_VALUES,
      },
      types: {
        ...HABIT_TYPES,
        all: HABIT_TYPE_VALUES,
      },
      templates: HABIT_TEMPLATES,
      timelines: HABIT_TIMELINES,
      weekdays: WEEKDAYS,
      notificationSounds: NOTIFICATION_SOUNDS,
      metadata: {
        version: '1.0.0',
        description:
          'Habit configuration constants for the 4-step habit builder wizard and predefined suggestions',
      },
    };

    return res.status(200).json({
      success: true,
      message: 'Habit configuration constants retrieved successfully.',
      habitConstants: constants,
    });
  } catch (error) {
    console.error('💥 Get Habit Constants Error:', error.message);
    return next(
      new AppError('Failed to retrieve habit constants. Please try again.', 500)
    );
  }
};
