/**
 * @file EditGoal.jsx
 * @module screens/goals-screen/EditGoal
 * @description Fully custom multi-step wizard for editing existing goals with pre-filled data.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import StepProgressHeader from '../../utilities/custom-components/steps-progressor/StepProgressor';
import Header from '../../utilities/custom-components/header/header/Header';
import Button from '../../utilities/custom-components/button/Button';
import CategoryCard from '../../utilities/custom-components/card/CategoryCard';
import TimelineOptionCard from '../../utilities/custom-components/card/TimelineOptionCard';
import CustomActionBottomSheet from '../../utilities/custom-components/bottom-sheet/BottomSheet';
import {
  validateStep1,
  validateStep2,
  validateDaysAndCommitment,
  validateStep3,
} from '../../utilities/custom-components/validation/Validation';

import {
  generateAiDescription,
  updateGoal,
  getGoalsConstants,
} from '../../redux/slices/goals.slice';
import Loader from '../../utilities/custom-components/loader/Loader';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';

const WIZARD_STEPS = [
  'Set Category',
  'Set Timeline',
  'Describe Goal',
  'Generate Roadmap',
];

const EditGoal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { scale, wp, hp } = useGlobalStyles();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const { goalId } = route.params || {};

  const styles = createStyles({ scale, wp, hp, isLandscape });

  const goalsConstants = useSelector(state => state.goals);
  const { goals } = useSelector(state => state.goals);
  const isUpdatingGoal = goalsConstants?.loading;

  // Find the goal to edit
  const goalToEdit = goals?.find(g => g._id === goalId || g.id === goalId);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [timelineType, setTimelineType] = useState(null);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickingTarget, setPickingTarget] = useState('start');
  const [datePickerTitle, setDatePickerTitle] = useState('Select Date');

  const [isDaysSheetVisible, setIsDaysSheetVisible] = useState(false);
  const [isCommitmentSheetVisible, setIsCommitmentSheetVisible] =
    useState(false);

  const [isTimesSheetVisible, setIsTimesSheetVisible] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [reminderTimes, setReminderTimes] = useState(['09:00']);

  const [selectedDays, setSelectedDays] = useState([]);
  const [dailyCommitment, setDailyCommitment] = useState('15m');

  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);

  const [errors, setErrors] = useState({});

  // ─── POPULATE FORM WITH EXISTING GOAL DATA ──────────────
  useEffect(() => {
    if (!goalToEdit) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Goal not found',
      });
      navigation.goBack();
      return;
    }

    console.log('📝 Editing goal:', goalToEdit);

    // Step 1: Category
    if (goalToEdit.category) {
      setSelectedCategory(goalToEdit.category);
    }

    // Step 2: Timeline
    if (goalToEdit.timelineType) {
      setTimelineType(goalToEdit.timelineType);
    }

    if (goalToEdit.startDate) {
      setStartDate(new Date(goalToEdit.startDate));
    }

    if (goalToEdit.endDate) {
      setEndDate(new Date(goalToEdit.endDate));
    }

    if (goalToEdit.selectedDays) {
      setSelectedDays(goalToEdit.selectedDays);
    }

    if (goalToEdit.dailyCommitment) {
      setDailyCommitment(goalToEdit.dailyCommitment);
    }

    // Step 3: Goal Details
    if (goalToEdit.title) {
      setGoalTitle(goalToEdit.title);
    }

    if (goalToEdit.description) {
      setGoalDescription(goalToEdit.description);
    }

    // Step 4: Reminder Times
    if (goalToEdit.reminderTimes && goalToEdit.reminderTimes.length > 0) {
      setReminderTimes(goalToEdit.reminderTimes);
    }

    // Auto-advance to step 2 since we have data
    setCurrentStep(1);
  }, [goalToEdit, navigation]);

  useEffect(() => {
    console.log('Dispatching getGoalsConstants Thunk...');

    dispatch(getGoalsConstants())
      .unwrap()
      .then(res => {
        console.log('Thunk Success Response:', res);
      })
      .catch(err => {
        console.error('Thunk Error Response:', err);
      });
  }, [dispatch]);

  useEffect(() => {
    const handleHardwareBackPress = () => {
      if (currentStep > 1) {
        setCurrentStep(prevStep => prevStep - 1);
        setErrors({});
        return true;
      }
      return false;
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleHardwareBackPress,
    );

    return () => backHandlerSubscription.remove();
  }, [currentStep]);

  // ─── Date picker handlers ──────────────────────────────────
  const handleDateConfirm = date => {
    setIsDatePickerOpen(false);

    if (timelineType === 'custom') {
      if (pickingTarget === 'start') {
        setStartDate(date);
        setPickingTarget('end');
        setDatePickerTitle('Select End Date');
        setTimeout(() => {
          setIsDatePickerOpen(true);
        }, 300);
      } else {
        setEndDate(date);
        if (date < startDate) {
          Toast.show({
            type: 'warning',
            text1: 'Invalid Date Range',
            text2: 'End date must be after start date. Please try again.',
          });
          setEndDate(null);
          setPickingTarget('end');
          setDatePickerTitle('Select End Date');
          setTimeout(() => {
            setIsDatePickerOpen(true);
          }, 300);
        }
      }
    } else {
      setStartDate(date);
      const computedEnd = new Date(date);
      if (timelineType === '1_week')
        computedEnd.setDate(computedEnd.getDate() + 7);
      if (timelineType === '1_month')
        computedEnd.setMonth(computedEnd.getMonth() + 1);
      if (timelineType === '3_months')
        computedEnd.setMonth(computedEnd.getMonth() + 3);
      setEndDate(computedEnd);
    }
  };

  // ─── Time picker handlers ──────────────────────────────────
  const handleTimeConfirm = date => {
    setIsTimePickerOpen(false);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const cleanTimeString = `${hours}:${minutes}`;

    if (!reminderTimes.includes(cleanTimeString)) {
      setReminderTimes([...reminderTimes, cleanTimeString].sort());
    } else {
      Toast.show({
        type: 'info',
        text1: 'Duplicate Alert',
        text2: 'This target notification time stamp is already mapped.',
      });
    }
  };

  const handleRemoveTimeInstance = timeToRemove => {
    setReminderTimes(reminderTimes.filter(t => t !== timeToRemove));
  };

  // ─── AI description handler ──────────────────────────────────
  const handleTriggerAiDescription = async () => {
    if (!goalTitle || !selectedCategory) return;
    setIsAiLoading(true);
    try {
      const result = await dispatch(
        generateAiDescription({
          category: selectedCategory,
          title: goalTitle,
        }),
      ).unwrap();
      setGoalDescription(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ─── Update Goal handler ──────────────────────────────────
  const handleUpdateGoal = async () => {
    setIsSubmittingGoal(true);

    const payload = {
      category: selectedCategory,
      title: goalTitle,
      timelineType,
      customEndDate:
        timelineType === 'custom' ? endDate?.toISOString() : undefined,
      selectedDays,
      dailyCommitment,
      description: goalDescription,
      reminderTimes,
      isAiAssistedDescription: true,
    };

    try {
      const result = await dispatch(
        updateGoal({ goalId, ...payload }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result?.message || 'Goal updated successfully!',
      });

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      console.error('❌ [Goal Update Exception]:', err);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.message || 'Failed to update goal',
      });
    } finally {
      setIsSubmittingGoal(false);
    }
  };

  // ─── Step Navigation ──────────────────────────────────
  const handleNextStep = () => {
    if (currentStep === 1) {
      const { isValid, errors: validationErrors } =
        validateStep1(selectedCategory);

      if (!isValid) {
        const firstError = Object.values(validationErrors)[0];
        Toast.show({
          type: 'error',
          text1: 'Failure',
          text2: firstError,
        });
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setCurrentStep(2);
    }

    if (currentStep === 2 && timelineType) {
      const { isValid, errors: validationErrors } = validateStep2(timelineType);

      if (!isValid) {
        const firstError = Object.values(validationErrors)[0];
        Toast.show({
          type: 'error',
          text1: 'Failure',
          text2: firstError,
        });
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setIsDaysSheetVisible(true);
      return;
    }

    if (currentStep === 3) {
      const { isValid, errors: validationErrors } = validateStep3(
        goalTitle,
        goalDescription,
      );

      if (!isValid) {
        const firstError = Object.values(validationErrors)[0];
        Toast.show({
          type: 'error',
          text1: 'Failure',
          text2: firstError,
        });
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setCurrentStep(4);
    }
  };

  const handleDaySelectionToggle = dayName => {
    if (selectedDays.includes(dayName)) {
      setSelectedDays(selectedDays.filter(d => d !== dayName));
    } else {
      setSelectedDays([...selectedDays, dayName]);
    }
  };

  const weekDays = [
    { id: 'sunday', label: 'Sunday ☀️' },
    { id: 'monday', label: 'Monday 🟡' },
    { id: 'tuesday', label: 'Tuesday 🔥' },
    { id: 'wednesday', label: 'Wednesday 🍃' },
    { id: 'thursday', label: 'Thursday ⚡' },
    { id: 'friday', label: 'Friday 💧' },
    { id: 'saturday', label: 'Saturday 🌈' },
  ];

  const commitment = [
    { id: '15m', label: '15 Min' },
    { id: '30m', label: '30 Min' },
    { id: '1h', label: '1 Hr' },
    { id: '2h', label: '2 Hrs' },
    { id: '3h', label: '3 Hrs' },
    { id: '4h', label: '4 Hrs' },
    { id: '6h', label: '6 Hrs' },
    { id: '8h', label: '8 Hrs' },
    { id: '10h', label: '10 Hrs' },
  ];

  if (!goalToEdit) {
    return (
      <View style={styles.masterWrapper}>
        <Header
          title="Edit Goal"
          subtitle="Goal not found"
          headerColor={theme.colors.dashboard.goals}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loaderCenterFrame}>
          <Text>Goal not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.masterWrapper}>
      <Header
        title="Edit Goal"
        subtitle="Update your dynamic strategy metrics."
        headerColor={theme.colors.dashboard.goals}
        onBackPress={() => {
          if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
          } else {
            navigation.goBack();
          }
        }}
      />
      <StepProgressHeader
        currentStep={currentStep}
        steps={WIZARD_STEPS}
        accentColor={theme.colors.dashboard.goals}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: CHOOSE CATEGORY */}
        {currentStep === 1 && (
          <View style={styles.stepContentFrame}>
            <Text style={styles.stepSectionHeading}>Choose Category</Text>
            <View style={styles.categoryGrid}>
              {(goalsConstants?.goalsConstants?.goalCategories?.all || [])
                .filter(cat => cat !== 'custom')
                .map(categoryKey => {
                  const categoryMap = {
                    family_relationships: {
                      emoji: '👨‍👩‍👧‍👦',
                      label: 'Family & Relationships',
                    },
                    mindfulness_focus: {
                      emoji: '🧘',
                      label: 'Mindfulness & Focus',
                    },
                    sleep_recovery: { emoji: '😴', label: 'Sleep & Recovery' },
                    self_care_reflection: {
                      emoji: '🪞',
                      label: 'Self Care & Reflection',
                    },
                    physical_wellness: {
                      emoji: '💪',
                      label: 'Physical Wellness',
                    },
                    emotional_resilience: {
                      emoji: '❤️',
                      label: 'Emotional Resilience',
                    },
                    boundaries_balance: {
                      emoji: '⚖️',
                      label: 'Boundaries & Balance',
                    },
                  };

                  const displayInfo = categoryMap[categoryKey];
                  const isSelected = selectedCategory === categoryKey;

                  return (
                    <CategoryCard
                      key={categoryKey}
                      label={
                        displayInfo?.label || categoryKey.replace(/_/g, ' ')
                      }
                      emoji={displayInfo?.emoji}
                      isSelected={isSelected}
                      isLandscape={isLandscape}
                      accentColor={theme.colors.dashboard.goals}
                      onPress={() => setSelectedCategory(categoryKey)}
                    />
                  );
                })}
            </View>
          </View>
        )}

        {/* STEP 2: SET TIMELINE */}
        {currentStep === 2 && (
          <View style={styles.stepContentFrame}>
            <Text style={styles.stepSectionHeading}>Choose Timeline</Text>
            <View style={styles.timelineSelectionBlock}>
              {[
                { id: '3_months', label: '3 Months' },
                { id: '1_month', label: '1 Month' },
                { id: '1_week', label: '1 Week' },
                { id: 'custom', label: 'Custom Duration' },
              ].map(item => {
                const isSelected = timelineType === item.id;
                return (
                  <TimelineOptionCard
                    key={item.id}
                    label={item.label}
                    subLabel={item.sub}
                    isSelected={isSelected}
                    accentColor={theme.colors.dashboard.goals}
                    onPress={() => {
                      setTimelineType(item.id);
                      if (item.id === 'custom') {
                        setPickingTarget('start');
                        setStartDate(new Date());
                        setEndDate(null);
                        setDatePickerTitle('Select Start Date');
                        setIsDatePickerOpen(true);
                      } else {
                        setDatePickerTitle('Select Date');
                        setIsDatePickerOpen(true);
                      }
                    }}
                  />
                );
              })}
            </View>

            {timelineType === 'custom' && endDate && (
              <View style={styles.customDateCard}>
                <View style={styles.customDateHeader}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={theme.colors.dashboard.habits}
                  />
                  <Text style={styles.customDateTitle}>Custom Duration</Text>
                </View>

                <View style={styles.customDateRow}>
                  <View style={styles.customDateItem}>
                    <Text style={styles.customDateLabel}>Start</Text>
                    <Text style={styles.customDateValue}>
                      {startDate.toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.customDateDivider} />
                  <View style={styles.customDateItem}>
                    <Text style={styles.customDateLabel}>End</Text>
                    <Text style={styles.customDateValue}>
                      {endDate.toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.customReselectButton}
                  onPress={() => {
                    setPickingTarget('start');
                    setDatePickerTitle('Select Start Date');
                    setIsDatePickerOpen(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={16} color="#475569" />
                  <Text style={styles.customReselectText}>Reselect Dates</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 3: DESCRIBE GOAL */}
        {currentStep === 3 && (
          <View style={styles.stepContentFrame}>
            <Text style={styles.inputLabelField}>What is the goal?</Text>
            <TextInput
              style={styles.textInputBox}
              placeholder="e.g: Enhance productivity within the community"
              placeholderTextColor="#A0A0A0"
              value={goalTitle}
              onChangeText={setGoalTitle}
            />

            <Text style={styles.inputLabelField}>
              Why do you want to achieve the goal?
            </Text>
            <TextInput
              style={[styles.textInputBox, styles.textAreaMultiLine]}
              placeholder="e.g: Boost metrics together natively"
              placeholderTextColor="#A0A0A0"
              multiline
              value={goalDescription}
              onChangeText={setGoalDescription}
            />

            <TouchableOpacity
              style={styles.aiGenerationButton}
              onPress={handleTriggerAiDescription}
              disabled={isAiLoading || !goalTitle}
            >
              {isAiLoading ? (
                <Loader color={theme.colors.white} size="small" />
              ) : (
                <Text style={styles.aiButtonText}>✨ GENERATE WITH AI</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: PREVIEW AND ROADMAP GENERATION */}
        {currentStep === 4 && (
          <View style={styles.stepContentFrame}>
            <View style={styles.previewHeaderContainer}>
              <Text style={styles.stepSectionHeading}>Strategy Blueprint</Text>
              <View style={styles.aiReadyBadge}>
                <Text style={styles.aiReadyBadgeText}>✨ AI READY</Text>
              </View>
            </View>

            <Text style={styles.previewSubheadingHint}>
              Review your dynamic configuration engine parameters before
              updating the operational neural roadmap.
            </Text>

            <View style={styles.premiumPreviewCard}>
              <View style={styles.previewMainHeader}>
                <Ionicons
                  name="rocket-outline"
                  size={scale(22)}
                  color={theme.colors.dashboard.goals}
                />
                <View style={styles.previewMainHeaderContent}>
                  <Text style={styles.previewHeaderLabel}>TARGET GOAL</Text>
                  <Text style={styles.previewGoalTitleText}>
                    {goalTitle || 'Untitled Strategy Metrics'}
                  </Text>
                </View>
              </View>

              <View style={styles.horizontalDivider} />

              <View style={styles.specsGridContainer}>
                {/* Category */}
                <View style={styles.specGridItem}>
                  <View style={styles.specIconWrapper}>
                    <Ionicons
                      name="grid-outline"
                      size={scale(16)}
                      color="#475569"
                    />
                  </View>
                  <View style={styles.specMetaFrame}>
                    <Text style={styles.specMetaLabel}>CATEGORY</Text>
                    <Text style={styles.specMetaValueText}>
                      {selectedCategory
                        ? selectedCategory.replace(/_/g, ' ')
                        : 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Timeline Profile */}
                <View style={styles.specGridItem}>
                  <View style={styles.specIconWrapper}>
                    <Ionicons
                      name="calendar-outline"
                      size={scale(16)}
                      color="#475569"
                    />
                  </View>
                  <View style={styles.specMetaFrame}>
                    <Text style={styles.specMetaLabel}>TIMELINE PROFILE</Text>
                    <Text style={styles.specMetaValueText}>
                      {timelineType === 'custom'
                        ? `${startDate.toLocaleDateString()} → ${endDate?.toLocaleDateString()}`
                        : timelineType?.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                {/* Commitment */}
                <View style={styles.specGridItem}>
                  <View style={styles.specIconWrapper}>
                    <Ionicons
                      name="time-outline"
                      size={scale(16)}
                      color="#475569"
                    />
                  </View>
                  <View style={styles.specMetaFrame}>
                    <Text style={styles.specMetaLabel}>DAILY COMMITMENT</Text>
                    <Text style={styles.specMetaValueText}>
                      {dailyCommitment} / Day
                    </Text>
                  </View>
                </View>

                {/* Velocity */}
                <View style={styles.specGridItem}>
                  <View style={styles.specIconWrapper}>
                    <Ionicons
                      name="speedometer-outline"
                      size={scale(16)}
                      color="#475569"
                    />
                  </View>
                  <View style={styles.specMetaFrame}>
                    <Text style={styles.specMetaLabel}>VELOCITY RATE</Text>
                    <Text style={styles.specMetaValueText}>
                      {selectedDays?.length || 0} Days / Wk
                    </Text>
                  </View>
                </View>

                {/* Reminder Schedules */}
                <View
                  style={[
                    styles.specGridItem,
                    { width: '100%', marginTop: scale(8) },
                  ]}
                >
                  <View style={styles.specIconWrapper}>
                    <Ionicons
                      name="notifications-outline"
                      size={scale(16)}
                      color="#475569"
                    />
                  </View>
                  <View style={styles.specMetaFrame}>
                    <Text style={styles.specMetaLabel}>REMINDER SCHEDULES</Text>
                    <Text style={styles.specMetaValueText}>
                      {reminderTimes.join(', ')} ({reminderTimes.length}x daily)
                    </Text>
                  </View>
                </View>
              </View>

              {goalDescription ? (
                <>
                  <View style={styles.horizontalDivider} />
                  <View style={styles.purposeBlockFrame}>
                    <Text style={styles.purposeBlockLabel}>
                      STATEMENT OF PURPOSE
                    </Text>
                    <Text style={styles.purposeDescriptionValue}>
                      {goalDescription}
                    </Text>
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.submitButtonSpacingFrame}>
              <Button
                title={
                  isSubmittingGoal
                    ? 'UPDATING ROADMAP...'
                    : '✨ UPDATE DYNAMIC ROADMAP'
                }
                backgroundColor={theme.colors.dashboard.goals}
                textColor={theme.colors.white}
                onPress={handleUpdateGoal}
                disabled={isSubmittingGoal}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {currentStep < 4 && (
        <View style={styles.fixedBottomButtonContainer}>
          <Button
            title="NEXT"
            backgroundColor={theme.colors.dashboard.goals}
            textColor={theme.colors.white}
            onPress={handleNextStep}
          />
        </View>
      )}

      {/* ─── Date Picker Modal ─── */}
      <DatePicker
        modal
        open={isDatePickerOpen}
        date={pickingTarget === 'start' ? startDate : endDate || new Date()}
        mode="date"
        title={datePickerTitle}
        onConfirm={handleDateConfirm}
        onCancel={() => {
          setIsDatePickerOpen(false);
          if (timelineType === 'custom') {
            setPickingTarget('start');
            setDatePickerTitle('Select Start Date');
          }
        }}
      />

      {/* ─── Time Picker Modal ─── */}
      <DatePicker
        modal
        open={isTimePickerOpen}
        date={new Date()}
        mode="time"
        is24Hour={true}
        onConfirm={handleTimeConfirm}
        onCancel={() => setIsTimePickerOpen(false)}
      />

      {/* Days Sheet */}
      <CustomActionBottomSheet
        visible={isDaysSheetVisible}
        onClose={() => setIsDaysSheetVisible(false)}
        title="Week Days To Be Used"
        options={weekDays}
        selectedIds={selectedDays}
        isMultiSelect={true}
        accentColor={theme.colors.dashboard.goals}
        onSelectOption={handleDaySelectionToggle}
        onContinue={() => {
          const { isValid, errors: validationErrors } =
            validateDaysAndCommitment(selectedDays, dailyCommitment);
          if (!isValid) {
            Toast.show({
              type: 'error',
              text1: 'Failure',
              text2: Object.values(validationErrors)[0],
            });
            setErrors(validationErrors);
            return;
          }
          setIsDaysSheetVisible(false);
          setTimeout(() => setIsCommitmentSheetVisible(true), 350);
        }}
      />

      {/* Commitment Sheet */}
      <CustomActionBottomSheet
        visible={isCommitmentSheetVisible}
        onClose={() => setIsCommitmentSheetVisible(false)}
        title="Choose Daily Time Commitment"
        options={commitment}
        selectedIds={dailyCommitment}
        isMultiSelect={false}
        accentColor={theme.colors.dashboard.goals}
        onSelectOption={timeId => setDailyCommitment(timeId)}
        onContinue={() => {
          const { isValid, errors: validationErrors } =
            validateDaysAndCommitment(selectedDays, dailyCommitment);
          if (!isValid) {
            Toast.show({
              type: 'error',
              text1: 'Failure',
              text2: Object.values(validationErrors)[0],
            });
            setErrors(validationErrors);
            return;
          }
          setIsCommitmentSheetVisible(false);
          setTimeout(() => setIsTimesSheetVisible(true), 350);
        }}
      />

      {/* ─── Multi-Time Selection Panel ─── */}
      <CustomActionBottomSheet
        visible={isTimesSheetVisible}
        onClose={() => setIsTimesSheetVisible(false)}
        title="Setup Daily Reminders (Time to Time)"
        isMultiSelect={false}
        accentColor={theme.colors.dashboard.goals}
        onContinue={() => {
          if (reminderTimes.length === 0) {
            Toast.show({
              type: 'error',
              text1: 'Configuration Error',
              text2: 'Please attach at least one active reminder time point.',
            });
            return;
          }
          setIsTimesSheetVisible(false);
          setCurrentStep(3);
        }}
        renderCustomContent={() => (
          <View style={{ paddingVertical: scale(10), width: '100%' }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.dashboard.goals,
                padding: scale(12),
                borderRadius: scale(8),
                borderStyle: 'solid',
                borderWidth: 1,
                borderColor: theme.colors.border,
                marginBottom: scale(15),
              }}
              onPress={() => setIsTimePickerOpen(true)}
              activeOpacity={0.6}
            >
              <Ionicons
                name="add-circle-outline"
                size={scale(20)}
                color={theme.colors.white}
              />
              <Text
                style={{
                  marginLeft: scale(8),
                  color: theme.colors.white,
                  fontFamily: theme.typography.medium,
                  fontSize: scale(14),
                  textTransform: 'capitalize',
                }}
              >
                Set Reminders
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                color: theme.colors.dark,
                fontFamily: theme.typography.bold,
                fontSize: scale(12),
                marginBottom: scale(8),
              }}
            >
              ACTIVE REMINDER TARGETS:
            </Text>

            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: scale(8) }}
            >
              {reminderTimes.map(time => (
                <View
                  key={time}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: scale(6),
                    shadowOffset: { width: 0, height: scale(2) },
                    elevation: 2,
                    backgroundColor: theme.colors.white,
                    padding: scale(12),
                    borderRadius: scale(50),
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    marginBottom: scale(15),
                  }}
                >
                  <Text
                    style={{
                      marginLeft: scale(8),
                      color: theme.colors.dark,
                      fontFamily: theme.typography.bold,
                      fontSize: scale(12),
                      textTransform: 'capitalize',
                    }}
                  >
                    ⏰ {time}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTimeInstance(time)}
                    style={{
                      marginLeft: scale(12),
                      color: theme.colors.dark,
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={scale(16)}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default EditGoal;

/**
 * 🎨 Styles Matrix
 */
const createStyles = ({ scale, wp, hp, isLandscape }) => {
  return StyleSheet.create({
    masterWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: wp(5),
      paddingBottom: hp(12),
    },

    stepContentFrame: {
      marginTop: scale(16),
    },

    stepSectionHeading: {
      fontFamily: theme.typography.bold,
      fontSize: scale(18),
      color: '#2C3E50',
      marginBottom: scale(16),
    },

    subLabelHint: {
      fontFamily: theme.typography.regular,
      fontSize: scale(12.5),
      color: '#7F8C8D',
      marginBottom: scale(4),
    },

    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: scale(10),
    },

    timelineSelectionBlock: {
      backgroundColor: theme.colors.white,
      borderRadius: scale(14),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },

    customDateCard: {
      backgroundColor: theme.colors.white,
      borderRadius: scale(14),
      padding: scale(16),
      marginTop: scale(16),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },

    customDateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(12),
      gap: scale(8),
    },

    customDateTitle: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(14),
      color: '#1E293B',
      letterSpacing: 0.3,
    },

    customDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background,
      borderRadius: scale(10),
      paddingVertical: scale(10),
      paddingHorizontal: scale(14),
      marginBottom: scale(14),
    },

    customDateItem: {
      flex: 1,
      alignItems: 'center',
    },

    customDateLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(10),
      color: theme.colors.dark,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: scale(2),
    },

    customDateValue: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(14),
      color: '#0F172A',
    },

    customDateDivider: {
      width: 1,
      height: scale(24),
      backgroundColor: theme.colors.background,
    },

    customReselectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(6),
      paddingVertical: scale(8),
      backgroundColor: theme.colors.background,
      borderRadius: scale(8),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    customReselectText: {
      fontFamily: theme.typography.medium,
      fontSize: scale(12),
      color: '#475569',
    },

    inputLabelField: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(14),
      color: '#2C3E50',
      marginBottom: scale(8),
      marginTop: scale(12),
    },

    textInputBox: {
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: scale(10),
      paddingHorizontal: scale(14),
      height: scale(48),
      color: '#2C3E50',
      fontFamily: theme.typography.regular,
    },

    textAreaMultiLine: {
      height: scale(100),
      textAlignVertical: 'top',
      paddingVertical: scale(12),
    },

    aiGenerationButton: {
      backgroundColor: '#FF6B6B',
      borderRadius: scale(25),
      paddingVertical: scale(14),
      alignItems: 'center',
      marginTop: scale(20),
    },

    aiButtonText: {
      color: theme.colors.white,
      fontFamily: theme.typography.bold,
      fontSize: scale(13),
      letterSpacing: 0.5,
    },

    previewHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: scale(6),
    },

    aiReadyBadge: {
      backgroundColor: '#E0F2FE',
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    aiReadyBadgeText: {
      fontFamily: theme.typography.bold,
      fontSize: scale(10),
      color: '#0369A1',
      letterSpacing: 0.5,
    },

    previewSubheadingHint: {
      fontFamily: theme.typography.regular,
      fontSize: scale(13),
      color: '#64748B',
      lineHeight: scale(18),
      marginBottom: scale(20),
    },

    premiumPreviewCard: {
      backgroundColor: theme.colors.white,
      borderRadius: scale(16),
      padding: scale(18),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 4,
      marginBottom: scale(24),
    },

    previewMainHeader: {
      flexDirection: isLandscape ? 'row' : 'row',
      alignItems: 'center',
      gap: isLandscape ? scale(8) : scale(12),
    },

    previewMainHeaderContent: {
      flex: 1,
    },

    previewHeaderLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(10),
      color: '#94A3B8',
      letterSpacing: 1,
    },

    previewGoalTitleText: {
      fontFamily: theme.typography.bold,
      fontSize: isLandscape ? scale(14) : scale(16),
      color: theme.colors.textPrimary,
      marginTop: scale(2),
    },

    horizontalDivider: {
      height: 1,
      backgroundColor: '#F1F5F9',
      marginVertical: scale(16),
    },

    specsGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: isLandscape ? scale(12) : scale(16),
    },

    specGridItem: {
      width: isLandscape ? '33%' : '50%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(10),
    },

    specIconWrapper: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(8),
      backgroundColor: '#F8FAFC',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    specMetaFrame: {
      flex: 1,
    },

    specMetaLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(9),
      color: '#94A3B8',
      letterSpacing: 0.5,
    },

    specMetaValueText: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(13),
      color: '#334155',
      textTransform: 'capitalize',
      marginTop: scale(1),
    },

    purposeBlockFrame: {
      backgroundColor: '#F8FAFC',
      borderRadius: theme.borderRadius.large,
      padding: isLandscape ? scale(12) : scale(14),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    purposeBlockLabel: {
      fontFamily: theme.typography.bold,
      fontSize: scale(10),
      color: '#64748B',
      letterSpacing: 0.8,
      marginBottom: scale(6),
    },

    purposeDescriptionValue: {
      fontFamily: theme.typography.regular,
      fontSize: scale(13),
      color: '#475569',
      lineHeight: scale(19),
    },

    submitButtonSpacingFrame: {
      marginTop: scale(8),
      marginBottom: scale(16),
    },

    fixedBottomButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: isLandscape ? wp(6) : wp(5),
      paddingVertical: isLandscape ? hp(1.5) : hp(2),
      backgroundColor: theme.colors.background,
    },

    loaderCenterFrame: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
