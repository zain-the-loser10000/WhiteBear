/**
 * @file ProfileSubCard.jsx
 * @module utilities/custom-components/card/ProfileSubCard
 * @description Renders modular preference clusters containing actionable navigation links.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const ProfileSubCard = ({ groupTitle, items = [], onItemPress }) => {
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  return (
    <View style={styles.settingGroupBlock}>
      {/* Group Label Title Section */}
      {groupTitle && <Text style={styles.groupHeadingText}>{groupTitle}</Text>}

      {/* Container Box Layer */}
      <View style={styles.cardContainer}>
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => onItemPress && onItemPress(item.id)}
              style={[styles.rowItem, isLastItem && styles.noBorder]}
            >
              <View style={styles.rowLeftSection}>
                <Ionicons
                  name={item.icon}
                  size={moderateScale(22)}
                  color={theme.colors.dashboard.settings}
                  style={styles.rowIcon}
                />
                <Text style={styles.rowItemTitle}>{item.title}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={moderateScale(20)}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ProfileSubCard;

/**
 * Visual Layout Styles Factory
 */
const createStyles = ({ wp, hp, moderateScale, isLandscape }) => {
  return StyleSheet.create({
    settingGroupBlock: {
      width: isLandscape ? wp(70) : wp(90),
      maxWidth: isLandscape ? moderateScale(320) : moderateScale(520),
      alignSelf: 'flex-start',
      marginLeft: isLandscape ? wp(5) : wp(5),
      marginBottom: isLandscape ? hp(2) : hp(2.5),
    },

    groupHeadingText: {
      fontSize: moderateScale(13),
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginLeft: wp(2),
      marginBottom: hp(1),
    },

    cardContainer: {
      width: '100%',
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius?.large,
      paddingHorizontal: wp(4),

      // Shadow Depth Engine Definition Nodes
      elevation: theme.elevation?.depth1?.elevation,
      shadowColor: theme.colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },

    rowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: isLandscape ? hp(3) : hp(1.5),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray,
    },

    noBorder: {
      borderBottomWidth: 0,
    },

    rowLeftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    rowIcon: {
      marginRight: wp(3.5),
    },

    rowItemTitle: {
      fontSize: moderateScale(15),
      fontFamily: theme.typography.medium,
      color: theme.colors.primary,
    },
  });
};
