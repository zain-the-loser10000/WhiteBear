/**
 * @file Habits.jsx
 * @module screens/habit-screens/Habits
 * @description Habits screen featuring header, DateSlider, and Habit cards with daily tracking.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import {
  deleteHabit,
  getAllHabits,
  getHabitsConstants,
  toggleActionableCompletion,
} from '../../redux/slices/habit.slice';

import Header from '../../utilities/custom-components/header/header/Header';
import DateSlider from '../../utilities/custom-components/date-slider/DateSlider';
import Button from '../../utilities/custom-components/button/Button';
import GlobalEmptyState from '../../utilities/custom-components/empty-state/EmptyState';
import Loader from '../../utilities/custom-components/loader/Loader';
import HabitCard from '../../utilities/custom-components/card/HabitCard';
import Toast from 'react-native-toast-message';
import SuggestedBottomSheet from '../../utilities/custom-components/bottom-sheet/SuggestedBottomSheet';
import Modal from '../../utilities/custom-components/modal/Modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUser } from '../../redux/slices/user.slice';

const EMPTY_ARRAY = [];

const Habits = () => {
  useStatusBarConfig();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSuggestedSheetVisible, setIsSuggestedSheetVisible] = useState(false);
  const [habitTemplates, setHabitTemplates] = useState({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { wp, hp, scale, isLandscape } = useGlobalStyles();

  const styles = useMemo(
    () => createStyles({ wp, hp, scale, isLandscape }),
    [wp, hp, scale, isLandscape],
  );

  // ✅ ShallowEqual
  const habits = useSelector(
    state => state.habits?.habits || EMPTY_ARRAY,
    shallowEqual,
  );
  const habitsLoading = useSelector(state => state.habits?.loading || false);
  const auth = useSelector(state => state.auth?.user, shallowEqual);
  const user = useSelector(state => state.user?.user, shallowEqual);
  const userLoading = useSelector(state => state.user?.loading || false);

  const isInitialMount = useRef(true);
  const constantsFetched = useRef(false);
  const lastFetchRef = useRef(0);

  const authUserId = auth?.id || auth?.userId;

  const subscriptionPlan = useMemo(() => {
    const targetUser = user || auth;
    return targetUser?.subscriptionPlan || 'free_trial';
  }, [user, auth]);

  const habitsCreatedToday = useMemo(() => {
    if (!habits || habits.length === 0) return 0;
    const todayString = new Date().toISOString().split('T')[0];
    return habits.filter(habit => {
      if (!habit?.createdAt) return false;
      return (
        new Date(habit.createdAt).toISOString().split('T')[0] === todayString
      );
    }).length;
  }, [habits]);

  // ✅ Cached fetch with TTL
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const now = Date.now();
      const shouldFetch =
        habits.length === 0 || now - lastFetchRef.current > 30000;

      const synchronizeScreenState = async () => {
        try {
          if (authUserId && isInitialMount.current) {
            isInitialMount.current = false;
            await dispatch(getUser(authUserId));
          }

          if (shouldFetch) {
            await dispatch(getAllHabits());
            lastFetchRef.current = now;
          }
        } catch (error) {
          console.error('Error fetching habits:', error);
        }
      };

      if (isMounted) {
        synchronizeScreenState();
      }

      return () => {
        isMounted = false;
      };
    }, [dispatch, authUserId, habits.length]),
  );

  // Fetch constants once
  useEffect(() => {
    if (constantsFetched.current) return;
    constantsFetched.current = true;

    dispatch(getHabitsConstants())
      .unwrap()
      .then(res => {
        const constantsData =
          res?.habitConstants ||
          res?.habitsConstants ||
          res?.goalConstants ||
          res?.goalsConstants ||
          res ||
          {};
        const templates =
          constantsData?.templates ||
          constantsData?.habitTemplates ||
          res?.habitTemplates ||
          constantsData?.goalTemplates ||
          res?.goalTemplates ||
          {};
        if (Object.keys(templates).length > 0) {
          setHabitTemplates(templates);
        }
      })
      .catch(err => {
        console.error('❌ Failed to fetch habit constants:', err);
      });
  }, [dispatch]);

  const validateHabitCreationLimit = useCallback(() => {
    const targetUser = user || auth;

    if (!targetUser) {
      Toast.show({
        type: 'info',
        text1: 'Syncing Data 🔄',
        text2: 'Verifying subscription profile, please try again in a moment.',
      });
      return false;
    }

    const currentPlan = targetUser.subscriptionPlan || 'free_trial';

    if (currentPlan === 'free_trial') {
      if (habitsCreatedToday >= 1) {
        Toast.show({
          type: 'error',
          text1: 'Limit Reached 🔒',
          text2: 'Free trial allows only 1 habit per day. Upgrade to Premium!',
          visibilityTime: 4000,
        });
        return false;
      }
    }
    return true;
  }, [user, auth, habitsCreatedToday]);

  const handleNewHabit = useCallback(() => {
    if (!validateHabitCreationLimit()) return;
    navigation.navigate('Create_Habit', { isCustom: true, selectedDate });
  }, [validateHabitCreationLimit, navigation, selectedDate]);

  const handleSuggestedHabits = useCallback(() => {
    if (!validateHabitCreationLimit()) return;
    setIsSuggestedSheetVisible(true);
  }, [validateHabitCreationLimit]);

  const handleSuggestedHabitSelect = useCallback(
    (categoryKey, habit) => {
      setIsSuggestedSheetVisible(false);
      navigation.navigate('Create_Habit', {
        prefillCategory: categoryKey,
        prefillHabit: {
          title: habit?.title,
          stop: habit?.stop,
          start: habit?.start,
          continue: habit?.continue,
          type: habit?.type,
        },
        isSuggested: true,
        selectedDate,
      });
    },
    [navigation, selectedDate],
  );

  const handleToggleActionable = useCallback(
    (habitId, date, actionKey) => {
      dispatch(
        toggleActionableCompletion({
          habitId,
          targetDate: date.toISOString(),
          actionKey,
          isCompleted: true,
        }),
      ).catch(err => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err?.message,
        });
      });
    },
    [dispatch],
  );

  const handleDeleteHabit = useCallback(habitId => {
    if (!habitId) return;
    setHabitToDelete(habitId);
    setDeleteModalVisible(true);
  }, []);

  const confirmDeleteHabit = useCallback(async () => {
    if (!habitToDelete) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(
        deleteHabit({ habitId: habitToDelete }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result?.message,
      });

      setDeleteModalVisible(false);
      setHabitToDelete(null);
      await dispatch(getAllHabits()).unwrap();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message,
      });
      dispatch(getAllHabits());
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, habitToDelete]);

  const handleEditHabit = useCallback(
    habitId => {
      if (!habitId) return;
      navigation.navigate('Edit_Habit', { habitId });
    },
    [navigation],
  );

  const isScreenLoading = useMemo(() => {
    return habitsLoading || (userLoading && !user);
  }, [habitsLoading, userLoading, user]);

  const renderedHabits = useMemo(() => {
    if (!habits || habits.length === 0) return null;

    return habits.map((habit, index) => {
      const key =
        habit?._id?.toString() ||
        habit?.id?.toString() ||
        `habit-node-${index}`;
      return (
        <HabitCard
          key={key}
          habit={habit}
          selectedDate={selectedDate}
          onToggleActionable={handleToggleActionable}
          onDeletePress={handleDeleteHabit}
          onEditPress={handleEditHabit}
          accentColor={theme.colors.dashboard.habits}
          isLandscape={isLandscape}
        />
      );
    });
  }, [
    habits,
    selectedDate,
    handleToggleActionable,
    handleDeleteHabit,
    handleEditHabit,
    isLandscape,
  ]);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Header
          title="Habits"
          subtitle="Make or break the habits"
          headerColor={theme.colors.dashboard.habits}
          onBackPress={() => navigation.replace('Main')}
        />
      </View>

      <DateSlider
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        style={styles.sliderSpacing}
        activeColor={theme.colors.dashboard.habits}
        pastMonthsToRender={4}
        futureMonthsToRender={4}
      />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.actionControlsWrapper}>
          <Button
            title="CREATE A HABIT"
            backgroundColor={theme.colors.white}
            textColor={theme.colors.dashboard.habits}
            onPress={handleNewHabit}
            style={styles.customHabitButton}
            textStyle={styles.actionButtonText}
            width={isLandscape ? '48%' : '100%'}
            elevation="low"
            iconName="add-circle-outline"
            iconSize={scale(24)}
            iconColor={theme.colors.dashboard.habits}
            iconPosition="left"
            iconStyle={styles.buttonIconSpacing}
          />

          <Button
            title="SUGGESTED HABITS"
            backgroundColor={theme.colors.dashboard.habits}
            textColor={theme.colors.background}
            onPress={handleSuggestedHabits}
            style={styles.suggestedHabitButton}
            textStyle={styles.actionButtonText}
            width={isLandscape ? '48%' : '100%'}
            elevation="low"
            iconName="bulb-outline"
            iconSize={scale(24)}
            iconColor={theme.colors.background}
            iconPosition="left"
            iconStyle={styles.buttonIconSpacing}
          />
        </View>

        {isScreenLoading ? (
          <View style={styles.loaderCenterFrame}>
            <Loader size="small" color={theme.colors.dashboard.habits} />
          </View>
        ) : habits.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <GlobalEmptyState
              iconName="barbell-outline"
              title="No Habits Yet"
              subtitle="Start building your routine by creating a naya habit or exploring suggestions."
              accentColor={theme.colors.dashboard.habits}
            />
          </View>
        ) : (
          <View style={styles.habitsListContentGrid}>{renderedHabits}</View>
        )}
      </ScrollView>

      <SuggestedBottomSheet
        visible={isSuggestedSheetVisible}
        onClose={() => setIsSuggestedSheetVisible(false)}
        mode="habit"
        habitTemplates={habitTemplates}
        onSelectHabit={handleSuggestedHabitSelect}
        accentColor={theme.colors.dashboard.habits}
      />

      <Modal
        isOpen={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setHabitToDelete(null);
        }}
        title="Delete Habit"
        subtitle="Are you sure you want to delete this habit? This action cannot be undone."
        icon={
          <View style={{ alignItems: 'center' }}>
            <Ionicons
              name="warning-outline"
              size={48}
              color={theme.colors.error}
            />
          </View>
        }
        buttons={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => {
              setDeleteModalVisible(false);
              setHabitToDelete(null);
            },
          },
          {
            label: isDeleting ? 'Deleting...' : 'Delete',
            variant: 'danger',
            loading: isDeleting,
            onClick: confirmDeleteHabit,
          },
        ]}
      />
    </View>
  );
};

export default Habits;

const createStyles = ({ wp, hp, scale, isLandscape }) => {
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    headerContainer: {
      width: '100%',
    },

    sliderSpacing: {
      marginTop: hp(0.5),
      marginBottom: hp(1.5),
      marginHorizontal: isLandscape ? wp(2) : 0,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: scale(32),
    },

    actionControlsWrapper: {
      paddingHorizontal: wp(5),
      marginTop: scale(16),
      flexDirection: isLandscape ? 'row' : 'column',
      justifyContent: isLandscape ? 'space-between' : 'flex-start',
      alignItems: 'center',
      gap: scale(12),
      width: '100%',
    },

    customHabitButton: {
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: scale(54),
      justifyContent: 'center',
    },

    suggestedHabitButton: {
      borderRadius: theme.borderRadius.large,
      height: scale(54),
      justifyContent: 'center',
    },

    actionButtonText: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(14),
      letterSpacing: 0.3,
    },

    buttonIconSpacing: {
      marginRight: scale(8),
    },

    loaderCenterFrame: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: scale(60),
    },

    emptyStateContainer: {
      flex: 1,
      marginTop: scale(40),
    },

    habitsListContentGrid: {
      paddingHorizontal: wp(5),
      marginTop: scale(20),
      width: '100%',
      alignSelf: 'center',
      maxWidth: isLandscape ? '85%' : '100%',
    },
  });
};
