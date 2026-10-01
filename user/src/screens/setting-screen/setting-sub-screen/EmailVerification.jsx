/**
 * @file EmailVerification.jsx
 * @module screens/setting-screen/setting-sub-screen/EmailVerification
 * @description Secure verification interface with automated on-mount OTP requests.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

import {
  verifyEmail,
  requestEmailVerification,
} from '../../../redux/slices/otp.slice';

import Header from '../../../utilities/custom-components/header/header/Header';
import Button from '../../../utilities/custom-components/button/Button';
import { setEmailVerified } from '../../../redux/slices/auth.slice';

const EmailVerification = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { email: passedEmail } = route.params || {};
  const { loading: otpSliceLoading } = useSelector(state => state.otp);

  const targetEmail = passedEmail;

  // Layout & Responsive UI Engine
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  // State Management
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  // Guard reference to ensure the initial auto-request only fires EXACTLY once
  const hasRequestedOTP = useRef(false);

  const isButtonEnabled = otp.every(digit => digit !== '');

  // 2. AUTOMATIC INITIAL OTP DISPATCH ON MOUNT
  useEffect(() => {
    if (!hasRequestedOTP.current && targetEmail) {
      dispatch(requestEmailVerification(targetEmail));
      hasRequestedOTP.current = true;
    }
  }, [targetEmail, dispatch]);

  // OTP Countdown Clock Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync Text Input Changes & Move Focus Forward
  const handleChange = (text, index) => {
    // MODIFIED: Sanitize to allow alphanumeric characters and
    const sanitizedText = text.replace(/[^a-zA-Z0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = sanitizedText;
    setOtp(newOtp);

    if (sanitizedText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Safe Backspace Navigation Mapping
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // OTP Verification Submission Action
  const handleVerify = async () => {
    const otpString = otp.join('');

    if (otpString.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Verification Incomplete',
        text2: 'Please enter the full 6-digit code.',
      });
      return;
    }

    try {
      const resultAction = await dispatch(
        verifyEmail({ email: targetEmail, otp: otpString }),
      );

      if (verifyEmail.fulfilled.match(resultAction)) {
        dispatch(setEmailVerified(true));

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });
        navigation.replace('Settings');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: resultAction.payload?.message,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message,
      });
    }
  };

  // Request New Activation Token
  const handleResend = async () => {
    console.log('[DEBUG - VERIFICATION UI] User manually clicked Resend Code.');
    if (timer > 0) return;

    try {
      const resultAction = await dispatch(
        requestEmailVerification(targetEmail),
      );

      if (requestEmailVerification.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'info',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });
        setTimer(59);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Request Failed',
          text2:
            resultAction.payload?.message ||
            'Failed to resend validation token.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message,
      });
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Header
          title="Email Verification"
          subtitle="Verify your email address"
          headerColor={theme.colors.dashboard.settings}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexEngine}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainLayoutContainer}>
            {/* COLUMN 1: Context Meta Section */}
            <View style={styles.metaContextColumn}>
              <Animatable.View
                animation="fadeInDown"
                duration={1000}
                style={styles.topSection}
              >
                <View style={styles.iconBadge}>
                  <Ionicons
                    name="shield-outline"
                    size={isLandscape ? wp(5) : wp(12)}
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={styles.mainHeading}>Security Challenge</Text>
                <View style={styles.headingUnderline} />
              </Animatable.View>

              <Animatable.View
                animation="fadeInUp"
                delay={200}
                style={styles.infoBox}
              >
                <Text style={styles.description}>
                  We have sent a 6-digit OTP to
                </Text>
                <Text style={styles.emailText}>{targetEmail}</Text>
              </Animatable.View>
            </View>

            {/* COLUMN 2: Interaction Forms & Submissions */}
            <View style={styles.formInteractionColumn}>
              <Animatable.View
                animation="zoomIn"
                delay={400}
                style={styles.otpWrapper}
              >
                {otp.map((digit, index) => (
                  <View
                    key={index}
                    style={[
                      styles.inputContainer,
                      focusedIndex === index && styles.inputContainerActive,
                    ]}
                  >
                    <TextInput
                      ref={ref => (inputRefs.current[index] = ref)}
                      style={styles.otpInput}
                      maxLength={1}
                      value={digit}
                      onFocus={() => setFocusedIndex(index)}
                      onChangeText={text => handleChange(text, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      selectionColor={theme.colors.primary}
                      placeholder="•"
                      placeholderTextColor={theme.colors.gray}
                    />
                  </View>
                ))}
              </Animatable.View>

              <Animatable.View
                animation="fadeInUp"
                delay={500}
                style={styles.footerAction}
              >
                <View style={styles.timerRow}>
                  <Ionicons
                    name="timer-outline"
                    size={moderateScale(18)}
                    color={timer > 0 ? '#64748B' : theme.colors.primary}
                  />
                  <Text style={styles.timerText}>
                    {timer > 0 ? (
                      <>
                        Resend code available in{' '}
                        <Text style={styles.timerCount}>
                          00:{timer < 10 ? `0${timer}` : timer}
                        </Text>
                      </>
                    ) : (
                      "Didn't receive the credentials token?"
                    )}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleResend}
                  disabled={timer > 0 || otpSliceLoading}
                  style={[
                    styles.resendTouchable,
                    (timer > 0 || otpSliceLoading) && styles.disabledResend,
                  ]}
                >
                  <Text style={styles.resendText}>Resend Secure Code</Text>
                </TouchableOpacity>

                <View style={styles.btnContainer}>
                  <Button
                    title="VERIFY & PROCEED"
                    onPress={handleVerify}
                    width={isLandscape ? wp(46) : wp(84)}
                    loading={otpSliceLoading}
                    disabled={!isButtonEnabled || otpSliceLoading}
                    backgroundColor={theme.colors.primary}
                    textColor={theme.colors.white}
                    borderRadius={theme.borderRadius.medium}
                  />
                </View>
              </Animatable.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EmailVerification;

/**
 * Responsive Design Layout Styles Factory
 */
const createStyles = ({ wp, hp, isLandscape, moderateScale }) => {
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    headerContainer: {
      width: '100%',
    },

    flexEngine: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: wp(6),
      paddingBottom: isLandscape ? hp(4) : hp(5),
      flexGrow: 1,
      justifyContent: 'center',
    },

    mainLayoutContainer: {
      flexDirection: isLandscape ? 'row' : 'column',
      justifyContent: isLandscape ? 'space-between' : 'center',
      alignItems: isLandscape ? 'center' : 'stretch',
      width: '100%',
    },

    metaContextColumn: {
      width: isLandscape ? '46%' : '100%',
      alignItems: 'center',
    },

    formInteractionColumn: {
      width: isLandscape ? '50%' : '100%',
      alignItems: 'center',
      marginTop: isLandscape ? hp(2) : 0,
    },

    topSection: {
      alignItems: 'center',
      marginVertical: isLandscape ? hp(1.5) : hp(3),
    },

    iconBadge: {
      width: isLandscape ? wp(9) : wp(20),
      height: isLandscape ? wp(9) : wp(20),
      borderRadius: isLandscape ? wp(4.5) : wp(10),
      backgroundColor: `${theme.colors.primary}12`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },

    mainHeading: {
      fontSize: isLandscape ? moderateScale(22) : moderateScale(26),
      fontFamily: theme.typography.bold,
      color: theme.colors.dark,
      textAlign: 'center',
    },

    headingUnderline: {
      width: wp(18),
      height: hp(0.005),
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.large,
      marginTop: hp(1),
    },

    infoBox: {
      alignItems: 'center',
      marginBottom: isLandscape ? hp(3) : hp(4),
    },

    description: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.medium,
      color: '#64748B',
      textAlign: 'center',
    },

    emailText: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.semiBold,
      color: theme.colors.dark,
      marginTop: hp(0.5),
      textAlign: 'center',
    },

    otpWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: isLandscape ? hp(3) : hp(4),
    },

    inputContainer: {
      width: isLandscape ? wp(6.8) : wp(11.5),
      height: isLandscape ? wp(8.5) : wp(14.5),
      borderRadius: 12,
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 2,
    },

    inputContainerActive: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 6,
    },

    otpInput: {
      width: '100%',
      height: '100%',
      textAlign: 'center',
      fontSize: isLandscape ? moderateScale(18) : moderateScale(22),
      fontFamily: theme.typography.bold,
      color: theme.colors.primary,
      padding: 0,
    },

    footerAction: {
      width: '100%',
      alignItems: 'center',
    },

    timerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1),
    },

    timerText: {
      fontSize: moderateScale(13),
      fontFamily: theme.typography.medium,
      marginLeft: wp(1.5),
      color: theme.colors.secondary,
    },

    timerCount: {
      color: theme.colors.primary,
      fontFamily: theme.typography.bold,
    },

    resendTouchable: {
      marginBottom: isLandscape ? hp(3) : hp(4),
    },

    resendText: {
      color: theme.colors.primary,
      fontSize: moderateScale(14),
      fontFamily: theme.typography.bold,
    },

    disabledResend: {
      opacity: 0.35,
    },

    btnContainer: {
      width: '100%',
      alignItems: 'center',
    },
  });
};
