/**
 * @file goal.constants.js
 * @module constants/goalConstant
 * @description Centralized configuration maps for mental wellness goal tracking wizards and AI prompts.
 */

const GOAL_CATEGORIES = {
  FAMILY_RELATIONSHIPS: 'family_relationships',
  MINDFULNESS_FOCUS: 'mindfulness_focus',
  SLEEP_RECOVERY: 'sleep_recovery',
  SELF_CARE_REFLECTION: 'self_care_reflection',
  PHYSICAL_WELLNESS: 'physical_wellness',
  EMOTIONAL_RESILIENCE: 'emotional_resilience',
  BOUNDARIES_BALANCE: 'boundaries_balance',
  CUSTOM: 'custom',
};


/**
 * Predefined template titles per wellness category
 * Useful for frontend dropdowns and backend validation
 */
const GOAL_TEMPLATES = {
  [GOAL_CATEGORIES.FAMILY_RELATIONSHIPS]: [
    'Improve communication with loved ones',
    'Spend quality time with family and friends',
  ],
  [GOAL_CATEGORIES.MINDFULNESS_FOCUS]: [
    'Establish a grounding daily meditation habit',
    'Practice deep-breathing cycles during high-stress windows',
  ],
  [GOAL_CATEGORIES.SLEEP_RECOVERY]: [
    'Build a consistent, tech-free sleep hygiene routine',
    'Unwind mindfully 30 minutes before bed',
  ],
  [GOAL_CATEGORIES.SELF_CARE_REFLECTION]: [
    'Keep a daily raw emotional processing journal',
    "Carve out dedicated, guilt-free weekly 'me-time'",
  ],
  [GOAL_CATEGORIES.PHYSICAL_WELLNESS]: [
    'Maintain baseline body hydration levels',
    'Integrate low-impact mindful movement or yoga',
  ],
  [GOAL_CATEGORIES.EMOTIONAL_RESILIENCE]: [
    'Track personal mood triggers to pinpoint patterns',
    'Practice a daily active gratitude reflection session',
  ],
  [GOAL_CATEGORIES.BOUNDARIES_BALANCE]: [
    'Implement strict professional disconnect hours',
    "Say 'no' to draining commitments to guard energy",
  ],
  [GOAL_CATEGORIES.CUSTOM]: [],
};

const TIMELINE_TYPES = ['1_week', '1_month', '3_months', 'custom'];

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DAILY_COMMITMENTS = [
  '15m',
  '30m',
  '1h',
  '2h',
  '3h',
  '4h',
  '6h',
  '8h',
  '10h',
];

module.exports = {
  GOAL_CATEGORIES,
  GOAL_ENUM_VALUES: Object.values(GOAL_CATEGORIES),
  GOAL_TEMPLATES,
  TIMELINE_TYPES,
  WEEKDAYS,
  DAILY_COMMITMENTS,
};
