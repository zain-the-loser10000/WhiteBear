/**
 * @file About.jsx
 * @module screens/setting-screen/setting-sub-screen/About
 * @description Sleek, typographic application profile screen utilizing flat architectural details.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar } from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../utilities/custom-components/header/header/Header';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import { useNavigation } from '@react-navigation/native';

const About = () => {
  useStatusBarConfig();
  const navigation = useNavigation();
  const responsiveValues = useGlobalStyles();
  const { moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  const coreFeatures = [
    {
      icon: 'bullseye-arrow',
      title: 'AI-Driven Goals',
      text: 'Intelligent multi-category roadmaps (Relationships, Career, Fitness, Spirituality) built by your personal AI assistant.',
    },
    {
      icon: 'calendar-check',
      title: 'Automated To-Dos',
      text: 'Smart scheduling with built-in productivity focus timers and automated roll-over mechanics for uncompleted tasks.',
    },
    {
      icon: 'chart-timeline-variant',
      title: 'Visual Analytics',
      text: 'High-fidelity performance metrics presenting your personal journey through clean, actionable visual charts.',
    },
    {
      icon: 'notebook-edit-outline',
      title: 'Bi-Monthly Insights',
      text: 'Deep-dive reflection logs analyzed systematically on the 15th and end of each month to track behavioral breakthroughs.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <Header
          title="About App"
          subtitle="How White Bear Works"
          headerColor={theme.colors.dashboard.settings}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Minimal Hero Header */}
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Master Your Momentum</Text>
          <Text style={styles.heroSubtitle}>
            White Bear is a comprehensive personal development workspace
            engineered to streamline your thoughts, automate productivity
            rhythms, and forge data-backed personal growth.
          </Text>
        </Animatable.View>

        <View style={styles.contentWrapper}>
          {/* Typographic Mission Statement Accent Block */}
          <Animatable.View
            animation="fadeInUp"
            delay={150}
            style={styles.blueprintContainer}
          >
            <Text style={styles.blueprintLabel}>THE BLUEPRINT</Text>
            <Text style={styles.blueprintBody}>
              By integrating goal architecture, behavioral habit tracking, and
              reflective journal systems into a singular user-focused grid,
              White Bear shifts your aspirations from scattered concepts into
              continuous, daily achievements.
            </Text>
          </Animatable.View>

          <Text style={styles.sectionLabel}>Platform Architecture</Text>

          {/* Clean, Legible Feature Layout Module */}
          <View style={styles.featureLayout}>
            {coreFeatures.map((item, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={200 + index * 50}
                style={styles.featureItem}
              >
                <View style={styles.featureHeaderRow}>
                  <View style={styles.iconWrapper}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={moderateScale(20)}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                </View>
                <Text style={styles.featureText}>{item.text}</Text>
              </Animatable.View>
            ))}
          </View>

          {/* Meta Framework Tags */}
          <Animatable.View
            animation="fadeIn"
            delay={450}
            style={styles.brandSection}
          >
            <Text style={styles.brandTitle}>Ecosystem Specs</Text>
            <View style={styles.brandRow}>
              {[
                'AI Assistant Roadmaps',
                'Task Automation',
                'Visual Performance Charts',
                'Secure & Confidential',
              ].map((brand, i) => (
                <View key={i} style={styles.brandTag}>
                  <Text style={styles.brandTagText}>{brand}</Text>
                </View>
              ))}
            </View>
          </Animatable.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default About;

/**
 * Isolated Adaptive Style Sheet Factory Engine
 */
const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    headerContainer: {
      width: '100%',
    },

    scrollContent: {
      paddingBottom: isLandscape ? hp(8) : hp(5),
    },

    heroSection: {
      paddingTop: isLandscape ? hp(5) : hp(3),
      paddingBottom: hp(4),
      paddingHorizontal: isLandscape ? wp(10) : wp(6),
      alignItems: 'flex-start',
    },

    heroTitle: {
      fontSize: moderateScale(28),
      fontFamily: theme.typography.bold,
      color: '#111111',
      letterSpacing: -0.5,
    },

    heroSubtitle: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.regular,
      color: '#666666',
      marginTop: hp(1.5),
      lineHeight: moderateScale(22),
      maxWidth: isLandscape ? wp(80) : '100%',
    },

    contentWrapper: {
      paddingHorizontal: isLandscape ? wp(10) : wp(6),
    },

    blueprintContainer: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      paddingLeft: wp(4),
      marginVertical: hp(2),
      maxWidth: isLandscape ? wp(80) : '100%',
    },

    blueprintLabel: {
      fontSize: moderateScale(11),
      fontFamily: theme.typography.bold,
      color: theme.colors.primary,
      letterSpacing: 1.5,
      marginBottom: hp(0.5),
    },

    blueprintBody: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.regular,
      color: '#333333',
      lineHeight: moderateScale(22),
    },

    sectionLabel: {
      fontSize: moderateScale(16),
      fontFamily: theme.typography.bold,
      color: '#111111',
      marginTop: hp(4),
      marginBottom: hp(2),
      letterSpacing: -0.2,
    },

    featureLayout: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
    },

    featureItem: {
      backgroundColor: theme.colors.white,
      width: isLandscape ? wp(38) : '100%',
      borderRadius: theme.borderRadius.medium,
      padding: moderateScale(16),
      marginBottom: hp(2),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    featureHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1),
    },

    iconWrapper: {
      marginRight: wp(3),
    },

    featureTitle: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.semiBold,
      color: '#111111',
    },

    featureText: {
      fontSize: moderateScale(13),
      fontFamily: theme.typography.regular,
      color: '#555555',
      lineHeight: moderateScale(19),
    },

    brandSection: {
      marginTop: hp(3),
    },

    brandTitle: {
      fontSize: moderateScale(13),
      fontFamily: theme.typography.bold,
      color: '#888888',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: hp(1.5),
    },

    brandRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: moderateScale(8),
    },

    brandTag: {
      backgroundColor: '#F0F0F0',
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.8),
      borderRadius: moderateScale(6),
    },

    brandTagText: {
      fontSize: moderateScale(12),
      fontFamily: theme.typography.medium,
      color: '#444444',
    },
  });
};
