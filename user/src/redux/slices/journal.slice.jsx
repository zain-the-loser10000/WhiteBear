/**
 * @file journals.slice.jsx
 * @module redux/slices/journalsSlice
 * @description Redux slice handling journal management, fetching, and state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

const SESSION_TOKEN_KEY = '@white_bear_session_token';

const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) throw new Error('User is not authenticated');
    return token;
  } catch (error) {
    return rejectWithValue({
      message: error.message || 'Failed to retrieve authentication token',
    });
  }
};

export const getAllJournals = createAsyncThunk(
  'journals/getAllJournals',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/journal/get-all-journals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        journals: response.data.allJournals,
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

export const getJournalCategories = createAsyncThunk(
  'journals/getJournalCategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/journal/get-journals-categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        journalCategories: response.data.journalCategories,
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

export const createNewJournal = createAsyncThunk(
  'journals/createNewJournal',
  async (journalPayload, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      // Backend expects properties at the root of the body object
      const response = await axios.post(
        `${BACKEND_API_URL}/journal/create-new-journal`,
        journalPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        newJournal: response.data.newJournal,
        message: response.data.message,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || 'Failed to submit journal to system.',
        status: error.response?.status,
      });
    }
  },
);

const initialState = {
  journals: [],
  currentJournal: null,
  journalCategories: null,
  loading: false,
  error: null,
  message: null,
};

const journalsSlice = createSlice({
  name: 'journals',
  initialState,
  reducers: {
    clearJournals: state => {
      state.journals = [];
      state.error = null;
      state.message = null;
    },
    clearCurrentJournal: state => {
      state.currentJournal = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAllJournals.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllJournals.fulfilled, (state, action) => {
        state.loading = false;
        state.journals = action.payload.journals;
        state.message = action.payload.message;
      })
      .addCase(getAllJournals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(getJournalCategories.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getJournalCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.journalCategories = action.payload.journalCategories;
        state.message = action.payload.message;
      })
      .addCase(getJournalCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(createNewJournal.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewJournal.fulfilled, (state, action) => {
        state.loading = false;
        const incomingRecord = action.payload.newJournal;
        state.message = action.payload.message;

        // Sync local immutable state. Avoid compound duplicate indices by ID verification
        const elementIndex = state.journals.findIndex(
          j => j._id === incomingRecord.id || j._id === incomingRecord._id,
        );

        if (elementIndex !== -1) {
          // Updates matching pre-existing documents directly
          state.journals[elementIndex] = {
            ...state.journals[elementIndex],
            ...incomingRecord,
            _id: incomingRecord.id || incomingRecord._id, // normalizing string translation variations
          };
        } else {
          // Unshifts clean records to top of array allocation blocks
          state.journals.unshift({
            ...incomingRecord,
            _id: incomingRecord.id || incomingRecord._id,
          });
        }
      })
      .addCase(createNewJournal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearJournals, clearCurrentJournal, clearError } =
  journalsSlice.actions;
export default journalsSlice.reducer;
