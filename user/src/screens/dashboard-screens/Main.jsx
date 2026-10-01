/**
 * @file Main.js
 * @module screens/dashboard-screen/Main
 * @description Professional, ultra-enhanced, and fully responsive main platform entry dashboard.
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import DashboardCard from '../../utilities/custom-components/card/DashboardCard';

const HomeScreen = ({ navigation }) => {
  const globalStyles = useGlobalStyles();
  const { isLandscape, wp, hp, moderateScale } = globalStyles;
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  const menuItems = [
    {
      id: 'goals',
      title: 'Create Goals',
      subtitle: 'Define achievable milestones and track progress.',
      gradientColors: theme.colors.dashboard.goalsGradient,
      fullWidth: true,
    },
    {
      id: 'todos',
      title: 'To-Dos',
      subtitle: 'Daily tasks and reminders',
      color: theme.colors.dashboard.todos,
      fullWidth: false,
    },
    {
      id: 'habits',
      title: 'Habits',
      subtitle: 'Consistency loops',
      color: theme.colors.dashboard.habits,
      fullWidth: false,
    },
    {
      id: 'reflections',
      title: 'Journals',
      subtitle: 'Mindful journals',
      color: theme.colors.dashboard.journals,
      fullWidth: false,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Growth metrics',
      color: theme.colors.dashboard.analytics,
      fullWidth: false,
    },
    {
      id: 'system_guide',
      title: 'How It Works',
      subtitle: 'System guide',
      color: theme.colors.dashboard.howItWorks,
      fullWidth: false,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Preferences',
      color: theme.colors.dashboard.settings,
      fullWidth: false,
    },
  ];

  const handleNavigation = targetId => {
    const routeMapping = {
      goals: 'Goals',
      todos: 'ToDos',
      habits: 'Habits',
      reflections: 'Reflections',
      settings: 'Settings',
      analytics: 'Analytics',
      system_guide: 'System_Guide',
    };
    const targetRoute = routeMapping[targetId];
    if (navigation && targetRoute) {
      navigation.navigate(targetRoute);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Responsive Branding Segment */}
        <View style={styles.headerWrapper}>
          <Image
            source={require('../../assets/logo/logo.png')}
            style={styles.brandLogo}
            resizeMode="cover"
            resizeMethod="resize"
          />
          <View style={styles.textBlockAlignment}>
            <Text style={styles.brandMainTitle}>White Bear</Text>
            <Text style={styles.brandTagline}>
              Achieve your dreams, one focused choice at a time.
            </Text>
          </View>
        </View>

        {/* Scaled Multi-Column Adaptive Flex Grid */}
        <View style={styles.dashboardGrid}>
          {menuItems.map(item => (
            <DashboardCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              color={item.color}
              gradientColors={item.gradientColors}
              fullWidth={item.fullWidth}
              globalStyles={globalStyles}
              onPress={() => handleNavigation(item.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

/**
 * Proportional Layout Engine Factory
 */
const createStyles = ({ wp, hp, moderateScale, isLandscape }) => {
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      alignItems: 'center',
      paddingHorizontal: wp(5),
      paddingBottom: isLandscape ? hp(8) : hp(0),
    },

    headerWrapper: {
      width: '100%',
      marginTop: isLandscape ? hp(10) : hp(6.5),
      marginBottom: hp(3.5),
      flexDirection: isLandscape ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: isLandscape ? 'center' : 'center',
    },

    brandLogo: {
      width: Math.round(isLandscape ? wp(6) : wp(22)),
      height: Math.round(isLandscape ? wp(6) : wp(24)),
      marginBottom: isLandscape ? 0 : hp(1),
      marginRight: isLandscape ? wp(2.5) : 0,
    },

    textBlockAlignment: {
      alignItems: isLandscape ? 'flex-start' : 'center',
    },

    brandMainTitle: {
      fontFamily: theme.typography.bold,
      color: theme.colors.dark,
      fontSize: moderateScale(24),
      letterSpacing: -0.4,
    },

    brandTagline: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textMuted,
      fontSize: moderateScale(13),
      textAlign: isLandscape ? 'left' : 'center',
      marginTop: hp(0.2),
    },

    dashboardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
    },
  });
};
