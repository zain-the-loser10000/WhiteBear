/**
 * @file Analytics.jsx
 * @module screens/analytic-screen/Analytics
 * @description Production container managing structured array layers of chronological analytic snapshots.
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import Header from '../../utilities/custom-components/header/header/Header';
import CustomTabBar from '../../utilities/custom-components/tab-bar/TabBar';
import Loader from '../../utilities/custom-components/loader/Loader';
import GlobalEmptyState from '../../utilities/custom-components/empty-state/EmptyState';

import {
  fetchGoalAnalytics,
  fetchTodoAnalytics,
  fetchHabitAnalytics,
  fetchJournalAnalytics,
  setTrackingRange,
} from '../../redux/slices/analytics.slice';

import JournalAnalyticsView from '../../utilities/custom-components/analytics/JournalAnalyticsView';
import GoalAnalyticsView from '../../utilities/custom-components/analytics/GoalAnalyticsView';
import TodoAnalyticsView from '../../utilities/custom-components/analytics/TodoAnalyticsView';
import HabitAnalyticsView from '../../utilities/custom-components/analytics/HabitsAnalyticsView';

const Analytics = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // 0: GOALS, 1: TO-DOS, 2: HABITS, 3: JOURNALS
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setloading] = useState(true);

  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  // 🟢 Safely reading synced selectors matching our updated Redux Slice structure
  const { journalData, todoData, goalData, habitData, currentRange } =
    useSelector(state => state.analytics);

  // 🔄 AUTOMATIC LIFECYCLE SYNC PIPELINE
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const syncBackendSnapshot = async () => {
        setloading(true);
        try {
          switch (currentTab) {
            case 0:
              await dispatch(fetchGoalAnalytics(currentRange));
              break;
            case 1:
              await dispatch(fetchTodoAnalytics(currentRange));
              break;
            case 2:
              await dispatch(fetchHabitAnalytics(currentRange));
              break;
            case 3:
              await dispatch(fetchJournalAnalytics(currentRange));
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Data pipeline connectivity error:', error);
        } finally {
          if (isActive) {
            setloading(false);
          }
        }
      };

      syncBackendSnapshot();

      return () => {
        isActive = false;
      };
    }, [dispatch, currentRange, currentTab]),
  );

  const handleHorizonChange = mode => {
    const modeMapping = { biweekly: 15, monthly: 30, quarterly: 90 };
    const selectedDays = modeMapping[mode] || 15;
    dispatch(setTrackingRange(selectedDays));
  };

  // Safe layout normalization wrapper to safeguard against empty states
  const ensureLoopableArray = data => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  };

  const renderHorizonPills = () => (
    <View style={styles.horizonButtonStrip}>
      {[
        { label: 'BIWEEKLY', modeStr: 'biweekly', daysVal: 15 },
        { label: 'MONTHLY', modeStr: 'monthly', daysVal: 30 },
        { label: 'QUARTERLY', modeStr: 'quarterly', daysVal: 90 },
      ].map(item => {
        const isSelected = currentRange === item.daysVal;
        return (
          <TouchableOpacity
            key={item.modeStr}
            activeOpacity={0.85}
            onPress={() => handleHorizonChange(item.modeStr)}
            style={[
              styles.horizonPillButton,
              isSelected && styles.horizonPillButtonActive,
            ]}
          >
            <Text
              style={[styles.pillText, isSelected && styles.pillTextActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderTabContent = () => {
    // Shared loader logic inside the content screen wrapper
    if (loading || loading) {
      return (
        <View style={styles.loadingContainer}>
          <Loader size="small" color={theme.colors.dashboard.analytics} />
        </View>
      );
    }

    switch (currentTab) {
      case 0: // 🎯 GOALS TAB
        const operationalGoals = ensureLoopableArray(goalData);
        const hasNoGoals =
          operationalGoals.length === 0 ||
          operationalGoals.every(g => g === null);
        return (
          <ScrollView
            contentContainerStyle={styles.scrollFlexGap}
            nestedScrollEnabled={true}
          >
            {renderHorizonPills()}
            {hasNoGoals ? (
              <GlobalEmptyState
                iconName="trophy-outline"
                title="Goals Analytics"
                subtitle="Set strategic goals and track your progress with detailed analytics insights."
                accentColor={theme.colors.dashboard.analytics}
              />
            ) : (
              operationalGoals.map((snapshotItem, elementIndex) => (
                <GoalAnalyticsView
                  key={
                    snapshotItem?._id ||
                    snapshotItem?.id ||
                    `goal-snapshot-${elementIndex}`
                  }
                  data={snapshotItem}
                  hp={hp}
                  wp={wp}
                  moderateScale={moderateScale}
                  isLandscape={isLandscape}
                  currentRange={currentRange}
                />
              ))
            )}
          </ScrollView>
        );

      case 1: // 📝 TO-DOS TAB
        const operationalTodos = ensureLoopableArray(todoData);
        const hasNoTodos =
          operationalTodos.length === 0 ||
          operationalTodos.every(t => t === null);
        return (
          <ScrollView
            contentContainerStyle={styles.scrollFlexGap}
            nestedScrollEnabled={true}
          >
            {renderHorizonPills()}
            {hasNoTodos ? (
              <GlobalEmptyState
                iconName="clipboard-outline"
                title="TO-DOs Analytics"
                subtitle="Begin tracking your tasks to gain actionable insights and improve productivity."
                accentColor={theme.colors.dashboard.analytics}
              />
            ) : (
              operationalTodos.map((snapshotItem, elementIndex) => (
                <TodoAnalyticsView
                  key={
                    snapshotItem?._id ||
                    snapshotItem?.id ||
                    `todo-snapshot-${elementIndex}`
                  }
                  data={snapshotItem}
                  hp={hp}
                  wp={wp}
                  moderateScale={moderateScale}
                  isLandscape={isLandscape}
                  currentRange={currentRange}
                />
              ))
            )}
          </ScrollView>
        );

      case 2: // 🔄 HABITS TAB
        const operationalHabits = ensureLoopableArray(habitData);
        const hasNoHabits =
          operationalHabits.length === 0 ||
          operationalHabits.every(h => h === null);
        return (
          <ScrollView
            contentContainerStyle={styles.scrollFlexGap}
            nestedScrollEnabled={true}
          >
            {renderHorizonPills()}
            {hasNoHabits ? (
              <GlobalEmptyState
                iconName="calendar-outline"
                title="Habits Analytics"
                subtitle="Start building and tracking habits to monitor your behavioral patterns and foster lasting positive change."
                accentColor={theme.colors.dashboard.analytics}
              />
            ) : (
              operationalHabits.map((snapshotItem, elementIndex) => (
                <HabitAnalyticsView
                  key={
                    snapshotItem?._id ||
                    snapshotItem?.id ||
                    `habit-snapshot-${elementIndex}`
                  }
                  data={snapshotItem}
                  hp={hp}
                  wp={wp}
                  moderateScale={moderateScale}
                  isLandscape={isLandscape}
                  currentRange={currentRange}
                />
              ))
            )}
          </ScrollView>
        );

      case 3: // 📖 JOURNALS TAB
        const operationalTimeline = ensureLoopableArray(journalData);
        const hasNoJournals =
          operationalTimeline.length === 0 ||
          operationalTimeline.every(j => j === null);
        return (
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollFlexGap}
            nestedScrollEnabled={true}
            style={styles.scrollView}
          >
            {renderHorizonPills()}
            {hasNoJournals ? (
              <GlobalEmptyState
                iconName="book-outline"
                title="No Journal Entries"
                subtitle="Start journaling to reflect on your experiences and track your personal growth journey."
                accentColor={theme.colors.dashboard.analytics}
              />
            ) : (
              operationalTimeline.map((snapshotItem, elementIndex) => (
                <JournalAnalyticsView
                  key={
                    snapshotItem?._id ||
                    snapshotItem?.id ||
                    `snapshot-${elementIndex}`
                  }
                  data={snapshotItem}
                  hp={hp}
                  wp={wp}
                  moderateScale={moderateScale}
                  isLandscape={isLandscape}
                  currentRange={currentRange}
                />
              ))
            )}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Header
          title="Analytics"
          subtitle="Achieve Goals - See Results & Feel Good"
          headerColor={theme.colors.dashboard.analytics}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <CustomTabBar
        activeTab={currentTab}
        onTabChange={index => setCurrentTab(index)}
        tabs={['GOALS', 'TO-DOS', 'HABITS', 'JOURNALS']}
        activeColor={theme.colors.dashboard.analytics}
        style={styles.tabBarSpacing}
      />

      <View style={styles.tabContentContainer}>{renderTabContent()}</View>
    </View>
  );
};

export default Analytics;

const createStyles = ({ wp, hp, isLandscape, moderateScale }) => {
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    headerContainer: {
      width: '100%',
    },

    scrollView: {
      flex: 1,
    },

    tabBarSpacing: {
      marginTop: isLandscape ? hp(1) : hp(1.5),
      marginBottom: isLandscape ? hp(0.3) : hp(0.5),
      marginHorizontal: isLandscape ? wp(2) : 0,
    },

    tabContentContainer: {
      flex: 1,
      width: '100%',
    },

    scrollFlexGap: {
      paddingHorizontal: isLandscape ? wp(6) : wp(4),
      paddingBottom: moderateScale(isLandscape ? hp(8) : hp(4)),
      paddingTop: isLandscape ? hp(1) : hp(0.5),
      flexGrow: 1,
    },

    horizonButtonStrip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(isLandscape ? 14 : 12),
      height: isLandscape ? hp(14) : hp(6),
      padding: moderateScale(isLandscape ? 6 : 4),
      marginTop: hp(isLandscape ? 0.8 : 1),
      marginBottom: hp(isLandscape ? 1.2 : 1.6),
      marginHorizontal: isLandscape ? wp(1) : 0,
    },

    horizonPillButton: {
      flex: 1,
      paddingVertical: moderateScale(isLandscape ? hp(0.9) : hp(1.4)),
      paddingHorizontal: moderateScale(isLandscape ? 8 : 4),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: moderateScale(10),
      marginHorizontal: isLandscape ? 4 : 2,
    },

    horizonPillButtonActive: {
      backgroundColor: theme.colors.dashboard.analytics,
    },

    pillText: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textMuted,
      fontSize: moderateScale(isLandscape ? 10 : 11.5),
      textAlign: 'center',
    },

    pillTextActive: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(isLandscape ? 10 : 11.5),
      color: theme.colors.background,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    placeholderComponentText: {
      color: theme.colors.text,
      textAlign: 'center',
      marginTop: hp(4),
      fontFamily: theme.typography.medium,
    },
  });
};
