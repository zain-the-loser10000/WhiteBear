/**
 * @file store.store.jsx
 * @module redux/store/store.jsx
 * @description Redux store configuration with persistence for user authentication state.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from '../slices/auth.slice';
import userReducer from '../slices/user.slice';
import otpReducer from '../slices/otp.slice';
import journalReducer from '../slices/journal.slice';
import todoReducer from '../slices/todos.slice';
import analyticReducer from '../slices/analytics.slice';
import goalReducer from '../slices/goals.slice';
import habitReducer from '../slices/habit.slice';
import subscriptionReducer from '../slices/subscription.slice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  otp: otpReducer,
  journal: journalReducer,
  todo: todoReducer,
  goals: goalReducer,
  analytics: analyticReducer,
  habits: habitReducer,
  subscription: subscriptionReducer,
});

// 2. Pass the placeholder rootReducer into the persist wrapper
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for Redux Persist
    }),
});

const persistor = persistStore(store);

export { store, persistor };
