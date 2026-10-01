/**
 * @file CreateTodo.jsx
 * @module screens/todos-screen/CreateTodo
 * @description Create multiple Todos screen with Redux dispatch + Toast (professional)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';

import Header from '../../utilities/custom-components/header/header/Header';
import InputField from '../../utilities/custom-components/input-field/InputField';
import Button from '../../utilities/custom-components/button/Button';

import { createNewTodo } from '../../redux/slices/todos.slice';

const CreateTodo = () => {
  useStatusBarConfig();
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  const rawDate = route.params?.selectedDate;
  const selectedDateFromTodos = rawDate ? new Date(rawDate) : new Date();

  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [todosList, setTodosList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FIX: Send date in YYYY-MM-DD format without time
  // Backend will parse it and set to UTC midnight
  const getFormattedDateForBackend = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      setTodosList(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          title: newTodoTitle.trim(),
        },
      ]);
      setNewTodoTitle('');
    }
  };

  const handleDeleteTodo = id => {
    setTodosList(prev => prev.filter(todo => todo.id !== id));
  };

  const handleSaveTodos = async () => {
    if (todosList.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Todos',
        text2: 'Please add at least one todo',
      });
      return;
    }

    setIsSaving(true);

    try {
      let successCount = 0;
      let lastBackendMessage = '';

      // ✅ Get current date for comparison (to check if selected date is today or future)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDateOnly = new Date(selectedDateFromTodos);
      selectedDateOnly.setHours(0, 0, 0, 0);

      // Check if selected date is in the past
      if (selectedDateOnly < today) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Date',
          text2: 'Todos cannot be created for past dates!',
        });
        setIsSaving(false);
        return;
      }

      for (const todo of todosList) {
        // ✅ Send date in YYYY-MM-DD format
        const formattedDate = getFormattedDateForBackend(selectedDateFromTodos);

        console.log('📅 Sending date to backend:', formattedDate);

        const resultAction = await dispatch(
          createNewTodo({
            title: todo.title,
            targetDate: formattedDate, // ✅ Send as "2026-06-08"
            todoType: 'DAILY',
            isRepeating: false,
            goalId: null,
          }),
        );

        if (createNewTodo.fulfilled.match(resultAction)) {
          successCount++;
          lastBackendMessage = resultAction.payload?.message;
          console.log('✅ Todo created:', resultAction.payload);
        }

        if (createNewTodo.rejected.match(resultAction)) {
          const payload = resultAction.payload;
          const errorMessage = payload.message;
          const statusCode = payload.status;

          Toast.show({
            type: 'error',
            text1: `Creation Failed (${statusCode})`,
            text2: errorMessage,
          });
          setIsSaving(false);
          return;
        }
      }

      if (successCount === todosList.length) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2:
            todosList.length === 1
              ? lastBackendMessage
              : `${successCount} todos created successfully!`,
        });

        setTimeout(() => {
          navigation.goBack();
        }, 1500);

        setTodosList([]);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Toast.show({
        type: 'error',
        text1: 'Unexpected Error',
        text2: err?.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formattedHeaderDate = selectedDateFromTodos
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();

  return (
    <View style={styles.screenContainer}>
      <Header
        title="NEW TO-DOs"
        subtitle="Goals To-Dos will be added automatically"
        headerColor={theme.colors.dashboard.todos}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formattedHeaderDate}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <View style={styles.inputFieldContainer}>
            <InputField
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
              placeholder="Input to-do you want to achieve"
              placeholderTextColor={theme.colors.textMuted}
              containerStyle={{ width: '100%', marginBottom: 0 }}
            />
          </View>
          <View style={styles.addButtonWrapper}>
            <Button
              title="Add"
              onPress={handleAddTodo}
              width="100%"
              height={hp(6)}
              backgroundColor={theme.colors.dashboard.todos}
              textColor={theme.colors.white}
              borderRadius={theme.borderRadius.large}
              iconName="add-circle-outline"
              iconPosition="left"
              iconSize={20}
              iconStyle={{ marginRight: 8 }}
            />
          </View>
        </View>

        <View style={styles.todosListContainer}>
          {todosList.map(todo => (
            <View key={todo.id} style={styles.todoItem}>
              <Text style={styles.todoText}>{todo.title}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteTodo(todo.id)}
                style={styles.deleteButton}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trash-outline"
                  size={isLandscape ? wp(2.5) : wp(5)}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={'Save'}
          onPress={handleSaveTodos}
          disabled={isSaving}
          loading={isSaving}
          width={isLandscape ? wp(50) : wp(84)}
          backgroundColor={theme.colors.dashboard.todos}
          textColor={theme.colors.white}
          borderRadius={theme.borderRadius.large}
        />
      </View>
    </View>
  );
};

export default CreateTodo;

const createStyles = ({ wp, hp, moderateScale, isLandscape }) =>
  StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    contentContainer: {
      flex: 1,
      paddingHorizontal: isLandscape ? wp(6) : wp(4),
      paddingTop: hp(2),
    },

    dateHeader: {
      alignItems: 'flex-start',
      paddingVertical: isLandscape ? hp(1) : hp(1.5),
      paddingHorizontal: isLandscape ? wp(3) : wp(2),
      marginBottom: isLandscape ? hp(2) : hp(2.5),
    },

    dateText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(20),
      color: theme.colors.dark,
    },

    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: isLandscape ? hp(2) : hp(3),
    },

    inputFieldContainer: {
      flex: isLandscape ? 0.7 : 0.76,
      marginRight: isLandscape ? wp(2.5) : wp(3),
    },

    addButtonWrapper: {
      flex: isLandscape ? 0.3 : 0.24,
      justifyContent: 'center',
    },

    todosListContainer: {
      flex: 1,
      paddingBottom: isLandscape ? hp(1) : 0,
    },

    todoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      paddingVertical: isLandscape ? hp(1.4) : hp(1.8),
      paddingHorizontal: isLandscape ? wp(3) : wp(4),
      borderRadius: moderateScale(12),
      marginBottom: isLandscape ? hp(2.2) : hp(3),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    todoText: {
      flex: 1,
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(isLandscape ? 15 : 16),
      color: theme.colors.dark,
    },

    deleteButton: {
      padding: moderateScale(8),
    },

    buttonContainer: {
      marginBottom: isLandscape ? hp(5) : hp(2),
      alignItems: 'center',
    },
  });
