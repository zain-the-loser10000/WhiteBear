/**
 * @file journalAnalytics.slice.js
 * @module redux/slices/journalAnalyticsSlice
 * @description Redux slice aligned with dynamic MongoDB sub-type snapshots (Journals, TODOs, Goals, Habits).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;
const SESSION_TOKEN_KEY = '@white_bear_session_token';

/**
 * @description State safe normalization mapping to fall back cleanly if integers leak from UI components
 */
const REVERSE_RANGE_MAPPING = {
  15: 'biweekly',
  30: 'monthly',
  90: 'quarterly',
  biweekly: 'biweekly',
  monthly: 'monthly',
  quarterly: 'quarterly',
};

// Helper to normalize the mode parameter sent from component layers
const getNormalizedRangeStr = input =>
  REVERSE_RANGE_MAPPING[input] || 'biweekly';

// ==========================================
// 1. ASYNC THUNKS (ALL 4 CORE BACKEND SNAPSHOT CHANNELS)
// ==========================================

export const fetchJournalAnalytics = createAsyncThunk(
  'analytics/fetchJournal',
  async (rangeMode, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const rangeParam = getNormalizedRangeStr(rangeMode);

      const response = await axios.get(
        `${BACKEND_API_URL}/analytic/get-journal-analytic`,
        {
          params: { range: rangeParam },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // 🟢 Fixed: Backend dumps inside payload data wrapping object
      const { success, message, data } = response.data;
      if (!success) throw new Error(message);

      return {
        // Humnay scheduler mein data.journals ke andar payload rakha hua hai
        journalAnalytics: data?.journals ?? null,
        message,
        rangeEvaluated: rangeParam,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message,
        success: backend?.success ?? false,
        status: error.response?.status,
      });
    }
  },
);

export const fetchTodoAnalytics = createAsyncThunk(
  'analytics/fetchTodo',
  async (rangeMode, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const rangeParam = getNormalizedRangeStr(rangeMode);

      const response = await axios.get(
        `${BACKEND_API_URL}/analytic/get-todo-analytic`,
        {
          params: { range: rangeParam },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { success, message, data, meta } = response.data;
      if (!success) throw new Error(message);

      return {
        // 🟢 Fixed: Extracting target mapping safely from schema payload layouts
        todoData: data?.todos ?? null,
        todoMeta: meta ?? null,
        message,
        rangeEvaluated: rangeParam,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message,
        success: backend?.success ?? false,
        status: error.response?.status,
      });
    }
  },
);

export const fetchGoalAnalytics = createAsyncThunk(
  'analytics/fetchGoal',
  async (rangeMode, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const rangeParam = getNormalizedRangeStr(rangeMode);

      const response = await axios.get(
        `${BACKEND_API_URL}/analytic/get-goal-analytic`,
        {
          params: { range: rangeParam },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { success, message, data } = response.data;
      if (!success) throw new Error(message);

      return {
        // 🟢 Fixed: Mapping into sub-attribute dynamic layouts
        goalData: data?.goals ?? null,
        message,
        rangeEvaluated: rangeParam,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message,
        success: backend?.success ?? false,
        status: error.response?.status,
      });
    }
  },
);

export const fetchHabitAnalytics = createAsyncThunk(
  'analytics/fetchHabit',
  async (rangeMode, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const rangeParam = getNormalizedRangeStr(rangeMode);

      const response = await axios.get(
        `${BACKEND_API_URL}/analytic/get-habit-analytic`,
        {
          params: { range: rangeParam },
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { success, message, data } = response.data;
      if (!success) throw new Error(message);

      return {
        // 🟢 Fixed: Extracts perfectly from the dynamic habits array payload
        habitData: data?.habits ?? null,
        message,
        rangeEvaluated: rangeParam,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message,
        success: backend?.success ?? false,
        status: error.response?.status,
      });
    }
  },
);

// ==========================================
// 2. INITIAL STATE & UTILS
// ==========================================

const initialState = {
  journalData: null,
  todoData: null,
  todoMeta: null,
  goalData: null,
  habitData: null,
  loading: false,
  error: null,
  message: null,
  currentRange: 15,
  timestamp: null,
};

const getMessageFromPayload = actionPayload => {
  if (!actionPayload) return null;
  if (typeof actionPayload === 'string') return actionPayload;
  if (actionPayload.message) return actionPayload.message;
  return null;
};

// ==========================================
// 3. SLICE DEFINITION
// ==========================================

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearJournalAnalyticsState: state => {
      state.journalData = null;
      state.error = null;
      state.message = null;
    },
    clearTodoAnalyticsState: state => {
      state.todoData = null;
      state.todoMeta = null;
      state.error = null;
      state.message = null;
    },
    clearGoalAnalyticsState: state => {
      state.goalData = null;
      state.error = null;
      state.message = null;
    },
    clearHabitAnalyticsState: state => {
      state.habitData = null;
      state.error = null;
      state.message = null;
    },
    resetAllAnalyticsState: () => initialState,
    setTrackingRange: (state, action) => {
      state.currentRange = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // 👑 RULE RUNNING: Saare .addCase humesha .addMatcher se PEHLE

      // --- Journal Analytics Success Case ---
      .addCase(fetchJournalAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.journalData = action.payload?.journalAnalytics;
        state.message = action.payload?.message ?? null;
      })
      // --- Todo Analytics Success Case ---
      .addCase(fetchTodoAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.todoData = action.payload?.todoData;
        state.todoMeta = action.payload?.todoMeta;
        state.message = action.payload?.message ?? null;
      })
      // --- Goal Analytics Success Case ---
      .addCase(fetchGoalAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.goalData = action.payload?.goalData;
        state.message = action.payload?.message ?? null;
      })
      // --- Habit Analytics Success Case ---
      .addCase(fetchHabitAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.habitData = action.payload?.habitData;
        state.message = action.payload?.message ?? null;
      })

      // 🎯 Matchers execution blocks at the absolute end

      // --- Shared Pending State Logic ---
      .addMatcher(
        action =>
          action.type.endsWith('/pending') &&
          action.type.startsWith('analytics/'),
        state => {
          state.loading = true;
          state.error = null;
          state.message = null;
        },
      )
      // --- Shared Rejected State Logic ---
      .addMatcher(
        action =>
          action.type.endsWith('/rejected') &&
          action.type.startsWith('analytics/'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? action.error?.message;
          state.message =
            getMessageFromPayload(action.payload) ??
            action.error?.message ??
            null;
        },
      );
  },
});

export const {
  clearJournalAnalyticsState,
  clearTodoAnalyticsState,
  clearGoalAnalyticsState,
  clearHabitAnalyticsState,
  resetAllAnalyticsState,
  setTrackingRange,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
