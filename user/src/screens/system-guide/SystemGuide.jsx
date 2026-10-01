/**
 * @file SystemGuide.js
 * @module screens/system-guide/SystemGuide
 * @description Professional ultra-enhanced system guide screen for the White Bear platform with smooth animated walkthrough layouts.
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../styles/Themes';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import Header from '../../utilities/custom-components/header/header/Header';

const SystemGuide = () => {
  useStatusBarConfig();
  const navigation = useNavigation();
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();

  const styles = useMemo(
    () => createStyles({ wp, hp, moderateScale, isLandscape }),
    [wp, hp, moderateScale, isLandscape],
  );

  const [expandedSection, setExpandedSection] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Track layout heights dynamically for smooth interpolation maps
  const animationDrivers = useRef({}).current;

  const sections = [
    {
      id: 'getting_started',
      icon: '🚀',
      title: 'Getting Started',
      description:
        'Welcome to White Bear - Your AI-Powered Mental Wellness Companion',
      content: [
        'White Bear helps you build better habits, achieve goals, and maintain mental wellness through AI-driven insights.',
        'Start by exploring the main dashboard to get an overview of your progress.',
        'The app is designed to be your daily companion for personal growth and mindfulness.',
      ],
    },
    {
      id: 'goals',
      icon: '🎯',
      title: 'Goals',
      description: 'Create and track meaningful life goals with AI assistance',
      content: [
        'Create goals with AI-generated descriptions and roadmaps',
        'Choose from categories like Physical Wellness, Mindfulness, Sleep Recovery, and more',
        'Set custom timelines (1 week, 1 month, 3 months, or custom duration)',
        'Define daily commitments and select active days',
        'Track progress through associated todos',
        'AI-powered roadmap generation for goal achievement',
      ],
    },
    {
      id: 'todos',
      icon: '✅',
      title: 'Todos',
      description: 'Manage daily tasks and stay productive',
      content: [
        'Create todos for today or future dates',
        'Organize todos by type: Goal-Todos or Daily-Todos',
        'Set target dates and priorities',
        'Mark todos as complete with one tap',
        'Countdown timer feature for focused work sessions',
        'Filter and search todos by status and type',
        "Outstanding todos automatically move to today's view",
      ],
    },
    {
      id: 'habits',
      icon: '🔄',
      title: 'Habits',
      description: 'Build and maintain positive daily routines',
      content: [
        'Create habits with custom frequency and schedule',
        'Set daily, weekly, or custom intervals',
        'Track habit completion with daily logs',
        'View habit streaks and progress analytics',
        'Receive reminders for habit completion',
        'Monitor habit performance over time',
      ],
    },
    {
      id: 'journals',
      icon: '📖',
      title: 'Journals',
      description: 'Express yourself and track your mental wellness journey',
      content: [
        'Write daily journal entries with mood tracking',
        'Tag entries for easy organization',
        'Attach images and emotions to your entries',
        'View journal history and patterns',
        'Private and secure writing space',
        'AI-powered sentiment analysis',
        'Export journal entries for personal records',
      ],
    },
    {
      id: 'subscription',
      icon: '⭐',
      title: 'Premium Subscription',
      description: 'Unlock unlimited access to all features',
      content: [
        'Free trial: 15 days of full access',
        'Monthly Plan: Rs 500/month',
        'Yearly Plan: Rs 250/year (Save 50%)',
        'Unlimited goals, habits, journals, and todos',
        'Priority AI access with faster responses',
        'Advanced analytics and insights',
        'Priority customer support',
        'Cancel anytime with no hidden fees',
      ],
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      description: 'Stay informed and never miss a deadline',
      content: [
        'Trial period reminders (7 days, 5 days, 3 days, 1 day before expiry)',
        'Goal progress updates',
        'Todo deadline reminders',
        'Habit completion notifications',
        'Journal reflection prompts',
        'AI insights and recommendations',
        'Custom notification preferences',
      ],
    },
    {
      id: 'ai_features',
      icon: '🤖',
      title: 'AI-Powered Features',
      description: 'Leverage artificial intelligence for better outcomes',
      content: [
        'AI Goal Description Generation',
        'Smart Goal Roadmap Creation',
        'Personalized Recommendations',
        'Sentiment Analysis for Journals',
        'Habit Pattern Recognition',
        'Productivity Insights',
        'Mental Wellness Tracking',
        'AI Chat Assistant (Coming Soon)',
      ],
    },
    {
      id: 'privacy',
      icon: '🔒',
      title: 'Privacy & Security',
      description: 'Your data is safe and secure',
      content: [
        'End-to-end encryption for all data',
        'Secure Redis data storage',
        'OTP-based email verification',
        'Session token authentication',
        'Data not shared with third parties',
        'GDPR compliant',
        'Option to delete your data anytime',
      ],
    },
  ];

  const toggleSection = sectionId => {
    const isExpanding = expandedSection !== sectionId;
    const targetSection = isExpanding ? sectionId : null;

    if (!animationDrivers[sectionId]) {
      animationDrivers[sectionId] = new Animated.Value(0);
    }

    // Simultaneously close previous and expand new
    if (expandedSection && expandedSection !== sectionId) {
      Animated.timing(animationDrivers[expandedSection], {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }

    setExpandedSection(targetSection);

    Animated.timing(animationDrivers[sectionId], {
      toValue: isExpanding ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderSection = section => {
    const isExpanded = expandedSection === section.id;

    if (!animationDrivers[section.id]) {
      animationDrivers[section.id] = new Animated.Value(0);
    }

    const heightInterpolation = animationDrivers[section.id].interpolate({
      inputRange: [0, 1],
      outputRange: [0, section.content.length * moderateScale(34) + hp(2)],
    });

    const opacityInterpolation = animationDrivers[section.id].interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <View
        key={section.id}
        style={[styles.sectionCard, isExpanded && styles.sectionCardExpanded]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleSection(section.id)}
          style={styles.sectionHeader}
        >
          <View style={styles.sectionIconWrapper}>
            <Text style={styles.sectionIcon}>{section.icon}</Text>
          </View>
          <View style={styles.sectionTitleWrapper}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle} numberOfLines={1}>
              {section.description}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={moderateScale(20)}
            color={
              isExpanded
                ? theme.colors.dashboard.howItWorks
                : theme.colors.textMuted
            }
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.sectionContent,
            { maxHeight: heightInterpolation, opacity: opacityInterpolation },
          ]}
        >
          {section.content.map((item, idx) => (
            <View key={idx} style={styles.contentItem}>
              <View style={styles.bulletIndicator} />
              <Text style={styles.contentText}>{item}</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title="System Guide"
        subtitle="Learn how to use the App efficiently."
        headerColor={theme.colors.dashboard.howItWorks}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Banner Section */}
        <LinearGradient
          colors={['#1D68B2', '#0F4C8A', '#0A2E5A']}
          style={styles.heroContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Welcome to White Bear</Text>
            <Text style={styles.heroSubtitle}>
              Your comprehensive guide to mastering mental wellness,
              productivity, and personal growth layers.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>9</Text>
                <Text style={styles.heroStatLabel}>Features</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>15</Text>
                <Text style={styles.heroStatLabel}>Days Trial</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNumber}>AI</Text>
                <Text style={styles.heroStatLabel}>Powered</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Action Matrix Mapping */}
        <View style={styles.quickStartContainer}>
          <Text style={styles.quickStartTitle}>⚡ Quick Start Matrix</Text>
          <View style={styles.quickStartGrid}>
            {[
              {
                id: 'goals',
                label: 'Set Goals',
                subtitle: 'Manage roadmaps',
                emoji: '🎯',
                color: 'rgba(239, 68, 68, 0.08)',
              },
              {
                id: 'todos',
                label: 'Create Todos',
                subtitle: 'Manage focus tasks',
                emoji: '✅',
                color: 'rgba(16, 185, 129, 0.08)',
              },
              {
                id: 'habits',
                label: 'Build Habits',
                subtitle: 'Track routines & streaks',
                emoji: '🔄',
                color: 'rgba(59, 130, 246, 0.08)',
              },
              {
                id: 'journals',
                label: 'Write Journal',
                subtitle: 'AI sentiment checks',
                emoji: '📖',
                color: 'rgba(245, 158, 11, 0.08)',
              },
            ].map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickStartCard}
                activeOpacity={0.75}
                onPress={() => toggleSection(item.id)}
              >
                <View
                  style={[
                    styles.quickStartIconBox,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Text style={styles.quickStartEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.quickStartTextColumn}>
                  <Text style={styles.quickStartLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.quickStartSubLabel} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Accordion List Body Wrapper */}
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionsTitle}>📚 Detailed Documentation</Text>
          <Text style={styles.sectionsSubtitle}>
            Select a system component stack below to unpack architectural
            guidelines.
          </Text>
          {sections.map(section => renderSection(section))}
        </View>

        {/* Explicit Support Area */}
        <View style={styles.footerContainer}>
          <Ionicons
            name="help-circle-outline"
            size={moderateScale(24)}
            color={theme.colors.textMuted}
          />
          <Text style={styles.footerText}>
            Encountering questions? Reach out to support operations at{' '}
            <Text style={styles.emailHighlight}>support@whitebear.com</Text>
          </Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default SystemGuide;

const createStyles = ({ wp, hp, moderateScale, isLandscape }) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    scrollContainer: {
      paddingBottom: hp(4),
    },

    heroContainer: {
      marginHorizontal: wp(4),
      marginTop: hp(1.5),
      marginBottom: hp(2.5),
      borderRadius: moderateScale(16),
      padding: wp(5),
      ...Platform.select({
        ios: {
          shadowColor: '#1D68B2',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
        android: {
          elevation: 6,
        },
      }),
    },

    heroContent: {
      alignItems: 'center',
    },

    heroTitle: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(22),
      color: theme.colors.white,
      marginBottom: hp(0.5),
    },

    heroSubtitle: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(13),
      color: 'rgba(255,255,255,0.85)',
      textAlign: 'center',
      lineHeight: moderateScale(18),
      marginBottom: hp(2),
    },

    heroStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justify: 'center',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: moderateScale(12),
      paddingVertical: hp(1.2),
      width: '100%',
    },

    heroStat: {
      alignItems: 'center',
      flex: 1,
    },

    heroStatNumber: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(18),
      color: theme.colors.white,
    },

    heroStatLabel: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(10),
      color: 'rgba(255,255,255,0.7)',
      marginTop: hp(0.2),
    },

    heroStatDivider: {
      width: 1,
      height: hp(2.5),
      backgroundColor: 'rgba(255,255,255,0.2)',
    },

    quickStartContainer: {
      paddingHorizontal: wp(4),
      marginBottom: hp(2.5),
    },

    quickStartTitle: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(16),
      color: theme.colors.textPrimary,
      marginBottom: hp(1.2),
    },

    quickStartGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: wp(3),
    },

    quickStartCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(14),
      padding: wp(3.5),
      flexDirection: 'row',
      alignItems: 'center',
      width: isLandscape ? '48.5%' : '47.5%',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.04)',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        android: {
          elevation: 2.5,
        },
      }),
    },

    quickStartIconBox: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(10),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(2.5),
    },

    quickStartEmoji: {
      fontSize: moderateScale(20),
    },

    quickStartTextColumn: {
      flex: 1,
    },

    quickStartLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(13),
      color: theme.colors.textPrimary,
    },

    quickStartSubLabel: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(10.5),
      color: theme.colors.textMuted,
      marginTop: hp(0.2),
    },

    sectionsContainer: {
      paddingHorizontal: wp(4),
    },

    sectionsTitle: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(18),
      color: theme.colors.textPrimary,
    },

    sectionsSubtitle: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
      marginBottom: hp(1.5),
    },

    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(12),
      marginBottom: hp(1),
      padding: moderateScale(14),
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.04)',
      overflow: 'hidden',
    },

    sectionCardExpanded: {
      borderColor: theme.colors.dashboard.howItWorks,
      borderWidth: 1.5,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    sectionIconWrapper: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(18),
      backgroundColor: 'rgba(29, 104, 178, 0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: moderateScale(10),
    },

    sectionIcon: {
      fontSize: moderateScale(18),
    },

    sectionTitleWrapper: {
      flex: 1,
      paddingRight: wp(2),
    },

    sectionTitle: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(15),
      color: theme.colors.textPrimary,
    },

    sectionSubtitle: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
    },

    sectionContent: {
      overflow: 'hidden',
    },

    contentItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: hp(0.8),
      paddingHorizontal: moderateScale(4),
    },

    bulletIndicator: {
      width: moderateScale(5),
      height: moderateScale(5),
      borderRadius: moderateScale(2.5),
      backgroundColor: theme.colors.dashboard.howItWorks,
      marginTop: hp(0.8),
      marginRight: moderateScale(8),
    },

    contentText: {
      flex: 1,
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(13),
      color: theme.colors.textSecondary,
      lineHeight: moderateScale(18),
    },

    dominantStateLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(22),
      textAlign: 'center',
    },

    trendSubLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(10),
      marginTop: moderateScale(2),
      textAlign: 'center',
    },

    footerContainer: {
      marginTop: hp(4),
      paddingHorizontal: wp(6),
      alignItems: 'center',
      gap: hp(0.5),
    },

    footerText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
      textAlign: 'center',
      lineHeight: moderateScale(18),
    },

    emailHighlight: {
      fontFamily: theme.typography.medium,
      color: theme.colors.dashboard.howItWorks,
    },

    footerVersion: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(11),
      color: theme.colors.textMuted,
      marginTop: hp(0.5),
    },
  });
