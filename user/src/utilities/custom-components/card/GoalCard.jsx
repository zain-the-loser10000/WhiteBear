/**
 * @file GoalCard.jsx
 * @description Ultra-enhanced, professional animated goal card designed strictly with scale, micro-interactions,
 * and orientation matrices matching Screenshot 2026-06-16 130903.png design specs.
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

const GoalCard = ({
  item,
  onMarkComplete,
  onViewRoadmap,
  onEdit,
  onDelete,
  onDownload,
  accentColor = theme.colors.dashboard.goals,
  isLandscape = false,
}) => {
  const { wp, hp, moderateScale } = useGlobalStyles();
  const animatedScale = useRef(new Animated.Value(1)).current;

  // Task metrics calculation metrics
  const totalTasks = item?.tasks?.length || 0;
  const completedTasks = item?.tasks?.filter(t => t.isCompleted).length || 0;
  const isCompleted = item.isCompleted || item.status === 'completed';

  // Micro-interactions scaling mechanics
  const handlePressIn = () => {
    Animated.timing(animatedScale, {
      toValue: 0.99,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedScale, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const formatEndDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // ✅ Helper function to extract ID from item
  const getGoalId = goalItem => {
    if (!goalItem) return null;
    // Try _id first (MongoDB standard)
    if (goalItem._id) {
      return typeof goalItem._id === 'object'
        ? goalItem._id.toString()
        : String(goalItem._id);
    }
    // Try id as fallback
    if (goalItem.id) {
      return typeof goalItem.id === 'object'
        ? goalItem.id.toString()
        : String(goalItem.id);
    }
    return null;
  };

  const handleMarkComplete = () => {
    const goalId = getGoalId(item);
    // ✅ Check both isCompleted and status field
    const isCompleted = item.isCompleted || item.status === 'completed';
    if (goalId && onMarkComplete) {
      onMarkComplete(goalId, isCompleted);
    }
  };

  const handleViewRoadmap = () => {
    if (onViewRoadmap) {
      onViewRoadmap(item);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      const goalId = getGoalId(item);
      if (goalId) {
        onEdit(goalId); // ✅ Pass only the ID
      }
    }
  };
  const handleDelete = () => {
    const goalId = getGoalId(item);
    if (goalId && onDelete) {
      onDelete(goalId); // ✅ Pass only the ID string
    }
  };

  // Compile style sheet passing dynamic state hooks
  const styles = createStyles({
    wp,
    hp,
    moderateScale,
    accentColor,
    isLandscape,
  });

  return (
    <Animated.View
      style={[
        styles.cardTransformWrapper,
        { transform: [{ scale: animatedScale }] },
      ]}
    >
      <View style={styles.cardContainer}>
        {/* 1. GOAL TITLE SEGMENT (Single Text block for perfect inline alignment) */}
        <View style={styles.contentRow}>
          <Text style={styles.bodyValueText}>
            <Text style={styles.boldPrimaryLabel}>Goal Title: </Text>
            {item?.title || 'Untitled Goal'}
          </Text>
        </View>

        <View style={styles.thinDivider} />

        {/* 2. DESCRIPTION SEGMENT */}
        <View style={styles.contentRow}>
          <Text style={styles.bodyValueText}>
            <Text style={styles.boldPrimaryLabel}>Description: </Text>
            {item?.description ||
              'No specific objective description specified.'}
          </Text>
        </View>

        <View style={styles.thinDivider} />

        {/* 3. METRICS SECTION LINE (Side-by-Side inline data grid) */}
        <View style={styles.metricsRow}>
          <Text style={styles.bodyValueText}>
            <Text style={styles.boldPrimaryLabel}>End at: </Text>
            {formatEndDate(item?.endDate)}
          </Text>
          <Text style={styles.metricsStatusText}>
            {completedTasks}/{totalTasks} To-Dos Completed
          </Text>
        </View>

        {/* 4. ACTIONS MATRIX FOOTER */}
        <View style={styles.actionsFooter}>
          {/* Left Side: Solid Action Triggers */}
          <View style={styles.pillGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={[styles.pillButton, isCompleted && styles.completedButton]}
              onPress={handleMarkComplete}
            >
              <Text
                style={[
                  styles.pillButtonText,
                  isCompleted && styles.completedButtonText,
                ]}
              >
                {isCompleted ? '✓ Completed' : 'Mark Complete'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.pillButton}
              onPress={handleViewRoadmap}
            >
              <Text style={styles.pillButtonText}>Roadmap</Text>
            </TouchableOpacity>
          </View>

          {/* Right Side: Square Vector Controls */}
          <View style={styles.iconGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.squareIconButton}
              onPress={handleEdit}
            >
              <Ionicons
                name="pencil-outline"
                size={moderateScale(13)}
                color={theme.colors.dashboard.goals}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.squareIconButton}
              onPress={handleDelete}
            >
              <Ionicons
                name="trash-outline"
                size={moderateScale(13)}
                color={theme.colors.error}
              />
            </TouchableOpacity>

            {/* <TouchableOpacity
              activeOpacity={0.7}
              style={styles.squareIconButton}
              onPress={() => onDownload?.(item)}
            >
              <Ionicons
                name="download-outline"
                size={moderateScale(13)}
                color={accentColor}
              />
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default GoalCard;

/**
 * 🎨 Production-Grade Responsive Styles Matrix
 */
const createStyles = ({ wp, hp, moderateScale, accentColor, isLandscape }) => {
  return StyleSheet.create({
    cardTransformWrapper: {
      width: '100%',
      alignSelf: 'center',
      maxWidth: isLandscape ? '85%' : '100%',
      marginBottom: hp(1.5),
    },

    cardContainer: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(16),
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
      paddingBottom: hp(1.8),
      borderWidth: 1,
      borderColor: theme.colors.border,
      position: 'relative',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: moderateScale(6),
      elevation: 2,
    },

    contentRow: {
      flexDirection: 'row',
      width: '100%',
    },

    boldPrimaryLabel: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(14),
      color: accentColor,
    },

    bodyValueText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(14),
      color: '#334155',
      flex: 1,
      lineHeight: moderateScale(20),
    },

    thinDivider: {
      height: 1,
      backgroundColor: theme.colors.primary,
      marginVertical: hp(1.4),
    },

    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },

    metricsStatusText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(13),
      color: '#64748B',
    },

    actionsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: hp(0.5),
    },

    pillGroup: {
      flexDirection: 'row',
      gap: wp(2),
    },

    pillButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(8),
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.7),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },

    pillButtonText: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(12),
      color: accentColor,
    },

    iconGroup: {
      flexDirection: 'row',
      gap: wp(2),
    },

    squareIconButton: {
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },

    // Add to createStyles function
    completedButton: {
      backgroundColor: accentColor,
      borderColor: accentColor,
    },

    completedButtonText: {
      color: theme.colors.white,
    },
  });
};
