/**
 * @file Button.jsx
 * @module utilities/custom-components/button/Button
 * @description Highly customizable, theme-consistent button component with full responsive support.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { theme } from '../../../styles/Themes';
import WaveLoader from '../loader/Loader';

const Button = ({
  onPress,
  title,
  loading = false,
  style,
  textStyle,
  width,
  disabled = false,
  backgroundColor,
  gradientColors,
  textColor,
  iconName,
  iconSize = 20,
  iconColor,
  iconStyle,
  iconPosition = 'left',
  elevation,
  gradientProps = {},
}) => {
  const { styles: baseGlobalStyles, wp, scale } = useGlobalStyles();

  const hasGradient =
    !disabled &&
    !backgroundColor &&
    Array.isArray(gradientColors) &&
    gradientColors.length >= 2;

  const finalBgColor = disabled
    ? theme.colors.gray
    : backgroundColor || theme.colors.primary;

  const finalTextColor = disabled ? theme.colors.dark : textColor;
  const finalIconColor = iconColor || finalTextColor;

  const styles = createStyles({
    wp,
    scale,
    width,
    elevation,
    finalBgColor,
    finalTextColor,
  });

  const renderIcon = () =>
    iconName ? (
      <Ionicons
        name={iconName}
        size={scale(iconSize) / scale(1)}
        color={finalIconColor}
        style={[styles.iconBase, iconStyle]}
      />
    ) : null;

  const content = loading ? (
    <WaveLoader color={finalTextColor} size={22} scaleUtil={scale} />
  ) : (
    <>
      {iconPosition === 'left' && renderIcon()}
      <Text
        style={[
          baseGlobalStyles.buttonText,
          styles.buttonTextOverride,
          textStyle,
        ]}
      >
        {title}
      </Text>
      {iconPosition === 'right' && renderIcon()}
    </>
  );

  const combinedButtonStyles = [
    baseGlobalStyles.buttonPrimary,
    styles.responsiveLayout,
    style,
  ];

  // 🟢 FIXED: Solid background wrapper now forces row-direction layout natively
  if (disabled || !hasGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={disabled ? 1 : 0.8}
        style={[
          combinedButtonStyles,
          styles.solidBackground,
          styles.rowContentProps,
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      style={combinedButtonStyles}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      {...gradientProps}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.centerContent}>{content}</View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Button;

/**
 * Isolated dynamic style factory
 */
const createStyles = ({
  wp,
  scale,
  width,
  elevation,
  finalBgColor,
  finalTextColor,
}) => {
  return StyleSheet.create({
    responsiveLayout: {
      width: width || '100%',
      gap: theme.gap(1),
      ...(elevation ? theme.elevation[elevation] : {}),
    },

    solidBackground: {
      backgroundColor: finalBgColor,
    },

    rowContentProps: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    buttonTextOverride: {
      color: finalTextColor,
    },

    iconBase: {
      marginHorizontal: scale(4),
    },

    centerContent: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.gap(1),
    },
  });
};
