/**
 * @file SuggestedBottomSheet.jsx
 * @module utilities/custom-components/bottom-sheet/SuggestedBottomSheet
 * @description Premium architectural native animated bottom sheet supporting flexible configurations and custom content rendering engines.
 *              Now supports both goal and habit templates via the `mode` prop.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { theme } from '../../../styles/Themes';

const SuggestedBottomSheet = ({
  visible,
  onClose,
  // Goal props (unchanged)
  goalTemplates = {},
  onSelectGoal,
  // Habit props (new)
  habitTemplates = {},
  onSelectHabit,
  mode = 'goal', // 'goal' or 'habit'
  accentColor = theme.colors.dashboard.goals,
}) => {
  const { wp, hp, moderateScale, scale, isLandscape } = useGlobalStyles();

  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const sheetTranslateY = React.useRef(new Animated.Value(hp(100))).current;

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
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleClose();
    }
  }, [visible, isLandscape]);

  const handleClose = () => {
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

  // ---------- GOAL HANDLERS (unchanged) ----------
  const handleGoalSelect = (categoryKey, goalTitle) => {
    if (onSelectGoal) onSelectGoal(categoryKey, goalTitle);
    handleClose();
  };

  // ---------- HABIT HANDLER (new) ----------
  const handleHabitSelect = (categoryKey, habit) => {
    if (onSelectHabit) onSelectHabit(categoryKey, habit);
    handleClose();
  };

  // Existing goal category map
  const goalCategoryMap = {
    family_relationships: { emoji: '👨‍👩‍👧‍👦', label: 'Family & Relationships' },
    mindfulness_focus: { emoji: '🧘', label: 'Mindfulness & Focus' },
    sleep_recovery: { emoji: '😴', label: 'Sleep & Recovery' },
    self_care_reflection: { emoji: '🪞', label: 'Self Care & Reflection' },
    physical_wellness: { emoji: '💪', label: 'Physical Wellness' },
    emotional_resilience: { emoji: '❤️', label: 'Emotional Resilience' },
    boundaries_balance: { emoji: '⚖️', label: 'Boundaries & Balance' },
  };

  // New habit category map (different emojis/labels for habit categories)
  const habitCategoryMap = {
    family_relationships: { emoji: '👨‍👩‍👧‍👦', label: 'Family & Relationships' },
    career_finances: { emoji: '💼', label: 'Career & Finances' },
    fitness_nutrition: { emoji: '💪', label: 'Fitness & Nutrition' },
    mental_wellness: { emoji: '🧠', label: 'Mental Wellness' },
    fun_leisure: { emoji: '🎉', label: 'Fun & Leisure' },
    spirituality: { emoji: '🕊️', label: 'Spirituality' },
    life_purpose: { emoji: '🌱', label: 'Life Purpose' },
  };

  const goalCategories = Object.keys(goalTemplates).filter(
    key => key !== 'custom',
  );
  const habitCategories = Object.keys(habitTemplates).filter(
    key => key !== 'custom',
  );

  const styles = createStyles({
    wp,
    hp,
    moderateScale,
    scale,
    isLandscape,
    accentColor:
      mode === 'goal'
        ? theme.colors.dashboard.goals
        : theme.colors.dashboard.habits,
  });

  // Dynamic header title
  const headerTitle =
    mode === 'habit'
      ? 'Pick Habit from Suggestions'
      : 'Pick Goal from Suggested Goals';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.mainModalViewLayer}>
        <TouchableWithoutFeedback onPress={handleClose}>
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
          {/* Header Section */}
          <View style={styles.headerBlock}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitleText}>{headerTitle}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close-circle"
                  size={scale(24)}
                  color="#1E293B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Grid Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentLayout}
          >
            {/* ---------- GOAL MODE (original, unchanged) ---------- */}
            {mode === 'goal' &&
              goalCategories.map(categoryKey => {
                const categoryInfo = goalCategoryMap[categoryKey];
                const subGoals = goalTemplates[categoryKey] || [];

                if (subGoals.length === 0) return null;

                return (
                  <View
                    key={categoryKey}
                    style={styles.categorySectionContainer}
                  >
                    <View style={styles.categoryHeaderRow}>
                      <Text style={styles.categoryEmoji}>
                        {categoryInfo?.emoji || '📌'}
                      </Text>
                      <Text
                        style={[
                          styles.categoryLabelText,
                          { color: accentColor },
                        ]}
                      >
                        {categoryInfo?.label || categoryKey.replace(/_/g, ' ')}
                      </Text>
                    </View>

                    <View style={styles.goalsMatrixGrid}>
                      {subGoals.map((goal, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.goalCardItem}
                          activeOpacity={0.7}
                          onPress={() => handleGoalSelect(categoryKey, goal)}
                        >
                          <Text
                            style={styles.goalCardText}
                            numberOfLines={isLandscape ? 3 : 4}
                          >
                            {goal}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}

            {/* ---------- HABIT MODE (new) ---------- */}
            {mode === 'habit' &&
              habitCategories.map(categoryKey => {
                const categoryData = habitTemplates[categoryKey] || {};
                // Flatten make & break arrays with type attribute
                const allHabits = [
                  ...(categoryData.make || []).map(h => ({
                    ...h,
                    type: 'make',
                  })),
                  ...(categoryData.break || []).map(h => ({
                    ...h,
                    type: 'break',
                  })),
                ];
                if (allHabits.length === 0) return null;

                const categoryInfo = habitCategoryMap[categoryKey] || {
                  emoji: '📌',
                  label: categoryKey.replace(/_/g, ' '),
                };

                return (
                  <View
                    key={categoryKey}
                    style={styles.categorySectionContainer}
                  >
                    <View style={styles.categoryHeaderRow}>
                      <Text style={styles.categoryEmoji}>
                        {categoryInfo.emoji}
                      </Text>
                      <Text
                        style={[
                          styles.categoryLabelText,
                          { color: accentColor },
                        ]}
                      >
                        {categoryInfo.label}
                      </Text>
                    </View>

                    <View style={styles.goalsMatrixGrid}>
                      {allHabits.map((habit, idx) => (
                        <TouchableOpacity
                          key={`${categoryKey}-${idx}`}
                          style={styles.goalCardItem}
                          activeOpacity={0.7}
                          onPress={() => handleHabitSelect(categoryKey, habit)}
                        >
                          <Text style={styles.goalCardText} numberOfLines={2}>
                            {habit.title}
                          </Text>
                          {/* Small badge showing Make/Break */}
                          <View
                            style={[
                              styles.habitTypeBadge,
                              {
                                backgroundColor:
                                  habit.type === 'make'
                                    ? theme.colors.dashboard.habits
                                    : theme.colors.error,
                              },
                            ]}
                          >
                            <Text style={styles.habitTypeBadgeText}>
                              {habit.type === 'make' ? 'Make' : 'Break'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SuggestedBottomSheet;

const createStyles = ({
  wp,
  hp,
  moderateScale,
  scale,
  isLandscape,
  accentColor,
}) => {
  return StyleSheet.create({
    mainModalViewLayer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: isLandscape ? 'center' : 'stretch',
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.2)',
    },
    sheetSurfacePanel: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: moderateScale(24),
      borderTopRightRadius: moderateScale(24),
      paddingHorizontal: wp(4),
      paddingTop: isLandscape ? hp(4) : hp(2.5),
      width: isLandscape ? wp(90) : wp(100),
      maxHeight: isLandscape ? hp(88) : hp(65),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 24,
    },

    headerBlock: {
      width: '100%',
      marginBottom: isLandscape ? hp(3) : hp(2),
      paddingHorizontal: wp(1),
    },

    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    headerTitleText: {
      fontFamily: theme.typography.bold,
      fontSize: isLandscape ? moderateScale(16) : moderateScale(18),
      color: '#1E293B',
    },

    closeButton: {
      padding: scale(2),
    },

    scrollContentLayout: {
      paddingBottom: isLandscape ? hp(8) : hp(5),
    },

    categorySectionContainer: {
      marginBottom: isLandscape ? hp(3) : hp(2.5),
    },

    categoryHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isLandscape ? hp(1.5) : hp(1.2),
      paddingHorizontal: wp(1),
    },

    categoryEmoji: {
      fontSize: isLandscape ? moderateScale(16) : moderateScale(18),
      marginRight: wp(2),
    },

    categoryLabelText: {
      fontFamily: theme.typography.semiBold,
      fontSize: isLandscape ? moderateScale(14) : moderateScale(16),
      color: accentColor,
    },

    goalsMatrixGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: isLandscape ? 'flex-start' : 'space-between',
      width: '100%',
      gap: isLandscape ? wp(2) : 0,
    },

    goalCardItem: {
      backgroundColor: theme.colors.background,
      width: isLandscape ? wp(29.3) : wp(43.5),
      minHeight: isLandscape ? hp(16) : hp(12),
      maxHeight: isLandscape ? hp(22) : hp(15),
      borderRadius: moderateScale(16),
      padding: isLandscape ? wp(2.5) : wp(3.5),
      marginBottom: isLandscape ? hp(2) : hp(1.5),
      justifyContent: 'flex-start',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 2,
    },

    goalCardText: {
      fontFamily: theme.typography.regular,
      fontSize: isLandscape ? moderateScale(12) : moderateScale(13),
      color: '#334155',
      lineHeight: isLandscape ? 16 : 18,
      marginBottom: 4, // slight spacing for badge
    },

    // New habit-specific styles
    habitTypeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: wp(2),
      paddingVertical: hp(0.3),
      borderRadius: moderateScale(8),
      marginTop: 4,
    },
    habitTypeBadgeText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(10),
      color: '#fff',
    },
  });
};
