/**
 * @file analytics.scheduler.js
 * @description Analytical engine for extracting and merging telemetry streams from MongoDB with correct time windows.
 */

const cron = require('node-cron');
const Analytics = require('../models/analytic.schema');
const User = require('../models/user.schema'); // Assuming user model path is here
const geminiService = require('../services/gemini.service');

// ================================================================================
// 🔵 HELPER: Dynamic MongoDB Upsert Handler
// ================================================================================
const upsertSnapshot = async ({
  userId,
  rangeMode,
  analyticsType,
  windowStartDate,
  windowEndDate,
  computedAt,
  payloadData,
}) => {
  await Analytics.findOneAndUpdate(
    { userId, rangeMode, analyticsType },
    {
      userId,
      rangeMode,
      analyticsType,
      windowStartDate,
      windowEndDate,
      computedAt,
      data: payloadData,
    },
    { upsert: true, returnDocument: 'after' }
  );
};

// ================================================================================
// 🟢 HELPER: Build Comprehensive Habit Summary
// ================================================================================
const buildHabitSummary = (habit) => {
  // Calculate completion rate from tracking logs
  const logs = habit.trackingLogs || [];
  let totalDays = logs.length;
  let completedDays = 0;
  let totalActionsCompleted = 0;
  let totalActionsPossible = 0;

  logs.forEach((log) => {
    const completed = [
      log.isStopCompleted,
      log.isStartCompleted,
      log.isContinueCompleted,
    ].filter(Boolean).length;

    totalActionsCompleted += completed;
    totalActionsPossible += 3; // 3 actionables per day

    if (completed === 3) completedDays++;
  });

  const completionRate =
    totalActionsPossible > 0
      ? Math.round((totalActionsCompleted / totalActionsPossible) * 100)
      : 0;

  // Get the most recent log
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // Calculate days since last activity
  let daysSinceLastActivity = 0;
  if (lastLog && lastLog.date) {
    const lastDate = new Date(lastLog.date);
    const now = new Date();
    daysSinceLastActivity = Math.floor(
      (now - lastDate) / (1000 * 60 * 60 * 24)
    );
  }

  // Determine if habit is on track
  let status = 'active';
  if (completionRate >= 80) status = 'consistent';
  else if (completionRate >= 50) status = 'building';
  else if (completionRate >= 20) status = 'inconsistent';
  else if (daysSinceLastActivity > 7) status = 'stalled';
  else status = 'new';

  // Build the actionables summary
  const actionables = habit.actionables || {};
  const stopText = actionables.stop || 'Not specified';
  const startText = actionables.start || 'Not specified';
  const continueText = actionables.continue || 'Not specified';

  return {
    // Core habit info
    habitId: habit._id?.toString() || habit.id || 'unknown',
    title: habit.title || 'Unnamed Habit',
    habitType: habit.habitType || 'make', // 'make' or 'break'
    category: habit.category || 'uncategorized',
    status: status,

    // Actionables
    actionables: {
      stop: stopText,
      start: startText,
      continue: continueText,
    },

    // Performance metrics
    completionRate: completionRate,
    completedDays: completedDays,
    totalDays: totalDays || 0,
    currentStreak: habit.currentStreak || 0,
    longestStreak: habit.longestStreak || 0,
    daysSinceLastActivity: daysSinceLastActivity,

    // Latest tracking details
    lastActivity: lastLog
      ? {
          date: lastLog.date
            ? new Date(lastLog.date).toISOString().split('T')[0]
            : null,
          stopCompleted: lastLog.isStopCompleted || false,
          startCompleted: lastLog.isStartCompleted || false,
          continueCompleted: lastLog.isContinueCompleted || false,
          dailyScore: lastLog.dailyScorePercentage || 0,
        }
      : null,

    // Schedule info
    selectedDays: habit.selectedDays || [],
    startDate: habit.startDate
      ? new Date(habit.startDate).toISOString().split('T')[0]
      : null,
    endDate: habit.endDate
      ? new Date(habit.endDate).toISOString().split('T')[0]
      : null,

    // Notification preference
    notificationSound: habit.notifications?.sound || 'default',
    notificationTimes: habit.notifications?.times || [],
    isEveryDayNotification: habit.notifications?.isEveryDay || false,
  };
};

// ================================================================================
// 🟢 STEP 1: BIWEEKLY GENERATOR & SAVER (15 Days Lookup Window)
// ================================================================================
const processAndSaveBiweeklyPipelines = async (
  userData,
  boundaryDate,
  now
) => {
  const userId = userData.userId || userData._id?.toString();

  // 1. 📖 JOURNALS PIPELINE
  const rawJournals = userData.journals || [];
  const filteredJournals = rawJournals.filter(
    (log) => new Date(log.targetDate) >= boundaryDate
  );

  if (filteredJournals.length > 0) {
    filteredJournals.sort(
      (a, b) => new Date(a.targetDate) - new Date(b.targetDate)
    );
    const journalsDataArray = filteredJournals.map((log) => ({
      id: log.id || log._id?.toString(),
      targetDate:
        typeof log.targetDate === 'string'
          ? log.targetDate.split('T')[0]
          : new Date(log.targetDate).toISOString().split('T')[0],
      journalType: log.journalType,
      challenges: log.challenges || '',
      ...(log.journalType === 'DAILY'
        ? { mood: log.mood || '', memorableMoment: log.memorableMoment || '' }
        : { bigWins: log.bigWins || '' }),
    }));

    const journalsAnalytics = await geminiService.generateJournalAnalytics({
      userId,
      journalsDataArray,
    });

    await upsertSnapshot({
      userId,
      rangeMode: 'biweekly',
      analyticsType: 'JOURNALS',
      windowStartDate: boundaryDate,
      windowEndDate: now,
      computedAt: now,
      payloadData: {
        journals: journalsAnalytics,
        todos: null,
        goals: null,
        habits: null,
      },
    });
  }

  // 2. 📝 TODOS PIPELINE
  const rawTodos = userData.todos || [];
  const filteredTodos = rawTodos.filter(
    (t) => new Date(t.createdAt || Date.now()) >= boundaryDate
  );

  if (filteredTodos.length > 0) {
    const todosSummaryArray = filteredTodos.map((t) => ({
      type: t.todoType,
      isCompleted: t.isCompleted,
      rolloversIncurred: t.rolloverCount || 0,
    }));
    const todosAnalytics = await geminiService.generateTodoAnalytics({
      userId,
      todosSummaryArray,
      rangeMode: 'biweekly',
    });

    await upsertSnapshot({
      userId,
      rangeMode: 'biweekly',
      analyticsType: 'TODOS',
      windowStartDate: boundaryDate,
      windowEndDate: now,
      computedAt: now,
      payloadData: {
        journals: null,
        todos: todosAnalytics,
        goals: null,
        habits: null,
      },
    });
  }

  // 3. 🎯 GOALS PIPELINE
  const rawGoals = userData.goals || [];
  const filteredGoals = rawGoals.filter(
    (g) => new Date(g.updatedAt || Date.now()) >= boundaryDate
  );

  if (filteredGoals.length > 0) {
    const goalsSummaryArray = filteredGoals.map((g) => ({
      id:
        g._id?.toString() ||
        g.id ||
        `goal_${Math.random().toString(36).slice(2)}`,
      title: g.title,
      status: g.status,
      progress: g.progressPercentage || 0,
      category: g.category || null,
      description: g.description ? g.description.substring(0, 150) : null,
      createdAt: g.createdAt
        ? new Date(g.createdAt).toISOString().split('T')[0]
        : null,
      updatedAt: g.updatedAt
        ? new Date(g.updatedAt).toISOString().split('T')[0]
        : null,
      lastActivity: g.lastActivity || g.updatedAt || null,
      completionHistory: g.completionHistory || null,
    }));

    const goalsAnalytics = await geminiService.generateGoalsAnalytics({
      userId,
      operationalDataSummary: goalsSummaryArray,
      rangeMode: 'biweekly',
    });

    await upsertSnapshot({
      userId,
      rangeMode: 'biweekly',
      analyticsType: 'GOALS',
      windowStartDate: boundaryDate,
      windowEndDate: now,
      computedAt: now,
      payloadData: {
        journals: null,
        todos: null,
        goals: goalsAnalytics,
        habits: null,
      },
    });

    console.log(
      `✅ Goals Analytics generated for ${filteredGoals.length} goals (user: ${userId})`
    );
  }

  // 4. ⚡ HABITS PIPELINE
  const rawHabits = userData.habits || [];
  const filteredHabits = rawHabits.filter(
    (h) => new Date(h.updatedAt || Date.now()) >= boundaryDate
  );

  if (filteredHabits.length > 0) {
    const habitsSummaryArray = filteredHabits.map(buildHabitSummary);

    console.log(
      `📊 [Habits] Processing ${filteredHabits.length} habits for user ${userId}`
    );

    const habitsAnalytics = await geminiService.generateHabitsAnalytics({
      userId,
      habitsSummaryArray,
      rangeMode: 'biweekly',
    });

    await upsertSnapshot({
      userId,
      rangeMode: 'biweekly',
      analyticsType: 'HABITS',
      windowStartDate: boundaryDate,
      windowEndDate: now,
      computedAt: now,
      payloadData: {
        journals: null,
        todos: null,
        goals: null,
        habits: habitsAnalytics,
      },
    });

    console.log(
      `✅ Habits Analytics generated for ${filteredHabits.length} habits (user: ${userId})`
    );
  } else {
    console.log(
      `⚠️ [Habits] No habits found for user ${userId} in the last 15 days`
    );
  }
};

// ================================================================================
// 🔵 MAIN PIPELINE CONTROLLER (Configured for 15, 30, and 90 Days Windows)
// ================================================================================
const runIncrementalAnalyticsPipeline = async (rangeMode) => {
  const now = new Date();
  console.log(
    `\n🤖 [Pipeline Triggered] Compiling data for mode: ${rangeMode.toUpperCase()} at ${now.toLocaleTimeString()}`
  );

  try {
    // Fetch active users directly from MongoDB
    const activeUsers = await User.find({ isActive: true }).lean();
    if (!activeUsers || activeUsers.length === 0) return;

    for (const userData of activeUsers) {
      const userId = userData.userId || userData._id?.toString();
      const targetTypes = ['JOURNALS', 'TODOS', 'GOALS', 'HABITS'];

      // 🛑 MODE 1: BIWEEKLY (15 Days Window Lookup)
      if (rangeMode === 'biweekly') {
        const boundaryDate = new Date();
        boundaryDate.setDate(boundaryDate.getDate() - 15);

        await processAndSaveBiweeklyPipelines(userData, boundaryDate, now);
        console.log(
          `✅ Processed & Saved Dynamic 15-Day Biweekly snapshots for user ${userId}`
        );
      }

      // 🛑 MODE 2: MONTHLY (30 Days Window Lookup)
      else if (rangeMode === 'monthly') {
        const boundaryDate = new Date();
        boundaryDate.setDate(boundaryDate.getDate() - 30);

        for (const type of targetTypes) {
          const pastBiweeklies = await Analytics.find({
            userId,
            rangeMode: 'biweekly',
            analyticsType: type,
            computedAt: { $gte: boundaryDate },
          })
            .sort({ computedAt: -1 })
            .limit(2)
            .lean();

          if (pastBiweeklies.length === 2) {
            const mergedMonthlyData =
              await geminiService.mergeSnapshotsIntoHigherRange({
                rangeMode: 'monthly',
                snapshotsArray: pastBiweeklies.map((b) => b.data),
              });

            await upsertSnapshot({
              userId,
              rangeMode: 'monthly',
              analyticsType: type,
              windowStartDate: pastBiweeklies[1].windowStartDate,
              windowEndDate: now,
              computedAt: now,
              payloadData: mergedMonthlyData,
            });
            console.log(
              `✅ Merged 2 Biweeklies into 1 30-Day Monthly [${type}] Snapshot for user ${userId}`
            );
          }
        }
      }

      // 🛑 MODE 3: QUARTERLY (90 Days Window Lookup)
      else if (rangeMode === 'quarterly') {
        const boundaryDate = new Date();
        boundaryDate.setDate(boundaryDate.getDate() - 90);

        for (const type of targetTypes) {
          const pastMonthlies = await Analytics.find({
            userId,
            rangeMode: 'monthly',
            analyticsType: type,
            computedAt: { $gte: boundaryDate },
          })
            .sort({ computedAt: -1 })
            .limit(3)
            .lean();

          if (pastMonthlies.length === 3) {
            const mergedQuarterlyData =
              await geminiService.mergeSnapshotsIntoHigherRange({
                rangeMode: 'quarterly',
                snapshotsArray: pastMonthlies.map((m) => m.data),
              });

            await upsertSnapshot({
              userId,
              rangeMode: 'quarterly',
              analyticsType: type,
              windowStartDate: pastMonthlies[2].windowStartDate,
              windowEndDate: now,
              computedAt: now,
              payloadData: mergedQuarterlyData,
            });
            console.log(
              `✅ Merged 3 Monthlies into 1 90-Day Quarterly [${type}] Snapshot for user ${userId}`
            );
          }
        }
      }
    }
  } catch (err) {
    console.error(
      `🚨 Error in ${rangeMode} incremental pipeline:`,
      err.message
    );
  }
};

// ================================================================================
// ⏰ PRODUCTION CRON TRIGGERS
// ================================================================================
exports.initAnalyticsSchedulers = () => {
  cron.schedule('0 */12 * * *', async () => {
    await runIncrementalAnalyticsPipeline('biweekly');
  });

  cron.schedule('0 1 * * *', async () => {
    await runIncrementalAnalyticsPipeline('monthly');
  });

  cron.schedule('0 2 */2 * *', async () => {
    await runIncrementalAnalyticsPipeline('quarterly');
  });

  console.log(
    '🚀 [Production Analytics Engine] Active! Interval schedules configured for 12-hour, Daily, and Biennial rollups.'
  );
};