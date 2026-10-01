/**
 * @file TimelineOptionCard.jsx
 * @description Premium responsive row layout component for timeline configurations.
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

const TimelineOptionCard = ({
  label,
  subLabel,
  isSelected,
  onPress,
  accentColor = theme.colors.dashboard.goals,
}) => {
  const { wp, hp, moderateScale } = useGlobalStyles();
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Active micro-feedback state scaling
  const handlePressIn = () => {
    Animated.timing(animatedScale, {
      toValue: 0.98,
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

  const styles = createStyles({
    wp,
    hp,
    moderateScale,
    accentColor,
    isSelected,
  });

  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.rowContainer}
      >
        {/* Left Informational Content Group */}
        <View style={styles.contentBlock}>
          <Text style={styles.labelText}>{label}</Text>
          {subLabel ? (
            <Text style={styles.subLabelText}>{subLabel}</Text>
          ) : null}
        </View>

        {/* Right Custom Radio Structural Indicator */}
        <View style={styles.radioOuterCircle}>
          {isSelected && <View style={styles.radioInnerCore} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TimelineOptionCard;

/**
 * 🎨 Production-Grade Styles Matrix
 */
const createStyles = ({ wp, hp, moderateScale, accentColor, isSelected }) => {
  return StyleSheet.create({
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      backgroundColor: isSelected ? `${accentColor}05` : theme.colors.white, // Light structural ambient glow
      borderBottomWidth: 1,
      borderBottomColor: '#F1F5F9', // Modern dynamic soft separator
      transition: 'all 0.2s ease',
    },

    contentBlock: {
      flex: 1,
      paddingRight: wp(4),
    },

    labelText: {
      fontFamily: isSelected ? theme.typography.bold : theme.typography.medium,
      fontSize: moderateScale(14),
      color: isSelected ? accentColor : '#1E293B',
      textTransform: 'capitalize',
    },

    subLabelText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(11.5),
      color: '#64748B',
      marginTop: hp(0.4),
    },

    radioOuterCircle: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(10),
      borderWidth: 2,
      borderColor: isSelected ? accentColor : theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    radioInnerCore: {
      width: moderateScale(10),
      height: moderateScale(10),
      borderRadius: moderateScale(5),
      backgroundColor: accentColor,
    },
  });
};
