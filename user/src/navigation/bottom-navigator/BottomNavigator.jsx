/**
 * @file BottomNavigator.js
 * @module navigation/BottomNavigator
 * @description Custom animated bottom tab navigation with high-performance lazy loading,
 * zero hardcoded design tokens, and orientation-adaptive constraints.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

// --- Screen Imports ---
import HomeScreen from '../../screens/dashboard-screens/Main';
import JournalScreen from '../../screens/journal-screens/Journals';
import TodoScreen from '../../screens/todos-screen/Todos';
import GoalScreen from '../../screens/goals-screen/Goals';
import HabitScreen from '../../screens/habit-screens/Habits';

const PlaceholderScreen = ({ route }) => (
  <View style={stylesStatic.placeholderContainer}>
    <Text style={stylesStatic.placeholderText}>
      {route.name} Screen Placeholder
    </Text>
  </View>
);

const Tab = createBottomTabNavigator();

/**
 * Tab Configuration Module linked directly to dashboard theme tokens
 */
const tabConfig = {
  Goals: {
    label: 'Goals',
    icon: require('../../assets/navigator-icons/goal-icon.png'),
    activeColor: theme.colors.dashboard.goalsGradient[0],
  },
  ToDos: {
    label: 'To-Dos',
    icon: require('../../assets/navigator-icons/todo-icon.png'),
    activeColor: theme.colors.dashboard.todos,
  },
  Home: {
    icon: require('../../assets/logo/logo.png'),
    activeColor: theme.colors.primary,
  },
  Habits: {
    label: 'Habits',
    icon: require('../../assets/navigator-icons/habit-icon.png'),
    activeColor: theme.colors.dashboard.habits,
  },
  Reflections: {
    label: 'Journals',
    icon: require('../../assets/navigator-icons/journal-icon.png'),
    activeColor: theme.colors.dashboard.journals,
  },
};

/**
 * Responsive Side Tab Icons - Clean Anti-Aliasing
 */
const AnimatedSideIcon = ({ focused, iconSource, moderateScale }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.15 : 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  const imageSize = Math.round(moderateScale(30));

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Image
        source={iconSource}
        style={{
          width: imageSize,
          height: imageSize,
        }}
        resizeMode="cover"
        resizeMethod="resize"
      />
    </Animated.View>
  );
};

/**
 * Responsive Center Tab Anchor - Clean Asset Rendering without Edging Artifacts
 */
const CustomCenterTabBarButton = ({
  onPress,
  focused,
  styles,
  isLandscape,
  wp,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const logoSize = Math.round(isLandscape ? wp(10.5) : wp(18.5));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.centerButtonWrapper}
    >
      <Animated.View
        style={[
          styles.centerLogoContainer,
          {
            transform: [{ scale: scaleValue }],
            width: logoSize,
            height: logoSize,
          },
        ]}
      >
        <Image
          source={tabConfig.Home.icon}
          style={styles.fullDimensions}
          resizeMode="contain"
          resizeMethod="resize"
        />
      </Animated.View>
      <Text
        style={[
          styles.tabBarLabel,
          {
            color: focused
              ? tabConfig.Home.activeColor
              : theme.colors.tabInactive,
          },
        ]}
      >
        {tabConfig.Home.label}
      </Text>
    </TouchableOpacity>
  );
};

const BottomNavigator = () => {
  useStatusBarConfig();
  const responsiveValues = useGlobalStyles();
  const { isLandscape, wp, moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  return (
    <Tab.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Goals"
        component={GoalScreen}
        options={{
          tabBarLabel: tabConfig.Goals.label,
          tabBarActiveTintColor: tabConfig.Goals.activeColor,
          tabBarIcon: ({ focused }) => (
            <AnimatedSideIcon
              focused={focused}
              iconSource={tabConfig.Goals.icon}
              isLandscape={isLandscape}
              moderateScale={moderateScale}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ToDos"
        component={TodoScreen}
        options={{
          tabBarLabel: tabConfig.ToDos.label,
          tabBarActiveTintColor: tabConfig.ToDos.activeColor,
          tabBarIcon: ({ focused }) => (
            <AnimatedSideIcon
              focused={focused}
              iconSource={tabConfig.ToDos.icon}
              isLandscape={isLandscape}
              moderateScale={moderateScale}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Main"
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarLabel: tabConfig.Home.label,
          tabBarButton: props => (
            <CustomCenterTabBarButton
              {...props}
              focused={navigation.getState().index === 2}
              styles={styles}
              isLandscape={isLandscape}
              wp={wp}
            />
          ),
        })}
      />

      <Tab.Screen
        name="Habits"
        component={HabitScreen}
        options={{
          tabBarLabel: tabConfig.Habits.label,
          tabBarActiveTintColor: tabConfig.Habits.activeColor,
          tabBarIcon: ({ focused }) => (
            <AnimatedSideIcon
              focused={focused}
              iconSource={tabConfig.Habits.icon}
              isLandscape={isLandscape}
              moderateScale={moderateScale}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Reflections"
        component={JournalScreen}
        options={{
          tabBarLabel: tabConfig.Reflections.label,
          tabBarActiveTintColor: tabConfig.Reflections.activeColor,
          tabBarIcon: ({ focused }) => (
            <AnimatedSideIcon
              focused={focused}
              iconSource={tabConfig.Reflections.icon}
              isLandscape={isLandscape}
              moderateScale={moderateScale}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Dynamic Style Sheet Factory
 */
const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  return StyleSheet.create({
    tabBar: {
      height: isLandscape ? hp(12.5) : hp(9.5),
      backgroundColor: theme.colors.background,
      borderTopWidth: 0,
      elevation: theme.elevation.depth3.elevation,
      shadowColor: theme.colors.dark,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      paddingBottom: isLandscape ? hp(1) : hp(1.8),
      paddingTop: isLandscape ? hp(1) : hp(1.2),
    },

    tabBarLabel: {
      fontSize: isLandscape ? moderateScale(12.5) : moderateScale(11),
      fontFamily: theme.typography.semiBold,
      marginTop: isLandscape ? -hp(0.2) : hp(0.8),
    },

    centerButtonWrapper: {
      top: isLandscape ? -hp(1.8) : -hp(2.2),
      justifyContent: 'center',
      alignItems: 'center',
      width: wp(18),
    },

    centerLogoContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isLandscape ? hp(20.2) : hp(0.4),
    },

    fullDimensions: {
      width: '100%',
      height: '100%',
    },
  });
};

export default BottomNavigator;

const stylesStatic = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },

  placeholderText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.medium,
    color: theme.colors.textMuted,
  },
});
