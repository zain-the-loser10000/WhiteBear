/**
 * @file ChangePassword.jsx
 * @module screens/setting-screen/setting-sub-screen/ChangePassword
 * @description Interface for changing the user's password, matching Sign-in styles and handling orientation responsively.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import AuthHeader from '../../../utilities/custom-components/header/auth-header/AuthHeader';
import Logo from '../../../assets/logo/logo.png';
import InputField from '../../../utilities/custom-components/input-field/InputField';
import Button from '../../../utilities/custom-components/button/Button';
import { changePassword } from '../../../redux/slices/user.slice';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

const ChangePassword = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const responsiveValues = useGlobalStyles();
  const { isLandscape, wp, hp, moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  // Redux state context tracking
  const auth = useSelector(state => state.auth.user);

  // Form Input States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Individual Visibility States
  const [hideCurrentPassword, setHideCurrentPassword] = useState(true);
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  // UI Error & Validation States
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

  // Dynamic Rule Definer corresponding to strict passcode complexity requirements
  const passwordRules = [
    {
      id: 'uppercase',
      label: 'At least one uppercase letter required',
      test: val => /[A-Z]/.test(val),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter required',
      test: val => /[a-z]/.test(val),
    },
    {
      id: 'length',
      label: 'Password length must be 8-20 characters',
      test: val => val.length >= 8 && val.length <= 20,
    },
    {
      id: 'numeric',
      label: 'At least one numeric digit required',
      test: val => /\d/.test(val),
    },
    {
      id: 'special',
      label: 'At least one special character required',
      test: val => /[\W_]/.test(val),
    },
  ];

  // Side effect validation hook tracking system health criteria
  useEffect(() => {
    const allRulesPassed = passwordRules.every(rule => rule.test(newPassword));
    const fieldsFilled = currentPassword && newPassword && confirmPassword;
    const passwordsMatch = newPassword === confirmPassword;

    setIsButtonEnabled(
      fieldsFilled && allRulesPassed && passwordsMatch && !confirmPasswordError,
    );
  }, [currentPassword, newPassword, confirmPassword, confirmPasswordError]);

  const handleConfirmPasswordChange = value => {
    setConfirmPassword(value);
    if (newPassword && value !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleChangePasswordSubmit = async () => {
    setLoading(true);

    try {
      const resultAction = await dispatch(
        changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      );

      if (changePassword.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });

        // Clear values safely on complete operations cycle
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else if (changePassword.rejected.match(resultAction)) {
        const payload = resultAction.payload || {};
        Toast.show({
          type: 'error',
          text1: 'Modification Refused',
          text2:
            payload.message || 'Failed to update user security credentials.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'System Error',
        text2:
          err?.message || 'An unexpected internal routing exception occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.mainContainer}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dynamic Header Branding Module */}
          <Animatable.View
            animation="fadeIn"
            duration={1000}
            style={styles.brandWrapper}
          >
            <AuthHeader logo={Logo} />
          </Animatable.View>

          {/* Contextual Typography Area */}
          <Animatable.View
            animation="fadeInUp"
            duration={900}
            delay={200}
            style={styles.headerTextContainer}
          >
            <Text style={styles.title}>Update Password</Text>
            <Text style={styles.description}>
              Ensure your workspace remains safe by selecting a strong
              encryption credential set.
            </Text>
          </Animatable.View>

          {/* Core Password Modifiers Input Fields */}
          <View style={styles.inputsContainer}>
            {/* Current Password Input Field */}
            <Animatable.View
              animation="fadeInUp"
              delay={300}
              duration={800}
              style={styles.inputWrapper}
            >
              <InputField
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={hideCurrentPassword}
                leftIcon={
                  <Ionicons
                    name={'lock-closed-outline'}
                    size={moderateScale(21)}
                    color={theme.colors.primary}
                  />
                }
                rightIcon={
                  <Ionicons
                    name={
                      hideCurrentPassword ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={moderateScale(21)}
                    color={theme.colors.textLight || '#5C6E66'}
                  />
                }
                onRightIconPress={() =>
                  setHideCurrentPassword(!hideCurrentPassword)
                }
              />
            </Animatable.View>

            {/* New Password Input Field */}
            <Animatable.View
              animation="fadeInUp"
              delay={400}
              duration={800}
              style={styles.inputWrapper}
            >
              <InputField
                placeholder="New Password"
                value={newPassword}
                onChangeText={text => {
                  setNewPassword(text);
                  if (confirmPassword && text !== confirmPassword) {
                    setConfirmPasswordError('Passwords do not match');
                  } else {
                    setConfirmPasswordError('');
                  }
                }}
                secureTextEntry={hideNewPassword}
                onFocus={() => setIsNewPasswordFocused(true)}
                onBlur={() => setIsNewPasswordFocused(false)}
                leftIcon={
                  <Ionicons
                    name={'key-outline'}
                    size={moderateScale(21)}
                    color={theme.colors.primary}
                  />
                }
                rightIcon={
                  <Ionicons
                    name={hideNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={moderateScale(21)}
                    color={theme.colors.textLight || '#5C6E66'}
                  />
                }
                onRightIconPress={() => setHideNewPassword(!hideNewPassword)}
              />

              {/* Dynamic Rules Real-time Passcode Quality Audit Checklist */}
              {isNewPasswordFocused && (
                <View style={styles.checklistContainer}>
                  {passwordRules.map(rule => {
                    const isValid = rule.test(newPassword);
                    return (
                      <View key={rule.id} style={styles.checklistItem}>
                        <Ionicons
                          name={isValid ? 'checkmark-circle' : 'close-circle'}
                          size={moderateScale(16)}
                          color={isValid ? '#4CAF50' : '#FF5722'}
                        />
                        <Text
                          style={[
                            styles.checklistText,
                            { color: isValid ? '#4CAF50' : '#FF5722' },
                          ]}
                        >
                          {rule.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </Animatable.View>

            {/* Confirm New Password Input Field */}
            <Animatable.View
              animation="fadeInUp"
              delay={500}
              duration={800}
              style={styles.inputWrapper}
            >
              <InputField
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={hideConfirmPassword}
                leftIcon={
                  <Ionicons
                    name={'shield-checkmark-outline'}
                    size={moderateScale(21)}
                    color={theme.colors.primary}
                  />
                }
                rightIcon={
                  <Ionicons
                    name={
                      hideConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={moderateScale(21)}
                    color={theme.colors.textLight || '#5C6E66'}
                  />
                }
                onRightIconPress={() =>
                  setHideConfirmPassword(!hideConfirmPassword)
                }
              />
              {confirmPasswordError ? (
                <Animatable.Text animation="shake" style={styles.textError}>
                  {confirmPasswordError}
                </Animatable.Text>
              ) : null}
            </Animatable.View>
          </View>

          {/* Action Submission Control Infrastructure Block */}
          <Animatable.View
            animation="fadeInUp"
            delay={600}
            duration={800}
            style={styles.actionContainer}
          >
            <View style={styles.btnContainer}>
              <Button
                title="UPDATE PASSWORD"
                onPress={handleChangePasswordSubmit}
                width={isLandscape ? wp(60) : wp(90)}
                loading={loading}
                disabled={!isButtonEnabled}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
                borderRadius={theme.borderRadius?.large}
              />
            </View>

            <View style={styles.footerContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelLink}>Cancel and Return</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ChangePassword;

/**
 * Isolated Adaptive Style Sheet Factory Engine
 */
const createStyles = ({ isLandscape, moderateScale, wp, hp }) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
    },

    keyboardView: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isLandscape ? wp(20) : wp(5),
      justifyContent: isLandscape ? 'flex-start' : 'center',
      paddingTop: isLandscape ? hp(4) : hp(6),
      paddingBottom: isLandscape ? hp(8) : hp(4),
      gap: isLandscape ? hp(2) : hp(0),
    },

    brandWrapper: {
      alignItems: 'center',
      marginBottom: isLandscape ? hp(1.5) : hp(3),
    },

    headerTextContainer: {
      marginBottom: isLandscape ? hp(1.5) : hp(3),
      alignItems: 'center',
    },

    title: {
      fontSize: moderateScale(26),
      fontFamily: theme.typography.semiBold,
      color: theme.colors.dark || '#1E2925',
      letterSpacing: -0.3,
      marginBottom: hp(0.6),
    },

    description: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.regular,
      color: '#5C6E66',
      textAlign: 'center',
      lineHeight: moderateScale(20),
    },

    inputsContainer: {
      width: '100%',
    },

    inputWrapper: {
      marginBottom: isLandscape ? hp(1.5) : hp(2),
    },

    checklistContainer: {
      marginTop: hp(1.2),
      paddingHorizontal: wp(1),
      alignItems: 'flex-start',
    },

    checklistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(0.5),
    },

    checklistText: {
      fontSize: moderateScale(12.5),
      fontFamily: theme.typography.regular,
      marginLeft: wp(2),
    },

    actionContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: hp(1.5),
    },

    btnContainer: {
      width: '100%',
      alignItems: 'center',
    },

    footerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: isLandscape ? hp(2.5) : hp(4),
      width: '100%',
    },

    cancelLink: {
      fontSize: moderateScale(15),
      color: theme.colors.primary,
      fontFamily: theme.typography.bold,
      textDecorationLine: 'underline',
    },

    textError: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.semiBold,
      color: theme.colors.error,
      left: wp(2),
      top: hp(1),
    },
  });
};
