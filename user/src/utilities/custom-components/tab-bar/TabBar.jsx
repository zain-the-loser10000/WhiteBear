/**
 * @file TabBar.jsx
 * @module utilities/custom-components/tab-bar/TabBar
 * @description Dynamic, smoothly animated custom segmented tab bar supporting 2 to 6+ tabs with automatic geometry scaling.
 */

import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { theme } from '../../../styles/Themes';

const CustomTabBar = ({
  activeTab,
  onTabChange,
  tabs = [],
  activeColor = theme.colors?.dashboard?.journals,
  style,
}) => {
  const { scale, wp, hp, isLandscape } = useGlobalStyles();

  // 🌟 Safe Fallback: Agar activeTab null hai to Animated.Value ko shuru mein 0 do crash se bachne ke liye
  const animationValue = useRef(new Animated.Value(activeTab ?? 0)).current;

  const totalTabs = tabs.length || 2;
  const tabWidthPercentage = 100 / totalTabs;

  useEffect(() => {
    // 🌟 Animation tabhi trigger karo jab activeTab actual mein aik valid index (number) ho
    if (typeof activeTab === 'number') {
      Animated.timing(animationValue, {
        toValue: activeTab,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [activeTab, animationValue]);

  // 📐 Safe Matrix Interpolation Range Factory
  const translateSlider = animationValue.interpolate({
    inputRange: Array.from({ length: totalTabs }, (_, i) => i),
    outputRange: Array.from(
      { length: totalTabs },
      (_, i) => `${i * tabWidthPercentage}%`,
    ),
  });

  const styles = createStyles({
    scale,
    wp,
    hp,
    isLandscape,
    tabWidthPercentage,
  });
  const isAnyTabActive = typeof activeTab === 'number';

  return (
    <View style={[styles.container, style]}>
      {/* 🚀 Sliding Pill Overlay tabhi render hoga jab koi tab active hoga */}
      {isAnyTabActive && (
        <Animated.View
          style={[
            styles.animatedSlider,
            {
              left: translateSlider,
              backgroundColor: activeColor,
              shadowColor: activeColor,
            },
          ]}
        />
      )}

      {tabs.map((tabLabel, index) => {
        const isActive = activeTab === index;

        return (
          <TouchableOpacity
            key={`tab-segment-${index}`}
            activeOpacity={0.9}
            onPress={() => onTabChange(index)}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabText,
                isActive ? styles.textActive : { color: activeColor },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tabLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomTabBar;

/**
 * Responsive Layout Styles Factory Engine
 */
const createStyles = ({ scale, wp, hp, isLandscape, tabWidthPercentage }) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      width: isLandscape ? wp(82) : wp(92),
      height: isLandscape ? hp(18) : hp(7.5),
      backgroundColor: theme.colors?.background,
      borderRadius: scale(14),
      alignSelf: 'center',
      position: 'relative',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 4.5,
      elevation: 4,
      paddingHorizontal: 2,
    },

    animatedSlider: {
      position: 'absolute',
      width: `${tabWidthPercentage}%`, // 🌟 Explicit dynamic matrix alignment
      height: '100%', // Keeps it slightly smaller than container for premium pill look
      borderRadius: scale(12),
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },

    tabButton: {
      flex: 1,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },

    tabText: {
      fontSize: scale(14),
      fontFamily: theme.typography.semiBold,
    },

    textActive: {
      color: theme.colors.white,
    },
  });
};
