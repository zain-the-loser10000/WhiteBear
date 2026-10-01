/**
 * @file todo.controller.js
 * @module controllers/todoController
 * @description Processes incoming user task interactions, custom entries, and calendar routing.
 */

const mongoose = require('mongoose');
const Todo = require('../models/todo.schema');
const Goal = require('../models/goal.schema');
const User = require('../models/user.schema');
const AppError = require('../errors/app-error');

/**
 * @description Creates a new To-Do entry
 * @access      Private
 */
exports.createTodo = async (req, res, next) => {
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

    // 🌟 FIX: Destructure incoming parameters from the request body
    const { title, targetDate, todoType, goalId, isRepeating } = req.body;

    // Validate that title exists before doing anything else
    if (!title || !title.trim()) {
      return next(new AppError('Please input a to-do task description.', 400));
    }

    // 🟢 Fetch user directly from MongoDB
    const sensitiveData = await User.findById(userId).select('-password -__v');
    if (!sensitiveData) {
      return next(
        new AppError('User account record could not be verified.', 404)
      );
    }

    /* -------------------------------------------------------------------------- */
    /* SUBSCRIPTION POLICY WALL - TODO CREATION                                   */
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

      const todosCreatedToday = await Todo.countDocuments({
        userId,
        todoType: 'DAILY',
        createdAt: { $gte: startOfToday },
      });

      if (todosCreatedToday >= 3) {
        return next(
          new AppError(
            'Free trial allows only 3 daily todos per day. Upgrade to Premium for unlimited access.',
            429
          )
        );
      }
    } else if (['monthly', 'yearly'].includes(sensitiveData.subscriptionPlan)) {
      // Premium users - Unlimited
    } else {
      return next(
        new AppError('Invalid subscription plan. Please contact support.', 403)
      );
    }

    // Normalize target date
    let parsedDate = targetDate ? new Date(targetDate) : new Date();
    if (isNaN(parsedDate.getTime())) {
      return next(new AppError('Invalid target date provided.', 400));
    }
    parsedDate.setUTCHours(0, 0, 0, 0);

    // Create Todo in MongoDB (Source of Truth)
    const newTodo = await Todo.create({
      userId,
      title: title.trim(),
      targetDate: parsedDate,
      originalTargetDate: parsedDate,
      todoType: todoType === 'GOAL' ? 'GOAL' : 'DAILY',
      goalId: todoType === 'GOAL' ? goalId : null,
      isRepeating: Boolean(isRepeating),
      status: 'pending',
      completedAt: null,
    });

    // === Build response payload ===
    const todoForSession = {
      id: newTodo._id.toString(),
      title: newTodo.title,
      targetDate: newTodo.targetDate.toISOString(),
      todoType: newTodo.todoType,
      goalId: newTodo.goalId,
      isRepeating: newTodo.isRepeating,
      status: newTodo.status,
      createdAt: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: 'To-Do created successfully!',
      newTodo: todoForSession,
    });
  } catch (error) {
    console.error('💥 Create Todo Error:', error.message);
    return next(
      new AppError('Failed to create to-do item. Please try again.', 500)
    );
  }
};

/**
 * @description   Retrieve all todos for the authenticated user
 * @access        Private
 */

exports.getAllTodos = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('Authentication required.', 401));
    }

    // Fetch todos sorted by target date and creation layout
    const todos = await Todo.find({ userId }).sort({
      targetDate: 1,
      createdAt: -1,
    });

    // Format response to flag outstanding tasks dynamically
    const processedTodos = todos.map((todo) => {
      const todoObj = todo.toObject();

      // 🌟 Outstanding Verification: If shifted to next days due to remaining uncompleted
      todoObj.isOutstanding = !todo.isCompleted && todo.rolloverCount > 0;

      return todoObj;
    });

    return res.status(200).json({
      success: true,
      message: 'Todos retrieved successfully.',
      count: processedTodos.length,
      allTodos: processedTodos,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description   Update an existing todo (Daily or Goal-linked) across DB and Cache
 * @access        Private
 */
exports.updateTodo = async (req, res, next) => {
  try {
    const { todoId } = req.params;
    const { title, isCompleted, targetDate, isRepeating } = req.body; // 🌟 NOTICE: We do NOT extract goalId here!
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return next(new AppError('Invalid To-Do ID format.', 400));
    }

    const mongoTodoId = new mongoose.Types.ObjectId(todoId);
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch the original todo straight from the database first
    const originalTodo = await Todo.findOne({
      _id: mongoTodoId,
      userId: mongoUserId,
    });
    if (!originalTodo) {
      return next(new AppError('Target to-do item could not be found.', 404));
    }

    // Capture the historical values so they are never lost
    const oldTitle = originalTodo.title;
    const stableGoalId = originalTodo.goalId; // 🔒 Save the original goalId safe and sound
    const stableTodoType = originalTodo.todoType; // 🔒 Save the original type

    // 2. Build a isolated update payload (Strict Whitelisting)
    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (isRepeating !== undefined)
      updatePayload.isRepeating = Boolean(isRepeating);

    if (isCompleted !== undefined) {
      updatePayload.isCompleted = Boolean(isCompleted);
      updatePayload.completedAt = isCompleted ? new Date() : null;
    }

    if (targetDate !== undefined) {
      const parsedDate = new Date(targetDate);
      if (!isNaN(parsedDate.getTime())) {
        parsedDate.setUTCHours(0, 0, 0, 0);
        updatePayload.targetDate = parsedDate;
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return next(
        new AppError('Please provide at least one field to update.', 400)
      );
    }

    // 3. Update MongoDB using ONLY the whitelisted payload fields
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: mongoTodoId, userId: mongoUserId },
      { $set: updatePayload }, // 🛡️ $set will ONLY touch fields inside updatePayload
      { new: true, runValidators: true }
    );

    // 4. Cascade changes into parent Goal document if it's a GOAL todo
    if (stableTodoType === 'GOAL' && stableGoalId) {
      const parentGoal = await Goal.findOne({
        _id: stableGoalId,
        userId: mongoUserId,
      });

      if (parentGoal && Array.isArray(parentGoal.tasks)) {
        parentGoal.tasks = parentGoal.tasks.map((task) => {
          if (typeof task === 'string') {
            return task === oldTitle ? updatedTodo.title : task;
          } else if (task && typeof task === 'object') {
            if (
              task.title === oldTitle ||
              task.id === todoId ||
              task._id?.toString() === todoId
            ) {
              if (updatePayload.title) task.title = updatePayload.title;
              if (updatePayload.isCompleted !== undefined)
                task.isCompleted = updatePayload.isCompleted;
            }
            return task;
          }
          return task;
        });

        parentGoal.markModified('tasks');
        await parentGoal.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Todo updated successfully.',
      updatedTodo: updatedTodo,
    });
  } catch (error) {
    console.error('💥 Update Todo Error:', error.message);
    return next(error);
  }
};

/**
 * @description   Delete an existing todo (Daily or Goal-linked) across DB and Cache
 * @access        Private
 */
exports.deleteTodo = async (req, res, next) => {
  try {
    const { todoId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return next(
        new AppError(
          'Authentication required. Missing user identity credentials.',
          401
        )
      );
    }

    // 🛡️ 1. Validate ObjectId structure
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return next(new AppError('Invalid To-Do ID format provided.', 400));
    }

    const mongoTodoId = new mongoose.Types.ObjectId(todoId);
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    // 2. Locate the target document to retrieve its type details before destruction
    const todoToDelete = await Todo.findOne({
      _id: mongoTodoId,
      userId: mongoUserId,
    });
    if (!todoToDelete) {
      return next(
        new AppError(
          'Target to-do item could not be found, or access is unauthorized.',
          404
        )
      );
    }

    const { todoType, goalId, title: oldTitle } = todoToDelete;

    // 3. Purge the main Todo document from MongoDB
    await Todo.deleteOne({ _id: mongoTodoId, userId: mongoUserId });

    // 4. 🟢 Cascade Removal: If it is a GOAL type todo, pull it from the parent Goal document
    if (todoType === 'GOAL' && goalId) {
      const parentGoal = await Goal.findOne({
        _id: goalId,
        userId: mongoUserId,
      });

      if (parentGoal && Array.isArray(parentGoal.tasks)) {
        // Filter out the task whether it's stored as a raw text string or a structured object
        parentGoal.tasks = parentGoal.tasks.filter((task) => {
          if (typeof task === 'string') {
            return task !== oldTitle;
          } else if (task && typeof task === 'object') {
            const currentTaskId = task.id || task._id?.toString();
            return currentTaskId !== todoId && task.title !== oldTitle;
          }
          return true;
        });

        // Inform Mongoose of the internal array layout change, then commit
        parentGoal.markModified('tasks');
        await parentGoal.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Todo deleted successfully!',
    });
  } catch (error) {
    console.error('💥 Delete Todo Cascade Error:', error.message);
    return next(error);
  }
};

/**
 * @description   Toggle todo completion status (isCompleted) and sync across DB
 * @access        Private
 */
exports.toggleTodoCompletion = async (req, res, next) => {
  try {
    const { todoId } = req.params;
    const { isCompleted } = req.body; // Expecting a boolean (true/false)
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError('Authentication required.', 401));
    }

    if (isCompleted === undefined) {
      return next(
        new AppError('Please provide an isCompleted boolean status.', 400)
      );
    }

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return next(new AppError('Invalid To-Do ID format.', 400));
    }

    const mongoTodoId = new mongoose.Types.ObjectId(todoId);
    const mongoUserId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch original todo to secure its metadata (type, goal relationship, and title)
    const originalTodo = await Todo.findOne({
      _id: mongoTodoId,
      userId: mongoUserId,
    });
    if (!originalTodo) {
      return next(new AppError('Target to-do item could not be found.', 404));
    }

    const { title: todoTitle, todoType, goalId } = originalTodo;

    // 2. Prepare completion tracking properties
    const updatedStatus = Boolean(isCompleted);
    const completedAtTimestamp = updatedStatus ? new Date() : null;

    // 3. Update the main Todo Document in MongoDB
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: mongoTodoId, userId: mongoUserId },
      {
        $set: {
          isCompleted: updatedStatus,
          completedAt: completedAtTimestamp,
        },
      },
      { new: true, runValidators: true }
    );

    // 4. 🟢 Cascade Status Update to Parent Goal Document if type is 'GOAL'
    if (todoType === 'GOAL' && goalId) {
      const parentGoal = await Goal.findOne({
        _id: goalId,
        userId: mongoUserId,
      });

      if (parentGoal && Array.isArray(parentGoal.tasks)) {
        parentGoal.tasks = parentGoal.tasks.map((task) => {
          if (task && typeof task === 'object') {
            // Match via matching explicit structural IDs or string text fallbacks
            if (
              task.id === todoId ||
              task._id?.toString() === todoId ||
              task.title === todoTitle
            ) {
              task.isCompleted = updatedStatus;
              task.completedAt = completedAtTimestamp;
            }
          }
          return task;
        });

        parentGoal.markModified('tasks');
        await parentGoal.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `To-Do ${updatedStatus ? 'completed' : 'incomplete'} successfully.`,
      todo: updatedTodo,
    });
  } catch (error) {
    console.error('💥 Toggle Todo Completion Error:', error.message);
    return next(error);
  }
};

/**
 * @description Automatically shifts incomplete past todos to the next calendar day
 * @schedule    Should run daily at 00:00 (Midnight) server/local alignment
 */
exports.executeDailyTodoRollOver = async () => {
  try {
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);

    // 1. Find all tasks where targetDate is in the past AND they are still incomplete
    const outstandingPastTodos = await Todo.find({
      targetDate: { $lt: todayMidnight },
      isCompleted: false,
    });

    if (outstandingPastTodos.length === 0) return;

    console.log(
      `⏳ Rollover Engine: Shifting ${outstandingPastTodos.length} outstanding tasks...`
    );

    // 2. Map and loop over them to shift dates forward
    for (const todo of outstandingPastTodos) {
      const originalDateLog = todo.targetDate;

      // Move target date to today midnight execution window
      todo.targetDate = todayMidnight;

      // Increment rollover count context matrix
      todo.rolloverCount += 1;

      await todo.save();
    }

    console.log(
      '✅ Auto-Rollover Layer complete. All remaining tasks marked as outstanding.'
    );
  } catch (error) {
    console.error('💥 Critical Rollover Engine Failure:', error.message);
  }
};
