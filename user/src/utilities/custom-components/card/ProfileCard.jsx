/**
 * @file ProfileCard.jsx
 * @module utilities/custom-components/ProfileCard
 * @description Profile summary layout optimized for portrait, landscape, and tablet viewports.
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const ProfileCard = ({
  name = 'User',
  email = '',
  profilePicture,
  isEmailVerified = false,
}) => {
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();

  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  return (
    <View style={styles.cardContainer}>
      {/* --- AVATAR LAYOUT --- */}
      <View style={styles.avatarWrapper}>
        <Image
          source={
            profilePicture && profilePicture.length > 0
              ? { uri: profilePicture }
              : require('../../../assets/placeHolder/placeholder.png')
          }
          style={styles.avatar}
        />
      </View>

      {/* --- USER ACCOUNT DATA DETAILS --- */}
      <View style={styles.textDetailsColumn}>
        <Text style={styles.userNameText} numberOfLines={1}>
          {name}
        </Text>

        {/* EMAIL LAYER WITH STATUS INDICATORS */}
        <View style={styles.emailStatusRow}>
          <Text style={styles.userEmailText} numberOfLines={1}>
            {email}
          </Text>
          <Ionicons
            name={isEmailVerified ? 'checkmark-circle' : 'close-circle'}
            size={moderateScale(16)}
            color={isEmailVerified ? theme.colors.success : theme.colors.error}
            style={styles.statusIcon}
          />
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;

/**
 * Visual Layout Styles Factory
 */
const createStyles = ({ wp, hp, moderateScale, isLandscape }) => {
  const avatarSize = moderateScale(64);

  return StyleSheet.create({
    cardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isLandscape ? hp(2) : hp(2.5),
      borderRadius: moderateScale(16),
      marginTop: isLandscape ? hp(2) : hp(2.5),
      width: isLandscape ? wp(70) : wp(90),
      maxWidth: moderateScale(520),
      alignSelf: 'flex-start',
      marginLeft: isLandscape ? wp(5) : wp(5),
    },

    avatarWrapper: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },

    avatar: {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: theme.colors.background,
    },

    textDetailsColumn: {
      flex: 1,
      marginLeft: isLandscape ? wp(3) : wp(4.5),
      justifyContent: 'center',
    },

    userNameText: {
      fontSize: moderateScale(18),
      fontFamily: theme.typography.bold,
      color: theme.colors.primary,
      marginBottom: hp(0.2),
    },

    emailStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },

    userEmailText: {
      fontSize: moderateScale(13),
      fontFamily: theme.typography.regular,
      color: theme.colors.textMuted,
      flexShrink: 1,
    },

    statusIcon: {
      marginLeft: isLandscape ? wp(1) : wp(1.5),
    },
  });
};
