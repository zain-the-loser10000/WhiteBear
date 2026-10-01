/**
 * @file CategoryCard.jsx
 * @description Ultra-enhanced, professional category card designed strictly with scale, dimensions and accent matrices.
 */

import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const CategoryCard = ({
  label,
  emoji,
  isSelected,
  onPress,
  accentColor = theme.colors.dashboard.goals,
  isLandscape = false,
}) => {
  const { wp, hp, moderateScale } = useGlobalStyles();
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Micro-interactions scaling response
  const handlePressIn = () => {
    Animated.timing(animatedScale, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Inject matrix metrics inside the localized sheet compiler
  const styles = createStyles({
    wp,
    hp,
    moderateScale,
    accentColor,
    isSelected,
    isLandscape,
  });

  return (
    <Animated.View
      style={[
        styles.cardTransformWrapper,
        { transform: [{ scale: animatedScale }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.cardContainer}
      >
        {/* Top Accent Structural Band Indicator */}
        {isSelected && <View style={styles.topAccentIndicator} />}

        {/* Realistic Glassmorphic Icon Wrapper */}
        <View style={styles.iconWrapperShell}>
          <Text style={styles.emojiGlyph}>{emoji || '📌'}</Text>
        </View>

        {/* Label Core Layout Block */}
        <View style={styles.textContainer}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.labelTitleText}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CategoryCard;

/**
 * 🎨 Production-Grade Styles Matrix Structure
 */
const createStyles = ({
  wp,
  hp,
  moderateScale,
  accentColor,
  isSelected,
  isLandscape,
}) => {
  return StyleSheet.create({
    cardTransformWrapper: {
      width: isLandscape ? '23.5%' : '48%',
      marginBottom: hp(1),
    },

    cardContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(14),
      borderWidth: 1.5,
      borderColor: isSelected ? accentColor : theme.colors.border,
      paddingHorizontal: wp(3.5),
      paddingTop: hp(2),
      paddingBottom: hp(1.8),
      alignItems: 'flex-start',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      minHeight: moderateScale(100),

      shadowColor: isSelected ? accentColor : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isSelected ? 0.12 : 0.03,
      shadowRadius: moderateScale(6),
      elevation: isSelected ? 3 : 1,
      backgroundColor: isSelected ? `${accentColor}08` : theme.colors.white, // Smooth 5% alpha injection
    },

    topAccentIndicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: hp(0.5),
      backgroundColor: accentColor,
    },

    iconWrapperShell: {
      width: moderateScale(42),
      height: moderateScale(42),
      borderRadius: moderateScale(10),
      backgroundColor: isSelected
        ? `${accentColor}18`
        : theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: hp(1.2),
    },

    emojiGlyph: {
      fontSize: moderateScale(20),
      color: accentColor,
      textAlign: 'center',
    },

    textContainer: {
      width: '100%',
      justifyContent: 'center',
    },

    labelTitleText: {
      fontFamily: isSelected
        ? theme.typography.bold
        : theme.typography.semiBold,
      fontSize: moderateScale(12),
      color: isSelected ? accentColor : '#334155',
      lineHeight: moderateScale(16.5),
    },
  });
};
