/**
 * @file goal.controller.js
 * @module controller/goalController
 * @description Orchestrates the wellness wizard pipelines, dates engine, and Gemini service evaluations with centralized AppError handling.
 */

const mongoose = require('mongoose');
const Goal = require('../models/goal.schema');
const Todo = require('../models/todo.schema');
const User = require('../models/user.schema');
const AppError = require('../errors/app-error');
const {
  GOAL_ENUM_VALUES,
  TIMELINE_TYPES,
  WEEKDAYS,
  DAILY_COMMITMENTS,
  GOAL_TEMPLATES,
} = require('../constants/goal.constant'); // 🟢 Integrated constants for strict validation
const {
  generateAssistedDescription,
  generateActionableRoadmap,
} = require('../services/gemini.service');

/**
 * @description   Generate goal description using AI
 * @access        Public
 */
exports.generateAiDescription = async (req, res, next) => {
  try {
    const { category, title, userApiKey } = req.body;

    if (!category || !title) {
      return next(
        new AppError('Category and title inputs are required parameters.', 400)
      );
    }

    const aiDescription = await generateAssistedDescription({
      category,
      title,
      explicitApiKey: userApiKey,
    });

    return res.status(200).json({
      success: true,
      message: 'Description generated successfully',
      description: aiDescription,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description   Generate goal configuration, enforcing 15-day trial rules and daily rate-limits
 * @access        Private
 */
exports.generateNewGoal = async (req, res, next) => {
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

    // 🟢 Fetch user directly from MongoDB
    const sensitiveData = await User.findById(userId).select('-password -__v');
    if (!sensitiveData) {
      return next(
        new AppError('User account record could not be verified.', 404)
      );
    }

    /* -------------------------------------------------------------------------- */
    /* FREE TRIAL vs PREMIUM SUBSCRIPTION POLICIES                                */
    /* -------------------------------------------------------------------------- */
    if (sensitiveData.subscriptionPlan === 'free_trial') {
      const trialExpiry = sensitiveData.trialExpiresAt
        ? new Date(sensitiveData.trialExpiresAt)
        : null;

      // Trial expired
      if (trialExpiry && new Date() > trialExpiry) {
        return next(
          new AppError(
            'Your 15-day free trial has expired. Please upgrade to Premium for unlimited access.',
            403
          )
        );
      }

      // Daily goal creation limit for Free Trial
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const goalsCreatedToday = await Goal.countDocuments({
        userId,
        createdAt: { $gte: startOfToday, $lte: endOfToday },
      });

      if (goalsCreatedToday >= 3) {
        return next(
          new AppError(
            'Free trial allows maximum 3 goals per day. Upgrade to Premium for unlimited goal creation.',
            429
          )
        );
      }
    }
    // Premium users (monthly/yearly) get unlimited goals - no restrictions
    else if (['monthly', 'yearly'].includes(sensitiveData.subscriptionPlan)) {
      console.log(
        `Premium user (${sensitiveData.subscriptionPlan}) - Unlimited goals allowed`
      );
    } else {
      return next(
        new AppError(
          'Invalid subscription status. Please contact support.',
          403
        )
      );
    }

    // 1. Destructure Wizard inputs
    let {
      category,
      title,
      timelineType,
      customEndDate,
      selectedDays,
      dailyCommitment,
      description,
      reminderTimes, // 🌟 Changed from reminderTime to reminderTimes array
      isAiAssistedDescription,
      userApiKey,
    } = req.body;

    if (
      !category ||
      !title ||
      !timelineType ||
      !selectedDays ||
      !dailyCommitment
    ) {
      return next(
        new AppError('Missing required goal wizard configuration fields.', 400)
      );
    }

    // 2. DEFENSIVE SANITIZATION & STRICT CONSTANTS VALIDATION
    category = category.toLowerCase();
    if (!GOAL_ENUM_VALUES.includes(category)) {
      return next(
        new AppError(
          `Invalid goal category. Must be one of: ${GOAL_ENUM_VALUES.join(', ')}`,
          400
        )
      );
    }

    if (!TIMELINE_TYPES.includes(timelineType)) {
      return next(
        new AppError(
          `Invalid timeline type. Must be one of: ${TIMELINE_TYPES.join(', ')}`,
          400
        )
      );
    }

    if (Array.isArray(selectedDays)) {
      selectedDays = selectedDays.map((day) => day.toLowerCase());
      const hasInvalidDay = selectedDays.some((day) => !WEEKDAYS.includes(day));
      if (hasInvalidDay) {
        return next(
          new AppError('One or more selected days are invalid weekdays.', 400)
        );
      }
    } else {
      return next(
        new AppError('Selected days parameter must be a valid array.', 400)
      );
    }

    // Normalize legacy/variant time commitments to match goal.constants.js values
    if (dailyCommitment === '15_mins') dailyCommitment = '15m';
    if (dailyCommitment === '30_mins') dailyCommitment = '30m';
    if (dailyCommitment === '1_hour') dailyCommitment = '1h';

    if (!DAILY_COMMITMENTS.includes(dailyCommitment)) {
      return next(
        new AppError(
          `Invalid daily commitment length. Must be one of: ${DAILY_COMMITMENTS.join(', ')}`,
          400
        )
      );
    }

    // 🌟 Defensive array validation for multiple reminder time points
    // Inside exports.generateNewGoal verification step:
    if (
      reminderTimes &&
      Array.isArray(reminderTimes) &&
      reminderTimes.length > 0
    ) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      const hasInvalidTime = reminderTimes.some(
        (time) => !timeRegex.test(time)
      );

      if (hasInvalidTime) {
        return next(
          new AppError(
            'All provided reminder times must match HH:MM format.',
            400
          )
        );
      }

      // 🌟 ADD THIS: Ensure all hours are stored perfectly zero-padded (e.g., "9:05" -> "09:05")
      reminderTimes = reminderTimes.map((time) => {
        const [h, m] = time.split(':');
        return `${h.padStart(2, '0')}:${m}`;
      });
    }

    // 3. Calculate Calendar End Date boundaries
    let computedEndDate = new Date();
    if (timelineType === '1_week') {
      computedEndDate.setDate(computedEndDate.getDate() + 7);
    } else if (timelineType === '1_month') {
      computedEndDate.setMonth(computedEndDate.getMonth() + 1);
    } else if (timelineType === '3_months') {
      computedEndDate.setMonth(computedEndDate.getMonth() + 3);
    } else if (timelineType === 'custom' && customEndDate) {
      computedEndDate = new Date(customEndDate);
      if (isNaN(computedEndDate.getTime())) {
        return next(
          new AppError(
            'Provided custom end date is an invalid date structure.',
            400
          )
        );
      }
    } else {
      computedEndDate = null;
    }

    // 4. Trigger Gemini Multi-Engine Parsing
    let aiCompilationResult;
    try {
      aiCompilationResult = await generateActionableRoadmap({
        category,
        title,
        timelineType,
        selectedDays,
        dailyCommitment,
        description,
        explicitApiKey: userApiKey,
      });
    } catch (aiError) {
      return next(
        new AppError(
          `Gemini Engine compilation failure: ${aiError.message}`,
          502
        )
      );
    }

    const newGoal = await Goal.create({
      userId,
      category,
      title,
      timelineType,
      endDate: computedEndDate,
      selectedDays,
      dailyCommitment,
      description,
      reminderTimes, // 🌟 Save the collection array properties field directly to Mongo document
      isAiAssistedDescription: !!isAiAssistedDescription,
      aiGeneratedRoadmap: aiCompilationResult.roadmapMarkdown,
      tasks: aiCompilationResult.tasks,
      status: 'active',
    });

    // 2. 🟢 Bulk provision individual items into the Todo collection
    let createdTodosForSession = [];

    if (
      aiCompilationResult.tasks &&
      Array.isArray(aiCompilationResult.tasks) &&
      aiCompilationResult.tasks.length > 0
    ) {
      const defaultTodoDate = new Date();
      defaultTodoDate.setUTCHours(0, 0, 0, 0);

      const todosToProvision = aiCompilationResult.tasks.map((task) => {
        const taskTitle =
          typeof task === 'string' ? task : task.title || task.text;

        return {
          userId,
          title: taskTitle.trim(),
          targetDate: defaultTodoDate,
          originalTargetDate: defaultTodoDate,
          todoType: 'GOAL',
          goalId: newGoal._id,
          isRepeating: false,
          status: 'pending',
          completedAt: null,
        };
      });

      const insertedTodos = await Todo.insertMany(todosToProvision);

      createdTodosForSession = insertedTodos.map((todo) => ({
        id: todo._id.toString(),
        title: todo.title,
        targetDate: todo.targetDate.toISOString(),
        todoType: todo.todoType,
        goalId: todo.goalId.toString(),
        isRepeating: todo.isRepeating,
        status: todo.status,
        createdAt: new Date().toISOString(),
      }));
    }

    // 3. Convert Mongoose Goal payload into a plain JavaScript Object
    const goalForSession = newGoal.toObject({
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    });
    if (goalForSession.progress === undefined) goalForSession.progress = 0;

    // 5. Respond to frontend
    return res.status(201).json({
      success: true,
      message: 'Goal generated successfully!',
      newGoal: goalForSession,
      todosCount: createdTodosForSession.length,
    });
  } catch (error) {
    console.error('💥 Goal Compilation & Sync Failure:', error);
    return next(error);
  }
};

/**
 * @description   Toggle single task status + dynamically evaluate overall goal status
 * @access        Public
 */
exports.toggleTaskStatus = async (req, res, next) => {
  try {
    const { goalId, taskId } = req.params;
    const { isCompleted } = req.body;
    const userId = req.user?.userId;

    if (isCompleted === undefined) {
      return next(
        new AppError(
          'The isCompleted boolean state is required in the request body.',
          400
        )
      );
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return next(
        new AppError(
          'Target goal could not be found, or access is unauthorized.',
          404
        )
      );
    }

    const task = goal.tasks.id(taskId);
    if (!task) {
      return next(
        new AppError('Target task item not found inside this goal.', 404)
      );
    }

    task.isCompleted = isCompleted;

    const totalTasks = goal.tasks.length;
    const completedTasks = goal.tasks.filter((t) => t.isCompleted).length;

    if (completedTasks === totalTasks && totalTasks > 0) {
      goal.status = 'completed';
    } else {
      goal.status = 'active';
    }

    await goal.save();

    return res.status(200).json({
      success: true,
      message: `Task successfully marked as ${isCompleted ? 'completed' : 'incomplete'}.`,
      analytics: {
        totalTasks,
        completedTasks,
        goalStatus: goal.status,
        progressText: `${completedTasks}/${totalTasks} Tasks Completed`,
      },
      goal,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description   Master Trigger: Instantly marks the goal and ALL of its nested tasks as completed
 * @access        Public
 */
exports.markGoalCompleted = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return next(
        new AppError(
          'Authentication required. Missing user identity credentials.',
          401
        )
      );
    }

    // 🛡️ 1. Cast and validate ObjectId structures safely
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return next(new AppError('Invalid Goal ID format provided.', 400));
    }

    const mongoGoalId = new mongoose.Types.ObjectId(goalId);
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    const completedAtTimestamp = new Date();

    // 2. Update the Goal document inside MongoDB (and mark all internal roadmap tasks as completed)
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: mongoGoalId, userId: mongoUserId },
      {
        $set: {
          status: 'completed',
          'tasks.$[].isCompleted': true,
          'tasks.$[].completedAt': completedAtTimestamp,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedGoal) {
      return next(
        new AppError(
          'Target goal could not be found, or access is unauthorized.',
          404
        )
      );
    }

    // 3. 🟢 MongoDB Cascade: Mark all standalone linked Todos as completed simultaneously
    await Todo.updateMany(
      { goalId: mongoGoalId, userId: mongoUserId },
      {
        $set: {
          isCompleted: true,
          completedAt: completedAtTimestamp,
        },
      }
    );

    const totalTasks = updatedGoal.tasks.length;

    return res.status(200).json({
      success: true,
      message: 'Goal completed successfully!',
      analytics: {
        totalTasks,
        completedTasks: totalTasks,
        goalStatus: 'completed',
        progressText: `${totalTasks}/${totalTasks} Tasks Completed`,
      },
      goal: updatedGoal,
    });
  } catch (error) {
    console.error('💥 Mark Goal Completed Cascade Error:', error.message);
    return next(error);
  }
};

/**
 * @description   Retrieve all goals for the authenticated user
 * @access        Private
 */
exports.getAllGoals = async (req, res, next) => {
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

    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Goals retrieved successfully.',
      count: goals.length,
      allGoals: goals,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description   Update an existing goal criteria
 * @access        Private
 */
exports.updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return next(
        new AppError(
          'Authentication required. Missing user identity credentials.',
          401
        )
      );
    }

    // 🛡️ 1. Cast and validate ObjectId structures safely
    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return next(new AppError('Invalid Goal ID format provided.', 400));
    }

    const mongoGoalId = new mongoose.Types.ObjectId(goalId);
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (description !== undefined)
      updatePayload.description = description.trim();

    if (Object.keys(updatePayload).length === 0) {
      return next(
        new AppError(
          'Please provide at least a title or description field to update.',
          400
        )
      );
    }

    // 2. Execute update inside MongoDB (Source of Truth)
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: mongoGoalId, userId: mongoUserId },
      { $set: updatePayload },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedGoal) {
      return next(
        new AppError(
          'Target goal could not be found, or access is unauthorized.',
          404
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Goal updated successfully across all storage layers.',
      updatedGoal: updatedGoal,
    });
  } catch (error) {
    console.error('💥 Update Goal Sync Error:', error.message);
    return next(error);
  }
};

/**
 * @description   Delete a goal and all its generated AI tasks/todos
 * @access        Private
 */

exports.deleteGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return next(
        new AppError(
          'Authentication required. Missing user identity credentials.',
          401
        )
      );
    }

    // 1. Delete the Goal from MongoDB
    const deletedGoal = await Goal.findOneAndDelete({ _id: goalId, userId });

    if (!deletedGoal) {
      return next(
        new AppError(
          'Target goal could not be found, or access is unauthorized.',
          404
        )
      );
    }

    // 2. 🟢 MongoDB Cascade Delete: Wipe all linked Todos matching this goal ID
    await Todo.deleteMany({ goalId, userId });

    // 3. Atomically remove the goal ID from parent User profile document in MongoDB
    await User.findByIdAndUpdate(userId, {
      $pull: { goals: goalId },
    });

    return res.status(200).json({
      success: true,
      message: 'Goal deleted successfully!',
    });
  } catch (error) {
    console.error('💥 Delete Cascade Error:', error.message);
    return next(error);
  }
};

/**
 * @description   Get all goals constants
 */
exports.getGoalConstants = async (req, res, next) => {
  try {
    // Return all constants in a structured format
    const constants = {
      goalCategories: {
        FAMILY_RELATIONSHIPS: 'family_relationships',
        MINDFULNESS_FOCUS: 'mindfulness_focus',
        SLEEP_RECOVERY: 'sleep_recovery',
        SELF_CARE_REFLECTION: 'self_care_reflection',
        PHYSICAL_WELLNESS: 'physical_wellness',
        EMOTIONAL_RESILIENCE: 'emotional_resilience',
        BOUNDARIES_BALANCE: 'boundaries_balance',
        CUSTOM: 'custom',
        all: GOAL_ENUM_VALUES,
      },
      goalTemplates: GOAL_TEMPLATES,
      timelineTypes: TIMELINE_TYPES,
      weekdays: WEEKDAYS,
      dailyCommitments: DAILY_COMMITMENTS,
      metadata: {
        version: '1.0.0',
        description:
          'Goal configuration constants for wellness categories, timelines, and daily commitments',
        characterLimit: 250,
      },
    };

    return res.status(200).json({
      success: true,
      message: 'Goal constants retrieved successfully.',
      goalConstants: constants,
    });
  } catch (error) {
    console.error('💥 Get Goal Constants Error:', error.message);
    return next(
      new AppError('Failed to retrieve goal constants. Please try again.', 500)
    );
  }
};
