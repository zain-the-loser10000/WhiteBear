/**
 * @file Header.jsx
 * @module utilities/custom-components/header/auth-header/Header
 * @description Renders the header component with back navigation and title.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../../styles/Themes';
import { useGlobalStyles } from '../../../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../../custom-hooks/custom-status-bar/StatusBar.hook';

const Header = ({ title = '', subtitle = '', headerColor, onBackPress }) => {
  useStatusBarConfig();
  const { isLandscape, wp, hp, moderateScale } = useGlobalStyles();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-15)).current;

  const finalBgColor = headerColor || theme.colors.primary;
  const styles = createStyles({
    wp,
    hp,
    moderateScale,
    isLandscape,
    finalBgColor,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.backNavigationRow}>
        <TouchableOpacity
          onPress={onBackPress}
          activeOpacity={0.7}
          style={styles.backButtonClickBox}
        >
          <Ionicons
            name="chevron-back-outline"
            size={moderateScale(26)}
            color={theme.colors.white}
          />
        </TouchableOpacity>

        <View style={styles.backTextStack}>
          <Text style={styles.innerScreenTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.innerScreenSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
};

export default Header;

/**
 * Responsive Layout Styles
 */
const createStyles = ({ wp, hp, moderateScale, isLandscape, finalBgColor }) => {
  return StyleSheet.create({
    headerContainer: {
      backgroundColor: finalBgColor,
      paddingTop: isLandscape ? hp(4) : hp(6),
      paddingHorizontal: wp(5),
      paddingBottom: isLandscape ? hp(2.5) : hp(2.2),
      borderBottomLeftRadius: moderateScale(24),
      borderBottomRightRadius: moderateScale(24),
      elevation: theme.elevation?.depth3?.elevation,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },

    backNavigationRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    backButtonClickBox: {
      paddingRight: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
    },

    backTextStack: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },

    innerScreenTitle: {
      fontSize: moderateScale(22),
      fontFamily: theme.typography.bold,
      color: theme.colors.white,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },

    innerScreenSubtitle: {
      fontSize: moderateScale(12.5),
      fontFamily: theme.typography.semiBold,
      color: theme.colors.white,
      opacity: 0.85,
      marginTop: hp(0.2),
      textTransform: 'capitalize',
    },
  });
};
