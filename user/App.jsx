/**
 * @file App.jsx
 * @module App
 * @description Main application component initializing navigation with a custom top-fading toast configuration.
 */

import React, { useEffect } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, { BaseToast } from 'react-native-toast-message';
import { theme } from './src/styles/Themes';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useResponsive } from './src/utilities/custom-hooks/custom-responsive/useResponsive.hook';
import { Platform, StatusBar } from 'react-native';

// REDUX WRAPPERS
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/redux/store/store';

import messaging from '@react-native-firebase/messaging';
import {
  requestNotificationPermission,
  subscribeToUserNotifications,
} from './src/utilities/notifications/NotificationHelper';

// 🌟 STATIC TOAST CONFIGURATION (Moved outside to prevent re-creation bugs)
const toastConfig = {
  success: props => <CustomToastWrapper type="success" {...props} />,
  error: props => <CustomToastWrapper type="error" {...props} />,
};

// 🌟 Custom component to safely handle hooks like useResponsive inside the Toast layout
function CustomToastWrapper(props) {
  const { type } = props;
  const { wp, hp, scale } = useResponsive();

  const isSuccess = type === 'success';
  const color = isSuccess ? theme.colors.success : theme.colors.error;
  const iconName = isSuccess
    ? 'checkmark-circle-outline'
    : 'alert-circle-outline';

  const topMarginOffset =
    Platform.OS === 'android' ? StatusBar.currentHeight + hp(2) : hp(5);

  return (
    <BaseToast
      {...props}
      style={{
        borderLeftWidth: wp(1.5),
        borderLeftColor: color,
        backgroundColor: theme.colors.white,
        borderRadius: theme.borderRadius.large,
        paddingHorizontal: wp(4),
        width: wp(92),
        marginTop: topMarginOffset,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
        height: 'auto',
        minHeight: hp(7.5),
      }}
      contentContainerStyle={{
        flex: 1,
        paddingLeft: wp(2),
        justifyContent: 'center',
      }}
      text1Style={{
        fontSize: scale(14),
        fontFamily: theme.typography.semiBold,
        color: theme.colors.dark,
        marginBottom: 2,
      }}
      text2Style={{
        fontSize: scale(13),
        fontFamily: theme.typography.regular,
        color: '#5C6E66',
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <Ionicons
          name={iconName}
          size={scale(22)}
          color={color}
          style={{ marginRight: wp(1) }}
        />
      )}
    />
  );
}

// Sub-component created to safely consume the Redux state wrapper context hook
const AppContent = () => {
  const currentUser = useSelector(state => state.user?.user);
  const userId = currentUser?.userId || currentUser?._id || currentUser?.id;

  useEffect(() => {
    const setupFCMSystem = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission && userId) {
        await subscribeToUserNotifications(userId);
      }
    };

    setupFCMSystem();

    // Handle incoming messages when the app is running in the foreground
    const unsubscribeForegroundListener = messaging().onMessage(
      async remoteMessage => {
        if (remoteMessage.notification) {
          // Get the custom sound from the payload mapping array
          const incomingSound =
            remoteMessage.android?.notification?.sound || 'default';
          const channelId =
            remoteMessage.data?.androidChannelId || 'goal_reminders';

          await notifee.displayNotification({
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            data: remoteMessage.data,
            android: {
              channelId: channelId,
              importance: AndroidImportance.HIGH,
              sound: incomingSound, // Forces runtime sound mapping inside foreground runtime
              pressAction: { id: 'default' },
            },
            ios: {
              foregroundPresentationOptions: {
                alert: true,
                badge: true,
                sound: true,
              },
            },
          });
        }
      },
    );

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'App opened from background via notification:',
        remoteMessage.data,
      );
    });

    return unsubscribeForegroundListener;
  }, [userId]);

  return (
    <>
      <RootNavigator />
      <Toast config={toastConfig} position="top" topOffset={0} />
    </>
  );
};

// Main Entry wrapping the architecture correctly
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;
