/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import './gesture-handler.native';
import messaging from '@react-native-firebase/messaging';

// Register background/killed state message listener
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📥 [FCM Background Packet Received]:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
