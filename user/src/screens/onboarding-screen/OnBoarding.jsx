/**
 * @file OnBoarding.js
 * @module screens/onboarding-screen/OnBoarding
 * @description Fully automated, edge-to-edge responsive onboarding flow for WhiteBear.
  Dynamically adapts to device orientation and auto-routes users based on session presence.
 */

import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

const SESSION_TOKEN_KEY = '@white_bear_session_token';
const SLIDE_VIEW_TIMEOUT = 1500; // Time in ms to read the final slide before routing

const ONBOARDING_DATA = [
  {
    id: '1',
    titlePart1: 'Your AI-Powered\n',
    titleHighlight: 'Wellness Analyzer',
    titlePart2: '',
    description:
      'AI-powered analysis of your goals & habits & todos and journals to surface personalized wellness insights, patterns, and actionable triggers.',
    highlightColor: '#87B07D', // Sage Green
    bgColor: '#F4F7F4', // Pristine minimal sage tint
    animation: require('../../assets/onboarding/onboard-1.json'),
  },
  {
    id: '2',
    titlePart1: 'Build Better\n',
    titleHighlight: 'Habits & Goals',
    titlePart2: '',
    description:
      'Design and track meaningful habits with structured goals. Create atomic routines and long-term milestones to achieve sustainable personal growth.',
    highlightColor: '#4A6B6C', // Slate Teal
    bgColor: '#F2F5F6', // Clean slate tint
    animation: require('../../assets/onboarding/onboard-2.json'),
  },
  {
    id: '3',
    titlePart1: 'Reflect with\n',
    titleHighlight: 'Journals & Todos',
    titlePart2: '',
    description:
      'Reflect on your day with Journals & Todos—capture insights, track moods, and convert reflections into prioritized, actionable tasks.',
    highlightColor: '#E9A13B', // Refined Warm Amber
    bgColor: '#FAF7F0', // Soft premium white linen
    animation: require('../../assets/onboarding/onboard-3.json'),
  },
];

const OnBoarding = () => {
  useStatusBarConfig();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const responsiveValues = useGlobalStyles();
  const { width } = responsiveValues;
  const styles = createStyles(responsiveValues);

  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  /**
   * Evaluates active credentials locally and executes contextual structural routing
   */
  const handleAutoNavigation = async () => {
    try {
      const activeToken = await AsyncStorage.getItem(SESSION_TOKEN_KEY);

      if (activeToken) {
        navigation.replace('Main');
      } else {
        navigation.replace('Signin');
      }
    } catch (error) {
      navigation.replace('Signin');
    }
  };

  // Automated hands-free routing engine activated upon arriving at the final panel
  useEffect(() => {
    let autoRouteTimer;

    if (isLastSlide) {
      autoRouteTimer = setTimeout(() => {
        handleAutoNavigation();
      }, SLIDE_VIEW_TIMEOUT);
    }

    return () => {
      if (autoRouteTimer) clearTimeout(autoRouteTimer);
    };
  }, [currentIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [responsiveValues.hp(4), 0, -responsiveValues.hp(4)],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const scaleValue = scrollX.interpolate({
      inputRange,
      outputRange: [0.94, 1, 0.94],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        {/* Animated Asset Frame */}
        <Animated.View
          style={[
            styles.animationWrapper,
            { opacity, transform: [{ scale: scaleValue }] },
          ]}
        >
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={styles.lottie}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Informational Presenter Node */}
        <Animated.View
          style={[
            styles.contentOverlay,
            { opacity, transform: [{ translateY }] },
          ]}
        >
          <Text style={styles.title}>
            {item.titlePart1}
            <Text style={{ color: item.highlightColor }}>
              {item.titleHighlight}
            </Text>
            {item.titlePart2}
          </Text>

          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.pillDivider} />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Absolute Layered Cross-Fade Background Canvas */}
      {ONBOARDING_DATA.map((item, index) => {
        const opacity = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={item.id}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: item.bgColor, opacity },
            ]}
          />
        );
      })}

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        keyExtractor={item => item.id}
      />

      {/* Dynamic Passive Pagination Anchor */}
      <View style={styles.staticBottomControls} pointerEvents="none">
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [
                responsiveValues.wp(2),
                responsiveValues.wp(5.5),
                responsiveValues.wp(2),
              ],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: dotOpacity,
                    width: dotWidth,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default OnBoarding;

/**
 * Responsive Style Sheet Construction Factory
 */
const createStyles = ({
  isLandscape,
  moderateScale,
  wp,
  hp,
  width,
  height,
}) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },

    slide: {
      width: width,
      height: height,
      flexDirection: isLandscape ? 'row' : 'column',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: isLandscape ? 0 : hp(18),
    },

    animationWrapper: {
      width: isLandscape ? wp(46) : width,
      height: isLandscape ? height : 'auto',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: isLandscape ? 0 : hp(2),
    },

    lottie: {
      width: isLandscape ? wp(40) : wp(76),
      height: isLandscape ? wp(40) : wp(76),
    },

    contentOverlay: {
      width: isLandscape ? wp(54) : width,
      paddingHorizontal: wp(8),
      alignItems: 'center',
      justifyContent: 'center',
    },

    title: {
      fontSize: moderateScale(25),
      fontFamily: theme.typography.bold,
      color: '#1E2925',
      textAlign: 'center',
      lineHeight: moderateScale(34),
      letterSpacing: -0.4,
    },

    description: {
      fontSize: moderateScale(13.5),
      fontFamily: theme.typography.medium,
      color: '#5C6E66',
      textAlign: 'center',
      lineHeight: moderateScale(21),
      marginTop: hp(1.8),
      paddingHorizontal: wp(3),
    },

    pillDivider: {
      width: wp(8),
      height: hp(0.4),
      backgroundColor: 'rgba(30, 41, 37, 0.05)',
      borderRadius: wp(0.2),
      marginTop: hp(3),
    },

    staticBottomControls: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: isLandscape ? wp(54) : width,
      alignItems: 'center',
      paddingBottom: isLandscape ? hp(6) : hp(7),
    },

    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: hp(1.5),
    },

    dot: {
      height: hp(0.9),
      borderRadius: hp(0.45),
      marginHorizontal: wp(1),
      backgroundColor: '#1E2925',
    },
  });
};
