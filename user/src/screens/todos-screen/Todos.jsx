/**
 * @file Todos.jsx
 * @module screens/todos-screen/Todo
 * @description Super-optimized, crash-resilient lazy tab rendering architecture with active Redux toggle controls and structural subscription verification limits.
 */
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

import Header from '../../utilities/custom-components/header/header/Header';
import DateSlider from '../../utilities/custom-components/date-slider/DateSlider';
import CustomTabBar from '../../utilities/custom-components/tab-bar/TabBar';
import Loader from '../../utilities/custom-components/loader/Loader';
import CustomCard from '../../utilities/custom-components/card/Card';
import Modal from '../../utilities/custom-components/modal/Modal';
import GlobalEmptyState from '../../utilities/custom-components/empty-state/EmptyState';
import GlobalFilterMatrix from '../../utilities/custom-components/filter-matrix/FilterMatrix';

import {
  getAllTodos,
  deleteTodo,
  toggleTodoComplete,
  updateTodo,
} from '../../redux/slices/todos.slice';
import { markGoalCompleted, getAllGoals } from '../../redux/slices/goals.slice';
import InputField from '../../utilities/custom-components/input-field/InputField';
import { getUser } from '../../redux/slices/user.slice';

// 🟢 OPTIMIZATION: Stable references outside component to prevent selector trigger identity break
const EMPTY_ARRAY = [];

const TODO_FILTER_OPTIONS = [
  { label: 'Goal-Todos', key: 'GOAL' },
  { label: 'Daily Todos', key: 'DAILY' },
  { label: 'Completed Todos', key: 'COMPLETED' },
  { label: 'Outstanding Todos', key: 'OUTSTANDING' },
];

const formatDateString = d => {
  if (!d) return '';
  const dateObj = d instanceof Date ? d : new Date(d);
  return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(dateObj.getDate()).padStart(2, '0')}`;
};

const Todos = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // ✅ OPTIMIZATION: Removed inline array leaks from the root selectors
  const goals = useSelector(state => state.goals?.goals) || EMPTY_ARRAY;
  const todos = useSelector(state => state.todo?.todos) || EMPTY_ARRAY;
  const todosLoading = useSelector(state => state.todo?.loading || false);
  const auth = useSelector(state => state.auth?.user);
  const user = useSelector(state => state.user?.user);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTab, setCurrentTab] = useState(0);
  // ⚡ DEFERRED TAB STATE: Offloads heavy FlatList re-renders to prevent lagging the tab bar animation
  const [deferredTab, setDeferredTab] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    GOAL: false,
    DAILY: false,
    COMPLETED: false,
    OUTSTANDING: false,
  });

  const [fadeAnim] = useState(new Animated.Value(0));

  // ⏱️ Timer Engine Matrix States
  const [activeTimers, setActiveTimers] = useState({});
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [targetTodoForTimer, setTargetTodoForTimer] = useState(null);

  const [inputHours, setInputHours] = useState('0');
  const [inputMinutes, setInputMinutes] = useState('0');
  const [inputSeconds, setInputSeconds] = useState('0');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetTodoForEdit, setTargetTodoForEdit] = useState(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  const tickerIntervalRef = useRef(null);
  const isInitialMount = useRef(true);
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();

  // ✅ Memoized styles
  const styles = useMemo(
    () => createStyles({ wp, hp, moderateScale, isLandscape }),
    [wp, hp, moderateScale, isLandscape],
  );

  // ⚡ Schedule deferred tab content evaluation immediately after the active tab switch interaction handles complete
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setDeferredTab(currentTab);
    });
    return () => cancelAnimationFrame(handle);
  }, [currentTab]);

  // ⏱️ Loading timeout fallback - prevents infinite loading state
  useEffect(() => {
    let timeoutId = null;

    if (todosLoading && todos.length === 0) {
      timeoutId = setTimeout(() => {
        console.warn('⚠️ Loading timeout - forcing loading state to false');
        // Force loading to false after 5 seconds
        dispatch({ type: 'todo/setLoading', payload: false });
      }, 5000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [todosLoading, todos.length, dispatch]);

  // ✅ Memoized user data for subscription checks
  // const subscriptionPlan = useMemo(() => {
  //   const targetUser = user || auth;
  //   return targetUser?.subscriptionPlan || 'free_trial';
  // }, [user, auth]);

  // ✅ Memoized active todos count
  const activeTodosCount = useMemo(() => {
    return (todos || []).filter(t => !t.isCompleted).length;
  }, [todos]);

  // 🟢 Pull Records on Screen Focus - Fixed Infinite Loop Storm
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          await dispatch(getAllTodos()).unwrap();
          if (isMounted) {
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }).start();
          }
        } catch (error) {
          console.error('❌ Failed to fetch todos:', error);
        }
      };

      // Trigger profile fetch once on initial mount
      const userId = auth?.id || auth?.userId;
      if (userId && isInitialMount.current) {
        isInitialMount.current = false;
        dispatch(getUser(userId));
      }

      // Safely dispatch API calls without triggering dependency re-runs
      fetchData();
      dispatch(getAllGoals());

      return () => {
        isMounted = false;
      };
    }, [dispatch, auth?.id, auth?.userId, fadeAnim]), // ✅ Clean dependencies
  );

  // ✅ Structural Sync Automated pipeline
  useEffect(() => {
    if (!goals || !todos || goals.length === 0 || todos.length === 0) return;

    let isMounted = true;

    const checkAndAutoCompleteGoals = async () => {
      try {
        const todosByGoal = {};
        todos.forEach(todo => {
          if (todo?.goalId) {
            const goalIdStr = todo.goalId.toString();
            if (!todosByGoal[goalIdStr]) todosByGoal[goalIdStr] = [];
            todosByGoal[goalIdStr].push(todo);
          }
        });

        for (const goal of goals) {
          const goalIdStr = goal?._id?.toString() || goal?.id?.toString();
          if (!goalIdStr || goal.isCompleted || goal.status === 'completed')
            continue;

          const goalTodos = todosByGoal[goalIdStr] || [];
          if (goalTodos.length === 0) continue;

          const allCompleted = goalTodos.every(todo => todo.isCompleted);

          if (allCompleted && isMounted) {
            await dispatch(markGoalCompleted({ goalId: goalIdStr })).unwrap();
            dispatch(getAllGoals());
          }
        }
      } catch (error) {
        console.error(`❌ Failed to auto-complete goal:`, error);
      }
    };

    checkAndAutoCompleteGoals();

    return () => {
      isMounted = false;
    };
  }, [todos, goals, dispatch]);

  // ✅ Countdown timer
  useEffect(() => {
    if (Object.keys(activeTimers).length > 0) {
      if (!tickerIntervalRef.current) {
        tickerIntervalRef.current = setInterval(() => {
          setActiveTimers(prevTimers => {
            const updated = { ...prevTimers };
            Object.keys(updated).forEach(id => {
              if (updated[id] <= 1) {
                delete updated[id];
                dispatch(
                  toggleTodoComplete({ todoId: id, isCompleted: true }),
                ).then(() => {
                  dispatch(getAllTodos());
                });
              } else {
                updated[id] = updated[id] - 1;
              }
            });
            return updated;
          });
        }, 1000); // ✅ Added missing 1000ms
      }
    } else {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }
    }
    return () => {
      if (tickerIntervalRef.current) {
        clearInterval(tickerIntervalRef.current);
        tickerIntervalRef.current = null;
      }
    };
  }, [activeTimers, dispatch]);

  /**
   * 🔥 1. STEP ONE: Filter by Date
   */
  const dateFilteredTodos = useMemo(() => {
    const dayStr = formatDateString(selectedDate);
    const todayStr = formatDateString(new Date());
    const baseTodos = todos || [];

    return baseTodos.filter(t => {
      if (!t?.targetDate) return false;
      const todoDateStr = t.targetDate.split('T')[0];

      if (todoDateStr === dayStr) return true;
      if (dayStr === todayStr && todoDateStr < todayStr && !t.isCompleted)
        return true;

      if (t.isCompleted && t.completedAt) {
        const completedDateStr = t.completedAt.split('T')[0];
        if (completedDateStr === dayStr) return true;
      }

      return false;
    });
  }, [todos, selectedDate]);

  /**
   * 📊 2. STEP TWO: Direct Render Value Matrix Dynamic Counter
   */
  const remainingTodosCount = useMemo(() => {
    return dateFilteredTodos.filter(t => !t.isCompleted).length;
  }, [dateFilteredTodos]);

  /**
   * ⚡ 3. STEP THREE: Lazy Segment Filtering Compilation Layer
   * Optimized to switch targets via deferredTab tracking references
   */
  const computedFilteredListData = useMemo(() => {
    let base = [...dateFilteredTodos];

    if (deferredTab === 0) {
      base = base.filter(t => t?.todoType === 'GOAL' || t?.goalId !== null);
    } else if (deferredTab === 1) {
      base = base.filter(
        t => t?.todoType === 'DAILY' || (!t?.todoType && !t?.goalId),
      );
    }

    const isAnyFilterApplied = Object.values(activeFilters).some(v => v);
    if (!isAnyFilterApplied) return base;

    return base.filter(t => {
      const isGoal = t?.todoType === 'GOAL' || t?.goalId !== null;
      const isDaily = t?.todoType === 'DAILY' || (!t?.todoType && !t?.goalId);
      const todayStr = formatDateString(new Date());
      const todoDateStr = t?.targetDate ? t.targetDate.split('T')[0] : '';
      const isOutstanding =
        t?.isOutstanding || (todoDateStr < todayStr && !t?.isCompleted);

      const matchesType =
        (!activeFilters.GOAL && !activeFilters.DAILY) ||
        (activeFilters.GOAL && isGoal) ||
        (activeFilters.DAILY && isDaily);

      const matchesStatus =
        (!activeFilters.COMPLETED && !activeFilters.OUTSTANDING) ||
        (activeFilters.COMPLETED && t?.isCompleted) ||
        (activeFilters.OUTSTANDING && isOutstanding);

      return matchesType && matchesStatus;
    });
  }, [deferredTab, dateFilteredTodos, activeFilters]);

  /**
   * 🔒 Subscription & Free Trial Validation Matrix
   */
  const validateTodoCreationLimit = useCallback(() => {
    const targetUser = user || auth;
    if (!targetUser) {
      Toast.show({
        type: 'info',
        text1: 'Syncing Data 🔄',
        text2: 'Verifying subscription profile, please try again in a moment.',
      });
      return false;
    }

    const isSubscribed = targetUser.isSubscribed || false;
    const maxFreeTierLimit = 10;

    if (!isSubscribed && activeTodosCount >= maxFreeTierLimit) {
      Alert.alert(
        'Limit Exceeded 🚀',
        'Free trial tier limits active tasks to 10 max simultaneously. Upgrade to premium to unlock uncapped architectural workflow matrix bounds.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade Now',
            onPress: () => navigation.navigate('Subscription_Screen'),
          },
        ],
      );
      return false;
    }
    return true;
  }, [user, auth, activeTodosCount, navigation]);

  const handleNavigationToCreate = useCallback(() => {
    if (!validateTodoCreationLimit()) return;
    navigation.navigate('Create_Todo', { selectedDate });
  }, [validateTodoCreationLimit, navigation, selectedDate]);

  const handleToggleComplete = useCallback(
    async (todoId, currentStatus) => {
      if (currentStatus) return;

      setActiveTimers(prev => {
        const copy = { ...prev };
        delete copy[todoId];
        return copy;
      });

      try {
        await dispatch(
          toggleTodoComplete({ todoId, isCompleted: true }),
        ).unwrap();
        dispatch(getAllTodos());
      } catch (err) {
        console.error('Failed to sync toggle status with server:', err);
      }
    },
    [dispatch],
  );

  const handleDeleteTodo = useCallback(
    async todoId => {
      setActiveTimers(prev => {
        const copy = { ...prev };
        delete copy[todoId];
        return copy;
      });

      try {
        await dispatch(deleteTodo({ todoId })).unwrap();
        dispatch(getAllTodos());
      } catch (err) {
        console.error('❌ Failed to delete from server:', err);
      }
    },
    [dispatch],
  );

  const openEditModalSetup = useCallback((todoId, currentTitle) => {
    setTargetTodoForEdit(todoId);
    setEditTitleInput(currentTitle);
    setIsEditModalOpen(true);
  }, []);

  const editTodoTitle = useCallback(async () => {
    if (!editTitleInput.trim() || !targetTodoForEdit) return;
    setIsEditModalOpen(false);

    try {
      await dispatch(
        updateTodo({ todoId: targetTodoForEdit, title: editTitleInput.trim() }),
      ).unwrap();
      dispatch(getAllTodos());
    } catch (err) {
      console.error('Failed to update todo title:', err);
    }
  }, [editTitleInput, targetTodoForEdit, dispatch]);

  const formatTimerString = useCallback(totalSeconds => {
    if (totalSeconds === undefined || totalSeconds === null) return null;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  }, []);

  const openTimerModalSetup = useCallback(todoId => {
    setTargetTodoForTimer(todoId);
    setInputHours('0');
    setInputMinutes('0');
    setInputSeconds('0');
    setIsTimerModalOpen(true);
  }, []);

  const commitSelectedTimer = useCallback(() => {
    const h = parseInt(inputHours || '0', 10);
    const m = parseInt(inputMinutes || '0', 10);
    const s = parseInt(inputSeconds || '0', 10);
    const totalSecs = h * 3600 + m * 60 + s;

    if (totalSecs > 0 && targetTodoForTimer) {
      setActiveTimers(prev => ({ ...prev, [targetTodoForTimer]: totalSecs }));
    }
    setIsTimerModalOpen(false);
  }, [inputHours, inputMinutes, inputSeconds, targetTodoForTimer]);

  // ✅ Memoized empty state configs
  const emptyStateConfig = useMemo(
    () => ({
      0: {
        title: 'No High-Tier Goals Locked',
        subtitle:
          'Build an AI-driven roadmap or set major milestone checkpoints to start tracking.',
        iconName: 'trophy-outline',
        accentColor: theme.colors.dashboard.goals,
      },
      1: {
        title: 'Clear Slate For Today',
        subtitle:
          'No routines mapped for this timeline. Start small and lock down a daily habit.',
        iconName: 'flame-outline',
        accentColor: theme.colors.dashboard.habits,
      },
      2: {
        title: 'No Todos Found',
        subtitle:
          'Your absolute task workspace is clean. Create a quick todo to organize your day.',
        iconName: 'checkbox-outline',
        accentColor: theme.colors.dashboard.todos,
      },
    }),
    [],
  );

  const renderEmptyState = useCallback(() => {
    const config = emptyStateConfig[deferredTab] || emptyStateConfig[2];
    return (
      <GlobalEmptyState
        iconName={config.iconName}
        title={config.title}
        subtitle={config.subtitle}
        accentColor={config.accentColor}
      />
    );
  }, [deferredTab, emptyStateConfig]);

  // ✅ Memoized render function for FlatList
  const renderTodoCard = useCallback(
    ({ item, index }) => {
      const isCompleted = item?.isCompleted;
      const todayStr = formatDateString(new Date());
      const todoDateStr = item?.targetDate ? item.targetDate.split('T')[0] : '';
      const isOutstanding =
        item?.isOutstanding || (todoDateStr < todayStr && !isCompleted);

      return (
        <CustomCard
          title={item?.title}
          indexPrefix="To-Do"
          index={index}
          dateLabel="Target Date"
          dateValue={item?.targetDate}
          accentColor={theme.colors.dashboard.todos}
          isCompleted={isCompleted}
          isOutstanding={isOutstanding}
          timerValue={formatTimerString(activeTimers[item?._id])}
          onMarkComplete={() => handleToggleComplete(item?._id, isCompleted)}
          onDelete={() => handleDeleteTodo(item?._id)}
          onStartTimer={
            !isCompleted ? () => openTimerModalSetup(item?._id) : undefined
          }
          onEdit={
            !isCompleted
              ? () => openEditModalSetup(item?._id, item?.title)
              : undefined
          }
        />
      );
    },
    [
      activeTimers,
      handleToggleComplete,
      handleDeleteTodo,
      openEditModalSetup,
      openTimerModalSetup,
      formatTimerString,
    ],
  );

  // ✅ OPTIMIZATION: Removed Math.random() fallback to prevent tearing down list component views on ticking events
  const keyExtractor = useCallback(
    (item, index) => item?._id?.toString() || `todo-item-key-${index}`,
    [],
  );

  const isLoading = todosLoading && todos.length === 0;

  return (
    <View style={styles.screenContainer}>
      <Header
        title="Todos"
        subtitle="Manage Tasks & Daily Productivity"
        headerColor={theme.colors.dashboard.todos}
        onBackPress={() => navigation.navigate('Main')}
      />

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader size="small" color={theme.colors.dashboard.todos} />
        </View>
      ) : (
        <Animated.View style={[styles.scrollView, { opacity: fadeAnim }]}>
          <DateSlider
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            style={styles.sliderSpacing}
            activeColor={theme.colors.dashboard.todos}
            futureMonthsToRender={4}
            disablePastDates={true}
          />

          <View style={styles.actionControlStrip}>
            <View style={styles.counterSection}>
              <Text style={styles.counterHighlightNumber}>
                {remainingTodosCount}
              </Text>
              <Text style={styles.counterMetricLabel}>TO-DOS REMAINING</Text>
            </View>
            <View style={styles.buttonActionGroupRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addNewButtonContainer}
                onPress={handleNavigationToCreate}
              >
                <Text style={styles.addNewButtonText}>ADD NEW</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsFilterModalOpen(true)}
                style={[
                  styles.filterIconButtonShell,
                  Object.values(activeFilters).some(v => v) &&
                    styles.filterIconButtonShellActive,
                ]}
              >
                <View style={styles.funnelTopBar} />
                <View style={styles.funnelStemLine} />
              </TouchableOpacity>
            </View>
          </View>

          <CustomTabBar
            activeTab={currentTab}
            onTabChange={setCurrentTab}
            tabs={['GOAL TO-DOS', 'DAILY TO-DOS']}
            activeColor={theme.colors.dashboard.todos}
            style={styles.tabBarSpacing}
          />

          <FlatList
            data={computedFilteredListData}
            renderItem={renderTodoCard}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.scrollContentLayout}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews
            extraData={activeTimers}
          />
        </Animated.View>
      )}

      {/* Filter Modal Overlay */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter"
        subtitle="Apply single, multi, or cross-layer filtering"
        buttons={[
          {
            label: 'Reset Filters',
            variant: 'secondary',
            onClick: () => {
              setActiveFilters({
                GOAL: false,
                DAILY: false,
                COMPLETED: false,
                OUTSTANDING: false,
              });
              setIsFilterModalOpen(false);
            },
          },
          {
            label: 'Apply Layout',
            variant: 'primary',
            onClick: () => setIsFilterModalOpen(false),
          },
        ]}
      >
        <GlobalFilterMatrix
          options={TODO_FILTER_OPTIONS}
          activeFilters={activeFilters}
          onToggleCriteria={key =>
            setActiveFilters(p => ({ ...p, [key]: !p[key] }))
          }
          accentColor={theme.colors.dashboard.todos}
        />
      </Modal>

      {/* Countdown Timer picker Modal */}
      <Modal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        title="Set Countdown Timer"
        subtitle="Define duration to auto-complete this structural milestone"
        buttons={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setIsTimerModalOpen(false),
          },
          {
            label: 'Start Timer',
            variant: 'primary',
            onClick: commitSelectedTimer,
          },
        ]}
      >
        <View style={styles.pickerInternalRow}>
          <View style={styles.columnUnit}>
            <Text style={styles.unitMetaLabel}>HOURS</Text>
            <TextInput
              style={styles.numericInputText}
              keyboardType="numeric"
              maxLength={2}
              value={inputHours}
              onChangeText={setInputHours}
              selectTextOnFocus
            />
          </View>
          <Text style={styles.unitSpliterText}>:</Text>
          <View style={styles.columnUnit}>
            <Text style={styles.unitMetaLabel}>MINUTES</Text>
            <TextInput
              style={styles.numericInputText}
              keyboardType="numeric"
              maxLength={2}
              value={inputMinutes}
              onChangeText={setInputMinutes}
              selectTextOnFocus
            />
          </View>
          <Text style={styles.unitSpliterText}>:</Text>
          <View style={styles.columnUnit}>
            <Text style={styles.unitMetaLabel}>SECONDS</Text>
            <TextInput
              style={styles.numericInputText}
              keyboardType="numeric"
              maxLength={2}
              value={inputSeconds}
              onChangeText={setInputSeconds}
              selectTextOnFocus
            />
          </View>
        </View>
      </Modal>

      {/* Edit Todo Title Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Todo Title"
        subtitle="Update the structural title for this specific task milestone"
        buttons={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setIsEditModalOpen(false),
          },
          {
            label: 'Save Changes',
            variant: 'primary',
            onClick: editTodoTitle,
          },
        ]}
      >
        <View style={styles.editInputWrapper}>
          <Text style={styles.inputLabel}>TODO TITLE</Text>
          <InputField
            value={editTitleInput}
            onChangeText={setEditTitleInput}
            placeholder="Enter Title"
            placeholderTextColor={theme.colors.white}
          />
        </View>
      </Modal>
    </View>
  );
};

export default Todos;

const createStyles = ({ wp, hp, moderateScale, isLandscape }) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    scrollView: {
      flex: 1,
    },

    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: isLandscape ? hp(10) : hp(4),
    },

    sliderSpacing: {
      marginTop: hp(0.5),
      marginBottom: hp(1),
    },

    actionControlStrip: {
      flexDirection: isLandscape ? 'column' : 'row',
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(14),
      paddingVertical: moderateScale(10),
      paddingHorizontal: moderateScale(16),
      marginHorizontal: wp(9),
      alignItems: isLandscape ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 8,
      marginTop: hp(0.5),
      marginBottom: hp(1),
    },

    counterSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      width: isLandscape ? '100%' : 'auto',
    },

    counterHighlightNumber: {
      fontFamily: theme.typography.bold,
      fontSize: isLandscape ? moderateScale(16) : moderateScale(18),
      color: theme.colors.dashboard.todos,
      marginRight: moderateScale(6),
    },

    counterMetricLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: isLandscape ? moderateScale(10) : moderateScale(11),
      color: '#8D8585',
      letterSpacing: moderateScale(0.5),
    },

    buttonActionGroupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: isLandscape ? '100%' : undefined,
      justifyContent: isLandscape ? 'space-between' : 'flex-start',
      marginTop: isLandscape ? moderateScale(12) : 0,
    },

    addNewButtonContainer: {
      backgroundColor: theme.colors.dashboard.todos,
      paddingHorizontal: moderateScale(14),
      paddingVertical: moderateScale(8),
      borderRadius: moderateScale(8),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isLandscape ? 0 : moderateScale(8),
      marginBottom: isLandscape ? moderateScale(8) : 0,
      minWidth: isLandscape ? wp(24) : undefined,
    },

    addNewButtonText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(11.5),
      color: theme.colors.white,
      letterSpacing: moderateScale(0.2),
    },

    filterIconButtonShell: {
      width: moderateScale(34),
      height: moderateScale(32),
      borderRadius: moderateScale(8),
      borderWidth: 1.5,
      borderColor: theme.colors.dashboard.todos,
      backgroundColor: theme.colors.white,
      justifyContent: 'center',
      alignItems: 'center',
    },

    filterIconButtonShellActive: {
      backgroundColor: theme.colors.dashboard.todos + '15',
      borderColor: theme.colors.primary,
    },

    funnelTopBar: {
      width: moderateScale(13),
      height: 0,
      borderTopWidth: moderateScale(6),
      borderTopColor: theme.colors.dashboard.todos,
      borderLeftWidth: moderateScale(3.5),
      borderLeftColor: 'transparent',
      borderRightWidth: moderateScale(3.5),
      borderRightColor: 'transparent',
      top: moderateScale(-1),
    },

    funnelStemLine: {
      width: moderateScale(2.5),
      height: moderateScale(6),
      backgroundColor: theme.colors.dashboard.todos,
      marginTop: moderateScale(-1),
    },

    tabBarSpacing: {
      marginTop: hp(1),
      marginBottom: hp(0.5),
    },

    scrollContentLayout: {
      paddingBottom: hp(4),
      paddingTop: hp(1),
      flexGrow: 1,
      paddingHorizontal: isLandscape ? wp(2) : 0,
    },

    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    pickerInternalRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: hp(2),
      gap: wp(2),
      flexWrap: isLandscape ? 'wrap' : 'nowrap',
    },

    columnUnit: {
      alignItems: 'center',
      width: isLandscape ? wp(14) : wp(16),
      marginBottom: isLandscape ? hp(1) : 0,
    },

    unitMetaLabel: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(10),
      color: '#7F8C8D',
      marginBottom: hp(0.5),
    },

    numericInputText: {
      backgroundColor: theme.colors.background,
      borderRadius: moderateScale(8),
      width: '100%',
      textAlign: 'center',
      paddingVertical: hp(1),
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(18),
      color: '#2C3E50',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    unitSpliterText: {
      fontSize: moderateScale(22),
      fontFamily: theme.typography.bold,
      color: '#34495E',
      alignSelf: 'center',
      marginTop: hp(1.5),
    },

    inputLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(11),
      color: theme.colors.white,
      letterSpacing: moderateScale(0.5),
      marginLeft: wp(1),
      marginBottom: hp(1),
    },

    editInputWrapper: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
    },
  });
