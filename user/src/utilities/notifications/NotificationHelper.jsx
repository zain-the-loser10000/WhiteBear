/**
 * @file NotificationHelper.jsx
 * @module NotificationHelper
 * @description Utility functions for requesting notification permissions and
 * managing topic subscriptions using Firebase Messaging and Notifee.
 */

import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

/**
 * Requests device permission for notifications (Crucial for Android 13+)
 */
export const requestNotificationPermission = async () => {
  console.log(
    '🔒 [FCM Helper] Requesting operating system permission contract...',
  );
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled && Platform.OS === 'android') {
      try {
        const soundPresets = ['toing', 'ting_tong_ting', 'ting_tong', 'ding'];

        // Dynamically create a custom channel for each individual audio asset
        await Promise.all(
          soundPresets.map(soundName =>
            notifee.createChannel({
              id: `habit_reminders_${soundName}`, // e.g., habit_reminders_toing
              name: `Habit Reminders (${soundName.replace(/_/g, ' ')})`,
              importance: AndroidImportance.HIGH,
              sound: soundName, // No extension for Android channel creation
              vibration: true,
              lights: true,
            }),
          ),
        );

        // Keep your fallback goal reminders channel
        await notifee.createChannel({
          id: 'goal_reminders',
          name: 'Goal Reminders',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          lights: true,
        });

        await notifee.createChannel({
          id: 'billing_reminders',
          name: 'Billing & Subscription Reminders',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          lights: true,
        });

        console.log(
          '📢 [FCM Helper] All sound channels successfully bound to OS engine.',
        );
      } catch (channelErr) {
        console.log(
          '⚠️ [FCM Helper] Notifee channel creation error:',
          channelErr,
        );
      }
    }
    return enabled;
  } catch (error) {
    console.error(
      '❌ [FCM Helper] Exception thrown requesting hardware channel access permissions:',
      error,
    );
    return false;
  }
};

// Default export for convenient import elsewhere
export default {
  requestNotificationPermission,
  subscribeToUserNotifications,
  unsubscribeFromUserNotifications,
};

/**
 * Subscribes the device to the user's specific MongoDB ID topic channel
 */
export const subscribeToUserNotifications = async userId => {
  console.log(
    `📡 [FCM Helper] Evaluation running for userId subscription: "${userId}"`,
  );
  if (!userId) {
    console.warn(
      '⚠️ [FCM Helper] Target subscription aborted: Provided userId evaluates to falsy value.',
    );
    return;
  }
  try {
    const cleanTopicId = String(userId);
    console.log(
      `📡 [FCM Helper] Dispatching network bridge registration for background topic: ${cleanTopicId}`,
    );
    await messaging().subscribeToTopic(cleanTopicId);
    console.log(
      `🎉 [FCM Helper] SUCCESS! Subscribed to backend topic channel matching user validation ID: ${cleanTopicId}`,
    );
  } catch (error) {
    console.error(
      `❌ [FCM Helper] Subscription registration failed for topic "${userId}":`,
      error,
    );
  }
};

/**
 * Unsubscribes from the topic when a user logs out
 */
export const unsubscribeFromUserNotifications = async userId => {
  console.log(
    `🔌 [FCM Helper] Evaluation running for userId unsubscription: "${userId}"`,
  );
  if (!userId) {
    console.warn(
      '⚠️ [FCM Helper] Target unsubscription aborted: Provided userId evaluates to falsy value.',
    );
    return;
  }
  try {
    const cleanTopicId = String(userId);
    console.log(
      `🔌 [FCM Helper] Disconnecting listener context pipeline from broadcast channel: ${cleanTopicId}`,
    );
    await messaging().unsubscribeFromTopic(cleanTopicId);
    console.log(
      `🔌 [FCM Helper] SUCCESS! Safely unsubscribed device token array from topic channel: ${cleanTopicId}`,
    );
  } catch (error) {
    console.error(
      `❌ [FCM Helper] Unsubscription process failed for topic target "${userId}":`,
      error,
    );
  }
};
