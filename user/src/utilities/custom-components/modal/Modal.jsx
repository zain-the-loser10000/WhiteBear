/**
 * @file Modal.jsx
 * @module utilities/custom-components/modal/Modal
 * @description Ultra-enhanced, responsive context container featuring state-locked cross-fade animations, keyboard avoidance, and multi-orientation scaling layouts.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import Loader from '../loader/Loader';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const Modal = ({
  isOpen,
  onClose,
  title = '',
  subtitle = '',
  children,
  buttons = [],
  icon,
  contentStyle,
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  // Sync animation cycles before unmounting component completely
  const [isMounted, setIsMounted] = useState(isOpen);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.93)).current;
  const translateYAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 55,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 12,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsMounted(false);
      });
    }
  }, [isOpen, fadeAnim, scaleAnim, translateYAnim]);

  if (!isMounted) return null;

  return (
    <RNModal
      visible={true}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidContainer}
          >
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [
                      { scale: scaleAnim },
                      { translateY: translateYAnim },
                    ],
                  },
                  contentStyle,
                ]}
              >
                {/* Header Layout Component Area */}
                {(title || subtitle || showCloseButton) && (
                  <View style={styles.headerContainer}>
                    <View style={styles.headerTextWrapper}>
                      {title ? (
                        <Text style={styles.titleText}>{title}</Text>
                      ) : null}
                      {subtitle ? (
                        <Text style={styles.subtitleText}>{subtitle}</Text>
                      ) : null}
                    </View>

                    {showCloseButton && (
                      <TouchableOpacity
                        onPress={onClose}
                        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                        style={styles.closeActionTarget}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.closeVectorSymbol}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Adaptive Scrollable Body Panel */}
                <ScrollView
                  style={styles.bodyScrollViewContainer}
                  contentContainerStyle={styles.bodyContentWrapper}
                  showsVerticalScrollIndicator={true}
                  indicatorStyle="white"
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.structuralBodyFrame}>
                    {icon && (
                      <View style={styles.iconDecoratorFrame}>{icon}</View>
                    )}

                    {typeof children === 'string' ? (
                      <Text style={styles.fallbackBodyText}>{children}</Text>
                    ) : (
                      children
                    )}
                  </View>
                </ScrollView>

                {/* Footer Controls Layout Area */}
                {buttons.length > 0 && (
                  <View style={styles.footerActionContainer}>
                    {buttons.map((btn, idx) => {
                      const variant = btn.variant || 'primary';
                      const isDanger = variant === 'danger';
                      const isSecondary =
                        variant === 'secondary' || variant === 'cancel';

                      return (
                        <TouchableOpacity
                          key={`modal-btn-${idx}`}
                          onPress={btn.onClick}
                          disabled={btn.loading || btn.disabled}
                          activeOpacity={0.75}
                          style={[
                            styles.actionButton,
                            isSecondary && styles.btnSecondaryMod,
                            isDanger && styles.btnDangerMod,
                            btn.loading && styles.btnLoadingMod,
                            btn.disabled && styles.btnDisabledMod,
                          ]}
                        >
                          {btn.loading ? (
                            <Loader
                              size="small"
                              color={
                                isDanger
                                  ? theme.colors.error
                                  : theme.colors.white
                              }
                            />
                          ) : (
                            <Text
                              style={[
                                styles.actionButtonText,
                                isSecondary && styles.txtSecondaryMod,
                                isDanger && styles.txtDangerMod,
                              ]}
                            >
                              {btn.label}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

export default Modal;

/**
 * Responsive Stylesheet Factory
 */
const createStyles = ({ wp, hp, moderateScale, isLandscape }) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    keyboardAvoidContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalContent: {
      width: isLandscape ? wp(68) : wp(88),
      maxWidth: isLandscape ? wp(68) : wp(88),
      maxHeight: isLandscape ? hp(84) : hp(78),
      borderRadius: theme.borderRadius.large || 20,
      paddingHorizontal: isLandscape ? wp(4) : wp(5),
      paddingTop: isLandscape ? hp(3) : hp(2.5),
      paddingBottom: isLandscape ? hp(3) : hp(2.5),
      backgroundColor: '#0A0A0A',
      borderWidth: 1,
      borderColor: theme.colors.dark,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: hp(1.5) },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 24,
      overflow: 'hidden',
    },

    headerContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#161616',
      paddingBottom: hp(1.5),
      marginBottom: hp(1.5),
    },

    headerTextWrapper: {
      flex: 1,
      paddingRight: wp(2),
    },

    titleText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(19),
      color: theme.colors.white,
      letterSpacing: 0.2,
    },

    subtitleText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(13),
      color: '#8E8E93',
      marginTop: hp(0.4),
      lineHeight: moderateScale(17),
    },

    closeActionTarget: {
      paddingHorizontal: wp(1),
      paddingVertical: hp(0.2),
      alignItems: 'center',
      justifyContent: 'center',
    },

    closeVectorSymbol: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.bold,
      color: '#EF4444',
      opacity: 0.9,
    },

    bodyScrollViewContainer: {
      flexGrow: 0,
    },

    bodyContentWrapper: {
      flexGrow: 1,
    },

    structuralBodyFrame: {
      paddingVertical: hp(0.5),
    },

    fallbackBodyText: {
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(14),
      color: '#D1D1D6',
      lineHeight: moderateScale(21),
    },

    iconDecoratorFrame: {
      alignItems: 'center',
      marginBottom: hp(1.5),
    },

    footerActionContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: wp(3),
      borderTopWidth: 1,
      borderTopColor: '#161616',
      paddingTop: hp(1.8),
      marginTop: hp(1),
    },

    actionButton: {
      paddingVertical: isLandscape ? hp(1.4) : hp(1.2),
      paddingHorizontal: wp(4.5),
      borderRadius: theme.borderRadius.medium || 12,
      minWidth: isLandscape ? wp(14) : wp(22),
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    btnSecondaryMod: {
      backgroundColor: '#242426',
    },

    btnDangerMod: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#EF4444',
    },

    btnLoadingMod: {
      opacity: 0.8,
    },

    btnDisabledMod: {
      backgroundColor: '#1C1C1E',
      borderColor: 'transparent',
      opacity: 0.4,
    },

    actionButtonText: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(13),
      color: theme.colors.white,
    },

    txtSecondaryMod: {
      color: '#E5E5EA',
    },

    txtDangerMod: {
      color: '#EF4444',
    },
  });
