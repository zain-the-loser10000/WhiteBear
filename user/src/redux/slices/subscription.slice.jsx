/**
 * @file subscription.slice.jsx
 * @module redux/slices/subscriptionSlice
 * @description Redux slice handling checkout URL allocation, active tracking states, and subscription purchase bounds.
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

/**
 * Thunk to request a dynamic premium Stripe Checkout Link from the backend
 */
export const createSubscriptionCheckout = createAsyncThunk(
  'subscription/createSubscriptionCheckout',
  async (plan, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const requestUrl = `${BACKEND_API_URL}/subscription/create-subscription-checkout`;

      const response = await axios.post(
        requestUrl,
        { plan }, // 'monthly' or 'yearly'
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { success, checkoutUrl, message } = response.data;
      if (!success) {
        throw new Error(message || 'Failed to initialize payment gateway.');
      }

      return { checkoutUrl, message };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message:
          backend?.message ||
          error.message ||
          'Subscription initialization failed.',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);


const initialState = {
  checkoutUrl: null,
  loading: false,
  error: null,
  message: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    resetSubscriptionState: state => {
      state.checkoutUrl = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createSubscriptionCheckout.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.checkoutUrl = null;
      })
      .addCase(createSubscriptionCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutUrl = action.payload.checkoutUrl;
        state.message = action.payload.message;
      })
      .addCase(createSubscriptionCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
        state.checkoutUrl = null;
      });
  },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
