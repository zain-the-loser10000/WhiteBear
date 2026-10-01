/**
 * @file goalsSlice.js
 * @module redux/slices/goalsSlice
 * @description Redux slice handling goal orchestration, AI description previews, and roadmap tasks management.
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

export const generateAiDescription = createAsyncThunk(
  'goals/generateAiDescription',
  async ({ category, title }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/goal/generate-ai-description`,
        { category, title },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.description;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message,
        status: error.response?.status,
      });
    }
  },
);

export const generateNewGoal = createAsyncThunk(
  'goals/generateNewGoal',
  async (goalPayload, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/goal/generate-new-goal`,
        goalPayload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        goal: response.data.newGoal,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message,
        status: error.response?.status,
      });
    }
  },
);

export const getAllGoals = createAsyncThunk(
  'goals/getAllGoals',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/goal/get-user-goals`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        goals: response.data.allGoals,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message,
        status: error.response?.status,
      });
    }
  },
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ goalId, title, description }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.patch(
        `${BACKEND_API_URL}/goal/update-goal/${goalId}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return {
        goalId,
        updatedGoal: response.data.updatedGoal,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message,
        status: error.response?.status,
      });
    }
  },
);

export const toggleTaskStatus = createAsyncThunk(
  'goals/toggleTaskStatus',
  async ({ goalId, taskId, isCompleted }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/goal/${goalId}/task/${taskId}`,
        { isCompleted },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return {
        goalId,
        taskId,
        isCompleted,
        updatedGoal: response.data.goal,
        analytics: response.data.analytics,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || 'Failed to toggle task status.',
        status: error.response?.status,
      });
    }
  },
);

export const markGoalCompleted = createAsyncThunk(
  'goals/markGoalCompleted',
  async ({ goalId }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/goal/mark-goal-completed/${goalId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return {
        goalId,
        updatedGoal: response.data.goal,
        analytics: response.data.analytics,
        message: response.data.message,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || 'Failed to complete goal cascade.',
        status: error.response?.status,
      });
    }
  },
);

// ✅ FIXED: Robust Delete Goal Thunk
export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async ({ goalId }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      // ✅ Robust ID extraction - handles object, string, or ObjectId
      let goalIdString = '';

      if (typeof goalId === 'string') {
        goalIdString = goalId;
      } else if (typeof goalId === 'object' && goalId !== null) {
        // Handle MongoDB ObjectId or any object with toString
        if (goalId.toString && typeof goalId.toString === 'function') {
          goalIdString = goalId.toString();
        } else if (goalId._id) {
          // If it's an object with _id property
          goalIdString =
            typeof goalId._id === 'object'
              ? goalId._id.toString()
              : String(goalId._id);
        } else if (goalId.id) {
          // If it's an object with id property
          goalIdString =
            typeof goalId.id === 'object'
              ? goalId.id.toString()
              : String(goalId.id);
        }
      } else {
        // Fallback: convert to string
        goalIdString = String(goalId);
      }

      console.log('🗑️ Delete Goal - Normalized ID:', goalIdString);

      const response = await axios.delete(
        `${BACKEND_API_URL}/goal/delete-goal/${goalIdString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        goalId: goalIdString,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Delete Goal Error:', error.message);
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to delete goal.',
        status: error.response?.status,
      });
    }
  },
);

export const getGoalsConstants = createAsyncThunk(
  'goals/getGoalsConstants',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/goal/get-goals-categories`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return {
        goalsConstants: response.data.goalConstants,
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

/* ========================================================================== */
/* SLICE STATE SLOTS                                                          */
/* ========================================================================== */

const initialState = {
  goals: [],
  generatedAiDescription: null,
  analytics: null,
  goalsConstants: null,
  loading: false,
  aiLoading: false,
  error: null,
  message: null,
};

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalsState: state => {
      state.goals = [];
      state.error = null;
      state.message = null;
    },
    clearAiDescription: state => {
      state.generatedAiDescription = null;
    },
    clearGoalsError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // AI Description Engine Matchers
      .addCase(generateAiDescription.pending, state => {
        state.aiLoading = true;
        state.error = null;
      })
      .addCase(generateAiDescription.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.generatedAiDescription = action.payload;
      })
      .addCase(generateAiDescription.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload;
      })

      // Goal Document Builders
      .addCase(generateNewGoal.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateNewGoal.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.goal) {
          state.goals.unshift(action.payload.goal);
        }
        state.message = action.payload.message;
      })
      .addCase(generateNewGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Query Fetch Matchers
      .addCase(getAllGoals.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload.goals;
        state.message = action.payload.message;
      })
      .addCase(getAllGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Patch / Structural Mutation Operations
      .addCase(updateGoal.pending, state => {
        state.loading = true;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        const { goalId, updatedGoal } = action.payload;
        const index = state.goals.findIndex(
          g => g._id === goalId || g.id === goalId,
        );
        if (index !== -1) {
          state.goals[index] = updatedGoal;
        }
        state.message = action.payload.message;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔥 OPTIMIZED AUTOMATION: Task toggle status update + auto goal completion check
      .addCase(toggleTaskStatus.pending, (state, action) => {
        const { goalId, taskId, isCompleted } = action.meta.arg;
        const goalIndex = state.goals.findIndex(
          g => g._id === goalId || g.id === goalId,
        );

        if (goalIndex !== -1) {
          const goal = state.goals[goalIndex];
          const tasksKey = goal.tasks
            ? 'tasks'
            : goal.roadmap
            ? 'roadmap'
            : null;

          if (tasksKey) {
            goal[tasksKey] = goal[tasksKey].map(t =>
              t._id === taskId || t.id === taskId ? { ...t, isCompleted } : t,
            );

            const areAllTasksDone = goal[tasksKey].every(t => t.isCompleted);
            if (areAllTasksDone && isCompleted) {
              goal.isCompleted = true;
            } else if (!isCompleted) {
              goal.isCompleted = false;
            }
          }
        }
      })
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const { goalId, updatedGoal, analytics } = action.payload;
        const index = state.goals.findIndex(
          g => g._id === goalId || g.id === goalId,
        );
        if (index !== -1) {
          state.goals[index] = updatedGoal;

          const tasksKey = updatedGoal.tasks
            ? 'tasks'
            : updatedGoal.roadmap
            ? 'roadmap'
            : null;
          if (tasksKey) {
            const areAllTasksDone = updatedGoal[tasksKey].every(
              t => t.isCompleted,
            );
            if (areAllTasksDone) {
              state.goals[index].isCompleted = true;
            }
          }
        }
        state.analytics = analytics;
        state.message = action.payload.message;
      })
      .addCase(toggleTaskStatus.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // 🔥 AUTOMATION CASCADE: Goal mark complete
      // 🔥 AUTOMATION CASCADE: Goal mark complete
      .addCase(markGoalCompleted.pending, (state, action) => {
        const { goalId } = action.meta.arg;
        const index = state.goals.findIndex(
          g => g._id === goalId || g.id === goalId,
        );
        if (index !== -1) {
          state.goals[index].isCompleted = true;
          state.goals[index].status = 'completed'; // ✅ Also update status

          const tasksKey = state.goals[index].tasks
            ? 'tasks'
            : state.goals[index].roadmap
            ? 'roadmap'
            : null;
          if (tasksKey) {
            state.goals[index][tasksKey] = state.goals[index][tasksKey].map(
              task => ({
                ...task,
                isCompleted: true,
              }),
            );
          }
        }
      })
      .addCase(markGoalCompleted.fulfilled, (state, action) => {
        const { goalId, updatedGoal, analytics } = action.payload;
        const index = state.goals.findIndex(
          g => g._id === goalId || g.id === goalId,
        );
        if (index !== -1) {
          state.goals[index] = updatedGoal;
          // ✅ Ensure both fields are in sync
          state.goals[index].isCompleted = true;
          state.goals[index].status = 'completed';
        }
        state.analytics = analytics;
        state.message = action.payload.message;
      })
      .addCase(markGoalCompleted.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // ✅ FIXED: Destruction Routines
      .addCase(deleteGoal.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        const { goalId } = action.payload;
        state.goals = state.goals.filter(g => {
          // Safely extract ID from goal object
          let gId = '';
          if (g._id) {
            gId = typeof g._id === 'object' ? g._id.toString() : String(g._id);
          } else if (g.id) {
            gId = typeof g.id === 'object' ? g.id.toString() : String(g.id);
          }
          return gId !== goalId;
        });
        state.message = action.payload.message;
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      // Fixed Thunk Matcher
      .addCase(getGoalsConstants.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getGoalsConstants.fulfilled, (state, action) => {
        state.loading = false;
        state.goalsConstants = action.payload.goalsConstants;
        state.message = action.payload.message;
      })
      .addCase(getGoalsConstants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { clearGoalsState, clearAiDescription, clearGoalsError } =
  goalsSlice.actions;
export default goalsSlice.reducer;
