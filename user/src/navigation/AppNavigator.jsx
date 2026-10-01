/**
 * @file AppNavigator.jsx
 * @module navigation/AppNavigator
 * @description Highly optimized App navigation stack with modular lazy loading
 * and fallback states to minimize initial JS bundle execution footprint.
 */

import React, { useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/Themes';

// --- Screen Imports ---
import Splash from '../screens/splash-screen/Splash';
import OnBoarding from '../screens/onboarding-screen/OnBoarding';

// --- Auth Imports ---
import Signin from '../screens/auth-screen/Signin';
import Signup from '../screens/auth-screen/Signup';

// --- Main Imports ---
import BottomNavigator from '../navigation/bottom-navigator/BottomNavigator';
import SystemGuide from '../screens/system-guide/SystemGuide';

// --- Profile and Setting Imports ---
import Setting from '../screens/setting-screen/Setting';
import EmailVerification from '../screens/setting-screen/setting-sub-screen/EmailVerification';
import UpdateProfile from '../screens/setting-screen/setting-sub-screen/UpdateProfile';
import ChangePassword from '../screens/setting-screen/setting-sub-screen/ChangePassword';
import About from '../screens/setting-screen/setting-sub-screen/About';
import TermsandConditions from '../screens/setting-screen/setting-sub-screen/TermsandConditions';
import PrivacyPolicy from '../screens/setting-screen/setting-sub-screen/PrivacyPolicy';

// --- Analytics Imports ---
import Analytics from '../screens/analytic-screens/Analytics';

// --- Todo Imports ---
import CreateTodo from '../screens/todos-screen/CreateTodo';

// --- Goal Imports ---
import CreateGoal from '../screens/goals-screen/CreateGoal';
import EditGoal from '../screens/goals-screen/EditGoal';

// --- Habit Imports ---
import CreateHabit from '../screens/habit-screens/CreateHabit';
import EditHabit from '../screens/habit-screens/EditHabit';

// --- Subscription Imports ---
import Subscription from '../screens/subscription-screen/Subscription';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle="light-content"
        translucent={false}
      />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      >
        {/* --- ENTRY POINT --- */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="OnBoarding">
          {props => (
            <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- AUTH --- */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* --- DASHBOARD --- */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="System_Guide">
          {props => (
            <SystemGuide {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- SETTINGS & PROFILE --- */}
        <Stack.Screen name="Settings">
          {props => (
            <Setting {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Email_Verification">
          {props => (
            <EmailVerification
              {...props}
              setStatusBarColor={setStatusBarColor}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Update_Profile">
          {props => (
            <UpdateProfile {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Change_Password">
          {props => (
            <ChangePassword {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="About">
          {props => <About {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Terms_and_Conditions">
          {props => (
            <TermsandConditions
              {...props}
              setStatusBarColor={setStatusBarColor}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Privacy_Policy">
          {props => (
            <PrivacyPolicy {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- ANALYTICS --- */}
        <Stack.Screen name="Analytics">
          {props => (
            <Analytics {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- TODOS --- */}
        <Stack.Screen name="Create_Todo">
          {props => (
            <CreateTodo {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- GOALS --- */}
        <Stack.Screen name="Create_Goal">
          {props => (
            <CreateGoal {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Edit_Goal">
          {props => (
            <EditGoal {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- HABITS --- */}
        <Stack.Screen name="Create_Habit">
          {props => (
            <CreateHabit {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Edit_Habit">
          {props => (
            <EditHabit {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* --- SUBSCRIPTION --- */}
        <Stack.Screen name="Subscription_Plans">
          {props => (
            <Subscription {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
