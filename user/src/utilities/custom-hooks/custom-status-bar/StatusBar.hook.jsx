/**
 * @file StatusBar.hooks.jsx
 * @module utilities/custom-hooks/custom-status-bar/StatusBar
 * @description Hook to configure the system status bar appearance and behavior for both iOS and Android.
 */

import { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';

/**
 * Hook to configure the system StatusBar settings.
 */
export const useStatusBarConfig = (
  barStyle = 'light-content',
  backgroundColor = 'transparent',
  translucent = true,
) => {
  useEffect(() => {
    StatusBar.setBarStyle(barStyle);

    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(backgroundColor);
      StatusBar.setTranslucent(translucent);
    }
  }, [barStyle, backgroundColor, translucent]);
};
