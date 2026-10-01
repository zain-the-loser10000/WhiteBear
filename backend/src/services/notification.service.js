/**
 * @file notification.service.js
 * @module services/notificationService
 * @description Background engine and direct routing modules for Firebase Cloud Messaging (FCM) with centralized error handling.
 */

const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const crypto = require('crypto');
const cron = require('node-cron');
const Goal = require('../models/goal.schema');
const Habit = require('../models/habit.schema');
const User = require('../models/user.schema');
const AppError = require('../errors/app-error');

// 🚀 Initialize Firebase Admin SDK Core Instance
try {
  // Parse the environment string back into a functional config object
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin Initialized via Env Variable.');
} catch (error) {
  console.error('❌ [Firebase Admin Initialization Error]:', error.message);
}

/**
 * @description Helper: Formats current day to lowercase matching your enum schema
 * Enforces local Pakistan Standard Time calculation to guarantee scheduling parity.
 */
const getCurrentDayName = () => {
  const localDayString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Karachi',
  });
  return localDayString.toLowerCase();
};

/**
 * @description Helper: Formats current system time to a clean "HH:MM" 24-hour match window
 * Guarantees zero-padding stability without environment-specific Intl layout deviations.
 */
const getCurrentTimeFormatted = () => {
  const now = new Date();

  // 1. Force the current server time into an absolute UTC timestamp
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;

  // 2. Add the exact Pakistan Standard Time offset (UTC +5 hours)
  const pakistanOffsetMillis = 5 * 60 * 60 * 1000;
  const pakistanDate = new Date(utcMillis + pakistanOffsetMillis);

  // 3. Extract and manually pad the numbers into a pure standard string literal
  const hours = String(pakistanDate.getHours()).padStart(2, '0');
  const minutes = String(pakistanDate.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`; // Always outputs exactly "HH:MM" (e.g., "10:07", "09:00")
};

/**
 * @description Core Driver: Dispatches live payloads via Firebase Cloud Messaging (FCM) using User Topics
 */
const sendNotificationRaw = async (
  userId,
  title,
  body,
  dataPayload = {},
  androidChannelId = 'goal_reminders',
  soundName = null
) => {
  const normalizedData = {};
  Object.keys(dataPayload).forEach((key) => {
    normalizedData[key] = String(dataPayload[key]);
  });

  normalizedData.androidChannelId = androidChannelId;

  // ✅ Map sound names to actual filenames
  const soundMap = {
    toing: 'toing',
    ting_tong_ting: 'ting_tong_ting',
    ting_tong: 'ting_tong',
    ding: 'ding',
    silent: null,
    default: 'default',
  };

  // Get the actual sound name (without extension for Android)
  let androidSound = soundMap[soundName] || 'default';

  // For iOS, we need the full filename with extension
  let iosSound =
    soundName && soundName !== 'silent' ? `${soundName}.mp3` : 'default.mp3';

  const message = {
    topic: String(userId),
    notification: {
      title: title,
      body: body,
    },
    data: normalizedData,
    android: {
      priority: 'high',
      notification: {
        channelId: androidChannelId,
        sound: androidSound, // Android uses just the name without extension
      },
    },
    apns: {
      payload: {
        aps: {
          badge: 1,
          sound: iosSound, // iOS uses the full filename with extension
        },
      },
    },
  };

  try {
    const messageId = await getMessaging().send(message);
    return { success: true, id: messageId };
  } catch (error) {
    console.error('❌ FCM Error Details:', error.message);
    throw new AppError(`FCM Gateway Exception: ${error.message}`, 500);
  }
};

/**
 * @description Core Gateway: Dispatches live goal alerts wrapping the low-level driver
 */
const sendPushToUser = async (goal) => {
  const user = goal.userId;
  if (!user) {
    throw new AppError('No user relation attached to goal framework.', 400);
  }

  const messageTitle = `⏰ Time for your goal: ${goal.title}`;
  const messageBody = goal.description
    ? `Remember your 'why': ${goal.description}`
    : `You committed to your ${goal.category} progression today. Let's make it happen!`;

  const dataPayload = {
    goalId: String(goal._id),
    category: String(goal.category),
    type: 'GOAL_TRACKING_TRIGGER',
  };

  const result = await sendNotificationRaw(
    user._id,
    messageTitle,
    messageBody,
    dataPayload,
    'goal_reminders'
  );

  console.log(
    `[FCM Success] Goal push queued via topic channel for ${user.email || user._id}. Message ID: ${result.id}`
  );

  return result;
};

/**
 * @description Core Gateway: Dispatches live habit alerts with custom sound assets
 */
const sendHabitPushToUser = async (habit) => {
  const user = habit.userId;
  if (!user) {
    throw new AppError('No user relation attached to habit framework.', 400);
  }

  const messageTitle = `⏰ Habit Reminder: ${habit.title}`;
  const messageBody =
    habit.habitType === 'make'
      ? `Time to start: ${habit.actionables.start}`
      : `Remember to stop: ${habit.actionables.stop}`;

  const dataPayload = {
    habitId: String(habit._id),
    category: String(habit.category),
    type: 'HABIT_TRACKING_TRIGGER',
  };

  // Extract sound name from database setup
  let soundName = habit.notifications?.sound || 'ding';
  if (soundName === 'silent') {
    soundName = null;
  }

  // 💥 DYNAMIC MATCH: Point explicitly to the exact channel container name
  const targetChannelId = soundName
    ? `habit_reminders_${soundName}`
    : 'habit_reminders_ding';

  const result = await sendNotificationRaw(
    user._id,
    messageTitle,
    messageBody,
    dataPayload,
    targetChannelId, // Forwarding the sound-specific channel ID here
    soundName
  );

  return result;
};

/**
 * @description Deterministic Evaluation: Validates 15-day trial timelines
 */
const evaluateTrialNotificationState = (userId, createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);

  now.setHours(0, 0, 0, 0);
  created.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - created.getTime();
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (daysPassed <= 9) return null;

  if (daysPassed <= 15) {
    const candidates = [10, 11, 12, 13, 14, 15];
    const hash = crypto
      .createHash('md5')
      .update(`${userId.toString()}-15day-active-trial`)
      .digest('hex');

    const randomValue1 = parseInt(hash.substring(0, 8), 16);
    const randomValue2 = parseInt(hash.substring(8, 16), 16);

    const index1 = randomValue1 % candidates.length;
    let index2 = randomValue2 % candidates.length;

    if (index1 === index2) {
      index2 = (index1 + 1) % candidates.length;
    }

    const targetDay1 = candidates[index1];
    const targetDay2 = candidates[index2];

    if (daysPassed === targetDay1 || daysPassed === targetDay2) {
      return {
        title: '⚡ Lock In Your Routine',
        body: `Your 15-day free trial is wrapping up soon (Day ${daysPassed}/15)! Upgrade your tier now to keep creating daily goals uninterrupted.`,
        data: { type: 'TRIAL_ACTIVE_NUDGE', daysPassed },
      };
    }
    return null;
  }

  if (daysPassed === 16) {
    return {
      title: '🚨 Free Trial Expired',
      body: 'Your 15-day trial period has ended and goal creation is now locked. Upgrade to Premium to lift limitations and restore full access!',
      data: { type: 'TRIAL_EXPIRED_ALERT', daysPassed },
    };
  }

  return null;
};

/**
 * @description Automated Cron Loop running once daily to evaluate 15-day trial conditions
 */
const initTrialReminderScheduler = () => {
  cron.schedule('0 10 * * *', async () => {
    try {
      console.log(
        '[Cron Billing Engine] Running daily 15-day trial life-cycle audit...'
      );
      const scanCutoffDate = new Date();
      scanCutoffDate.setDate(scanCutoffDate.getDate() - 20);

      const trialUsers = await User.find({
        subscriptionPlan: 'free_trial',
        createdAt: { $gte: scanCutoffDate },
      }).select('_id email createdAt');

      if (trialUsers.length === 0) return;

      await Promise.all(
        trialUsers.map(async (user) => {
          try {
            const notificationPayload = evaluateTrialNotificationState(
              user._id,
              user.createdAt
            );
            if (!notificationPayload) return;

            await sendNotificationRaw(
              user._id,
              notificationPayload.title,
              notificationPayload.body,
              notificationPayload.data,
              'billing_reminders'
            );

            console.log(
              `[Trial Management Engine] Dispatched FCM notice to topic channel: ${user._id}`
            );
          } catch (individualPushError) {
            console.error(
              `[Trial Push Error] Failed for account ${user.email}: ${individualPushError.message}`
            );
          }
        })
      );
    } catch (cronLoopError) {
      console.error(
        'Critical failure execution running trial reminder cron cycle:',
        cronLoopError.message
      );
    }
  });
};

/**
 * @description Automated Cron Loop running every minute to evaluate Goal schedule match criteria
 * Fixed to safely match elements hidden inside array arrays using explicit $in containment.
 */
const initGoalReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const currentDay = getCurrentDayName();
      const currentTime = getCurrentTimeFormatted();
      const systemRawDate = new Date();

      console.log('---------------------------------------------------------');
      console.log(`📡 [Cron Diagnostics] Checking execution loop context...`);
      console.log(`   ➔ Raw Server ISO Time:  ${systemRawDate.toISOString()}`);
      console.log(`   ➔ Local String Clock:   ${systemRawDate.toString()}`);
      console.log(`   ➔ Parsed Matching Day:  "${currentDay}"`);
      console.log(`   ➔ Parsed Match Time:   "${currentTime}"`);

      const queryFilters = {
        status: 'active',
        startDate: { $lte: systemRawDate },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: systemRawDate } },
        ],
        selectedDays: currentDay,
        reminderTimes: { $in: [currentTime] },
      };
      console.log(`   ➔ Target Mongo Filter: `, JSON.stringify(queryFilters));

      const matchingGoals = await Goal.find(queryFilters).populate(
        'userId',
        'email name'
      );

      if (matchingGoals.length === 0) {
        console.log(
          `⚠️  [Cron Result] 0 matching goals found for "${currentDay}" at "${currentTime}".`
        );
        console.log(
          '---------------------------------------------------------'
        );
        return;
      }

      console.log(
        `🎉 [Cron Result] SUCCESS! Found ${matchingGoals.length} goals matching criteria.`
      );

      matchingGoals.forEach((goal, index) => {
        console.log(`   👉 [Goal #${index + 1} Fetch Metadata]:`);
        console.log(`      • ID:          ${goal._id}`);
        console.log(`      • Title:       "${goal.title}"`);
        console.log(
          `      • Target User: ${goal.userId?.email || 'No Email Found'} (${goal.userId?._id})`
        );
        console.log(`      • Saved Days:  [${goal.selectedDays.join(', ')}]`);
        console.log(
          `      • Saved Times: [${goal.reminderTimes ? goal.reminderTimes.join(', ') : ''}]`
        );
      });
      console.log('---------------------------------------------------------');

      await Promise.all(
        matchingGoals.map(async (goal) => {
          try {
            await sendPushToUser(goal);
          } catch (individualPushError) {
            console.error(
              `❌ [Goal Cron Notification Failure] ${individualPushError.message}`
            );
          }
        })
      );
    } catch (cronLoopError) {
      console.error(
        '🚨 Critical failure execution running goals cron loop cycle:',
        cronLoopError.message
      );
    }
  });
};

/**
 * @description Automated Cron Loop running every minute to evaluate Habit schedules
 */
const initHabitReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentDay = getCurrentDayName();
      const currentTime = getCurrentTimeFormatted();

      const todayMidnight = new Date();
      todayMidnight.setUTCHours(0, 0, 0, 0);

      const matchingHabits = await Habit.find({
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: todayMidnight },
        'notifications.times': currentTime,
        $or: [
          { 'notifications.isEveryDay': true },
          { selectedDays: currentDay },
        ],
      })
        .select('+notifications')
        .populate('userId', 'email name');

      if (matchingHabits.length === 0) return;

      console.log(
        `[Cron Habits Task] Found ${matchingHabits.length} scheduled reminders at ${currentTime}. Processing...`
      );

      await Promise.all(
        matchingHabits.map(async (habit) => {
          try {
            await sendHabitPushToUser(habit);
          } catch (individualPushError) {
            console.error(
              `[Habit Cron Notification Failure] ${individualPushError.message}`
            );
          }
        })
      );
    } catch (cronLoopError) {
      console.error(
        'Critical failure execution running habits cron loop cycle:',
        cronLoopError.message
      );
    }
  });
};

module.exports = {
  initGoalReminderScheduler,
  initHabitReminderScheduler,
  initTrialReminderScheduler,
  sendPushToUser,
};
