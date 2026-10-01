/**
 * @file Goals.jsx
 * @module screens/goals-screen/Goals
 * @description Fully responsive portrait & landscape aligned goal tracking screen.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  useWindowDimensions,
  Text,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import {
  deleteGoal,
  getAllGoals,
  markGoalCompleted,
  getGoalsConstants,
} from '../../redux/slices/goals.slice';
import {
  getAllTodos,
  toggleTodoComplete,
} from '../../redux/slices/todos.slice';
import Header from '../../utilities/custom-components/header/header/Header';
import Button from '../../utilities/custom-components/button/Button';
import GlobalEmptyState from '../../utilities/custom-components/empty-state/EmptyState';
import Loader from '../../utilities/custom-components/loader/Loader';
import GoalCard from '../../utilities/custom-components/card/GoalCard';
import RoadmapBottomSheet from '../../utilities/custom-components/bottom-sheet/RoadmapBottomSheet';
import Modal from '../../utilities/custom-components/modal/Modal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import SuggestedBottomSheet from '../../utilities/custom-components/bottom-sheet/SuggestedBottomSheet';

const EMPTY_ARRAY = [];

const Goals = () => {
  useStatusBarConfig();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { scale, wp, hp, moderateScale } = useGlobalStyles();

  const styles = useMemo(
    () => createStyles({ scale, wp, hp, moderateScale, isLandscape }),
    [scale, wp, hp, moderateScale, isLandscape],
  );

  // UI States
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [selectedRoadmapText, setSelectedRoadmapText] = useState('');
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuggestedSheetVisible, setIsSuggestedSheetVisible] = useState(false);
  const [goalTemplates, setGoalTemplates] = useState({});

  const constantsFetched = useRef(false);
  const lastFetchRef = useRef(0);

  // ✅ Use shallowEqual to avoid re‑renders on reference changes
  const goals = useSelector(
    state => state.goals?.goals || EMPTY_ARRAY,
    shallowEqual,
  );
  const goalsLoading = useSelector(state => state.goals?.loading || false);
  const todos = useSelector(
    state => state.todo?.todos || EMPTY_ARRAY,
    shallowEqual,
  );
  const auth = useSelector(state => state.auth?.user, shallowEqual);
  const user = useSelector(state => state.user?.user, shallowEqual);
  const userLoading = useSelector(state => state.user?.loading || false);

  // ✅ Cached fetch: only if data is empty or older than 30s
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const now = Date.now();
      const shouldFetch =
        goals.length === 0 || now - lastFetchRef.current > 30000;

      const syncGoalsData = async () => {
        try {
          if (shouldFetch) {
            await Promise.all([
              dispatch(getAllGoals()),
              dispatch(getAllTodos()),
            ]);
            lastFetchRef.current = now;
          }
        } catch (error) {
          console.error('Error batching goals metrics synchronization:', error);
        }
      };

      if (isMounted) {
        syncGoalsData();
      }

      return () => {
        isMounted = false;
      };
    }, [dispatch, goals.length]),
  );

  // Fetch constants only once
  useEffect(() => {
    if (constantsFetched.current) return;
    constantsFetched.current = true;

    dispatch(getGoalsConstants())
      .unwrap()
      .then(res => {
        const constantsData =
          res?.goalConstants || res?.goalsConstants || res || {};
        const templates =
          constantsData?.goalTemplates || res?.goalTemplates || {};
        if (Object.keys(templates).length > 0) {
          setGoalTemplates(templates);
        }
      })
      .catch(err => console.error('❌ Failed to fetch goal constants:', err));
  }, [dispatch]);

  const validateGoalCreationLimit = useCallback(() => {
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
      const todayString = new Date().toISOString().split('T')[0];
      const goalsCreatedToday = goals.filter(goal => {
        if (!goal?.createdAt) return false;
        return (
          new Date(goal.createdAt).toISOString().split('T')[0] === todayString
        );
      });

      if (goalsCreatedToday.length >= 3) {
        Toast.show({
          type: 'error',
          text1: 'Limit Reached 🔒',
          text2:
            'Free trial allows maximum 3 goals per day. Upgrade to Premium!',
        });
        return false;
      }
    }
    return true;
  }, [user, auth, goals]);

  const handleSetGoal = useCallback(() => {
    if (!validateGoalCreationLimit()) return;
    navigation.navigate('Create_Goal', { isCustom: true });
  }, [validateGoalCreationLimit, navigation]);

  const handleSuggestedGoals = useCallback(() => {
    if (!validateGoalCreationLimit()) return;
    setIsSuggestedSheetVisible(true);
  }, [validateGoalCreationLimit]);

  const handleSuggestedGoalSelect = useCallback(
    (categoryKey, goalTitle) => {
      setIsSuggestedSheetVisible(false);
      navigation.navigate('Create_Goal', {
        prefillCategory: categoryKey,
        prefillTitle: goalTitle,
        isSuggested: true,
      });
    },
    [navigation],
  );

  const handleMarkComplete = useCallback(
    async (goalId, isCurrentComplete) => {
      if (isCurrentComplete) return;

      try {
        const result = await dispatch(markGoalCompleted({ goalId })).unwrap();
        if (result?.message) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: result.message,
          });
        }

        const linkedTodos = todos.filter(t => {
          const todoGoalId = t?.goalId?.toString() || t?.goalId || '';
          return todoGoalId === goalId && !t.isCompleted;
        });

        if (linkedTodos.length > 0) {
          await Promise.all(
            linkedTodos.map(todo =>
              dispatch(
                toggleTodoComplete({ todoId: todo._id, isCompleted: true }),
              ).unwrap(),
            ),
          );
        }

        dispatch(getAllGoals());
        dispatch(getAllTodos());
      } catch (err) {
        console.error('❌ Automation cascading failed:', err);
        Toast.show({ type: 'error', text1: 'Failure', text2: err?.message });
      }
    },
    [dispatch, todos],
  );

  const handleViewRoadmap = useCallback(goalItem => {
    setSelectedGoalTitle(goalItem?.title || '');
    setSelectedRoadmapText(goalItem?.aiGeneratedRoadmap || '');
    setIsSheetVisible(true);
  }, []);

  const handleEditGoal = useCallback(
    goalId => {
      if (!goalId) return;
      navigation.navigate('Edit_Goal', { goalId });
    },
    [navigation],
  );

  const handleDeleteGoal = useCallback(goalId => {
    if (!goalId) return;
    setGoalToDelete(goalId);
    setDeleteModalVisible(true);
  }, []);

  const confirmDeleteGoal = useCallback(async () => {
    if (!goalToDelete) return;
    setIsDeleting(true);

    try {
      const result = await dispatch(
        deleteGoal({ goalId: goalToDelete }),
      ).unwrap();
      Toast.show({ type: 'success', text1: 'Success', text2: result?.message });
      setDeleteModalVisible(false);
      setGoalToDelete(null);
      dispatch(getAllGoals());
    } catch (err) {
      console.error('❌ Server deletion failed:', err);
      Toast.show({ type: 'error', text1: 'Failure', text2: err?.message });
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, goalToDelete]);

  const isScreenLoading = useMemo(() => {
    return goalsLoading || (userLoading && !user);
  }, [goalsLoading, userLoading, user]);

  const renderedGoals = useMemo(() => {
    if (goals.length === 0) return null;
    return goals.map((item, index) => {
      const key =
        item?._id?.toString() || item?.id?.toString() || `goal-node-${index}`;
      return (
        <GoalCard
          key={key}
          item={item}
          onMarkComplete={handleMarkComplete}
          onViewRoadmap={handleViewRoadmap}
          onEdit={() => handleEditGoal(item?._id || item?.id)}
          onDelete={handleDeleteGoal}
          isLandscape={isLandscape}
        />
      );
    });
  }, [
    goals,
    handleMarkComplete,
    handleViewRoadmap,
    handleEditGoal,
    handleDeleteGoal,
    isLandscape,
  ]);

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Header
          title="Goals"
          subtitle="Track and achieve your personal goals."
          headerColor={theme.colors.dashboard.goals}
          onBackPress={() => navigation.navigate('Main')}
        />
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.actionControlsWrapper}>
          <Button
            title="SET A GOAL"
            backgroundColor={theme.colors.white}
            textColor={theme.colors.dashboard.goals}
            onPress={handleSetGoal}
            style={styles.customGoalButton}
            textStyle={styles.actionButtonText}
            width={isLandscape ? '48%' : '100%'}
            elevation="low"
            iconName="add-circle-outline"
            iconSize={scale(24)}
            iconColor={theme.colors.dashboard.goals}
            iconPosition="left"
            iconStyle={styles.buttonIconSpacing}
          />

          <Button
            title="SUGGESTED GOALS"
            backgroundColor={theme.colors.dashboard.goals}
            textColor={theme.colors.background}
            onPress={handleSuggestedGoals}
            style={styles.suggestedGoalButton}
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
            <Loader size="small" color={theme.colors.dashboard.goals} />
          </View>
        ) : goals.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <GlobalEmptyState
              iconName="trophy-outline"
              title="No High-Tier Goals"
              subtitle="Build an AI-driven roadmap or set major milestone to start tracking your structural metrics."
              accentColor={theme.colors.dashboard.goals}
            />
          </View>
        ) : (
          <View style={styles.goalsListContentGrid}>{renderedGoals}</View>
        )}
      </ScrollView>

      <RoadmapBottomSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        title={selectedGoalTitle}
        roadmapText={selectedRoadmapText}
        accentColor={theme.colors.dashboard.goals}
      />

      <SuggestedBottomSheet
        visible={isSuggestedSheetVisible}
        onClose={() => setIsSuggestedSheetVisible(false)}
        goalTemplates={goalTemplates}
        onSelectGoal={handleSuggestedGoalSelect}
        accentColor={theme.colors.dashboard.goals}
      />

      <Modal
        isOpen={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setGoalToDelete(null);
        }}
        title="Delete Goal"
        subtitle="Are you sure you want to delete this goal?"
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
              setGoalToDelete(null);
            },
          },
          {
            label: isDeleting ? 'Deleting...' : 'Delete',
            variant: 'danger',
            loading: isDeleting,
            onClick: confirmDeleteGoal,
          },
        ]}
      />
    </View>
  );
};

export default Goals;

/**
 * 🎨 Component Localized Styles Matrix
 */
const createStyles = ({ scale, wp, hp, moderateScale, isLandscape }) => {
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      width: '100%',
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
    customGoalButton: {
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      height: scale(54),
      justifyContent: 'center',
    },
    suggestedGoalButton: {
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
    goalsListContentGrid: {
      paddingHorizontal: wp(5),
      marginTop: scale(20),
      width: '100%',
      alignSelf: 'center',
      maxWidth: isLandscape ? '85%' : '100%',
    },
    editInputWrapper: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      width: '100%',
    },
    inputLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(11),
      color: theme.colors.white,
      letterSpacing: moderateScale(0.5),
      marginLeft: wp(1),
      marginBottom: hp(0.5),
    },
    inputFieldContainer: {
      width: '100%',
    },
    inputFieldText: {
      color: theme.colors.white,
      backgroundColor: 'transparent',
    },
    spacer: {
      height: hp(1.5),
    },
  });
};
