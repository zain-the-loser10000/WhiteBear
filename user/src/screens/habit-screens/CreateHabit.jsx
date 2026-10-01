/**
 * @file CreateHabit.jsx
 * @module screens/habits-screen/CreateHabit
 * @description Wizard step flow for habit formulation including AI generation features and notification setups.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  BackHandler,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import Header from '../../utilities/custom-components/header/header/Header';
import StepProgressHeader from '../../utilities/custom-components/steps-progressor/StepProgressor';
import CustomTabBar from '../../utilities/custom-components/tab-bar/TabBar';
import {
  generateAiAssistedActionables,
  createHabit,
  getHabitsConstants,
} from '../../redux/slices/habit.slice';
import { useDispatch, useSelector } from 'react-redux';
import CategoryCard from '../../utilities/custom-components/card/CategoryCard';
import TimelineOptionCard from '../../utilities/custom-components/card/TimelineOptionCard';
import CustomActionBottomSheet from '../../utilities/custom-components/bottom-sheet/BottomSheet';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import {
  validateHabitStep1,
  validateHabitStep2,
  validateHabitTimeline,
} from '../../utilities/custom-components/validation/Validation';
import Button from '../../utilities/custom-components/button/Button';
import InputField from '../../utilities/custom-components/input-field/InputField';
import Loader from '../../utilities/custom-components/loader/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ─── Sound playback library ──────────────
import Sound from 'react-native-sound';
Sound.setCategory('Playback');

const CreateHabit = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { scale, wp, hp } = useGlobalStyles();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const { isCustom = false, selectedDate } = route.params || {};

  const styles = createStyles({ scale, wp, hp, isLandscape });

  const habitsConstants = useSelector(state => state.habits);
  const isSavingHabit = habitsConstants?.loading;

  // Dynamic backend types safety matrix
  const backendTypes = habitsConstants?.habitsConstants?.types || {
    MAKE: 'make',
    BREAK: 'break',
  };

  // ─── Step 1 state ────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ─── Step 2 state ────────────────────────────────────────────
  const [habitType, setHabitType] = useState(null);
  const [habitTitle, setHabitTitle] = useState('');
  const [whyFactor, setWhyFactor] = useState('');
  const [aiActionables, setAiActionables] = useState({
    stop: '',
    start: '',
    continue: '',
  });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // ─── Step 3 state (Timeline & Days) ────────────────────────
  const [timelineType, setTimelineType] = useState(null);
  const [startDate, setStartDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date(),
  );
  const [endDate, setEndDate] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickingTarget, setPickingTarget] = useState('start');
  const [datePickerTitle, setDatePickerTitle] = useState('Select Start Date');
  const [isDaysSheetVisible, setIsDaysSheetVisible] = useState(false);

  // ─── Step 4 state (Notifications) ──────────────────────────
  const [isEveryDayNotification, setIsEveryDayNotification] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState([]); // Array of Date objects
  const [selectedSound, setSelectedSound] = useState('Silent');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [activeTimeIndex, setActiveTimeIndex] = useState(null);

  // ─── Errors ──────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ─── 🆕 HANDLE PREFILLED DATA FROM SUGGESTED HABITS ──────
  useEffect(() => {
    const params = route.params || {};
    console.log('📥 CreateHabit received params:', params);

    // Prefilled category
    if (params.prefillCategory) {
      console.log('📁 Setting category to:', params.prefillCategory);
      setSelectedCategory(params.prefillCategory);
    }

    // Prefilled habit data
    if (params.prefillHabit) {
      const habit = params.prefillHabit;
      console.log('📋 Prefilling habit data:', habit);

      // ---- HABIT TYPE ----
      if (habit.type) {
        const backendTypes = habitsConstants?.habitsConstants?.types || {
          MAKE: 'make',
          BREAK: 'break',
        };
        // Map the habit.type ('make' or 'break') to the backend's actual key
        const newType =
          habit.type === 'break'
            ? backendTypes.BREAK || 'break'
            : backendTypes.MAKE || 'make';
        console.log('🔄 Setting habit type to:', newType);
        setHabitType(newType);
      }

      // Habit title
      if (habit.title) {
        console.log('📝 Setting habit title to:', habit.title);
        setHabitTitle(habit.title);
      }

      // Actionables
      setAiActionables({
        stop: habit.stop || '',
        start: habit.start || '',
        continue: habit.continue || '',
      });
      console.log('✅ Actionables set:', {
        stop: habit.stop || '',
        start: habit.start || '',
        continue: habit.continue || '',
      });
    }

    // Auto-advance to step 2 if we have prefilled data
    if (params.prefillCategory && params.prefillHabit) {
      console.log('🚀 Auto-advancing to step 2');
      setCurrentStep(1);
    }
  }, [route.params, habitsConstants]); // dependencies remain the same
  // ─── Sound mapping helpers ──────────────────────────────────
  const mapSoundToBackend = display => {
    const map = {
      Silent: 'silent',
      Toing: 'toing',
      'Ting Tong Ting': 'ting_tong_ting',
      'Ting Tong': 'ting_tong',
      Ding: 'ding',
    };
    return map[display] || 'ding';
  };

  const playSound = displayName => {
    if (displayName === 'Silent') return;
    const fileName = mapSoundToBackend(displayName) + '.mp3';
    // For Android: file must be placed in android/app/src/main/res/raw/
    // For iOS: drag the .mp3 into Xcode and ensure it's added to the target.
    const sound = new Sound(fileName, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      sound.play(success => {
        if (success) {
          console.log('Sound played successfully');
        } else {
          console.log('Sound playback failed');
        }
        sound.release();
      });
    });
  };

  // ─── Initialize habit type from backend constants ──────────
  useEffect(() => {
    if (habitsConstants?.habitsConstants?.types?.MAKE) {
      setHabitType(habitsConstants.habitsConstants.types.MAKE);
    }
  }, [habitsConstants]);

  // ─── Fetch constants on mount ──────────────────────────────
  useEffect(() => {
    console.log('Dispatching getHabitsConstants Thunk...');
    dispatch(getHabitsConstants())
      .unwrap()
      .then(res => {
        console.log('Thunk Success Response:', res);
      })
      .catch(err => {
        console.error('Thunk Error Response:', err);
      });
  }, [dispatch]);

  // ─── Hardware back handler ──────────────────────────────────
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

  const WIZARD_STEPS = [
    'Set Category',
    'Habit Details',
    'Set Timeline',
    'Set Notifications',
  ];

  const SOUND_OPTIONS = [
    'Silent',
    'Toing',
    'Ting Tong Ting',
    'Ting Tong',
    'Ding',
  ];

  const getOrdinalLabel = index => {
    const labels = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
    return labels[index] || `${index + 1}th`;
  };

  // ─── Step Navigation & Submission Handling ──────────────────
  const handleNextStep = () => {
    if (currentStep === 1) {
      const { isValid, errors: validationErrors } =
        validateHabitStep1(selectedCategory);

      if (!isValid) {
        const firstError = Object.values(validationErrors)[0];
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: firstError,
        });
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const { isValid, errors: validationErrors } = validateHabitStep2(
        habitType,
        habitTitle,
        whyFactor,
      );

      if (!isValid) {
        const firstError = Object.values(validationErrors)[0];
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: firstError,
        });
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const errors = {};
      const timelineError = validateHabitTimeline(timelineType);
      if (timelineError) errors.timelineType = timelineError;

      if (!startDate) {
        errors.startDate = 'Start date is required';
      }
      if (!endDate) {
        errors.endDate = 'End date is required';
      } else if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }

      if (Object.keys(errors).length > 0) {
        const firstError = Object.values(errors)[0];
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: firstError,
        });
        setErrors(errors);
        return;
      }

      setErrors({});
      setIsDaysSheetVisible(true);
    }
  };

  const handleSaveHabit = () => {
    // Validate notifications
    if (isEveryDayNotification && notificationTimes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Notification Required',
        text2:
          'Please add at least one notification time or turn off daily alerts.',
      });
      return;
    }

    // ─── Build payload matching backend exactly ──────────────
    const payload = {
      category: selectedCategory,
      habitType: habitType, // 'make' or 'break'
      title: habitTitle,
      whyFactor: whyFactor,
      actionables: aiActionables, // { stop, start, continue }
      timelineType: timelineType,
      startDate: startDate.toISOString(), // root level
      selectedDays: selectedDays,
      notifications: {
        isEveryDay: isEveryDayNotification,
        times: notificationTimes.map(time =>
          time.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        ),
        sound: mapSoundToBackend(selectedSound),
      },
      isCustomHabit: isCustom, // from navigation
    };

    // For custom timeline, add customDurationDays
    if (timelineType === 'custom' && endDate) {
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      payload.customDurationDays = days;
    }

    dispatch(createHabit(payload))
      .unwrap()
      .then(res => {
        // ✅ Use backend message – no hardcoded text
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.message,
        });
        setTimeout(() => {
          navigation.navigate('Main');
        }, 1500);
      })
      .catch(err => {
        // ❌ Use backend error message – no hardcoded text
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err?.message,
        });
      });
  };

  // ─── AI generation handler ─────────────────────────────────
  const handleGenerateAiActionables = () => {
    // Validate step 2 fields
    const { isValid, errors: validationErrors } = validateHabitStep2(
      habitType,
      habitTitle,
      whyFactor,
    );

    if (!isValid) {
      const firstError = Object.values(validationErrors)[0];
      Toast.show({
        type: 'error',
        text1: 'Input Validation Required',
        text2: firstError,
      });
      setErrors(validationErrors);
      return;
    }

    // Ensure category is selected
    if (!selectedCategory) {
      Toast.show({
        type: 'error',
        text1: 'Category Missing',
        text2: 'Please select a category first.',
      });
      return;
    }

    setErrors({});
    setIsGeneratingAi(true);

    // ─── Correct payload matching backend ──────────────────────
    const requestPayload = {
      title: habitTitle,
      category: selectedCategory,
      habitType: habitType, // 'make' or 'break'
    };

    console.log('🤖 [AI Request] Dispatching with payload:', requestPayload);

    dispatch(generateAiAssistedActionables(requestPayload))
      .unwrap()
      .then(response => {
        console.log('✅ [AI Success] Received actionables:', response);
        setAiActionables({
          stop: response?.stop || '',
          start: response?.start || '',
          continue: response?.continue || '',
        });
        Toast.show({
          type: 'success',
          text1: 'AI Optimization Complete',
          text2: 'Habit execution routine formulated successfully.',
        });
      })
      .catch(error => {
        console.error('❌ [AI Error] Full error object:', error);
        console.error('❌ [AI Error] Message:', error?.message);
        console.error('❌ [AI Error] Status:', error?.status);
        Toast.show({
          type: 'error',
          text1: 'AI Generation Failed',
          text2:
            error?.message ||
            'Could not generate actionables. Please try again later.',
        });
      })
      .finally(() => {
        setIsGeneratingAi(false);
      });
  };

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
      if (timelineType === '20_days')
        computedEnd.setDate(computedEnd.getDate() + 20);
      else if (timelineType === '30_days')
        computedEnd.setDate(computedEnd.getDate() + 30);
      else if (timelineType === '60_days')
        computedEnd.setDate(computedEnd.getDate() + 60);
      setEndDate(computedEnd);
    }
  };

  // ─── Days selection sheet handlers ──────────────────────────
  const handleDaySelectionToggle = dayName => {
    if (selectedDays.includes(dayName)) {
      setSelectedDays(selectedDays.filter(d => d !== dayName));
    } else {
      setSelectedDays([...selectedDays, dayName]);
    }
  };

  // ─── Dynamic Reminder Management ───────────────────────────
  const handleTimeFieldPress = index => {
    setActiveTimeIndex(index);
    setIsTimePickerOpen(true);
  };

  const handleTimeConfirm = time => {
    setIsTimePickerOpen(false);
    const updatedTimes = [...notificationTimes];
    updatedTimes[activeTimeIndex] = time;
    setNotificationTimes(updatedTimes);
  };

  const handleAddNotificationField = () => {
    setNotificationTimes([...notificationTimes, new Date()]);
  };

  const handleRemoveNotificationField = index => {
    setNotificationTimes(notificationTimes.filter((_, idx) => idx !== index));
  };

  const toggleEveryDayNotification = () => {
    if (!isEveryDayNotification && notificationTimes.length === 0) {
      setNotificationTimes([new Date()]); // Provision starter element
    }
    setIsEveryDayNotification(!isEveryDayNotification);
  };

  // Build weekdays from backend constants or fallback
  const weekDaysFromBackend = habitsConstants?.habitsConstants?.weekdays || [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const weekDayLabels = {
    sunday: 'Sunday ☀️',
    monday: 'Monday 🟡',
    tuesday: 'Tuesday 🔥',
    wednesday: 'Wednesday 🍃',
    thursday: 'Thursday ⚡',
    friday: 'Friday 💧',
    saturday: 'Saturday 🌈',
  };
  const weekDaysOptions = weekDaysFromBackend.map(day => ({
    id: day,
    label: weekDayLabels[day] || day.charAt(0).toUpperCase() + day.slice(1),
  }));

  const timelineOptions = (
    habitsConstants?.habitsConstants?.timelines || [
      '20_days',
      '30_days',
      '60_days',
      'custom',
    ]
  ).map(id => {
    const labelMap = {
      '20_days': '20 Days',
      '30_days': '30 Days',
      '60_days': '60 Days',
      custom: 'Custom Duration',
    };
    return { id, label: labelMap[id] || id };
  });

  return (
    <View style={styles.masterWrapper}>
      <Header
        title="Create Habit"
        subtitle="Build your new routine"
        headerColor={theme.colors.dashboard.habits}
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
        accentColor={theme.colors.dashboard.habits}
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
              {(habitsConstants?.habitsConstants?.habitCategories?.all || [])
                .filter(cat => cat !== 'custom')
                .map(categoryKey => {
                  const categoryMap = {
                    family_relationships: {
                      emoji: '👨‍👩‍👧‍👦',
                      label: 'Family & Relationships',
                    },
                    career_finances: {
                      emoji: '💼',
                      label: 'Career & Finances',
                    },
                    fitness_nutrition: {
                      emoji: '💪',
                      label: 'Fitness & Nutrition',
                    },
                    mental_wellness: { emoji: '🧘', label: 'Mental Wellness' },
                    fun_leisure: { emoji: '🎉', label: 'Fun & Leisure' },
                    spirituality: { emoji: '✨', label: 'Spirituality' },
                    life_purpose: { emoji: '🎯', label: 'Life Purpose' },
                    reminder: { emoji: '⏰', label: 'Reminder' },
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
                      accentColor={theme.colors.dashboard.habits}
                      onPress={() => setSelectedCategory(categoryKey)}
                    />
                  );
                })}
            </View>
          </View>
        )}

        {/* STEP 2: HABIT DETAILS */}
        {currentStep === 2 && (
          <View style={styles.stepContentFrame}>
            <CustomTabBar
              tabs={['Make a Habit', 'Break a Habit']}
              // 👇 activeTab is now based on the **actual backend value** of habitType
              activeTab={
                habitType ===
                (habitsConstants?.habitsConstants?.types?.BREAK || 'break')
                  ? 1
                  : 0
              }
              onTabChange={index => {
                const backendTypes = habitsConstants?.habitsConstants
                  ?.types || {
                  MAKE: 'make',
                  BREAK: 'break',
                };
                const newType =
                  index === 0 ? backendTypes.MAKE : backendTypes.BREAK;
                console.log(
                  '🔄 Tab changed to:',
                  index === 0 ? 'MAKE' : 'BREAK',
                  'value:',
                  newType,
                );
                setHabitType(newType);
              }}
              activeColor={
                // Use the same condition for color – red for break, default for make
                habitType ===
                (habitsConstants?.habitsConstants?.types?.BREAK || 'break')
                  ? '#E74C3C' // Red for break habits
                  : theme.colors.dashboard.habits // Default color for make habits
              }
              style={styles.customTabBarSpacing}
            />

            <Text style={styles.inputLabelFieldTitle}>Habit Title</Text>
            <InputField
              containerStyle={styles.formTextInputField}
              placeholder="e.g, Exercise 4x week"
              placeholderTextColor="#A0AAB0"
              value={habitTitle}
              onChangeText={setHabitTitle}
            />

            <Text style={styles.inputLabelFieldTitle}>Why Factor</Text>
            <InputField
              containerStyle={styles.formTextInputField}
              placeholder="What's your motivation for this habit?"
              placeholderTextColor="#A0AAB0"
              value={whyFactor}
              onChangeText={setWhyFactor}
            />

            <Button
              title={'Generate AI Actionables'}
              backgroundColor={theme.colors.error}
              textColor={theme.colors.white}
              style={styles.aiGenerationTriggerButton}
              disabled={isGeneratingAi}
              loading={isGeneratingAi}
              onPress={handleGenerateAiActionables}
              width={isLandscape ? wp(60) : wp(70)}
            />

            <View style={styles.aiActionPlanCardMatrixWrapper}>
              <View style={styles.actionPlanRowLineItem}>
                <Text style={styles.actionPlanRowPrefixLabel}>Stop:</Text>
                <TextInput
                  style={styles.actionPlanUnderlineInput}
                  placeholderTextColor="#A0AAB0"
                  placeholder="e.g., Avoid late-night snacking"
                  value={aiActionables.stop}
                  onChangeText={text =>
                    setAiActionables(prev => ({ ...prev, stop: text }))
                  }
                />
              </View>

              <View style={styles.actionPlanRowLineItem}>
                <Text style={styles.actionPlanRowPrefixLabel}>Start:</Text>
                <TextInput
                  style={styles.actionPlanUnderlineInput}
                  placeholderTextColor="#A0AAB0"
                  placeholder="e.g., Drink a glass of water first"
                  value={aiActionables.start}
                  onChangeText={text =>
                    setAiActionables(prev => ({ ...prev, start: text }))
                  }
                />
              </View>

              <View style={[styles.actionPlanRowLineItem, { marginBottom: 0 }]}>
                <Text style={styles.actionPlanRowPrefixLabel}>Continue:</Text>
                <TextInput
                  style={styles.actionPlanUnderlineInput}
                  placeholderTextColor="#A0AAB0"
                  placeholder="e.g., Feel more energized and focused"
                  value={aiActionables.continue}
                  onChangeText={text =>
                    setAiActionables(prev => ({ ...prev, continue: text }))
                  }
                />
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: TIMELINE SELECTION */}
        {currentStep === 3 && (
          <View style={styles.stepContentFrame}>
            <Text style={styles.stepSectionHeading}>Choose Timeline</Text>
            <View style={styles.timelineSelectionBlock}>
              {timelineOptions.map(item => {
                const isSelected = timelineType === item.id;
                return (
                  <TimelineOptionCard
                    key={item.id}
                    label={item.label}
                    subLabel={item.sub}
                    isSelected={isSelected}
                    accentColor={theme.colors.dashboard.habits}
                    onPress={() => {
                      setTimelineType(item.id);
                      setPickingTarget('start');
                      if (item.id === 'custom') {
                        setStartDate(new Date());
                        setEndDate(null);
                      }
                      setDatePickerTitle('Select Start Date');
                      setIsDatePickerOpen(true);
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

        {/* STEP 4: NOTIFICATIONS CONFIGURATION */}
        {currentStep === 4 && (
          <View style={styles.stepContentFrame}>
            <TouchableOpacity
              style={styles.notificationToggleRow}
              activeOpacity={0.8}
              onPress={toggleEveryDayNotification}
            >
              <Text style={styles.notificationToggleText}>
                Select Every Day Notification (optional)
              </Text>
              <View
                style={[
                  styles.checkboxCircle,
                  isEveryDayNotification && {
                    backgroundColor: theme.colors.dashboard.habits,
                    borderColor: theme.colors.dashboard.habits,
                  },
                ]}
              >
                {isEveryDayNotification && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={theme.colors.white}
                  />
                )}
              </View>
            </TouchableOpacity>

            {isEveryDayNotification && (
              <View style={styles.notificationDynamicWrapper}>
                {notificationTimes.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.timePickerSelectorRow}
                    activeOpacity={0.7}
                    onPress={() => handleTimeFieldPress(index)}
                  >
                    <Text style={styles.timePickerSelectorText}>
                      {time
                        ? `Select ${getOrdinalLabel(
                            index,
                          )} Notification — ${time.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : `Select ${getOrdinalLabel(index)} Notification`}
                    </Text>
                    <View style={styles.timePickerActionIconsRow}>
                      <Ionicons
                        name="notifications-outline"
                        size={20}
                        color="#1E293B"
                        style={{ marginRight: scale(12) }}
                      />
                      <TouchableOpacity
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => handleRemoveNotificationField(index)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.addMoreAlertButton}
                  activeOpacity={0.7}
                  onPress={handleAddNotificationField}
                >
                  <Text style={styles.addMoreAlertButtonText}>Add More</Text>
                </TouchableOpacity>

                <Text style={styles.soundSectionHeading}>
                  Select Notification Sound
                </Text>
                <View style={styles.soundOptionsGrid}>
                  {SOUND_OPTIONS.map(sound => {
                    const isSelected = selectedSound === sound;
                    return (
                      <TouchableOpacity
                        key={sound}
                        style={[
                          styles.soundGridCard,
                          isSelected && styles.soundGridCardSelected,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedSound(sound);
                          playSound(sound); // 👈 plays preview on tap
                        }}
                      >
                        <Text
                          style={[
                            styles.soundCardText,
                            isSelected && styles.soundCardTextSelected,
                          ]}
                        >
                          {sound}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Fixed Dynamic Bottom Action Control */}
      <View style={styles.fixedBottomButtonContainer}>
        <Button
          title={currentStep === 4 ? 'SAVE' : 'NEXT'}
          backgroundColor={theme.colors.dashboard.habits}
          textColor={theme.colors.white}
          onPress={currentStep === 4 ? handleSaveHabit : handleNextStep}
          loading={isSavingHabit}
        />
      </View>

      {/* ─── Date Picker Modal ─────────────────────────────────── */}
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

      {/* ─── Notification Time Picker Modal ────────────────────── */}
      <DatePicker
        modal
        open={isTimePickerOpen}
        date={
          activeTimeIndex !== null
            ? notificationTimes[activeTimeIndex]
            : new Date()
        }
        mode="time"
        title="Select Notification Time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setIsTimePickerOpen(false)}
      />

      {/* ─── Days Selection Bottom Sheet ──────────────────────── */}
      <CustomActionBottomSheet
        visible={isDaysSheetVisible}
        onClose={() => setIsDaysSheetVisible(false)}
        title="Select Active Days"
        options={weekDaysOptions}
        selectedIds={selectedDays}
        isMultiSelect={true}
        accentColor={theme.colors.dashboard.habits}
        onSelectOption={handleDaySelectionToggle}
        onContinue={() => {
          if (selectedDays.length === 0) {
            Toast.show({
              type: 'error',
              text1: 'No Days Selected',
              text2: 'Please select at least one day.',
            });
            return;
          }
          setIsDaysSheetVisible(false);
          setCurrentStep(4);
        }}
      />
    </View>
  );
};

export default CreateHabit;

const createStyles = ({ scale, wp, hp, isLandscape }) => {
  return StyleSheet.create({
    masterWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: wp(5),
      paddingBottom: hp(14),
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

    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: scale(10),
    },

    customTabBarSpacing: {
      marginBottom: scale(20),
    },

    inputLabelFieldTitle: {
      fontFamily: theme.typography.bold,
      fontSize: scale(15),
      color: '#2C3E50',
      marginBottom: scale(8),
      marginTop: scale(12),
    },

    formTextInputField: {
      height: scale(46),
      fontFamily: theme.typography.regular,
      fontSize: scale(14),
      color: '#2C3E50',
      marginBottom: scale(4),
    },

    aiGenerationTriggerButton: {
      marginTop: scale(24),
      marginBottom: scale(16),
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.borderRadius.circle,
    },

    aiActionPlanCardMatrixWrapper: {
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: scale(16),
      padding: scale(18),
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },

    actionPlanRowLineItem: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: scale(10),
    },

    actionPlanRowPrefixLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(14),
      color: '#1E293B',
      width: scale(75),
      top: hp(1),
    },

    actionPlanUnderlineInput: {
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: '#1E293B',
      fontFamily: theme.typography.regular,
      fontSize: scale(14),
      color: '#2C3E50',
      paddingVertical: 0,
      minHeight: scale(10),
    },

    timelineSelectionBlock: {
      backgroundColor: theme.colors.white,
      borderRadius: scale(14),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      marginBottom: scale(16),
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

    // ─── Step 4 Specific Additions ───────────────────────────────
    notificationToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: scale(12),
      marginTop: scale(10),
    },

    notificationToggleText: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(15),
      color: '#E06D76',
    },

    checkboxCircle: {
      width: scale(22),
      height: scale(22),
      borderRadius: scale(11),
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },

    notificationDynamicWrapper: {
      marginTop: scale(10),
    },

    timePickerSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.white,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: scale(12),
      paddingHorizontal: scale(16),
      height: scale(54),
      marginBottom: scale(12),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },

    timePickerSelectorText: {
      fontFamily: theme.typography.medium,
      fontSize: scale(14),
      color: '#1E293B',
      flex: 1,
    },

    timePickerActionIconsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    addMoreAlertButton: {
      alignSelf: 'flex-end',
      borderWidth: 1.5,
      borderColor: theme.colors.dashboard.habits,
      borderRadius: scale(8),
      paddingHorizontal: scale(16),
      paddingVertical: scale(8),
      marginTop: scale(4),
      marginBottom: scale(24),
    },

    addMoreAlertButtonText: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(13),
      color: theme.colors.dashboard.habits,
    },

    soundSectionHeading: {
      fontFamily: theme.typography.semiBold,
      fontSize: scale(15),
      color: '#E06D76',
      marginBottom: scale(16),
    },

    soundOptionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: scale(10),
      marginBottom: scale(20),
    },

    soundGridCard: {
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: scale(12),
      paddingVertical: scale(14),
      paddingHorizontal: scale(12),
      minWidth: '47%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    soundGridCardSelected: {
      borderColor: theme.colors.dashboard.habits,
    },

    soundCardText: {
      fontFamily: theme.typography.medium,
      fontSize: scale(14),
      color: '#475569',
    },

    soundCardTextSelected: {
      fontFamily: theme.typography.semiBold,
      color: '#0F172A',
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
  });
};
