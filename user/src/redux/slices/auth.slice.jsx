/**
 * @file auth.slice.jsx
 * @module redux/slices/authSlice
 * @description Redux slice for authentication actions, token persistence, and state management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CONFIG from '../config/Config';
import { updateUser } from './user.slice'; // Imported to establish native internal cross-slice mirroring

const { BACKEND_API_URL } = CONFIG;
const SESSION_TOKEN_KEY = '@white_bear_session_token';

export const registerUser = createAsyncThunk(
  'user/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/user/signup-user`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const { message, success, user } = response.data;
      if (typeof success !== 'boolean')
        throw new Error('Invalid registration response');

      return { message, success, user: user ?? null };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Registration failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/user/signin-user`, {
        email,
        password,
      });

      const { success, message, user, token } = response.data;
      if (!success || !token)
        throw new Error(message || 'Authentication failed');

      await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
      return { user, token, message };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Authentication failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const response = await axios.post(
        `${BACKEND_API_URL}/user/logout-user`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      return { message: response.data?.message ?? null };
    } catch (error) {
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Logout failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  message: null,
};

const getMessageFromPayload = actionPayload => {
  if (!actionPayload) return null;
  if (typeof actionPayload === 'string') return actionPayload;
  if (actionPayload.message) return actionPayload.message;
  return null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: state => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.message = null;
    },
    setEmailVerified: (state, action) => {
      if (state.user) state.user.isEmailVerified = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // registerUser
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.user) state.user = action.payload.user;
        state.message = action.payload?.message ?? null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
      })

      // loginUser
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
      })

      // logoutUser
      .addCase(logoutUser.pending, state => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
        state.message = 'Logged out successfully';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.message =
          typeof action.payload === 'string' ? action.payload : 'Logged out';
      })

      // FIXED: Listens to updateUser from userSlice to simultaneously update auth user data state
      .addCase(updateUser.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload.user };
        } else {
          state.user = action.payload.user;
        }
      });
  },
});

export const { clearAuthState, setEmailVerified } = authSlice.actions;
export default authSlice.reducer;
