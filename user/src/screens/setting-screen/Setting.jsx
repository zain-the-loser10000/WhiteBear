/**
 * @file Setting.jsx
 * @module screens/setting-screen/Setting
 * @description Settings screen with a responsive layout and user profile management actions.
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import { useStatusBarConfig } from '../../utilities/custom-hooks/custom-status-bar/StatusBar.hook';
import { deleteUser, getUser } from '../../redux/slices/user.slice';
import { logoutUser } from '../../redux/slices/auth.slice';
import Header from '../../utilities/custom-components/header/header/Header';
import ProfileCard from '../../utilities/custom-components/card/ProfileCard';
import ProfileSubCard from '../../utilities/custom-components/card/ProfileSubCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import Modal from '../../utilities/custom-components/modal/Modal';

const Setting = () => {
  useStatusBarConfig();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const styles = createStyles({ wp, hp, moderateScale, isLandscape });

  const auth = useSelector(state => state.auth.user);
  const user = useSelector(state => state.user.user);
  const isUserSliceLoading = useSelector(state => state.user.loading);

  console.log('USER', user);

  // Fallback engine: Prioritize freshly fetched user data, then fall back to baseline auth data
  const isEmailVerified = user?.isEmailVerified ?? auth?.isEmailVerified;
  const userEmail = user?.email || auth?.email;
  const userFullName = user?.fullName || auth?.fullName;
  const userProfileImg = user?.profilePicture || auth?.profilePicture;

  // Real-Time Backend Subscription Processing via exact Enums
  const subscriptionStatus =
    user?.subscriptionStatus || auth?.subscriptionStatus || 'trialing';
  const subscriptionPlan =
    user?.subscriptionPlan || auth?.subscriptionPlan || 'free_trial';
  const trialExpiration = user?.trialExpiration || auth?.trialExpiration;

  // Client-side computed state derived from exact backend enums
  const isActivePremium =
    subscriptionStatus === 'active' &&
    (subscriptionPlan === 'monthly' || subscriptionPlan === 'yearly');

  const isTrialing = subscriptionStatus === 'trialing';

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Dynamic Date Delta Engine for Countdown Tracking
  const calculateDaysLeft = expirationIsoString => {
    if (!expirationIsoString) return 0;
    try {
      const expirationDate = new Date(expirationIsoString);
      const today = new Date();

      const differenceInTime = expirationDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));
      return daysLeft > 0 ? daysLeft : 0;
    } catch (error) {
      console.warn('Error parsing trial expiration timestamp:', error);
      return 0;
    }
  };

  const trialDaysLeft = calculateDaysLeft(trialExpiration);

  // Formats backend snake_case enums beautifully for display (e.g., "past_due" -> "Past Due")
  const formattedStatusText = subscriptionStatus
    ? subscriptionStatus
        .replace('_', ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
    : 'Trialing';

  // Dynamic color assignments driven directly by backend subscription states
  const getStatusColor = () => {
    if (isActivePremium) return '#10B981'; // Green
    if (isTrialing) return '#3B82F6'; // Blue
    return '#EF4444'; // Red for past_due, canceled, unpaid
  };

  const [appVersion, setAppVersion] = useState('Loading...');

  useFocusEffect(
    React.useCallback(() => {
      if (auth?.id || auth?.userId) {
        dispatch(getUser(auth.id || auth.userId));
      }
    }, [dispatch, auth]),
  );

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getUser());
    }, [dispatch]),
  );

  useEffect(() => {
    const fetchAppVersion = () => {
      try {
        const DeviceInfo = require('react-native-device-info').default;
        if (DeviceInfo && typeof DeviceInfo.getVersion === 'function') {
          const versionName = DeviceInfo.getVersion();
          setAppVersion(versionName);
        } else {
          throw new Error('DeviceInfo API not available');
        }
      } catch (error) {
        console.warn('Failed to fetch version:', error);
        setAppVersion('Version info unavailable');
      }
    };
    fetchAppVersion();
  }, []);

  const preferenceGroups = [
    {
      groupTitle: 'Account & Security',
      items: [
        ...(!isEmailVerified
          ? [
              {
                id: 'email_verification',
                title: 'Verify Email',
                icon: 'mail-outline',
              },
            ]
          : []),
        {
          id: 'update_profile',
          title: 'Update Profile',
          icon: 'pencil-outline',
        },
        {
          id: 'change_password',
          title: 'Change Password',
          icon: 'reload-outline',
        },
      ],
    },
    {
      groupTitle: 'General',
      items: [
        {
          id: 'app_info',
          title: 'About App',
          icon: 'information-circle-outline',
        },
        {
          id: 'terms_and_conditions',
          title: 'Terms of Use',
          icon: 'document-text-outline',
        },
        {
          id: 'privacy_policy',
          title: 'Privacy Policy',
          icon: 'shield-checkmark-outline',
        },
      ],
    },
    {
      groupTitle: 'Danger Zone',
      items: [
        {
          id: 'delete_account',
          title: 'Delete Account',
          icon: 'skull-outline',
        },
        { id: 'logout', title: 'Logout', icon: 'log-out-outline' },
      ],
    },
  ];

  const handleItemPress = itemId => {
    if (itemId === 'email_verification') {
      if (userEmail) {
        navigation.navigate('Email_Verification', { email: userEmail });
      }
      return;
    }

    if (itemId === 'update_profile') {
      if (auth || user) {
        navigation.navigate('Update_Profile', { userProfile: user || auth });
      }
      return;
    }

    if (itemId === 'change_password') {
      navigation.navigate('Change_Password');
      return;
    }

    if (itemId === 'logout') {
      handleLogout();
      return;
    }

    if (itemId === 'app_info') {
      navigation.navigate('About');
      return;
    }

    if (itemId === 'terms_and_conditions') {
      navigation.navigate('Terms_and_Conditions');
      return;
    }

    if (itemId === 'privacy_policy') {
      navigation.navigate('Privacy_Policy');
      return;
    }

    if (itemId === 'delete_account') {
      setIsDeleteModalOpen(true);
      return;
    }
  };

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());

      if (logoutUser.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'Signin' }],
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: resultAction.payload?.message,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'System Error',
        text2: err?.message,
      });
    }
  };

  const handleDeleteAccount = async () => {
    const targetUserId = auth?.id || auth?.userId || user?.id || user?.userId;
    if (!targetUserId) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2:
          'Could not identify your user validation data record identity scope.',
      });
      return;
    }

    try {
      const resultAction = await dispatch(deleteUser(targetUserId));

      if (deleteUser.fulfilled.match(resultAction)) {
        setIsDeleteModalOpen(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: resultAction.payload?.message,
        });

        navigation.reset({
          index: 0,
          routes: [{ name: 'Signin' }],
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Deletion Aborted',
          text2: resultAction.payload?.message,
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'System Exception',
        text2: err?.message,
      });
    }
  };

  const deleteModalButtons = [
    {
      label: 'Cancel',
      variant: 'cancel',
      disabled: isUserSliceLoading,
      onClick: () => setIsDeleteModalOpen(false),
    },
    {
      label: 'Permanently Delete',
      variant: 'danger',
      loading: isUserSliceLoading,
      disabled: isUserSliceLoading,
      onClick: handleDeleteAccount,
    },
  ];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.headerContainer}>
        <Header
          title="Settings"
          subtitle="App Settings - Preferences"
          headerColor={theme.colors.dashboard.settings}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCardContainer}>
          <ProfileCard
            name={userFullName}
            email={userEmail}
            profilePicture={userProfileImg}
            isEmailVerified={isEmailVerified}
          />
        </View>

        <View style={styles.subscriptionContainer}>
          <View style={styles.subCardBody}>
            <View style={styles.subInfoColumn}>
              {/* Primary Row: Status Display */}
              <View style={styles.metaDataRow}>
                <Text style={styles.metaLabel}>Subscription Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor() + '15' },
                  ]}
                >
                  <Ionicons
                    name={
                      isActivePremium
                        ? 'shield-star'
                        : isTrialing
                        ? 'timer-outline'
                        : 'alert-circle-outline'
                    }
                    size={moderateScale(13)}
                    color={getStatusColor()}
                    style={styles.badgeIcon}
                  />
                  <Text style={[styles.badgeText, { color: getStatusColor() }]}>
                    {formattedStatusText}
                  </Text>
                </View>
              </View>

              {/* Secondary Row: Plan Configuration */}
              <View style={[styles.metaDataRow, { marginTop: hp(1) }]}>
                <Text style={styles.metaLabel}>Subscription Plan</Text>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>
                    {subscriptionPlan
                      ? subscriptionPlan
                          .replace('_', ' ')
                          .replace(/\b\w/g, l => l.toUpperCase())
                      : 'Free Trial'}
                  </Text>
                </View>
              </View>

              {/* Tertiary Row: Contextual Countdown or System Flags */}
              {isTrialing && (
                <View style={styles.alertNoticeRow}>
                  <Text style={styles.durationText}>
                    Trial Expiration in •{' '}
                    <Text style={styles.countdownHighlight}>
                      {trialDaysLeft} {trialDaysLeft === 1 ? 'Day' : 'Days'}{' '}
                      Remaining
                    </Text>
                  </Text>
                </View>
              )}

              {!isActivePremium && !isTrialing && (
                <View style={styles.alertNoticeRow}>
                  <Text
                    style={[
                      styles.durationText,
                      { color: '#EF4444', fontFamily: theme.typography.medium },
                    ]}
                  >
                    Action Required • Please renew access to unlock workspace
                    tools.
                  </Text>
                </View>
              )}
            </View>

            {/* Elegant Performance Action Trigger */}
            {!isActivePremium && (
              <TouchableOpacity
                style={styles.upgradeButton}
                activeOpacity={0.85}
                disabled={false} /* 🛡️ Safe literal protection mapping */
                onPress={() => navigation.navigate('Subscription_Plans')}
              >
                <Text style={styles.upgradeButtonText}>
                  {subscriptionStatus === 'past_due' ||
                  subscriptionStatus === 'unpaid'
                    ? 'Renew'
                    : 'Upgrade'}
                </Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={moderateScale(14)}
                  color={theme.colors.white}
                  style={styles.buttonArrow}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.optionsSpacingBlock}>
          {preferenceGroups.map((group, index) => (
            <View
              key={index}
              style={
                isLandscape
                  ? index === 2
                    ? styles.landscapeFullWidthCard
                    : styles.landscapeHalfWidthCard
                  : styles.portraitCard
              }
            >
              <ProfileSubCard
                groupTitle={group.groupTitle}
                items={group.items}
                onItemPress={handleItemPress}
              />
            </View>
          ))}
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version {appVersion}</Text>
        </View>
      </ScrollView>

      {/* Account Deletion Contextual Custom Dialog Window */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isUserSliceLoading && setIsDeleteModalOpen(false)}
        title="Delete Account"
        subtitle="This operation is absolute and cannot be undone."
        buttons={deleteModalButtons}
        closeOnBackdrop={!isUserSliceLoading}
        showCloseButton={!isUserSliceLoading}
        icon={
          <Ionicons
            name="trash-bin-outline"
            size={moderateScale(38)}
            color="#EF4444"
          />
        }
      >
        <Text style={styles.modalContentBodyText}>
          Proceeding will permanently purge your identity records, database
          goals, todo logs, journals, analytical matrices, and clear all system
          sessions.
        </Text>
      </Modal>
    </View>
  );
};

export default Setting;

/**
 * Responsive Layout Styles Factory Engine
 */
const createStyles = ({ wp, hp, isLandscape, moderateScale }) => {
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    headerContainer: {
      width: '100%',
    },

    profileCardContainer: {
      width: '100%',
      paddingHorizontal: isLandscape ? wp(4) : 0,
    },

    subscriptionContainer: {
      width: '100%',
      paddingHorizontal: isLandscape ? wp(4) : wp(5),
      marginTop: hp(2.5),
    },

    subCardBody: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(14),
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: moderateScale(18),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 3,
    },

    subInfoColumn: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: wp(2),
    },

    metaDataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },

    metaLabel: {
      fontSize: moderateScale(13.5),
      fontFamily: theme.typography.medium,
      color: '#666666',
      letterSpacing: -0.1,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.5),
      borderRadius: moderateScale(6),
    },

    badgeIcon: {
      marginRight: wp(1),
    },

    badgeText: {
      fontSize: moderateScale(12),
      fontFamily: theme.typography.bold,
      textTransform: 'capitalize',
    },

    planBadge: {
      backgroundColor: '#F3F4F6', // Clean neutral slate backfill
      paddingHorizontal: wp(2.5),
      paddingVertical: hp(0.5),
      borderRadius: moderateScale(6),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    planBadgeText: {
      fontSize: moderateScale(12),
      fontFamily: theme.typography.semiBold,
      color: '#374151',
    },

    alertNoticeRow: {
      marginTop: hp(1.5),
      paddingTop: hp(1.2),
      borderTopWidth: 1,
      borderTopColor: '#F5F5F5',
    },

    durationText: {
      fontSize: moderateScale(12.5),
      fontFamily: theme.typography.regular,
      color: '#777777',
    },

    countdownHighlight: {
      fontFamily: theme.typography.bold,
      color: '#1E6091',
    },

    upgradeButton: {
      backgroundColor: '#1E6091', // Solid brand asset blue
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.4),
      borderRadius: moderateScale(10),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(2),
      shadowColor: '#1E6091',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 2,
    },

    upgradeButtonText: {
      fontSize: moderateScale(13),
      fontFamily: theme.typography.bold,
      color: theme.colors.white,
      letterSpacing: 0.2,
    },

    buttonArrow: {
      marginLeft: wp(1),
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: isLandscape ? hp(6) : hp(3),
    },

    optionsSpacingBlock: {
      marginTop: hp(1),
      paddingHorizontal: isLandscape ? wp(4) : 0,
      flexDirection: isLandscape ? 'row' : 'column',
      flexWrap: isLandscape ? 'wrap' : 'nowrap',
      justifyContent: isLandscape ? 'space-between' : 'flex-start',
    },

    portraitCard: {
      width: '100%',
    },

    landscapeHalfWidthCard: {
      width: '49%',
    },

    landscapeFullWidthCard: {
      width: '100%',
      marginTop: hp(1),
    },

    versionContainer: {
      marginTop: isLandscape ? hp(4) : hp(3),
      width: '100%',
    },

    versionText: {
      fontSize: moderateScale(14),
      fontFamily: theme.typography.semiBold,
      color: '#888888',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textAlign: 'center',
    },

    modalContentBodyText: {
      fontFamily: theme.typography.regular,
      fontSize: moderateScale(13.5),
      color: '#A9A9A9',
      lineHeight: moderateScale(20),
      textAlign: 'center',
    },
  });
};
