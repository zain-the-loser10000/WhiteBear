/**
 * @file habit.constants.js
 * @module constants/habitConstant
 * @description Centralized configuration maps for the 4-step habit builder wizard and predefined suggestions.
 */

const HABIT_CATEGORIES = {
  FAMILY_RELATIONSHIPS: 'family_relationships',
  CAREER_FINANCES: 'career_finances',
  FITNESS_NUTRITION: 'fitness_nutrition',
  MENTAL_WELLNESS: 'mental_wellness',
  FUN_LEISURE: 'fun_leisure',
  SPIRITUALITY: 'spirituality',
  LIFE_PURPOSE: 'life_purpose',
  REMINDER: 'reminder',
  CUSTOM: 'custom',
};

const HABIT_TYPES = {
  MAKE: 'make',
  BREAK: 'break',
};

/**
 * Predefined suggested habits (as shown in the Suggested Habits UI)
 * Mapped by Category -> Make/Break -> Habit Details
 */
const HABIT_TEMPLATES = {
  // FAMILY_RELATIONSHIPS
  [HABIT_CATEGORIES.FAMILY_RELATIONSHIPS]: {
    [HABIT_TYPES.MAKE]: [
      {
        title: 'Check in with a friend',
        stop: 'Neglecting relationships.',
        start: 'Call or text a friend weekly.',
        continue: 'Stronger friendships and better social support.',
      },
      {
        title: 'Eat dinner with family',
        stop: 'Eating alone or in front of screens.',
        start: 'Sit down at the table for dinner.',
        continue: 'Deeper family connection and presence.',
      },
    ],
    [HABIT_TYPES.BREAK]: [
      {
        title: 'Arriving late to functions',
        stop: 'Poor time management leading to tardiness.',
        start: 'Plan to arrive 15 minutes early.',
        continue: 'Building trust and respect for others time.',
      },
      {
        title: "Neglecting family and friends' need for attention",
        stop: 'Prioritizing work over loved ones consistently.',
        start: 'Schedule dedicated block time for family.',
        continue: 'Healthy work-life boundaries.',
      },
    ],
  },

  //  CAREER & FINANCES SUGGESTIONS
  [HABIT_CATEGORIES.CAREER_FINANCES]: {
    [HABIT_TYPES.MAKE]: [
      {
        title: 'Weekly spending review',
        stop: 'Ignoring bank statements.',
        start: 'Review accounts every Sunday.',
        continue: 'Financial clarity and control.',
      },
      {
        title: 'Maintain work-life balance',
        stop: 'Checking emails after 7 PM.',
        start: 'Turn off work notifications.',
        continue: 'Restful evenings and reduced burnout.',
      },
    ],
    [HABIT_TYPES.BREAK]: [
      {
        title: 'Saying yes to everything asked of you',
        stop: 'People-pleasing at work.',
        start: 'Evaluate requests before accepting.',
        continue: 'Protecting personal bandwidth.',
      },
      {
        title: 'Impulse buying',
        stop: 'One-click online shopping.',
        start: 'Implement a 24-hour waiting rule.',
        continue: 'Increased savings and intentional spending.',
      },
    ],
  },

  //  FITNESS & NUTRITION SUGGESTIONS
  [HABIT_CATEGORIES.FITNESS_NUTRITION]: {
    [HABIT_TYPES.MAKE]: [
      {
        title: 'Incorporate more movement into your daily routine',
        stop: 'Sitting for 8 hours straight.',
        start: 'Take a 10-minute walk every day.',
        continue: 'Higher energy and cardiovascular health.',
      },
      {
        title: 'Limit processed foods',
        stop: 'Eating packaged snacks.',
        start: 'Substitute with whole fruits.',
        continue: 'Better digestion and nutrient intake.',
      },
    ],
  },

  //  MENTAL WELLNESS SUGGESTIONS
  [HABIT_CATEGORIES.MENTAL_WELLNESS]: {
    [HABIT_TYPES.MAKE]: [
      {
        title: 'Morning mindfulness meditation',
        stop: 'Waking up & checking mobile',
        start: 'Sit quietly for 5 minutes.',
        continue: 'Reduced morning anxiety start to your day.',
      },
      {
        title: 'Daily emotional processing journal',
        stop: 'Suppressing stress from uncomfortable thoughts.',
        start: 'Write out two raw pages of thoughts every evening.',
        continue: 'Clearer mental processing & deep decompression.',
      },
    ],
    [HABIT_TYPES.BREAK]: [
      {
        title: 'Doomscrolling negative news feeds',
        stop: 'Mindlessly scrolling social media when anxious.',
        start: 'Charge your phone in another room for 45 minutes before bed.',
        continue:
          'Protected sleep hygiene, calmer headspace, and lower baseline cortisol.',
      },
      {
        title: 'Harsh internal negative self-talk',
        stop: 'Berating yourself when you make mistakes.',
        start: 'Catch thought and write realistic reassessment',
        continue: 'Stronger healthier internal relationship.',
      },
    ],
  },

  //  FUN & LEISURE SUGGESTIONS
  [HABIT_CATEGORIES.FUN_LEISURE]: {
    [HABIT_TYPES.MAKE]: [
      {
        title: "Carve out dedicated 'me-time' for a hobby",
        stop: 'Sacrificing personal playtime due to productivity or work guilt.',
        start:
          'Block out 2 hours every weekend explicitly for painting, gaming, or crafting.',
        continue:
          'Sustained creative excitement and actionable protection against mental burnout.',
      },
      {
        title: 'Read engaging literature for pleasure',
        stop: 'Watching high-stimulation video streams or TV shows late into the night.',
        start:
          'Open a physical book or fiction novel and read for 15 minutes in bed.',
        continue:
          'A naturally relaxed nervous system and seamless transitions into deep sleep.',
      },
    ],
    [HABIT_TYPES.BREAK]: [
      {
        title: 'Binge-watching streaming series past midnight',
        stop: 'Letting video platforms autoplay continuous episodes when you are already exhausted.',
        start:
          'Set a hard television and display power-cutoff rule at exactly 11:00 PM.',
        continue:
          'Consistent morning waking stamina and respect for your physical body.',
      },
      {
        title: 'Over-scheduling weekends with hyper-rigid plans',
        stop: 'Treating days off like a secondary checklist job, exhausting your social batteries.',
        start:
          'Keep at least one full afternoon entirely blank for completely spontaneous relaxation.',
        continue:
          'Authentic physical unwinding and breathing room in your lifestyle design.',
      },
    ],
  },

  //  SPIRITUALITY SUGGESTIONS
  [HABIT_CATEGORIES.SPIRITUALITY]: {
    [HABIT_TYPES.MAKE]: [
      {
        title: 'Daily silent meditation',
        stop: 'Starting the day in mental chaos and distraction.',
        start: 'Spend 10 minutes in quiet meditation or prayer each morning.',
        continue:
          'Calmer mind, stronger intuition, and a deeper sense of peace.',
      },
      {
        title: 'Practice loving-kindness',
        stop: 'Reacting from judgment or self-criticism.',
        start:
          'Offer a compassionate intention for yourself and others every day.',
        continue:
          'Greater empathy, inner harmony, and a more connected spiritual life.',
      },
    ],
    [HABIT_TYPES.BREAK]: [
      {
        title: 'Relying on external approval for worth',
        stop: 'Seeking validation from others instead of trusting yourself.',
        start:
          'Notice when you crave praise and choose self-acceptance instead.',
        continue:
          'Steadier self-worth and a stronger, more autonomous spiritual path.',
      },
      {
        title: 'Ignoring your inner guidance',
        stop: 'Pushing through choices without checking in with your intuition.',
        start: 'Pause before decisions and ask what feels aligned for you.',
        continue: 'Clearer direction and more trust in your spiritual journey.',
      },
    ],
  },

  //  LIFE_PURPOSE SUGGESTIONS
  [HABIT_CATEGORIES.LIFE_PURPOSE]: {
    [HABIT_TYPES.MAKE]: [
      {
        title: 'Define your personal mission statement',
        stop: 'Drifting through days without clear intention.',
        start:
          'Write down what matters most to you and what you want to contribute.',
        continue:
          'Sharper focus and a stronger sense of meaning in your actions.',
      },
      {
        title: 'Take one aligned step toward your long-term goals',
        stop: 'Putting off progress because the path feels overwhelming.',
        start:
          'Choose one small task today that moves you closer to your purpose.',
        continue: 'Steady momentum and growing confidence in your direction.',
      },
    ],
    [HABIT_TYPES.BREAK]: [
      {
        title: 'Chasing what others expect of you',
        stop: 'Making decisions based on approval rather than purpose.',
        start: 'Pause and ask if this choice aligns with your deeper values.',
        continue:
          'Greater authenticity and progress toward the life you actually want.',
      },
      {
        title: 'Allowing fear of failure to halt action',
        stop: 'Waiting for perfect conditions before starting.',
        start: 'Take one imperfect step forward today.',
        continue:
          'More momentum, less anxiety, and a stronger belief in your ability.',
      },
    ],
  },
};

// Based strictly on the UI screenshot values
const HABIT_TIMELINES = ['20_days', '30_days', '60_days', 'custom'];

const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const NOTIFICATION_SOUNDS = [
  'silent',
  'toing',
  'ting_tong_ting',
  'ting_tong',
  'ding',
];

module.exports = {
  HABIT_CATEGORIES,
  HABIT_CATEGORY_VALUES: Object.values(HABIT_CATEGORIES),
  HABIT_TYPES,
  HABIT_TYPE_VALUES: Object.values(HABIT_TYPES),
  HABIT_TEMPLATES,
  HABIT_TIMELINES,
  WEEKDAYS,
  NOTIFICATION_SOUNDS,
};
