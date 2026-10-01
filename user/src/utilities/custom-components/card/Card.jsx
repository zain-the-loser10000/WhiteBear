/**
 * @file CustomCard.jsx
 * @module utilities/custom-components/card/CustomCard
 * @description Customizable card component with optional timer, actions, and adaptive accent coloring.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const CustomCard = ({
  title = 'Untitled Task',
  indexPrefix = 'Item',
  index = 0,
  dateLabel = 'Created At',
  dateValue,
  accentColor = '#0066cc',
  isCompleted = false,
  isOutstanding = false,

  // ⏱️ Timer Overrides
  timerValue = null, // dynamic countdown string e.g., "00:15:30"

  showTimer = true,
  showComplete = true,
  showEdit = true,
  showDelete = true,

  timerLabel = 'Start Timer',
  completeLabel = 'Mark Complete',
  completedLabel = 'Completed',

  onStartTimer,
  onMarkComplete,
  onEdit,
  onDelete,
  onCardPress,
}) => {
  const { wp, hp, moderateScale } = useGlobalStyles();
  const styles = createStyles({
    wp,
    hp,
    moderateScale,
    accentColor,
    hasActiveTimer: !!timerValue,
  });

  const formatDisplayDate = () => {
    if (!dateValue) return '';
    try {
      const rawDate = new Date(dateValue);
      return rawDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return String(dateValue);
    }
  };

  const finalDateStr = formatDisplayDate();
  const shouldRenderTimer = isCompleted ? false : showTimer && !!onStartTimer;
  const shouldRenderEdit = isCompleted ? false : showEdit && !!onEdit;

  return (
    <TouchableOpacity
      activeOpacity={onCardPress ? 0.9 : 1}
      onPress={onCardPress}
      style={[
        styles.cardContainer,
        isOutstanding && !isCompleted && styles.outstandingCardBorder,
      ]}
    >
      {/* 🌟 Outstanding Badge Layout */}
      {isOutstanding && !isCompleted && (
        <View style={styles.outstandingBadge}>
          <Ionicons
            name="flag-outline"
            size={moderateScale(20)}
            color={theme.colors.white}
          />
          <Text style={styles.outstandingBadgeText}>OUTSTANDING TASK</Text>
        </View>
      )}
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>
          <Text style={styles.indexPrefix}>
            {indexPrefix} {index + 1}:{' '}
          </Text>
          {title}
        </Text>
      </View>

      {finalDateStr ? (
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {dateLabel}: <Text style={styles.dateValue}>{finalDateStr}</Text>
          </Text>
        </View>
      ) : null}

      <View style={styles.partitionLine} />

      <View style={styles.footerActionRow}>
        <View style={styles.leftButtonGroup}>
          {shouldRenderTimer && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onStartTimer}
              style={[
                styles.outlineButton,
                timerValue && styles.activeTimerButton,
              ]}
            >
              <Ionicons
                name={timerValue ? 'time' : 'play-circle-outline'}
                size={moderateScale(14)}
                color={timerValue ? theme.colors.white : accentColor}
                style={styles.buttonInlineIcon}
              />
              <Text
                style={[
                  styles.outlineButtonText,
                  timerValue && styles.activeTimerText,
                ]}
              >
                {timerValue ? timerValue : timerLabel}
              </Text>
            </TouchableOpacity>
          )}

          {showComplete && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onMarkComplete}
              style={[
                styles.outlineButton,
                isCompleted && styles.completedButtonActive,
              ]}
            >
              <Ionicons
                name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                size={moderateScale(14)}
                color={
                  isCompleted ? theme.colors.success || '#2ECC71' : accentColor
                }
                style={styles.buttonInlineIcon}
              />
              <Text
                style={[
                  styles.outlineButtonText,
                  isCompleted && styles.completedTextActive,
                ]}
              >
                {isCompleted ? completedLabel : completeLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightControlGroup}>
          {shouldRenderEdit && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onEdit}
              style={styles.iconActionShell}
            >
              <Ionicons
                name="create-outline"
                size={moderateScale(16)}
                color={accentColor}
              />
            </TouchableOpacity>
          )}

          {showDelete && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDelete}
              style={styles.iconActionShell}
            >
              <Ionicons
                name="trash-outline"
                size={moderateScale(16)}
                color={theme.colors.error || '#E74C3C'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CustomCard;

const createStyles = ({ wp, hp, moderateScale, accentColor }) => {
  return StyleSheet.create({
    cardContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: wp(4),
      paddingTop: hp(1.8),
      paddingBottom: hp(1.5),
      marginHorizontal: wp(4),
      marginBottom: hp(1.5),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 2,
    },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: hp(0.5),
    },

    titleText: {
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(14),
      color: '#2C3E50',
      lineHeight: moderateScale(19),
      flex: 1,
    },

    outstandingCardBorder: {
      borderColor: theme.colors.warning,
      borderWidth: 1.5,
    },

    outstandingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.warning,
      alignSelf: 'flex-start',
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.3),
      borderRadius: moderateScale(6),
      marginBottom: hp(1),
      gap: wp(1),
    },

    outstandingBadgeText: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(10),
      color: theme.colors.white,
    },

    indexPrefix: {
      fontFamily: theme.typography.bold,
      color: accentColor,
    },

    dateContainer: {
      alignItems: 'flex-end',
      marginBottom: hp(1),
    },

    dateText: {
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(11.5),
      color: '#7F8C8D',
    },

    dateValue: {
      fontFamily: theme.typography.semiBold,
      color: '#34495E',
    },

    partitionLine: {
      height: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
      marginBottom: hp(1.5),
    },

    footerActionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    leftButtonGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },

    outlineButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.2,
      borderColor: accentColor,
      borderRadius: moderateScale(8),
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.6),
    },

    activeTimerButton: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
    },

    buttonInlineIcon: {
      marginRight: wp(1),
    },

    completedButtonActive: {
      backgroundColor: theme.colors.successLight,
      borderColor: theme.colors.success,
    },

    outlineButtonText: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(11.5),
      color: accentColor,
    },

    activeTimerText: {
      color: theme.colors.white,
      fontFamily: theme.typography.bold,
    },

    completedTextActive: {
      color: theme.colors.success,
    },

    rightControlGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(1.8),
    },

    iconActionShell: {
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(8),
      borderWidth: 1.2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
  });
};
