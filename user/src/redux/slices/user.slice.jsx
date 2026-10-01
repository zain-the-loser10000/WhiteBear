/**
 * @file user.slice.jsx
 * @module redux/slices/userSlice
 * @description Redux slice handling user authentication, token persistence, and state management
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

export const getUser = createAsyncThunk(
  'user/getUser',
  async (_, { rejectWithValue }) => {
    // ✅ No parameters needed
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/user/get-user-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message,
        status: error.response?.status || 0,
      });
    }
  },
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/user/update-user-profile/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      // FIXED: Fallback checks to support both 'updatedUser' and 'user' keys from backend response
      const targetUser = response.data.updatedUser || response.data.user;
      const message = response.data.message || 'Profile updated successfully';
      const success = response.data.success ?? true;

      if (!targetUser)
        throw new Error(message || 'No user data returned from backend');

      return { user: targetUser, message, success };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to update user',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

/**
 * Update user security credentials with explicit password matching parameters
 * @param {Object} payload - Contains userId, currentPassword, newPassword, and confirmPassword
 */
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (
    { currentPassword, newPassword, confirmPassword },
    { rejectWithValue },
  ) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/user/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message,
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

/**
 * Permanently deletes the authenticated user's account and wipes local session tracking
 */
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.delete(
        `${BACKEND_API_URL}/user/delete-user-account/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Clean up the local React Native session storage upon success
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);

      return {
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message:
          backend?.message || error.message || 'Failed to delete account',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  message: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: state => {
      state.user = null;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(updateUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = state.user
          ? { ...state.user, ...action.payload.user }
          : action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(changePassword.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(deleteUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null; // Clear the user out of the state completely
        state.message = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
