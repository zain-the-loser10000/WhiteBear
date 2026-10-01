/**
 * @file Splash.jsx
 * @module screens/splash-screen/Splash
 * @description Splash screen for Book Hive with full responsive support via stylesheet factoring, featuring literary mental wellness quotes.
 */

import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import { useSessionCheck } from '../../utilities/custom-hooks/custom-session-check/SessionCheck.hook';

const customLogoEntry = {
  0: { opacity: 0, scale: 0.5, translateY: 40, rotate: '-8deg' },
  0.6: { opacity: 1, scale: 1.05, translateY: -5, rotate: '2deg' },
  1: { opacity: 1, scale: 1, translateY: 0, rotate: '0deg' },
};

const Splash = () => {
  useStatusBarConfig();
  useSessionCheck(2500);

  const responsiveValues = useGlobalStyles();
  const styles = createStyles(responsiveValues);

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <Animatable.View
        animation="fadeIn"
        duration={2500}
        style={StyleSheet.absoluteFill}
      >
        <LinearGradient
          colors={[
            theme.colors.primary,
            theme.colors.tertiary,
            theme.colors.secondary,
          ]}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animatable.View>

      {/* Ambient Glow Effects */}
      <Animatable.View
        animation={{
          0: { scale: 1, opacity: 0.25 },
          0.5: { scale: 1.15, opacity: 0.5 },
          1: { scale: 1, opacity: 0.25 },
        }}
        iterationCount="infinite"
        duration={8000}
        easing="ease-in-out"
        style={styles.glow1}
      />

      <Animatable.View
        animation={{
          0: { scale: 1, opacity: 0.25 },
          0.5: { scale: 1.2, opacity: 0.4 },
          1: { scale: 1, opacity: 0.25 },
        }}
        iterationCount="infinite"
        duration={10000}
        delay={1500}
        easing="ease-in-out"
        style={styles.glow2}
      />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Animatable.View
          animation={customLogoEntry}
          duration={900}
          delay={150}
          style={styles.logoContainer}
        >
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={4500}
            easing="ease-in-out"
          >
            <Animatable.Image
              source={require('../../assets/logo/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animatable.View>
        </Animatable.View>

        {/* Text Content */}
        <View style={styles.textWrapper}>
          <Animatable.View
            animation="fadeInUp"
            duration={900}
            delay={1100}
            style={styles.titleRow}
          >
            <Text style={styles.taglineMain}>WHITE</Text>

            <View style={styles.highlightContainer}>
              <View style={styles.highlightBackground} />
              <Text style={styles.taglineHighlight}>BEAR</Text>
            </View>
          </Animatable.View>

          {/* Professional Tagline */}
          <Animatable.Text
            animation="fadeInUp"
            duration={900}
            delay={1300}
            style={styles.taglineSub}
          >
            Cultivating Mindful Reading
          </Animatable.Text>

          {/* Powered By AI */}
          <Animatable.View
            animation="fadeInUp"
            duration={900}
            delay={1500}
            style={styles.poweredRow}
          >
            <Text style={styles.poweredText}>Powered By</Text>
            <Animatable.Image
              source={require('../../assets/icons/ai-icon.png')}
              style={styles.poweredImage}
              resizeMode="contain"
            />
          </Animatable.View>

          {/* Mental Wellness Literary Quote */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={1700}
            style={styles.quoteContainer}
          >
            <Text style={styles.quoteText}>
              "You can choose to be free from the things that restrict you, and
              find a quiet clarity within."
            </Text>
            <Text style={styles.quoteAuthor}>— Franz Kafka</Text>
          </Animatable.View>
        </View>
      </View>
    </View>
  );
};

export default Splash;

const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      flexDirection: isLandscape ? 'row' : 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isLandscape ? wp(6) : hp(2.5),
      paddingHorizontal: wp(8),
      marginTop: hp(20),
      zIndex: 3,
    },

    glow1: {
      position: 'absolute',
      backgroundColor: theme.colors.dark + '28',
      borderRadius: theme.borderRadius.circle,
      top: hp(12),
      left: -wp(30),
      width: wp(150),
      height: isLandscape ? hp(160) : hp(140),
      zIndex: 1,
    },

    glow2: {
      position: 'absolute',
      backgroundColor: theme.colors.primary + '28',
      borderRadius: theme.borderRadius.circle,
      bottom: -wp(35),
      right: -wp(15),
      width: wp(130),
      height: isLandscape ? hp(140) : hp(120),
      zIndex: 2,
    },

    logoContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      top: isLandscape ? hp(12) : hp(2),
      marginBottom: hp(4),
    },

    logoImage: {
      width: isLandscape ? wp(26) : wp(54),
      height: isLandscape ? hp(40) : hp(20),
    },

    textWrapper: {
      alignItems: isLandscape ? 'flex-start' : 'center',
      justifyContent: 'center',
      maxWidth: isLandscape ? wp(50) : wp(85),
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: wp(3),
    },

    taglineMain: {
      fontFamily: theme.typography.semiBold,
      color: 'rgba(255,255,255,0.95)',
      fontSize: moderateScale(28),
      letterSpacing: wp(1.2),
    },

    highlightContainer: {
      position: 'relative',
    },

    highlightBackground: {
      position: 'absolute',
      top: 3,
      left: 0,
      right: 0,
      bottom: 3,
      opacity: 0.35,
      backgroundColor: theme.colors.secondary,
      borderRadius: 8,
    },

    taglineHighlight: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.white,
      fontSize: moderateScale(28),
      letterSpacing: wp(1.2),
      paddingHorizontal: wp(4),
      paddingVertical: hp(0.6),
    },

    taglineSub: {
      fontFamily: theme.typography.medium,
      color: 'rgba(255,255,255,0.85)',
      fontSize: moderateScale(16),
      letterSpacing: wp(0.5),
      marginTop: hp(1.5),
      textAlign: isLandscape ? 'left' : 'center',
      left: isLandscape ? wp(1) : 0,
    },

    poweredRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(6),
      marginTop: hp(4),
      opacity: 0.8,
      left: isLandscape ? wp(6.5) : '0',
    },

    poweredText: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.dark,
      fontSize: moderateScale(14),
      letterSpacing: wp(0.3),
      textTransform: 'uppercase',
    },

    poweredImage: {
      width: moderateScale(24),
      height: moderateScale(24),
    },

    quoteContainer: {
      position: 'absolute',
      bottom: hp(-35),
      marginTop: hp(4),
      borderLeftWidth: isLandscape ? 3 : 0,
      borderLeftColor: theme.colors.secondary + 'A0',
      paddingLeft: isLandscape ? wp(3) : 0,
      alignItems: isLandscape ? 'flex-start' : 'center',
    },

    quoteText: {
      fontFamily: theme.typography.regular,
      fontStyle: 'italic',
      color: theme.colors.white,
      fontSize: moderateScale(16),
      lineHeight: moderateScale(19),
      textAlign: isLandscape ? 'left' : 'center',
    },

    quoteAuthor: {
      fontFamily: theme.typography.medium,
      color: theme.colors.dark,
      fontSize: moderateScale(14),
      marginTop: hp(0.8),
      letterSpacing: wp(0.2),
    },
  });
};
