/**
 * @file GlobalEmptyState.jsx
 * @module utilities/custom-components/empty-state/GlobalEmptyState
 * @description Fully responsive, highly scalable global empty state component driven by React Native Vector Icons and elegant entry animations.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, Easing } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const GlobalEmptyState = ({
  iconName,
  iconSize,
  title,
  subtitle,
  accentColor,
}) => {
  const { wp, hp, moderateScale } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.back(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const derivedIconSize = iconSize || moderateScale(76);

  return (
    <Animated.View
      style={[
        styles.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        },
      ]}
    >
      {/* 🔮 Vector Icon Matrix */}
      <Animated.View
        style={[styles.iconWrapper, { borderColor: accentColor + '20' }]}
      >
        <Ionicons name={iconName} size={derivedIconSize} color={accentColor} />
      </Animated.View>

      {/* 📝 Content Metadata Slots */}
      <Text style={styles.emptyTitleText}>{title}</Text>
      <Text style={styles.emptySubtitleText}>{subtitle}</Text>
    </Animated.View>
  );
};

export default React.memo(GlobalEmptyState);

/**
 * 🎨 Component Localized Styles Matrix
 */
const createStyles = ({ wp, hp, moderateScale }) => {
  return StyleSheet.create({
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: wp(8),
      paddingVertical: hp(6),
    },

    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: moderateScale(18),
      borderRadius: moderateScale(100),
      backgroundColor: 'transparent',
      marginBottom: hp(2.5),
    },

    emptyTitleText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(18),
      color: '#2C3E50',
      textAlign: 'center',
      marginBottom: hp(1.2),
      letterSpacing: 0.2,
    },

    emptySubtitleText: {
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(13),
      color: '#7F8C8D',
      textAlign: 'center',
      lineHeight: moderateScale(20),
      paddingHorizontal: wp(4),
    },
  });
};
