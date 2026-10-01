/**
 * @file PrivacyPolicy.jsx
 * @module screens/setting-screen/setting-sub-screen/PrivacyPolicy
 * @description Comprehensive, modern privacy and data safeguard disclosure component optimized for clean typography.
 */

import React from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar } from 'react-native';
import { theme } from '../../../styles/Themes';
import * as Animatable from 'react-native-animatable';
import Header from '../../../utilities/custom-components/header/header/Header';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

const PrivacyPolicy = () => {
  useStatusBarConfig();

  const responsiveValues = useGlobalStyles();
  const { isLandscape, moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  // Structured legal disclosure paragraphs matching advanced application data patterns
  const privacySections = [
    {
      title: '1. Information We Collect',
      content:
        'White Bear extracts and processes intentional user inputs to execute workspace logic. This includes account credentials (name, email address, password hashes), custom-defined objective matrices, automated to-do structures, daily progress statistics, and contextual data explicitly typed within reflection and journal text logs.',
    },
    {
      title: '2. Utilization of Data Payloads',
      content:
        'Collected telemetry data is utilized solely to deliver, protect, and refine ecosystem functionality. Specifically, your reflection records and habit routines are parsed to train your isolated, local AI assistant parameters, automate task roll-over mechanics, and synthesize bi-monthly visual analytics performance sheets.',
    },
    {
      title: '3. Generative AI Sub-Processors',
      content:
        'To generate personalized roadmap layers, specific text packages are transmitted securely to validated external AI parsing engines. These text vectors are handled strictly via anonymized API token streams. Our partners maintain strict confidentiality guidelines and are explicitly prohibited from using White Bear context packets to train public foundation models.',
    },
    {
      title: '4. Absolute Encryption Standards',
      content:
        'Security is forged directly into our framework layers. All data moving between your hardware device and workspace servers is guarded via Transport Layer Security (TLS 1.3). Static data repositories leverage Advanced Encryption Standard (AES-256) architectures, guaranteeing that your personal growth workspace remains entirely confidential.',
    },
    {
      title: '5. Retention and Explicit Deletion Rights',
      content:
        'We store data payloads exclusively as long as your workspace profile remains active. You hold complete sovereign authority over your digital history. You may instantly trigger an absolute database purge directly from your Account Management hub, which systematically eradicates all associated server-side nodes permanently.',
    },
    {
      title: '6. Tracking & Telemetry Insights',
      content:
        'We deploy localized analytical variables to track screen transitions, latency spikes, and system health performance. This profiling does not capture individual tracking indicators or external browsing history, remaining entirely focused on optimizing structural platform response times.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <Header
          title="Privacy Policy"
          headerColor={theme.colors.dashboard.settings}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Minimalist Data Privacy Hero Block */}
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          style={styles.heroSection}
        >
          <Text style={styles.policyTitle}>Data Safeguard Directives</Text>
          <Text style={styles.policySubtitle}>
            Last updated: June 2026. Your growth logs, analytics tracking, and
            AI-driven inputs are strictly protected. Learn exactly how White
            Bear manages and isolates your data profiles.
          </Text>
        </Animatable.View>

        <View style={styles.contentWrapper}>
          {/* Detailed Policy Text Chain */}
          <View style={styles.policyFlow}>
            {privacySections.map((section, index) => (
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

          {/* Compliance Contact Footnote */}
          <Animatable.View
            animation="fadeIn"
            delay={500}
            style={styles.footerNotice}
          >
            <Text style={styles.noticeText}>
              To initiate data collection transparency reports, file structural
              privacy audits, or request deep technical stack configuration
              insights, reach out directly via: support.whitebear@gmail.com
            </Text>
          </Animatable.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;

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

    policyTitle: {
      fontSize: moderateScale(26),
      fontFamily: theme.typography.bold,
      color: '#111111',
      letterSpacing: -0.5,
    },

    policySubtitle: {
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

    policyFlow: {
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
