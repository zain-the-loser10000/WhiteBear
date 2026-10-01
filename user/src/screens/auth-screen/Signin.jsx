/**
 * @file Signin.jsx
 * @module screens/auth-screen/Signin
 * @description Modern responsive sign-in interface for WhiteBear dynamically adapts to device orientation and auto-routes users based on session presence.
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
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import AuthHeader from '../../utilities/custom-components/header/auth-header/AuthHeader';
import Logo from '../../assets/logo/logo.png';
import InputField from '../../utilities/custom-components/input-field/InputField';
import Button from '../../utilities/custom-components/button/Button';
import {
  isValidInput,
  validatePassword,
  validateEmail,
} from '../../utilities/custom-components/validation/Validation';
import { loginUser } from '../../redux/slices/auth.slice';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import {
  requestNotificationPermission,
  subscribeToUserNotifications,
} from '../../utilities/notifications/NotificationHelper';

const Signin = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const responsiveValues = useGlobalStyles();
  const { isLandscape, wp, hp, moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // State to handle visual checklist visibility on input trigger
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Dynamic Rule Definer corresponding to image_3ed188.png requirements
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

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
    setIsButtonEnabled(!hasErrors);
  }, [emailError, passwordError, email, password]);

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  /**
   * Dispatches credentials payload to Redux Async Thunk engine
   */
  const handleSignin = async () => {
    if (!isValidInput({ email, password })) {
      // Validation failed for input parameters
      return;
    }

    setLoading(true);
    // Dispatching loginUser thunk

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        const message = resultAction.payload?.message;
        const payloadData = resultAction.payload;

        // 🔍 Resilient Extraction Matrix:
        // Checks resultAction.payload.user first, fallback directly to resultAction.payload
        const userInstance = payloadData?.user || payloadData;
        // To this line:
        const targetUserId =
          userInstance?.userId || userInstance?._id || userInstance?.id;

        // Extracted User ID

        // 🛑 EMERGENCY DEBUG LOG: If the target ID is missing, print the payload structure
        if (!targetUserId) {
          // ID not resolved; payload fields available
        }

        // 🌟 TRIGGER FCM PARITY ON SUCCESSFUL LOGIN
        if (targetUserId) {
          requestNotificationPermission()
            .then(hasPermission => {
              // Permission check response
              if (hasPermission) {
                subscribeToUserNotifications(targetUserId);
              } else {
                // FCM subscription skipped: Permission denied
              }
            })
            .catch(err => {
              // Detached permission promise rejected
            });
        } else {
          // FCM integration bypassed: Missing valid targetUserId
        }

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: message,
        });

        setTimeout(() => {
          navigation.replace('Main');
        }, 1200);

        setEmail('');
        setPassword('');
        return;
      }

      if (loginUser.rejected.match(resultAction)) {
        const payload = resultAction.payload || {};
        const message = payload.message || 'Authentication failed';
        const status = payload.status;

        // Error payload status logged

        if (status === 423) {
          Toast.show({
            type: 'error',
            text1: 'Account Restricted',
            text2: message,
          });
          return;
        }

        if (status === 401) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Credentials',
            text2: message,
          });
          return;
        }

        Toast.show({ type: 'error', text1: 'Login Failed', text2: message });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message || 'An unexpected execution error occurred',
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
          {/* Integrated Dynamic Header Branding Module */}
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.description}>
              Login to continue your mental health journey.
            </Text>
          </Animatable.View>

          {/* Clean Inline Input Segment Form Layout */}
          <View style={styles.inputsContainer}>
            <Animatable.View
              animation="fadeInUp"
              delay={400}
              duration={800}
              style={styles.inputWrapper}
            >
              <InputField
                placeholder="Email Address"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <Ionicons
                    name={'mail-outline'}
                    size={moderateScale(21)}
                    color={theme.colors.primary}
                  />
                }
              />
              {emailError ? (
                <Animatable.Text animation="shake" style={styles.textError}>
                  {emailError}
                </Animatable.Text>
              ) : null}
            </Animatable.View>

            <Animatable.View
              animation="fadeInUp"
              delay={500}
              duration={800}
              style={styles.inputWrapper}
            >
              <InputField
                placeholder="Password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={hidePassword}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
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
                      hidePassword ? 'lock-closed-outline' : 'lock-open-outline'
                    }
                    size={moderateScale(21)}
                    color={theme.colors.textLight || '#5C6E66'}
                  />
                }
                onRightIconPress={() => setHidePassword(!hidePassword)}
              />

              {/* Dynamic Micro-Checklist Module - Matches structural constraints of image_3ed188.png */}
              {isPasswordFocused && (
                <View style={styles.checklistContainer}>
                  {passwordRules.map(rule => {
                    const isValid = rule.test(password);
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

              {passwordError && !password ? (
                <Animatable.Text animation="shake" style={styles.textError}>
                  {passwordError}
                </Animatable.Text>
              ) : null}
            </Animatable.View>
          </View>

          {/* Execution Controls Section */}
          <Animatable.View
            animation="fadeInUp"
            delay={600}
            duration={800}
            style={styles.actionContainer}
          >
            {/*<View style={styles.forgotPassContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Forgot_Password')}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View> */}

            <View style={styles.btnContainer}>
              <Button
                title="SIGN IN"
                onPress={handleSignin}
                width={isLandscape ? wp(60) : wp(90)}
                loading={loading}
                disabled={!isButtonEnabled}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
                borderRadius={theme.borderRadius?.large}
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                activeOpacity={0.7}
              >
                <Text style={styles.signupLink}>Signup</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Signin;

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
      paddingTop: isLandscape ? hp(5) : hp(6),
      paddingBottom: isLandscape ? hp(10) : hp(4),
      gap: isLandscape ? hp(4) : hp(0),
    },

    brandWrapper: {
      alignItems: 'center',
      marginBottom: isLandscape ? hp(2) : hp(4),
    },

    headerTextContainer: {
      marginBottom: isLandscape ? hp(2) : hp(3.5),
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
      marginTop: hp(0.5),
    },

    forgotPassContainer: {
      width: '100%',
      alignItems: 'flex-end',
      marginBottom: isLandscape ? hp(2.5) : hp(3.5),
    },

    forgotPassText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(13.5),
    },

    btnContainer: {
      width: '100%',
      alignItems: 'center',
    },

    footerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      marginTop: isLandscape ? hp(2.5) : hp(4),
      width: '100%',
    },

    footerText: {
      fontSize: moderateScale(15),
      color: theme.colors.dark,
      fontFamily: theme.typography.regular,
      marginRight: wp(1.5),
    },

    signupLink: {
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
