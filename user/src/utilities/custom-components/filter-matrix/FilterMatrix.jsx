/**
 * @file FilterMatrix.jsx
 * @module utilities/custom-components/filter-matrix/FilterMatrix
 * @description Dynamic multi-selection filter engine row renderer powered by contextual accent colors.
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const FilterOptionRow = React.memo(
  ({ label, filterKey, isActive, onToggle, styles, accentColor }) => (
    <TouchableOpacity
      style={[
        styles.filterRow,
        isActive && styles.filterRowSelected,
        isActive && { borderColor: accentColor + '60' },
      ]}
      onPress={() => onToggle(filterKey)}
      activeOpacity={0.7}
    >
      <Text style={styles.filterLabelText}>{label}</Text>
      <View
        style={[
          styles.checkboxIndicator,
          isActive && {
            backgroundColor: accentColor,
            borderColor: accentColor,
          },
        ]}
      >
        {isActive && <Text style={styles.checkboxSymbolInline}>✓</Text>}
      </View>
    </TouchableOpacity>
  ),
);

const FilterMatrix = ({
  options = [],
  activeFilters,
  onToggleCriteria,
  accentColor = theme.colors.primary,
}) => {
  const { hp, wp, moderateScale } = useGlobalStyles();
  const styles = createStyles({ hp, wp, moderateScale });

  return (
    <View style={styles.filterModalContainer}>
      {options.map(option => (
        <FilterOptionRow
          key={option.key}
          label={option.label}
          filterKey={option.key}
          isActive={!!activeFilters[option.key]}
          onToggle={onToggleCriteria}
          styles={styles}
          accentColor={accentColor}
        />
      ))}
    </View>
  );
};

export default React.memo(FilterMatrix);

/**
 * 🎨 Component Component Localized Styles Matrix
 */
const createStyles = ({ hp, wp, moderateScale }) => {
  return StyleSheet.create({
    filterModalContainer: {
      width: '100%',
      paddingVertical: hp(1),
      gap: hp(1.5),
    },

    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(1.6),
      paddingHorizontal: wp(4),
      backgroundColor: '#121212',
      borderRadius: moderateScale(10),
      borderWidth: 1,
      borderColor: '#222',
    },

    filterRowSelected: {
      backgroundColor: '#161616',
    },

    filterLabelText: {
      fontFamily: theme.typography.medium,
      fontSize: moderateScale(14.5),
      color: '#E5E5EA',
    },

    checkboxIndicator: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(5),
      borderWidth: 1.5,
      borderColor: '#555',
      justifyContent: 'center',
      alignItems: 'center',
    },

    checkboxSymbolInline: {
      color: theme.colors.white,
      fontSize: moderateScale(11),
      fontFamily: theme.typography.bold,
    },
  });
};
