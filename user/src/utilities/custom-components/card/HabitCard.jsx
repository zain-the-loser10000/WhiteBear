/**
 * @file HabitCard.jsx
 * @module utilities/custom-components/card/HabitCard
 * @description Refactored Habit card displaying Stop-Start-Continue actionables with dynamic filling progress ring.
 */

import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const HabitCard = ({
  habit,
  selectedDate,
  onToggleActionable,
  onEditPress,
  onDeletePress,
  onSharePress,
  accentColor = '#1D70B8',
  isLandscape = false,
}) => {
  const { wp, hp, scale } = useGlobalStyles();
  const animatedScale = useRef(new Animated.Value(1)).current;

  // ─── Helper: Check if habit is active for selected date ──
  const isHabitActiveForDate = (habit, date) => {
    if (!habit || !date) return false;

    const selectedDateObj = new Date(date);
    selectedDateObj.setHours(0, 0, 0, 0); // local midnight

    const selectedDay = selectedDateObj
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const habitStartDate = new Date(habit.startDate);
    habitStartDate.setHours(0, 0, 0, 0);
    const habitEndDate = new Date(habit.endDate);
    habitEndDate.setHours(0, 0, 0, 0);

    const isWithinRange =
      selectedDateObj >= habitStartDate && selectedDateObj <= habitEndDate;
    const isDaySelected = habit.selectedDays?.includes(selectedDay) || false;

    return isWithinRange && isDaySelected;
  };

  const isActive = isHabitActiveForDate(habit, selectedDate);

  const getTodayLog = () => {
    if (!habit?.trackingLogs || habit.trackingLogs.length === 0) return null;

    // Ensure we're comparing dates correctly
    const selectedDateObj =
      selectedDate instanceof Date ? selectedDate : new Date(selectedDate);

    // Format as YYYY-MM-DD for comparison
    const dateStr = selectedDateObj.toISOString().split('T')[0];

    return habit.trackingLogs.find(log => {
      // Handle both Date objects and string dates from backend
      const logDate = log.date instanceof Date ? log.date : new Date(log.date);

      // Check if log date matches selected date (ignoring time)
      const logDateStr = logDate.toISOString().split('T')[0];
      return logDateStr === dateStr;
    });
  };

  const todayLog = getTodayLog();
  const isStopCompleted = todayLog?.isStopCompleted || false;
  const isStartCompleted = todayLog?.isStartCompleted || false;
  const isContinueCompleted = todayLog?.isContinueCompleted || false;

  // Completion percentage based on the three actionables
  const completedActions =
    (isStopCompleted ? 1 : 0) +
    (isStartCompleted ? 1 : 0) +
    (isContinueCompleted ? 1 : 0);
  const completionPercent = Math.round((completedActions / 3) * 100);

  const handlePressIn = () => {
    Animated.timing(animatedScale, {
      toValue: 0.99,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedScale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleToggle = actionKey => {
    if (!onToggleActionable) return;
    onToggleActionable(habit?._id, selectedDate, actionKey);
  };

  const styles = createStyles({
    wp,
    hp,
    scale,
    accentColor,
    isLandscape,
  });

  const selectedDay = selectedDate?.toLocaleDateString('en-US', {
    weekday: 'long',
  });

  // Circular progress ring dimensions
  const ringSize = scale(38);
  const ringStrokeWidth = 3;
  const halfRing = ringSize / 2;

  // Perfect 180-degree calculation logic for the CSS rotation approach
  const rightHalfRotation = Math.min(completionPercent, 50) * 3.6;
  const leftHalfRotation =
    completionPercent > 50 ? (completionPercent - 50) * 3.6 : 0;

  return (
    <Animated.View
      style={[
        styles.cardTransformWrapper,
        { transform: [{ scale: animatedScale }] },
      ]}
    >
      <View style={styles.cardContainer}>
        {!isActive ? (
          <>
            {/* Habit Title */}
            <View style={styles.headerBlock}>
              <Text style={styles.habitTitleLabel}>
                Habit Title:{' '}
                <Text style={styles.habitTitleValue}>{habit?.title || ''}</Text>
              </Text>
            </View>

            <View style={styles.horizontalDivider} />

            {/* Rest Day Message */}
            <View style={styles.restDayContainer}>
              <Text style={styles.restDayLabel}>
                {selectedDay} is Rest Day for This Habit
              </Text>

              <View style={styles.restDayIconContainer}>
                <Ionicons name="bed-outline" size={scale(48)} color="#94A3B8" />
              </View>

              <Text style={styles.restDayDescription}>
                This habit isn't scheduled for {selectedDay?.toLowerCase()} as
                you've excluded today while adopting this habit.
              </Text>
            </View>
          </>
        ) : (
          /* ─── ACTIVE HABIT VIEW ─────────────────────────────── */
          <>
            {/* Header: Habit Title Block */}
            <View style={styles.headerBlock}>
              <Text style={styles.habitTitleLabel}>
                Habit Title:{' '}
                <Text style={styles.habitTitleValue}>{habit?.title || ''}</Text>
              </Text>
            </View>

            <View style={styles.horizontalDivider} />

            {/* Subtitle / Instruction Row */}
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitleText}>
                Practice Stop-Start-Continue & Tap on Circle
              </Text>
              <Ionicons
                name="information-circle"
                size={scale(22)}
                color={accentColor}
              />
            </View>

            {/* Actionables Matrix Section */}
            <View style={styles.actionablesContainer}>
              {/* Stop Item */}
              <View style={styles.actionRow}>
                <Text style={styles.actionLabel}>
                  Stop:{' '}
                  <Text style={styles.actionText}>
                    {habit?.actionables?.stop || ''}
                  </Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleToggle('stop')}
                  style={styles.circleHitSlop}
                >
                  <View
                    style={[
                      styles.circle,
                      isStopCompleted && styles.circleCompleted,
                    ]}
                  >
                    {isStopCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={scale(16)}
                        color={theme.colors.white}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Start Item */}
              <View style={styles.actionRow}>
                <Text style={styles.actionLabel}>
                  Start:{' '}
                  <Text style={styles.actionText}>
                    {habit?.actionables?.start || '.'}
                  </Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleToggle('start')}
                  style={styles.circleHitSlop}
                >
                  <View
                    style={[
                      styles.circle,
                      isStartCompleted && styles.circleCompleted,
                    ]}
                  >
                    {isStartCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={scale(16)}
                        color={theme.colors.white}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* Continue Item */}
              <View style={styles.actionRow}>
                <Text style={styles.actionLabel}>
                  Continue:{' '}
                  <Text style={styles.actionText}>
                    {habit?.actionables?.continue || '.'}
                  </Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={() => handleToggle('continue')}
                  style={styles.circleHitSlop}
                >
                  <View
                    style={[
                      styles.circle,
                      isContinueCompleted && styles.circleCompleted,
                    ]}
                  >
                    {isContinueCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={scale(16)}
                        color={theme.colors.white}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.horizontalDivider} />

            {/* Footer Metrics and Actions Block */}
            <View style={styles.footerRow}>
              <View style={styles.scoreContainer}>
                {/* Inline Circular Progress Ring */}
                <View style={styles.progressRingWrapper}>
                  {/* The Ring Track & Dynamic Border Border */}
                  <View
                    style={[
                      styles.progressCircleBase,
                      completionPercent === 0 && {
                        borderColor: theme.colors.border,
                      },
                      completionPercent === 33 && {
                        borderColor: theme.colors.border,
                        borderTopColor: accentColor,
                      },
                      completionPercent === 67 && {
                        borderColor: accentColor,
                        borderBottomColor: theme.colors.border,
                      },
                      completionPercent === 100 && { borderColor: accentColor },
                    ]}
                  />

                  {/* Percentage text */}
                  <Text style={styles.progressRingText}>
                    {completionPercent}%
                  </Text>
                </View>

                <Text style={styles.scoreSectionLabel}>
                  Today Completion Score
                </Text>
              </View>

              {/* Action Toolbar buttons */}
              <View style={styles.toolbarButtonGroup}>
                <TouchableOpacity
                  style={styles.toolbarButton}
                  onPress={() => onEditPress?.(habit?._id || habit?.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={scale(16)}
                    color={accentColor}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toolbarButton}
                  onPress={() => onDeletePress(habit?._id || habit?.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={scale(16)}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

export default HabitCard;

const createStyles = ({ wp, hp, scale, accentColor, isLandscape }) => {
  return StyleSheet.create({
    cardTransformWrapper: {
      width: '100%',
      alignSelf: 'center',
      maxWidth: isLandscape ? '90%' : '100%',
      marginBottom: hp(2),
    },

    cardContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: scale(20),
      paddingHorizontal: wp(5),
      paddingVertical: hp(2.2),
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: scale(10),
      elevation: 3,
    },

    headerBlock: {
      paddingVertical: hp(0.5),
    },

    habitTitleLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(14),
      color: accentColor,
    },

    habitTitleValue: {
      fontFamily: theme.typography.semiBold,
      color: '#1E293B',
    },

    horizontalDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: hp(1.5),
    },

    subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(2),
    },

    subtitleText: {
      fontFamily: theme.typography.bold,
      fontSize: scale(12),
      color: theme.colors.dark,
      flex: 1,
      marginRight: wp(2),
    },

    actionablesContainer: {
      gap: hp(1.5),
      marginBottom: hp(0.5),
    },

    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    actionLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(12),
      color: accentColor,
      flex: 1,
      marginRight: wp(4),
    },

    actionText: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(12),
      color: '#334155',
    },

    circleHitSlop: {
      padding: scale(2),
    },

    circle: {
      width: scale(18),
      height: scale(18),
      borderRadius: scale(13),
      borderWidth: 1.5,
      borderColor: theme.colors.dashboard.habits,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },

    circleCompleted: {
      backgroundColor: theme.colors.dashboard.habits,
    },

    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: hp(0.5),
    },

    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    // Inline progress ring styles
    progressRingWrapper: {
      width: scale(38),
      height: scale(38),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(3),
      position: 'relative',
    },

    progressCircleBase: {
      position: 'absolute',
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      borderWidth: 3,
      transform: [{ rotate: '45deg' }], // Ensures segments align beautifully
    },

    progressTrack: {
      position: 'absolute',
    },

    halfContainer: {
      position: 'absolute',
      overflow: 'hidden',
    },

    halfCircle: {
      position: 'absolute',
      top: 0,
    },

    progressCenter: {
      position: 'absolute',
      backgroundColor: theme.colors.white, // matches card background
    },

    progressRingText: {
      fontFamily: theme.typography.bold,
      fontSize: scale(11),
      color: '#EF4444',
      textAlign: 'center',
    },

    scoreSectionLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(12),
      color: '#0F172A',
      flex: 1,
    },

    toolbarButtonGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp(2),
    },

    toolbarButton: {
      borderWidth: 1.5,
      borderColor: accentColor,
      borderRadius: scale(8),
      padding: scale(2),
      justifyContent: 'center',
      alignItems: 'center',
    },

    restDayContainer: {
      alignItems: 'center',
      paddingVertical: hp(1),
    },

    restDayLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(16),
      color: accentColor,
      textAlign: 'center',
      marginBottom: hp(1.5),
    },

    restDayIconContainer: {
      marginBottom: hp(1.5),
    },

    restDayDescription: {
      fontFamily: theme.typography.regular,
      fontSize: scale(13),
      color: '#64748B',
      textAlign: 'center',
      lineHeight: scale(20),
      paddingHorizontal: wp(4),
    },
  });
};
