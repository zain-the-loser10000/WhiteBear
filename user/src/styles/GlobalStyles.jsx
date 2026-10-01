/**
 * @file GlobalStyles.jsx
 * @module styles/GlobalStyles
 * @description Centralized hook-driven global style definitions that update dynamically on device rotation.
 */

import { StyleSheet } from 'react-native';
import { theme } from './Themes';
import { useResponsive } from '../utilities/custom-hooks/custom-responsive/useResponsive.hook';

export const useGlobalStyles = () => {
  const {
    scale,
    verticalScale,
    moderateScale,
    wp,
    hp,
    isLandscape,
    width,
    height,
  } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },

    textPrimary: {
      color: theme.colors.primary,
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(theme.typography.fontSize.sm),
    },

    textSecondary: {
      color: theme.colors.secondary,
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(theme.typography.fontSize.sm),
    },

    textWhite: {
      color: theme.colors.white,
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(theme.typography.fontSize.sm),
    },

    textBlack: {
      color: theme.colors.dark,
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(theme.typography.fontSize.sm),
    },

    textError: {
      color: theme.colors.error,
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(theme.typography.fontSize.xs),
      paddingLeft: scale(4),
    },

    textSuccess: {
      color: theme.colors.success,
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(theme.typography.fontSize.xs),
      paddingLeft: scale(4),
    },

    buttonPrimary: {
      backgroundColor: theme.colors.primary,
      paddingVertical: verticalScale(theme.spacing(1.5)),
      paddingHorizontal: scale(theme.spacing(3)),
      borderRadius: moderateScale(theme.borderRadius.large),
      alignItems: 'center',
      justifyContent: 'center',
      width: isLandscape ? wp(40) : wp(85),
      alignSelf: 'center',
    },

    buttonSecondary: {
      backgroundColor: theme.colors.secondary,
      paddingVertical: verticalScale(theme.spacing(1.5)),
      paddingHorizontal: scale(theme.spacing(3)),
      borderRadius: moderateScale(theme.borderRadius.large),
      alignItems: 'center',
      justifyContent: 'center',
      width: isLandscape ? wp(40) : wp(85),
      alignSelf: 'center',
    },

    buttonText: {
      color: theme.colors.white,
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(theme.typography.fontSize.sm),
    },

    inputContainer: {
      marginVertical: verticalScale(theme.spacing(1)),
      width: '100%',
    },

    input: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(theme.borderRadius.medium),
      paddingVertical: verticalScale(theme.spacing(1.2)),
      paddingHorizontal: scale(theme.spacing(2)),
      fontSize: moderateScale(theme.typography.fontSize.sm),
      fontFamily: theme.typography.regular,
      color: theme.colors.dark,
      minHeight: isLandscape ? hp(12) : hp(6),
    },

    inputLabel: {
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(theme.typography.fontSize.xs),
      marginBottom: verticalScale(theme.spacing(0.5)),
      paddingLeft: scale(4),
      color: theme.colors.dark,
    },

    card: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(theme.borderRadius.medium),
      padding: moderateScale(theme.spacing(2)),
      ...theme.elevation.depth2,
      width: isLandscape ? wp(60) : wp(90),
      alignSelf: 'center',
    },

    cardTitle: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(theme.typography.fontSize.lg),
      color: theme.colors.dark,
      marginBottom: verticalScale(theme.spacing(1)),
    },

    cardContent: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(theme.typography.fontSize.md),
      color: theme.colors.dark,
      lineHeight: moderateScale(theme.typography.lineHeight.md),
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.gray,
      marginVertical: verticalScale(theme.spacing(2)),
    },
  });

  // Return both the compiled styles object and raw structural values if screens need custom overrides
  return {
    styles,
    isLandscape,
    scale,
    verticalScale,
    moderateScale,
    wp,
    hp,
    width,
    height,
  };
};
