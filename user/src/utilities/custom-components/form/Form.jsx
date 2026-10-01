/**
 * @file JournalForm.jsx
 * @module utilities/custom-components/form/JournalForm
 * @description Ultra-enhanced dynamic form system adapting typography and buttons according to functional accents.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import InputField from '../input-field/InputField';
import Button from '../button/Button';

const JournalForm = ({
  type,
  selectedDate,
  journalCategories,
  backendJournals,
  onSubmit,
  loading = false,
  accentColor,
}) => {
  const { wp, hp, scale, moderateScale, isLandscape } = useGlobalStyles();

  const styles = createStyles({
    wp,
    hp,
    scale,
    moderateScale,
    isLandscape,
    accentColor,
  });

  const [formData, setFormData] = useState({});
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);

  const config = journalCategories || {};
  const charLimit = config.metadata?.characterLimit || 150;

  /**
   * 🗓️ Custom Short Formatter: Formats a date object to "MMM DD" (e.g., Jun 07)
   */
  const formatShortMonthDay = dateObj => {
    if (!dateObj) return '';
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthStr = months[dateObj.getMonth()];
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    return `${monthStr} ${dayStr}`;
  };

  /**
   * 🗓️ Backend Mirror Bracket: Returns format like "Jun 07 - Jun 13"
   */
  const getWeeklyRangeString = dateObj => {
    if (!dateObj) return '';
    const refDate = new Date(dateObj);
    const dayOfWeek = refDate.getDay(); // Sunday = 0, Monday = 1...

    // Snap to Sunday
    const sunday = new Date(refDate);
    sunday.setDate(refDate.getDate() - dayOfWeek);

    // Snap to Saturday
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return `${formatShortMonthDay(sunday)} - ${formatShortMonthDay(saturday)}`;
  };

  /**
   * 🔄 Effect 1: Find matched record from Redux Backend store array
   * whenever date or active tab changes, and map inputs automatically.
   */
  useEffect(() => {
    if (!backendJournals || !Array.isArray(backendJournals)) {
      setFormData({});
      setIsAlreadySubmitted(false);
      return;
    }

    const isDaily = type === 'DAILY';
    let matchedJournal = null;

    if (isDaily) {
      const targetComparisonTime = new Date(selectedDate).setHours(0, 0, 0, 0);

      matchedJournal = backendJournals.find(j => {
        if (!j.targetDate || j.journalType !== 'DAILY') return false;
        const dbDateTime = new Date(j.targetDate).setHours(0, 0, 0, 0);
        return dbDateTime === targetComparisonTime;
      });
    } else {
      const refDate = new Date(selectedDate);
      const dayOfWeek = refDate.getDay();
      const sundayOfWeek = new Date(refDate);
      sundayOfWeek.setDate(refDate.getDate() - dayOfWeek);
      const targetSundayTime = sundayOfWeek.setHours(0, 0, 0, 0);

      matchedJournal = backendJournals.find(j => {
        if (!j.targetDate || j.journalType !== 'WEEKLY') return false;
        const dbDateTime = new Date(j.targetDate).setHours(0, 0, 0, 0);
        return dbDateTime === targetSundayTime;
      });
    }

    if (matchedJournal) {
      setIsAlreadySubmitted(true);
      if (isDaily) {
        setFormData({
          MOOD: matchedJournal.mood,
          MEMORABLE_MOMENT: matchedJournal.memorableMoment,
          CHALLENGES: matchedJournal.challenges,
        });
      } else {
        setFormData({
          BIG_WINS: matchedJournal.bigWins,
          WHAT_COULD_BE_BETTER: matchedJournal.whatCouldBeBetter,
          DID_YOU_GROW: matchedJournal.didYouGrow,
          CHALLENGES: matchedJournal.challenges,
        });
      }
    } else {
      setIsAlreadySubmitted(false);
      setFormData({});
    }
  }, [selectedDate, type, backendJournals]);

  const handleInputChange = (fieldKey, value) => {
    if (isAlreadySubmitted) return;
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleFormSubmit = () => {
    if (onSubmit) {
      onSubmit({
        journalType: type,
        targetDate: selectedDate,
        data: formData,
      });
    }
  };

  const isDaily = type === 'DAILY';
  const displayTitle = isDaily ? 'How was your day today?' : 'Weekly Review';
  const promptList = isDaily
    ? config.dailyPrompts || {
        MOOD: 'My mood today:',
        MEMORABLE_MOMENT: "I'll remember this day by:",
        CHALLENGES: 'Challenges I am facing:',
      }
    : config.weeklyPrompts || {
        BIG_WINS: 'What were the big wins?',
        WHAT_COULD_BE_BETTER: 'What could be better?',
        DID_YOU_GROW: 'Did you grow?',
        CHALLENGES: 'Challenges I am facing:',
      };

  const keysToRender = isDaily
    ? ['MOOD', 'MEMORABLE_MOMENT', 'CHALLENGES']
    : ['BIG_WINS', 'WHAT_COULD_BE_BETTER', 'DID_YOU_GROW', 'CHALLENGES'];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{displayTitle}</Text>
          {/* 🗓️ Daily me date remove krdi ha, Weekly me short dynamic bracket text render hoga */}
          {!isDaily && (
            <Text style={styles.dateBadge}>
              {getWeeklyRangeString(selectedDate)}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Dynamic Mapping Nodes using your customized InputField component */}
        {keysToRender.map(key => {
          const currentText = formData[key] || '';
          const currentLength = currentText.length;

          return (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{promptList[key]}</Text>

              <InputField
                value={currentText}
                onChangeText={val => handleInputChange(key, val)}
                placeholder={
                  isAlreadySubmitted
                    ? 'No entry recorded'
                    : 'Type your response here...'
                }
                maxLength={charLimit}
                editable={!isAlreadySubmitted}
                containerStyle={styles.inputContainerStyle}
                inputWrapperStyle={{ borderColor: accentColor }}
                inputStyle={styles.textInputStyle}
              />

              {/* Dynamic Ultra-Clean Character Counter */}
              <Text style={styles.counterText}>
                {currentLength}/{charLimit}
              </Text>
            </View>
          );
        })}

        {/* Conditional Submission Rendering Control */}
        {!isAlreadySubmitted && (
          <Button
            title="SUBMIT"
            onPress={handleFormSubmit}
            loading={loading}
            backgroundColor={accentColor}
            textColor={theme.colors.white}
            style={styles.submitButtonOverride}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default JournalForm;

/**
 * Responsive Layout Styles Factory Engine
 */
const createStyles = ({
  wp,
  hp,
  scale,
  moderateScale,
  isLandscape,
  accentColor,
}) => {
  return StyleSheet.create({
    scrollContainer: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(4),
      alignItems: 'center',
    },

    cardContainer: {
      width: isLandscape ? wp(82) : wp(92),
      backgroundColor: theme.colors.background,
      borderRadius: scale(16),
      padding: wp(4),
      marginTop: hp(1.5),
      borderWidth: 1,
      borderColor: 'rgba(141, 133, 133, 0.15)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 5,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(0.5),
      flexWrap: 'wrap',
    },

    cardTitle: {
      fontSize: moderateScale(18),
      fontFamily: theme.typography?.bold,
      color: accentColor,
    },

    dateBadge: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.semiBold,
      color: theme.colors.dark,
    },

    divider: {
      width: '100%',
      height: StyleSheet.hairlineWidth * 2,
      backgroundColor: 'rgba(141, 133, 133, 0.2)',
      marginVertical: hp(1.2),
    },

    inputGroup: {
      width: '100%',
      marginBottom: hp(1.5),
    },

    inputLabel: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.medium,
      color: theme.colors.dark,
      marginBottom: hp(0.6),
      textTransform: 'capitalize',
      left: wp(1),
    },

    inputContainerStyle: {
      width: '100%',
    },

    textInputStyle: {
      fontSize: moderateScale(14),
      color: theme.colors.dark,
    },

    counterText: {
      alignSelf: 'flex-end',
      fontSize: moderateScale(10),
      color: 'rgba(141, 133, 133, 0.6)',
      marginTop: hp(0.4),
      fontFamily: theme.typography.medium,
      marginRight: wp(1),
    },

    submitButtonOverride: {
      width: '100%',
      height: isLandscape ? hp(11) : hp(6),
      borderRadius: scale(12),
      marginTop: hp(1.5),
    },
  });
};
