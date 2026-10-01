/**
 * @file journal.constants.js
 * @module constants/journalConstant
 * @description Centralized configuration, type definitions, and UI reflection prompts for journals.
 */

const JOURNAL_TYPES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
};

const DAILY_PROMPTS = {
  MOOD: 'My mood today...',
  MEMORABLE_MOMENT: "I'll remember this day by...",
  CHALLENGES: 'Challenges I am facing...',
};

const WEEKLY_PROMPTS = {
  BIG_WINS: 'What were the big wins?',
  WHAT_COULD_BE_BETTER: 'What could be better?',
  DID_YOU_GROW: 'Did you grow?',
  CHALLENGES: 'Challenges I am facing...', // Shared field category
};

module.exports = {
  JOURNAL_TYPES,
  DAILY_PROMPTS,
  WEEKLY_PROMPTS,
};
