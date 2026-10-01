/**
 * @file CustomActionBottomSheet.jsx
 * @module utilities/custom-components/bottom-sheet/CustomActionBottomSheet
 * @description Premium architectural native animated bottom sheet supporting flexible configurations and custom content rendering engines.
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const CustomActionBottomSheet = ({
  visible,
  onClose,
  title = 'Select Option',
  options = [], // [{ id: '1', label: 'Item 📌' }]
  selectedIds = [], // Array for multi-select, string/single element for single-select
  onSelectOption, // Callback function
  onContinue,
  isMultiSelect = false,
  accentColor = theme.colors.dashboard.goals,
  renderCustomContent = null, // 🌟 NEW: Functional injector layout context hook
}) => {
  const { wp, hp, moderateScale } = useGlobalStyles();

  // Animation Nodes
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(hp(100))).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          friction: 7.5,
          tension: 45,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleAnimateDismiss();
    }
  }, [visible]);

  const handleAnimateDismiss = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: hp(100),
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const styles = createStyles({ wp, hp, moderateScale, accentColor });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleAnimateDismiss}
    >
      <View style={styles.mainModalViewLayer}>
        <TouchableWithoutFeedback onPress={handleAnimateDismiss}>
          <Animated.View
            style={[styles.modalBackdrop, { opacity: backdropOpacity }]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheetSurfacePanel,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          {/* Header Structural Area */}
          <View style={styles.headerBlock}>
            <Text numberOfLines={1} style={styles.headerTitleText}>
              {title}
            </Text>
            <View style={styles.horizontalDividerLine} />
          </View>

          {/* Flexible Options Content Section */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentLayout}
          >
            {/* 🌟 NEW: Check if there is custom layout content to inject instead of the grid loop */}
            {typeof renderCustomContent === 'function' ? (
              renderCustomContent()
            ) : (
              <View style={styles.optionsFlexGrid}>
                {options.map(option => {
                  const isItemActive = isMultiSelect
                    ? selectedIds.includes(option.id)
                    : selectedIds === option.id;

                  return (
                    <TouchableOpacity
                      key={option.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        onSelectOption && onSelectOption(option.id)
                      }
                      style={[
                        styles.capsuleOptionButton,
                        isItemActive && styles.activeCapsuleOptionButton,
                      ]}
                    >
                      <Text
                        style={[
                          styles.capsuleOptionText,
                          isItemActive && {
                            color: accentColor,
                            fontFamily: theme.typography.bold,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Dynamic Footer Actions Control Panel */}
          <View style={styles.footerActionContainerRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAnimateDismiss}
              style={styles.cancelActionButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                // 🌟 REMOVED: Auto-closing step isolated here to support your wizard's validation errors
                if (onContinue) onContinue();
              }}
              style={styles.continueActionButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomActionBottomSheet;

/**
 * 🎨 Production-Grade Styles Matrix Structure
 */
const createStyles = ({ wp, hp, moderateScale, accentColor }) => {
  return StyleSheet.create({
    mainModalViewLayer: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.25)',
    },

    sheetSurfacePanel: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: moderateScale(24),
      borderTopRightRadius: moderateScale(24),
      paddingHorizontal: wp(5),
      paddingTop: hp(2.5),
      paddingBottom: hp(4),
      maxHeight: hp(75),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 24,
    },

    headerBlock: {
      width: '100%',
      marginBottom: hp(2),
    },

    headerTitleText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(18),
      color: '#1E293B',
      paddingLeft: wp(1),
    },

    horizontalDividerLine: {
      height: 1,
      backgroundColor: theme.colors.border,
      width: '100%',
      marginTop: hp(1.5),
    },

    scrollContentLayout: {
      paddingVertical: hp(0.5),
    },

    optionsFlexGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      gap: moderateScale(10),
    },

    capsuleOptionButton: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(14),
      paddingHorizontal: wp(4.5),
      paddingVertical: hp(1.5),
      minWidth: '29%',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    activeCapsuleOptionButton: {
      borderWidth: 1.5,
      borderColor: accentColor,
      backgroundColor: theme.colors.white,
      shadowOpacity: 0.1,
    },

    capsuleOptionText: {
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(12.5),
      color: '#0F172A',
    },

    footerActionContainerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: hp(3.5),
      gap: wp(4),
    },

    cancelActionButton: {
      flex: 1,
      backgroundColor: theme.colors.white,
      borderWidth: 1.2,
      borderColor: accentColor,
      borderRadius: moderateScale(12),
      paddingVertical: hp(1.5),
      alignItems: 'center',
      justifyContent: 'center',
    },

    cancelButtonText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(14),
      color: accentColor,
    },

    continueActionButton: {
      flex: 1,
      backgroundColor: accentColor,
      borderRadius: moderateScale(12),
      paddingVertical: hp(1.5),
      alignItems: 'center',
      justifyContent: 'center',
    },

    continueButtonText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(14),
      color: theme.colors.white,
    },
  });
};
