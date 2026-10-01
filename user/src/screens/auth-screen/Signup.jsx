/**
 * @file Signup.jsx
 * @module screens/auth-screen/Signup
 * @description Refactored premium minimalist authentication screen for WhiteBear with a unified, edge-to-edge layout.
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
  validatePassword,
  validateEmail,
  validateFullName,
} from '../../utilities/custom-components/validation/Validation';
import { registerUser } from '../../redux/slices/auth.slice';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

const Signup = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const responsiveValues = useGlobalStyles();
  const { isLandscape, wp, hp, moderateScale } = responsiveValues;
  const styles = createStyles(responsiveValues);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // State to handle visual triggers on focus/selection
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);

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
    const hasErrors =
      fullNameError ||
      emailError ||
      passwordError ||
      !fullName ||
      !email ||
      !password ||
      !acceptTerms; // ✅ Added terms check
    setIsButtonEnabled(!hasErrors);
  }, [
    fullNameError,
    emailError,
    passwordError,
    fullName,
    email,
    password,
    acceptTerms,
  ]); // ✅ Added acceptTerms dependency

  const handleFullNameChange = value => {
    setFullName(value);
    setFullNameError(validateFullName(value));
  };

  const handleEmailChange = value => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = value => {
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleSignup = async () => {
    if (!isButtonEnabled) return;

    if (!acceptTerms) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please accept the Terms and Conditions to continue.',
      });
      return;
    }

    setLoading(true);

    try {
      const resultAction = await dispatch(
        registerUser({ fullName, email, password, isTermCondition: true }),
      );

      if (registerUser.fulfilled.match(resultAction)) {
        const message = resultAction.payload?.message;

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: message,
        });

        setFullName('');
        setEmail('');
        setPassword('');
        setAcceptTerms(false); // ✅ Reset terms on success

        setTimeout(() => {
          navigation.replace('Signin');
        }, 1500);
        return;
      }

      if (registerUser.rejected.match(resultAction)) {
        const payload = resultAction.payload || {};
        const message = payload.message || 'Registration failed';

        Toast.show({
          type: 'error',
          text1: 'Signup Failed',
          text2: message,
        });
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

  const handleTermsPress = () => {
    navigation.navigate('Terms_and_Conditions'); // Make sure this screen exists in your navigation
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
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.description}>
              Join us to start your mental health journey.
            </Text>
          </Animatable.View>

          {/* Clean Inline Input Segment Form Layout */}
          <View style={styles.inputsContainer}>
            <Animatable.View
              animation="fadeInUp"
              delay={300}
              duration={800}
              style={styles.inputWrapper}
            >
              <InputField
                placeholder="Full Name"
                value={fullName}
                onChangeText={handleFullNameChange}
                autoCapitalize="words"
                leftIcon={
                  <Ionicons
                    name={'person-outline'}
                    size={moderateScale(21)}
                    color={theme.colors.primary}
                  />
                }
              />
              {fullNameError ? (
                <Animatable.Text animation="shake" style={styles.textError}>
                  {fullNameError}
                </Animatable.Text>
              ) : null}
            </Animatable.View>

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
                placeholder="Use Strong Password"
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

              {/* Dynamic Micro-Checklist Module - Evaluates conditionally upon trigger focus */}
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

          <Animatable.View
            animation="fadeInUp"
            delay={550}
            duration={800}
            style={styles.termsContainer}
          >
            <TouchableOpacity
              style={styles.checkboxWrapper}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {acceptTerms && (
                  <Ionicons
                    name="checkmark"
                    size={moderateScale(16)}
                    color={theme.colors.primary}
                  />
                )}
              </View>
              <Text style={styles.termsText}>
                I accept the{' '}
                <Text style={styles.termsLink} onPress={handleTermsPress}>
                  Terms and Conditions
                </Text>
              </Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Execution Controls Section */}
          <Animatable.View
            animation="fadeInUp"
            delay={600}
            duration={800}
            style={styles.actionContainer}
          >
            <View style={styles.btnContainer}>
              <Button
                title="SIGN UP"
                onPress={handleSignup}
                width={isLandscape ? wp(60) : wp(90)}
                loading={loading}
                disabled={!isButtonEnabled}
                backgroundColor={theme.colors.primary}
                textColor={theme.colors.white}
                borderRadius={theme.borderRadius?.large}
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signin')}
                activeOpacity={0.7}
              >
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Signup;

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
      gap: isLandscape ? hp(2) : hp(0),
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
      color: theme.colors.dark,
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
      marginTop: hp(2.5),
    },

    termsContainer: {
      marginTop: hp(1),
      marginBottom: hp(1),
      paddingHorizontal: wp(2),
    },

    checkboxWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    checkbox: {
      width: moderateScale(22),
      height: moderateScale(22),
      borderRadius: moderateScale(4),
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.white,
      marginRight: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
    },

    termsText: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.regular,
      color: theme.colors.dark,
      flex: 1,
    },

    termsLink: {
      color: theme.colors.primary,
      fontFamily: theme.typography.semiBold,
      textDecorationLine: 'underline',
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

    signinLink: {
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
