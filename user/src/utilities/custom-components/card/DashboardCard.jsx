/**
 * @file DashboardCard.jsx
 * @module utilities/custom-components/card/DashboardCard
 * @description Highly customizable, orientation-aware interactive dashboard card.
 * Features absolute visual alignment, unified padding structures, and zero layout loose magic numbers.
 */

import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { theme } from '../../../styles/Themes';

const DashboardCard = ({
  title,
  subtitle,
  color,
  gradientColors,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  subtitleStyle,
  disabled = false,
  elevation = 'depth2',
}) => {
  const { isLandscape, wp, hp, moderateScale } = useGlobalStyles();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const hasGradient =
    Array.isArray(gradientColors) && gradientColors.length >= 2;
  const finalBgColor = color || theme.colors.primary;

  const styles = createStyles({
    wp,
    hp,
    moderateScale,
    isLandscape,
    fullWidth,
    finalBgColor,
    elevation,
  });

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.96,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.95}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.cardWrapper, style]}
    >
      <Animated.View
        style={[styles.cardBase, { transform: [{ scale: scaleValue }] }]}
      >
        {/* Absolute Background Gradient layer to ensure layout rules are identical */}
        {hasGradient && (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Clean Centered Content Layer */}
        <View style={styles.cardContentContainer}>
          <Text style={[styles.cardTitle, textStyle]} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.cardSubtitle, subtitleStyle]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default DashboardCard;

/**
 * Proportional Layout Engine
 */
const createStyles = ({
  wp,
  hp,
  moderateScale,
  isLandscape,
  fullWidth,
  finalBgColor,
  elevation,
}) => {
  const cardWidth = fullWidth
    ? isLandscape
      ? wp(89)
      : wp(90)
    : isLandscape
    ? wp(29)
    : wp(43.5);

  const cardHeight = fullWidth
    ? isLandscape
      ? hp(18)
      : hp(14)
    : isLandscape
    ? hp(20)
    : hp(13.5);

  const innerPadding = Math.round(moderateScale(16));

  return StyleSheet.create({
    cardWrapper: {
      width: cardWidth,
      marginBottom: hp(1.8),
    },

    cardBase: {
      width: '100%',
      height: cardHeight,
      backgroundColor: finalBgColor,
      borderRadius: Math.round(moderateScale(16)),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      ...(elevation && theme.elevation?.[elevation]
        ? theme.elevation[elevation]
        : theme.elevation.depth2),
    },

    cardContentContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: innerPadding,
      paddingVertical: hp(1),
    },

    cardTitle: {
      fontFamily: theme.typography.bold,
      color: theme.colors.white,
      fontSize: moderateScale(20),
      textAlign: 'center',
    },

    cardSubtitle: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.white,
      fontSize: moderateScale(11.5),
      textAlign: 'center',
      opacity: 0.9,
      marginTop: hp(0.6),
    },
  });
};
