/**
 * @file DateSlider.jsx
 * @module utilities/custom-components/date-slider/DateSlider
 * @description Clean minimalist text-only date strip timeline with strict priority single-selection logic.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useGlobalStyles } from '../../../styles/GlobalStyles';
import { theme } from '../../../styles/Themes';

const DateSlider = ({
  selectedDate,
  onDateSelect,
  disablePastDates,
  disableFutureDates,
  pastMonthsToRender = 4,
  futureMonthsToRender = 4, // Changed default to 4 as per your Habits screen
  activeColor,
  style,
}) => {
  const { scale, wp, hp, isLandscape } = useGlobalStyles();
  const listRef = useRef(null);

  const getDateString = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Normalize date to midnight (prevents timezone/day shift issues)
  const normalizeDate = date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const dates = useMemo(() => {
    const datesArray = [];
    const today = normalizeDate(new Date());

    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - pastMonthsToRender);

    const endDate = new Date(today);
    if (futureMonthsToRender > 0) {
      endDate.setMonth(today.getMonth() + futureMonthsToRender);
    } else {
      endDate.setDate(today.getDate() + 3);
    }

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      datesArray.push(normalizeDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return datesArray;
  }, [pastMonthsToRender, futureMonthsToRender]);

  const cardWidth = useMemo(
    () => (isLandscape ? wp(9) : wp(14)),
    [isLandscape, wp],
  );
  const cardMargin = useMemo(() => wp(1.2), [wp]);
  const totalItemWidth = cardWidth + cardMargin * 2;

  useEffect(() => {
    if (dates.length > 0 && listRef.current) {
      const targetIndex = dates.findIndex(
        d => getDateString(d) === getDateString(selectedDate),
      );

      if (targetIndex !== -1) {
        const screenWidth = Dimensions.get('window').width;
        const offset =
          targetIndex * totalItemWidth - (screenWidth / 2 - totalItemWidth / 2);

        setTimeout(() => {
          listRef.current?.scrollToOffset({
            offset: Math.max(0, offset),
            animated: true,
          });
        }, 250);
      }
    }
  }, [selectedDate, dates, totalItemWidth]);

  const renderDateItem = ({ item }) => {
    const today = normalizeDate(new Date());
    const compareItem = normalizeDate(item);

    const isSelected = getDateString(item) === getDateString(selectedDate);
    const isToday = getDateString(item) === getDateString(today);

    const isPast = compareItem < today;
    const isFuture = compareItem > today;

    const isDisabled =
      (disablePastDates && isPast) || (disableFutureDates && isFuture);

    const dayName = item.toLocaleString('en-US', { weekday: 'short' });
    const monthName = item.toLocaleString('en-US', { month: 'short' });

    return (
      <TouchableOpacity
        activeOpacity={isDisabled ? 1 : 0.75}
        disabled={isDisabled}
        onPress={() => {
          // ✅ Always pass normalized date to parent
          onDateSelect(normalizeDate(item));
        }}
        style={[
          styles.cardWrapper,
          { width: cardWidth, marginHorizontal: cardMargin },
        ]}
      >
        <View style={[styles.dateCard, isDisabled && styles.dateCardDisabled]}>
          {/* Day Name */}
          <Text
            style={[
              styles.dayText,
              isSelected
                ? { color: activeColor }
                : isDisabled
                ? styles.textDisabled
                : styles.textDimmed,
            ]}
          >
            {dayName}
          </Text>

          {/* Date Number */}
          <Text
            style={[
              styles.dateNumber,
              isSelected
                ? { color: activeColor }
                : isDisabled
                ? styles.textDisabled
                : isToday
                ? styles.textBrightToday
                : styles.textDimmed,
            ]}
          >
            {item.getDate()}
          </Text>

          {/* Month Name */}
          <Text
            style={[
              styles.monthText,
              isSelected
                ? { color: activeColor }
                : isDisabled
                ? styles.textDisabled
                : styles.textDimmed,
            ]}
          >
            {monthName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = createStyles({ scale, wp, hp });

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={listRef}
        data={dates}
        renderItem={renderDateItem}
        keyExtractor={item => item.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: totalItemWidth,
          offset: totalItemWidth * index,
          index,
        })}
      />
    </View>
  );
};

export default DateSlider;

/**
 * Isolated Dynamic Styling Factories
 */
const createStyles = ({ scale, wp, hp }) => {
  return StyleSheet.create({
    container: {
      width: '100%',
      marginVertical: hp(0.8),
    },

    listContent: {
      paddingHorizontal: wp(4),
      alignItems: 'center',
    },

    cardWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    dateCard: {
      width: '100%',
      aspectRatio: 0.58,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      paddingVertical: hp(0.6),
    },

    dateCardDisabled: {
      opacity: 0.25,
    },

    dayText: {
      fontSize: scale(11),
      fontFamily: theme.typography.medium,
    },

    dateNumber: {
      fontSize: scale(17),
      fontFamily: theme.typography.bold,
    },

    monthText: {
      fontSize: scale(11),
      fontFamily: theme.typography.bold,
    },

    textDimmed: {
      color: 'rgba(141, 133, 133, 0.45)',
    },

    textBrightToday: {
      color: 'rgba(141, 133, 133, 0.45)', // You can make this brighter if needed
    },

    textDisabled: {
      color: theme.colors.textMuted,
    },
  });
};
