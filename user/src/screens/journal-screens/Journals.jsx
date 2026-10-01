/**
 * @file Journals.jsx
 * @module screens/journal-screens/Journals
 * @description Journals screen with optimized tab switching
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, ScrollView, InteractionManager } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import Header from '../../utilities/custom-components/header/header/Header';
import DateSlider from '../../utilities/custom-components/date-slider/DateSlider';
import CustomTabBar from '../../utilities/custom-components/tab-bar/TabBar';
import JournalForm from '../../utilities/custom-components/form/Form';
import { getUser } from '../../redux/slices/user.slice';
import {
  getAllJournals,
  getJournalCategories,
  createNewJournal,
} from '../../redux/slices/journal.slice';
import Loader from '../../utilities/custom-components/loader/Loader';
import Toast from 'react-native-toast-message';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const Journals = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTab, setCurrentTab] = useState(0);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loading, setLoading] = useState(true);

  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();

  const styles = useMemo(
    () => createStyles({ wp, hp, moderateScale, isLandscape }),
    [wp, hp, moderateScale, isLandscape],
  );

  // Selectors
  const auth = useSelector(state => state.auth?.user, shallowEqual);
  const journals = useSelector(
    state => state.journal?.journals || EMPTY_ARRAY,
    shallowEqual,
  );
  const journalCategories = useSelector(
    state => state.journal?.journalCategories || EMPTY_OBJECT,
    shallowEqual,
  );

  const isInitialMount = useRef(true);
  const lastFetchRef = useRef(0);

  // Fetch data
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const now = Date.now();
      const shouldFetch =
        journals.length === 0 || now - lastFetchRef.current > 30000;

      const loadJournalData = async () => {
        setLoading(true);
        try {
          if (shouldFetch) {
            await Promise.all([
              dispatch(getAllJournals()),
              dispatch(getJournalCategories()),
            ]);
            lastFetchRef.current = now;
          }

          const userId = auth?.id || auth?.userId;
          if (userId && isInitialMount.current) {
            isInitialMount.current = false;
            await dispatch(getUser(userId));
          }
        } catch (error) {
          console.error('Error fetching journal data:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadJournalData();

      return () => {
        isMounted = false;
      };
    }, [dispatch, auth?.id, auth?.userId, journals.length]),
  );

  // Optimized tab change with InteractionManager
  const handleTabChange = useCallback(tabIndex => {
    InteractionManager.runAfterInteractions(() => {
      setCurrentTab(tabIndex);
    });
  }, []);

  const handleJournalSubmit = useCallback(
    async formPayload => {
      const { journalType, targetDate, data } = formPayload;
      const localDate = new Date(targetDate);

      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const localizedTargetDate = `${year}-${month}-${day}T00:00:00.000Z`;

      const isDaily = journalType === 'DAILY';

      // Validation
      if (isDaily) {
        if (
          !data?.MOOD?.trim() ||
          !data?.MEMORABLE_MOMENT?.trim() ||
          !data?.CHALLENGES?.trim()
        ) {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: 'Please fill out all daily fields.',
          });
          return;
        }
      } else {
        if (
          !data?.BIG_WINS?.trim() ||
          !data?.WHAT_COULD_BE_BETTER?.trim() ||
          !data?.DID_YOU_GROW?.trim() ||
          !data?.CHALLENGES?.trim()
        ) {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: 'Please fill out all weekly fields.',
          });
          return;
        }
      }

      const structuredBody = {
        journalType,
        targetDate: localizedTargetDate,
        ...(isDaily
          ? {
              mood: data.MOOD.trim(),
              memorableMoment: data.MEMORABLE_MOMENT.trim(),
              challenges: data.CHALLENGES.trim(),
            }
          : {
              bigWins: data.BIG_WINS.trim(),
              whatCouldBeBetter: data.WHAT_COULD_BE_BETTER.trim(),
              didYouGrow: data.DID_YOU_GROW.trim(),
              challenges: data.CHALLENGES.trim(),
            }),
      };

      setLoadingSubmit(true);

      try {
        const resultAction = await dispatch(createNewJournal(structuredBody));

        if (createNewJournal.fulfilled.match(resultAction)) {
          Toast.show({
            type: 'success',
            text1: 'Entry Saved',
            text2:
              resultAction.payload?.message || 'Journal entry synchronized!',
          });
        } else if (createNewJournal.rejected.match(resultAction)) {
          Toast.show({
            type: 'error',
            text1: 'Failed',
            text2: resultAction.payload?.message || 'Submission error',
          });
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'System Exception',
          text2: err?.message,
        });
      } finally {
        setLoadingSubmit(false);
      }
    },
    [dispatch],
  );

  // Memoized Forms
  const dailyForm = useMemo(
    () => (
      <JournalForm
        type="DAILY"
        selectedDate={selectedDate}
        journalCategories={journalCategories}
        backendJournals={journals}
        onSubmit={handleJournalSubmit}
        loading={loadingSubmit}
        accentColor={theme.colors.dashboard.journals}
      />
    ),
    [
      selectedDate,
      journalCategories,
      journals,
      handleJournalSubmit,
      loadingSubmit,
    ],
  );

  const weeklyForm = useMemo(
    () => (
      <JournalForm
        type="WEEKLY"
        selectedDate={selectedDate}
        journalCategories={journalCategories}
        backendJournals={journals}
        onSubmit={handleJournalSubmit}
        loading={loadingSubmit}
        accentColor={theme.colors.dashboard.journals}
      />
    ),
    [
      selectedDate,
      journalCategories,
      journals,
      handleJournalSubmit,
      loadingSubmit,
    ],
  );

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Header
          title="Journals"
          subtitle="Reflect On Your Experience"
          headerColor={theme.colors.dashboard.journals}
          onBackPress={() => navigation.replace('Main')}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <Loader size="small" color={theme.colors.dashboard.journals} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          removeClippedSubviews={true}
          bounces={false}
        >
          <DateSlider
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            style={styles.sliderSpacing}
            activeColor={theme.colors.dashboard.journals}
            disableFutureDates={true}
            pastMonthsToRender={4}
            futureMonthsToRender={4}
          />

          <CustomTabBar
            activeTab={currentTab}
            onTabChange={handleTabChange}
            tabs={['JOURNALS', 'WEEKLY REVIEWS']}
            activeColor={theme.colors.dashboard.journals}
            style={styles.tabBarSpacing}
          />

          <View style={styles.tabContentContainer}>
            {/* Daily Form */}
            <View
              style={[
                styles.formWrapper,
                {
                  opacity: currentTab === 0 ? 1 : 0,
                  zIndex: currentTab === 0 ? 1 : 0,
                },
              ]}
              pointerEvents={currentTab === 0 ? 'auto' : 'none'}
            >
              {dailyForm}
            </View>

            {/* Weekly Form */}
            <View
              style={[
                styles.formWrapper,
                {
                  opacity: currentTab === 1 ? 1 : 0,
                  zIndex: currentTab === 1 ? 1 : 0,
                },
              ]}
              pointerEvents={currentTab === 1 ? 'auto' : 'none'}
            >
              {weeklyForm}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Journals;

const createStyles = ({ wp, hp, moderateScale, isLandscape }) => {
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    headerContainer: {
      width: '100%',
    },

    scrollView: {
      flex: 1,
    },

    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: isLandscape ? hp(10) : hp(4),
      paddingHorizontal: isLandscape ? wp(3) : 0,
    },

    tabBarSpacing: {
      marginTop: hp(1.5),
      marginBottom: hp(0.5),
      marginHorizontal: isLandscape ? wp(2) : 0,
    },

    sliderSpacing: {
      marginTop: hp(0.5),
      marginBottom: hp(1.5),
      marginHorizontal: isLandscape ? wp(2) : 0,
    },

    tabContentContainer: {
      flex: 1,
      width: '100%',
      position: 'relative',
      minHeight: isLandscape ? hp(60) : hp(80),
    },

    formWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
