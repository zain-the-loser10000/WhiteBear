/**
 * @file todosSlice.jsx
 * @module redux/slices/todosSlice
 * @description Redux slice handling todo management, fetching, and active state containment.
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

export const createNewTodo = createAsyncThunk(
  'todos/createNewTodo',
  async (
    { title, targetDate, todoType, isRepeating, goalId },
    { rejectWithValue },
  ) => {
    try {
      const token = await getToken(rejectWithValue);

      const payload = {
        title,
        targetDate,
        todoType,
        isRepeating,
        ...(goalId && { goalId }),
      };

      const response = await axios.post(
        `${BACKEND_API_URL}/todo/create-todo`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        todo: response.data.newTodo,
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

export const getAllTodos = createAsyncThunk(
  'todos/getAllTodos',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/todo/get-all-todos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        todos: response.data.allTodos,
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

export const toggleTodoComplete = createAsyncThunk(
  'todos/toggleTodoComplete',
  async ({ todoId, isCompleted }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/todo/toggle-todo-complete/${todoId}`,
        { isCompleted },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return {
        todoId,
        updatedTodo: response.data.todo,
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

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ todoId, title }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/todo/update-todo/${todoId}`,
        { title },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return {
        todoId,
        updatedTodo: response.data.todo,
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

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async ({ todoId }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.delete(
        `${BACKEND_API_URL}/todo/delete-todo/${todoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return {
        todoId,
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

const initialState = {
  todos: [],
  loading: false,
  error: null,
  message: null,
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearTodos: state => {
      state.todos = [];
      state.error = null;
      state.message = null;
    },

    clearTodoState: state => {
      state.todos = [];
      state.error = null;
    },

    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder

      .addCase(createNewTodo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTodo.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.todo) {
          state.todos.unshift(action.payload.todo);
        }
        state.message = action.payload.message;
      })
      .addCase(createNewTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(getAllTodos.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getAllTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload.todos;
        state.message = action.payload.message;
      })
      .addCase(getAllTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(toggleTodoComplete.fulfilled, (state, action) => {
        const { todoId, updatedTodo } = action.payload;
        const index = state.todos.findIndex(t => t._id === todoId);
        if (index !== -1) {
          state.todos[index] = updatedTodo || {
            ...state.todos[index],
            isCompleted: !state.todos[index].isCompleted,
          };
        }
        state.message = action.payload.message;
      })
      .addCase(toggleTodoComplete.rejected, (state, action) => {
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(updateTodo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.loading = false;
        const { todoId, updatedTodo } = action.payload;
        const index = state.todos.findIndex(t => t._id === todoId);
        if (index !== -1) {
          state.todos[index] = updatedTodo || {
            ...state.todos[index],
            title: action.meta.arg.title,
          };
        }
        state.message = action.payload.message;
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(deleteTodo.pending, state => {
        state.loading = true;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = state.todos.filter(
          todo => todo._id !== action.payload.todoId,
        );
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTodos, clearError, clearTodoState } = todosSlice.actions;
export default todosSlice.reducer;
