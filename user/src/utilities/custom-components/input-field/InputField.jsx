/**
 * @file InputField.jsx
 * @module Components/InputField
 * @description Reusable, cross-orientation theme-consistent responsive input fields.
 */

import React from 'react';
import { TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const InputField = ({
  containerStyle,
  value,
  onChangeText,
  placeholder = '',
  inputStyle,
  secureTextEntry = false,
  editable = true,
  keyboardType = 'default',
  multiline = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  maxLength,
  ...rest
}) => {
  const responsiveValues = useGlobalStyles();
  const styles = createStyles(responsiveValues);

  return (
    <View style={[styles.baseContainer, containerStyle]}>
      <View style={styles.inputWrapper}>
        {/* Left Aspect Icon Slot */}
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        {/* Dynamic Context Core Input Node */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray}
          secureTextEntry={secureTextEntry}
          editable={editable}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          style={[styles.textInput, multiline && styles.multiline, inputStyle]}
          {...rest}
        />

        {/* Right Aspect Interactive Control Slot */}
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
            hitSlop={{
              top: responsiveValues.hp(1.5),
              bottom: responsiveValues.hp(1.5),
              left: responsiveValues.wp(3),
              right: responsiveValues.wp(3),
            }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;

/**
 * Responsive Style Sheet Construction Factory
 */
const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  return StyleSheet.create({
    baseContainer: {
      width: '100%',
    },

    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: moderateScale(1.5),
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius?.large,
      backgroundColor: theme.colors.white,
      paddingHorizontal: wp(2),
      minHeight: isLandscape ? hp(14) : hp(7),
    },

    textInput: {
      flex: 1,
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(15),
      color: theme.colors.dark,
      paddingVertical: isLandscape ? hp(1) : hp(1.5),
      paddingHorizontal: wp(2),
    },

    multiline: {
      minHeight: hp(15),
      textAlignVertical: 'top',
      paddingVertical: hp(1.8),
    },

    leftIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(1),
    },

    rightIconContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(1),
      padding: wp(1),
    },
  });
};
