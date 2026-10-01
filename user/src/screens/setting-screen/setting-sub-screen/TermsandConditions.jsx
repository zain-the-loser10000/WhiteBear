/**
 * @file TermsAndConditions.jsx
 * @module screens/setting-screen/setting-sub-screen/TermsAndConditions
 * @description Comprehensive, legally structured legal terms interface optimized for high-fidelity readability across orientations.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar } from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import Header from '../../../utilities/custom-components/header/header/Header';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import { useNavigation } from '@react-navigation/native';

const TermsAndConditions = () => {
  useStatusBarConfig();
  const navigation = useNavigation();

  const responsiveValues = useGlobalStyles();
  const { isLandscape, moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  // Legally comprehensive sections mapped for systematic structural rendering
  const legalSections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By creating an account, accessing, or using the White Bear workspace application ("Service"), you agree to be bound by these Terms and Conditions ("Terms") and our Privacy Policy. If you do not agree to these structural terms, you are expressly prohibited from utilizing the platform and must discontinue use immediately.',
    },
    {
      title: '2. Workspace Account Security',
      content:
        'To access specific features including AI automation frameworks, you must register an account. You assume absolute responsibility for safeguarding your authorization credentials. Any activities executed under your authenticated session are your sole liability. You must immediately notify White Bear administration of any unapproved structural security breaches or compromises.',
    },
    {
      title: '3. AI Capabilities & Data Processing',
      content:
        'White Bear integrates advanced generative artificial intelligence models to construct personalized objective roadmaps, automated schedules, and bi-monthly behavioral evaluations. While our models are systematically calibrated for architectural precision, automated outputs are provided "as-is." White Bear does not guarantee the psychological, financial, or absolute logistical efficacy of AI-generated roadmaps.',
    },
    {
      title: '4. Proprietary User Content & Privacy',
      content:
        'You retain full structural ownership of data, reflections, tasks, and text logs submitted into the White Bear ecosystem. By entering information, you grant White Bear a secure, encrypted, non-exclusive license to process, parse, and evaluate your encrypted data payloads strictly to execute system logic and personalize your localized AI models.',
    },
    {
      title: '5. Platform Limitations & Fair Use',
      content:
        'You agree not to reverse-engineer, decompile, or systematically scrape any proprietary algorithms, data layouts, styling factories, or computational models driving the White Bear workspace. White Bear reserves the right to suspend accounts displaying behavioral traffic anomalies that threaten infrastructure health.',
    },
    {
      title: '6. Limitation of Liability',
      content:
        'In no event shall White Bear, its architectural engineers, or parent affiliates be held liable for any indirect, incidental, special, exemplary, or punitive consequences—including but not limited to loss of user data, task continuity anomalies, or personal development disruptions—arising out of or related to your structural configuration of the ecosystem.',
    },
    {
      title: '7. Revisions to Legal Framework',
      content:
        'We reserve the exclusive prerogative to adapt, modify, or completely update this architectural legal statement at any point. Your continued retention of an active workspace session following the public distribution of updated guidelines automatically confirms your legal compliance and validation of the revised parameters.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <Header
          title="Terms of Use"
          headerColor={theme.colors.dashboard.settings}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Minimal Legislative Hero */}
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          style={styles.heroSection}
        >
          <Text style={styles.legalTitle}>Platform Legal Framework</Text>
          <Text style={styles.legalSubtitle}>
            Last updated: June 2026. Please read these platform guidelines
            carefully before initializing your automated personal development
            workspace environments.
          </Text>
        </Animatable.View>

        <View style={styles.contentWrapper}>
          {/* Detailed Legal Content Flow Block */}
          <View style={styles.termsFlow}>
            {legalSections.map((section, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={100 + index * 50}
                style={styles.sectionBlock}
              >
                <Text style={styles.sectionHeading}>{section.title}</Text>
                <Text style={styles.sectionText}>{section.content}</Text>
              </Animatable.View>
            ))}
          </View>

          {/* Infrastructure Endnote */}
          <Animatable.View
            animation="fadeIn"
            delay={500}
            style={styles.footerNotice}
          >
            <Text style={styles.noticeText}>
              Questions regarding these legal paradigms or operational
              structural data safeguards should be formally channeled to:
              support.whitebear@gmail.com
            </Text>
          </Animatable.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsAndConditions;

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
      paddingBottom: isLandscape ? hp(10) : hp(6),
    },

    heroSection: {
      paddingTop: isLandscape ? hp(5) : hp(6),
      paddingBottom: hp(3),
      paddingHorizontal: isLandscape ? wp(12) : wp(6),
      alignItems: 'flex-start',
    },

    legalTitle: {
      fontSize: moderateScale(26),
      fontFamily: theme.typography.bold,
      color: '#111111',
      letterSpacing: -0.5,
    },

    legalSubtitle: {
      fontSize: moderateScale(13.5),
      fontFamily: theme.typography.regular,
      color: '#666666',
      marginTop: hp(1.5),
      lineHeight: moderateScale(21),
      maxWidth: isLandscape ? wp(75) : '100%',
    },

    contentWrapper: {
      paddingHorizontal: isLandscape ? wp(12) : wp(6),
    },

    termsFlow: {
      width: '100%',
    },

    sectionBlock: {
      marginBottom: hp(3.5),
      maxWidth: isLandscape ? wp(75) : '100%',
    },

    sectionHeading: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.semiBold,
      color: '#111111',
      marginBottom: hp(1),
      letterSpacing: -0.1,
    },

    sectionText: {
      fontSize: moderateScale(13.5),
      fontFamily: theme.typography.regular,
      color: '#444444',
      lineHeight: moderateScale(21),
      textAlign: 'left',
    },

    footerNotice: {
      marginTop: hp(2),
      paddingTop: hp(3),
      borderTopWidth: 1,
      borderTopColor: '#EAEAEA',
      maxWidth: isLandscape ? wp(75) : '100%',
    },

    noticeText: {
      fontSize: moderateScale(12.5),
      fontFamily: theme.typography.medium,
      color: '#888888',
      lineHeight: moderateScale(18),
      fontStyle: 'italic',
    },
  });
};
