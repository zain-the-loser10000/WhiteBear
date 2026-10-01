/**
 * @file habitsSlice.js
 * @module redux/slices/habitsSlice
 * @description Redux slice handling habit orchestration, AI Stop-Start-Continue blueprint previews, and habit state tracking.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;
const SESSION_TOKEN_KEY = '@white_bear_session_token';

// Helper utility to retrieve session token
const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) throw new Error('User is not authenticated');
    return token;
  } catch (error) {
    return rejectWithValue({
      message: error.message,
    });
  }
};

/* ========================================================================== */
/* ASYNC THUNKS MATRIX                                                        */
/* ========================================================================== */

// 🧠 AI Behavioral Blueprint Generation Engine
export const generateAiAssistedActionables = createAsyncThunk(
  'habits/generateAiAssistedActionables',
  async ({ title, category, habitType }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/habit/generate-ai-habit-actionable`, // Adjust endpoint path if nested differently under routing layers
        { title, category, habitType },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.actionables; // Returns { stop: '...', start: '...', continue: '...' }
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          'Failed to generate behavioral actionables.',
        status: error.response?.status,
      });
    }
  },
);

// ⚡ Wizard Creation Pipeline Document Builder
export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitPayload, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/habit/generate-new-habit`,
        habitPayload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        habit: response.data.newHabit,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          'Failed to establish habit blueprint.',
        status: error.response?.status,
      });
    }
  },
);

// 🔍 Query Fetch Matcher
export const getAllHabits = createAsyncThunk(
  'habits/getAllHabits',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/habit/get-all-habits`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        habits: response.data.allHabits,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || 'Failed to sync habits roster.',
        status: error.response?.status,
      });
    }
  },
);

// 🛠️ Structural Mutation Operation Updates
export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async ({ habitId, ...updatePayload }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.patch(
        `${BACKEND_API_URL}/habit/update-habit/${habitId}`,
        updatePayload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        habitId,
        updatedHabit: response.data.updatedHabit,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || 'Failed to revise habit structures.',
        status: error.response?.status,
      });
    }
  },
);

// 🗑️ Destruction Routine
export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async ({ habitId }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      let habitIdString = '';

      if (typeof habitId === 'string') {
        habitIdString = habitId;
      } else if (typeof habitId === 'object' && habitId !== null) {
        if (habitId.toString && typeof habitId.toString === 'function') {
          habitIdString = habitId.toString();
        } else if (habitId._id) {
          habitIdString =
            typeof habitId._id === 'object'
              ? habitId._id.toString()
              : String(habitId._id);
        } else if (habitId.id) {
          habitIdString =
            typeof habitId.id === 'object'
              ? habitId.id.toString()
              : String(habitId.id);
        }
      } else {
        habitIdString = String(habitId);
      }

      console.log('🗑️ Delete Habit - Normalized ID:', habitIdString);

      const response = await axios.delete(
        `${BACKEND_API_URL}/habit/delete-habit/${habitIdString}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return {
        habitId: habitIdString,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Delete Habit Error:', error.message);
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          'Failed to delete execution cycle habit.',
        status: error.response?.status,
      });
    }
  },
);

export const getHabitsConstants = createAsyncThunk(
  'habits/getHabitsConstants',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/habit/get-habit-categories`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return {
        habitsConstants: response.data.habitConstants,
        message: response.data.message,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message,
        status: error.response?.status,
      });
    }
  },
);

// ✅ Actionable Toggle Engine
export const toggleActionableCompletion = createAsyncThunk(
  'habits/toggleActionableCompletion',
  async (
    { habitId, targetDate, actionKey, isCompleted },
    { rejectWithValue, getState },
  ) => {
    try {
      const token = await getToken(rejectWithValue);

      // Get current habit state to determine if it's already completed
      const state = getState();
      const habit = state.habits.habits.find(
        h => h._id === habitId || h.id === habitId,
      );

      // Find the log for the target date
      const dateStr = new Date(targetDate).toISOString().split('T')[0];
      const log = habit?.trackingLogs?.find(l => {
        const logDate = l.date instanceof Date ? l.date : new Date(l.date);
        return logDate.toISOString().split('T')[0] === dateStr;
      });

      // Determine current completion state
      let currentCompletion = false;
      if (actionKey === 'stop')
        currentCompletion = log?.isStopCompleted || false;
      else if (actionKey === 'start')
        currentCompletion = log?.isStartCompleted || false;
      else if (actionKey === 'continue')
        currentCompletion = log?.isContinueCompleted || false;

      // Toggle the value
      const newCompletion = !currentCompletion;

      const response = await axios.patch(
        `${BACKEND_API_URL}/habit/mark-actionable-complete/${habitId}`,
        {
          targetDate,
          actionKey,
          isCompleted: newCompletion, // Send the toggled value
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        habitId,
        updatedHabit: response.data.habit,
        dailyScorePercentage: response.data.dailyScorePercentage,
        currentDayLog: response.data.currentDayLog,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || 'Failed to toggle actionable.',
        status: error.response?.status,
      });
    }
  },
);

/* ========================================================================== */
/* SLICE STATE SLOTS                                                          */
/* ========================================================================== */

const initialState = {
  habits: [],
  generatedAiActionables: null, // Slots Stop-Start-Continue objects
  habitsConstants: null,
  loading: false,
  aiLoading: false,
  error: null,
  message: null,
};

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    clearHabitsState: state => {
      state.habits = [];
      state.error = null;
      state.message = null;
    },
    clearAiActionables: state => {
      state.generatedAiActionables = null;
    },
    clearHabitsError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // AI Blueprint Matchers
      .addCase(generateAiAssistedActionables.pending, state => {
        state.aiLoading = true;
        state.error = null;
      })
      .addCase(generateAiAssistedActionables.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.generatedAiActionables = action.payload;
      })
      .addCase(generateAiAssistedActionables.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload;
      })

      // Creation Engine Matchers
      .addCase(createHabit.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHabit.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.habit) {
          state.habits.unshift(action.payload.habit);
        }
        state.message = action.payload.message;
      })
      .addCase(createHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Query Fetch Matchers
      .addCase(getAllHabits.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload.habits;
        state.message = action.payload.message;
      })
      .addCase(getAllHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Structural Mutation Matchers
      .addCase(updateHabit.pending, state => {
        state.loading = true;
      })
      .addCase(updateHabit.fulfilled, (state, action) => {
        state.loading = false;
        const { habitId, updatedHabit } = action.payload;
        const index = state.habits.findIndex(
          h => h._id === habitId || h.id === habitId,
        );
        if (index !== -1) {
          state.habits[index] = updatedHabit;
        }
        state.message = action.payload.message;
      })
      .addCase(updateHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Destruction Routine Eviction Matchers
      .addCase(deleteHabit.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.loading = false;
        const { habitId } = action.payload;
        state.habits = state.habits.filter(h => {
          let hId = '';
          if (h._id) {
            hId = typeof h._id === 'object' ? h._id.toString() : String(h._id);
          } else if (h.id) {
            hId = typeof h.id === 'object' ? h.id.toString() : String(h.id);
          }
          return hId !== habitId;
        });
        state.message = action.payload.message;
      })
      .addCase(deleteHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(getHabitsConstants.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getHabitsConstants.fulfilled, (state, action) => {
        state.loading = false;
        state.habitsConstants = action.payload.habitsConstants;
        state.message = action.payload.message;
      })
      .addCase(getHabitsConstants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // 🔄 Actionable Toggle – Optimistic update
      .addCase(toggleActionableCompletion.pending, (state, action) => {
        const { habitId, targetDate, actionKey, isCompleted } = action.meta.arg;
        const habitIndex = state.habits.findIndex(
          h => h._id === habitId || h.id === habitId,
        );
        if (habitIndex !== -1) {
          const habit = state.habits[habitIndex];
          const searchDate = new Date(targetDate);
          searchDate.setUTCHours(0, 0, 0, 0);
          const isoDate = searchDate.toISOString().split('T')[0];
          let log = habit.trackingLogs?.find(
            l => l.date?.toISOString?.()?.split?.('T')[0] === isoDate,
          );
          if (!log) {
            const newLog = {
              date: searchDate,
              isStopCompleted: false,
              isStartCompleted: false,
              isContinueCompleted: false,
              dailyScorePercentage: 0,
            };
            habit.trackingLogs = habit.trackingLogs || [];
            habit.trackingLogs.push(newLog);
            log = habit.trackingLogs[habit.trackingLogs.length - 1];
          }
          // Apply toggle (only if not already completed)
          if (actionKey === 'stop' && !log.isStopCompleted) {
            log.isStopCompleted = isCompleted;
          } else if (actionKey === 'start' && !log.isStartCompleted) {
            log.isStartCompleted = isCompleted;
          } else if (actionKey === 'continue' && !log.isContinueCompleted) {
            log.isContinueCompleted = isCompleted;
          }
          // Recalculate score
          let itemsAchieved = 0;
          if (log.isStopCompleted) itemsAchieved++;
          if (log.isStartCompleted) itemsAchieved++;
          if (log.isContinueCompleted) itemsAchieved++;
          log.dailyScorePercentage = Math.round((itemsAchieved / 3) * 100);
        }
      })
      .addCase(toggleActionableCompletion.fulfilled, (state, action) => {
        const { habitId, updatedHabit, message } = action.payload;
        const index = state.habits.findIndex(
          h => h._id === habitId || h.id === habitId,
        );
        if (index !== -1) {
          state.habits[index] = updatedHabit;
        }
        state.message = message;
        state.error = null;
      })
      .addCase(toggleActionableCompletion.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { clearHabitsState, clearAiActionables, clearHabitsError } =
  habitsSlice.actions;

export default habitsSlice.reducer;
