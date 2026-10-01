/**
 * @file otp.slice.jsx
 * @module redux/slices/otpSlice
 * @description Redux slice handling multi-route email OTP transmission, validation states, and security tokens.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;
const SESSION_TOKEN_KEY = '@white_bear_session_token';

const getToken = async () => {
  const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);

  if (!token) throw new Error('User is not authenticated');
  return token;
};

export const requestEmailVerification = createAsyncThunk(
  'otp/requestEmailVerification',
  async (email, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const requestUrl = `${BACKEND_API_URL}/otp/request-email`;

      const response = await axios.post(
        requestUrl,
        { email },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { message, success } = response.data;
      if (!success)
        throw new Error(
          message || 'Server flagged an execution success breakdown',
        );

      return { message, success };
    } catch (error) {
      if (error.response) {
      }

      const backend = error.response?.data;
      return rejectWithValue({
        message:
          backend?.message ||
          error.message ||
          'Failed to send verification code',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

export const verifyEmail = createAsyncThunk(
  'otp/verifyEmail',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const requestUrl = `${BACKEND_API_URL}/otp/verify-email`;

      const response = await axios.post(
        requestUrl,
        { email, otp },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { message, success } = response.data;
      if (!success)
        throw new Error(message || 'Challenge parsing validation refused');

      return { message, success };
    } catch (error) {
      if (error.response) {
      }

      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Verification failed',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

const initialState = {
  isEmailVerified: false,
  loading: false,
  error: null,
  message: null,
};

const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    resetOtpState: state => {
      state.isEmailVerified = false;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(requestEmailVerification.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })
      .addCase(verifyEmail.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isEmailVerified = true;
        state.message = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.isEmailVerified = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { resetOtpState } = otpSlice.actions;
export default otpSlice.reducer;
