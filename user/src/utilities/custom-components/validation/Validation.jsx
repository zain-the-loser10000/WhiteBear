/**
 * @file Validation.jsx
 * @module utilities/custom-components/validation/Validation
 * @description Enhanced validation suite supporting exact granular password verification and goal creation validations.
 */

export const validateFullName = fullName => {
  if (!fullName) return 'Full Name is required';
  if (fullName.trim().length < 3)
    return 'Full Name must be at least 3 characters long';
  return '';
};

export const validateEmail = email => {
  if (!email) return 'Email is required';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.trim()))
    return 'Please enter a valid email address';
  return '';
};

export const validatePassword = password => {
  if (!password) return 'Password is required';
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;
  if (!passwordRegex.test(password)) {
    return 'Password must meet all criteria listed below.';
  }
  return '';
};

// ============================================
// GOAL CREATION VALIDATIONS
// ============================================

export const validateGoalCategory = category => {
  if (!category) return 'Please select at least one goal category';
  return '';
};

export const validateTimelineType = timelineType => {
  if (!timelineType) return 'Please select a timeline duration';
  return '';
};

export const validateSelectedDays = selectedDays => {
  if (!selectedDays || selectedDays.length === 0) {
    return 'Please select at least one day for your goal routine';
  }
  return '';
};

export const validateDailyCommitment = commitment => {
  if (!commitment) return 'Please select your daily time commitment';
  return '';
};

export const validateGoalTitle = title => {
  if (!title || !title.trim()) return 'Please enter your goal title';
  if (title.trim().length < 5)
    return 'Goal title must be at least 5 characters long';
  if (title.trim().length > 100)
    return 'Goal title must be less than 100 characters';
  return '';
};

export const validateGoalDescription = description => {
  if (!description || !description.trim()) {
    return 'Please enter your goal description';
  }
  if (description.trim().length < 20) {
    return 'Description must be at least 20 characters long';
  }
  if (description.trim().length > 500) {
    return 'Description must be less than 500 characters';
  }
  return '';
};

// Combined validation for Step 1
export const validateStep1 = category => {
  const errors = {};

  const categoryError = validateGoalCategory(category);
  if (categoryError) errors.category = categoryError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Combined validation for Step 2
export const validateStep2 = timelineType => {
  const errors = {};

  const timelineError = validateTimelineType(timelineType);
  if (timelineError) errors.timelineType = timelineError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Combined validation for Days & Commitment (after Step 2)
export const validateDaysAndCommitment = (selectedDays, dailyCommitment) => {
  const errors = {};

  const daysError = validateSelectedDays(selectedDays);
  if (daysError) errors.selectedDays = daysError;

  const commitmentError = validateDailyCommitment(dailyCommitment);
  if (commitmentError) errors.dailyCommitment = commitmentError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Combined validation for Step 3
export const validateStep3 = (title, description) => {
  const errors = {};

  const titleError = validateGoalTitle(title);
  if (titleError) errors.title = titleError;

  const descriptionError = validateGoalDescription(description);
  if (descriptionError) errors.description = descriptionError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Complete goal validation before final submission
export const validateCompleteGoal = goalData => {
  const errors = {};

  const categoryError = validateGoalCategory(goalData.category);
  if (categoryError) errors.category = categoryError;

  const timelineError = validateTimelineType(goalData.timelineType);
  if (timelineError) errors.timelineType = timelineError;

  const daysError = validateSelectedDays(goalData.selectedDays);
  if (daysError) errors.selectedDays = daysError;

  const commitmentError = validateDailyCommitment(goalData.dailyCommitment);
  if (commitmentError) errors.dailyCommitment = commitmentError;

  const titleError = validateGoalTitle(goalData.title);
  if (titleError) errors.title = titleError;

  const descriptionError = validateGoalDescription(goalData.description);
  if (descriptionError) errors.description = descriptionError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================
// HABIT CREATION VALIDATIONS
// ============================================

export const validateHabitCategory = category => {
  if (!category) return 'Please select at least one habit category';
  return '';
};

export const validateHabitType = habitType => {
  if (!habitType)
    return 'Please choose whether you want to Make or Break a habit';
  return '';
};

export const validateHabitTitle = title => {
  if (!title || !title.trim()) return 'Habit Title is required';
  if (title.trim().length < 3)
    return 'Habit Title must be at least 3 characters long';
  return '';
};

export const validateWhyFactor = whyFactor => {
  if (!whyFactor || !whyFactor.trim())
    return 'The Why Factor field is required';
  if (whyFactor.trim().length < 5)
    return 'Please elaborate a bit more on your motivation';
  return '';
};

export const validateHabitTimeline = timelineType => {
  if (!timelineType) return 'Please select a timeline duration';
  return '';
};

export const validateHabitSelectedDays = selectedDays => {
  if (!selectedDays || selectedDays.length === 0) {
    return 'Please select at least one active day for your habit';
  }
  return '';
};

// Combined validation for Habit Step 1
export const validateHabitStep1 = category => {
  const errors = {};

  const categoryError = validateHabitCategory(category);
  if (categoryError) errors.category = categoryError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Combined validation for Habit Step 2
export const validateHabitStep2 = (habitType, title, whyFactor) => {
  const errors = {};

  const typeError = validateHabitType(habitType);
  if (typeError) errors.habitType = typeError;

  const titleError = validateHabitTitle(title);
  if (titleError) errors.title = titleError;

  const whyError = validateWhyFactor(whyFactor);
  if (whyError) errors.whyFactor = whyError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateHabitStep3 = (
  timelineType,
  selectedDays,
  startDate,
  endDate,
) => {
  const errors = {};

  const timelineError = validateHabitTimeline(timelineType);
  if (timelineError) errors.timelineType = timelineError;

  const daysError = validateHabitSelectedDays(selectedDays);
  if (daysError) errors.selectedDays = daysError;

  // Validate dates
  if (!startDate) {
    errors.startDate = 'Start date is required';
  }
  if (!endDate) {
    errors.endDate = 'End date is required';
  } else if (startDate && endDate && endDate <= startDate) {
    errors.endDate = 'End date must be after start date';
  }
};

// Generic validation for any fields object
export const validateFields = fields => {
  const validationMap = {
    fullName: validateFullName,
    email: validateEmail,
    password: validatePassword,

    //Goals Validations
    category: validateGoalCategory,
    timelineType: validateTimelineType,
    selectedDays: validateSelectedDays,
    dailyCommitment: validateDailyCommitment,
    title: validateGoalTitle,
    description: validateGoalDescription,

    //Habits Validations
    category: validateHabitCategory,
    habitType: validateHabitType,
    title: validateHabitTitle,
    whyFactor: validateWhyFactor,
    habitTimeline: validateHabitTimeline,
    habitSelectedDays: validateHabitSelectedDays,
  };

  const errors = {};

  Object.keys(fields).forEach(field => {
    const validator = validationMap[field];
    if (validator) {
      const error = validator(fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

export const isValidInput = fields => {
  const errors = validateFields(fields);
  return Object.keys(errors).length === 0;
};
