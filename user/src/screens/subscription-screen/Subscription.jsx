// screens/subscription-screen/SubscriptionScreen.jsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  BackHandler,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../styles/Themes';
import { useGlobalStyles } from '../../styles/GlobalStyles';
import Header from '../../utilities/custom-components/header/header/Header';
import { useSubscription } from '../../utilities/custom-hooks/custom-subscription/Subscription.hook';
import Loader from '../../utilities/custom-components/loader/Loader';
import { getUser } from '../../redux/slices/user.slice';

const PREMIUM_FEATURES = [
  { icon: '🎯', label: 'Unlimited Goals' },
  { icon: '🔄', label: 'Unlimited Habits' },
  { icon: '📖', label: 'Unlimited Journals' },
  { icon: '📊', label: 'Unlimited Analytics' },
  { icon: '✅', label: 'Unlimited To-Dos' },
];

const SubscriptionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { wp, hp, moderateScale, isLandscape } = useGlobalStyles();
  const { purchasePlan, isInitializingPortal, subscriptionMessage } =
    useSubscription();

  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Check if this is a forced subscription (trial ended)
  const isForceSubscription = route.params?.forceSubscription || false;
  const trialEnded = route.params?.trialEnded || false;

  const styles = useMemo(
    () => createStyles({ wp, hp, moderateScale, isLandscape }),
    [wp, hp, moderateScale, isLandscape],
  );

  // Check if user is already premium from Redux
  const isPremium = useSelector(
    state => state.subscription?.isPremium || false,
  );
  const currentPlan = useSelector(
    state => state.subscription?.currentPlan || 'free_trial',
  );

  // 🚫 Prevent going back if force subscription is active - Allow app quit
  useEffect(() => {
    if (isForceSubscription) {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          Alert.alert(
            'Subscription Required',
            'Your free trial has ended. Please subscribe to continue using the app.',
            [
              {
                text: 'Stay',
                style: 'cancel',
                onPress: () => {},
              },
              {
                text: 'Exit App',
                style: 'destructive',
                onPress: () => {
                  // Exit the app
                  if (Platform.OS === 'android') {
                    BackHandler.exitApp();
                  } else {
                    // For iOS, we can't programmatically exit, so we minimize
                    // You might want to use a library or just show a message
                    Alert.alert(
                      'Exit App',
                      'Please swipe up to close the app.',
                      [{ text: 'OK' }],
                    );
                  }
                },
              },
            ],
            { cancelable: false },
          );
          return true; // Prevent default back navigation
        },
      );

      return () => backHandler.remove();
    }
  }, [isForceSubscription]);

  // Handle subscription success and navigation
  useEffect(() => {
    if (isPremium && isForceSubscription) {
      // Refresh user data and navigate to Main
      dispatch(getUser())
        .unwrap()
        .then(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        });
    }
  }, [isPremium, isForceSubscription, navigation, dispatch]);

  // Handle plan selection with animation
  const handlePlanChange = plan => {
    if (plan === selectedPlan) return;
    setSelectedPlan(plan);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Synchronized with your actual live sandbox payment links
  const planInfo = useMemo(() => {
    if (selectedPlan === 'yearly') {
      return {
        priceLabel: 'Rs 250.00 / year',
        totalPrice: 'Rs 250.00',
        period: 'Billed recurringly every year.',
      };
    }
    return {
      priceLabel: 'Rs 500.00 / month',
      totalPrice: 'Rs 500.00',
      period: 'Billed recurringly every month.',
    };
  }, [selectedPlan]);

  const handlePurchase = () => {
    if (!selectedPlan) return;
    purchasePlan(selectedPlan);
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title={isForceSubscription ? 'Subscription Required' : 'Premium Access'}
        subtitle={
          isForceSubscription
            ? 'Your free trial has ended. Subscribe to continue.'
            : 'Elevate Your Architecture'
        }
        headerColor={theme.colors.dashboard.goals}
        onBackPress={
          isForceSubscription ? undefined : () => navigation.goBack()
        }
        showBackButton={!isForceSubscription}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Trial Ended Banner */}
        {isForceSubscription && (
          <View style={styles.trialEndedBanner}>
            <Text style={styles.trialEndedIcon}>⚠️</Text>
            <Text style={styles.trialEndedText}>
              Your 15-day free trial has ended. Please subscribe to continue
              using all premium features.
            </Text>
          </View>
        )}

        {/* Sandbox Dev Notice Banner */}
        <View style={styles.sandboxNoticeBanner}>
          <Text style={styles.sandboxNoticeText}>
            🛠️ Sandbox Testing Mode: Payments run via Stripe Test Gates. No real
            capital will be moved or charged.
          </Text>
        </View>

        {/* Brand App Asset Component Header */}
        <View style={styles.brandingWrapper}>
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Image
              source={require('../../assets/logo/logo.png')}
              style={styles.appLogoAsset}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.premiumTag}>PREMIUM ACCESS</Text>
        </View>

        {/* Dynamic Interactive Price Summary Layout */}
        <Animated.View style={[styles.dynamicPriceHero, { opacity: fadeAnim }]}>
          <Text style={styles.heroPriceText}>{planInfo.priceLabel}</Text>
        </Animated.View>

        {/* Features Content Matrix Block */}
        <View style={styles.featuresMatrixBlock}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkIconWrapper}>
                <Text style={styles.checkMarkIcon}>{feature.icon}</Text>
              </View>
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>

        {/* Current Plan Status (if premium) */}
        {isPremium && !isForceSubscription && (
          <View style={styles.currentPlanBanner}>
            <Text style={styles.currentPlanIcon}>👑</Text>
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanTitle}>Premium Active</Text>
              <Text style={styles.currentPlanSubtitle}>
                {currentPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'} •
                Active
              </Text>
            </View>
          </View>
        )}

        {/* Modern Vertical Structural Option Stack */}
        {!isPremium && (
          <View style={styles.verticalCardsStack}>
            {/* Yearly Card View */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePlanChange('yearly')}
              style={[
                styles.subscriptionCard,
                selectedPlan === 'yearly' && styles.activeSubscriptionCard,
              ]}
            >
              <View style={styles.cardLeftContent}>
                <View
                  style={[
                    styles.customCheckbox,
                    selectedPlan === 'yearly' && styles.customCheckboxActive,
                  ]}
                >
                  {selectedPlan === 'yearly' && (
                    <Text style={styles.checkmarkInnerSymbol}>✓</Text>
                  )}
                </View>
                <View style={styles.textWrapperCard}>
                  <Text style={styles.cardPlanTitle}>Yearly Premium</Text>
                  <Text style={styles.cardSubtitle}>
                    Continuous access • Cancel anytime
                  </Text>
                </View>
              </View>

              <View style={styles.cardPriceBlock}>
                <Text style={styles.cardPriceLabelText}>Rs 250</Text>
                <Text style={styles.cardPriceSub}>/year</Text>
              </View>
            </TouchableOpacity>

            {/* Monthly Card View */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handlePlanChange('monthly')}
              style={[
                styles.subscriptionCard,
                selectedPlan === 'monthly' && styles.activeSubscriptionCard,
              ]}
            >
              <View style={styles.cardLeftContent}>
                <View
                  style={[
                    styles.customCheckbox,
                    selectedPlan === 'monthly' && styles.customCheckboxActive,
                  ]}
                >
                  {selectedPlan === 'monthly' && (
                    <Text style={styles.checkmarkInnerSymbol}>✓</Text>
                  )}
                </View>
                <View style={styles.textWrapperCard}>
                  <Text style={styles.cardPlanTitle}>Monthly Premium</Text>
                  <Text style={styles.cardSubtitle}>
                    Flexible allocation • Cancel anytime
                  </Text>
                </View>
              </View>

              <View style={styles.cardPriceBlock}>
                <Text style={styles.cardPriceLabelText}>Rs 500</Text>
                <Text style={styles.cardPriceSub}>/month</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Upgrade Custom Dynamic Form Core Button */}
        {!isPremium && (
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={isInitializingPortal}
            onPress={handlePurchase}
            style={styles.submitUpgradeButton}
          >
            <LinearGradient
              colors={['#1D68B2', '#0F4C8A']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isInitializingPortal ? (
                <Loader size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.submitUpgradeButtonText}>
                  Upgrade Now — {planInfo.totalPrice}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Structural Fine Print System Notification */}
        <Text style={styles.finePrintDescription}>
          Unlock full access to premium features including unlimited goals,
          unlimited habits, unlimited journals and unlimited to-dos.{' '}
          {planInfo.period}
        </Text>

        <Text style={styles.securedVendorNotice}>
          🔒 Payments encrypted via Stripe Gateway.
        </Text>
      </ScrollView>
    </View>
  );
};

export default SubscriptionScreen;

const createStyles = ({ wp, hp, moderateScale, isLandscape }) => ({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContainer: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(8),
    alignItems: 'center',
  },

  trialEndedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: moderateScale(10),
    padding: wp(3.5),
    marginTop: hp(2),
    marginBottom: hp(1),
  },

  trialEndedIcon: {
    fontSize: moderateScale(20),
    marginRight: wp(2),
  },

  trialEndedText: {
    flex: 1,
    color: '#991B1B',
    fontSize: moderateScale(12),
    fontFamily: theme.typography.semiBold,
    lineHeight: moderateScale(17),
  },

  sandboxNoticeBanner: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: theme.colors.dashboard.todos,
    borderRadius: moderateScale(10),
    padding: wp(3.5),
    marginTop: hp(1),
    marginBottom: hp(1),
    alignItems: 'center',
  },

  sandboxNoticeText: {
    color: theme.colors.dark,
    fontSize: moderateScale(12),
    fontFamily: theme.typography.bold,
    textAlign: 'center',
    lineHeight: moderateScale(17),
  },

  brandingWrapper: {
    marginTop: isLandscape ? hp(3) : hp(4),
    marginBottom: hp(2.5),
    alignItems: 'center',
  },

  logoContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    alignItems: 'center',
    justifyContent: 'center',
  },

  appLogoAsset: {
    width: '100%',
    height: '100%',
  },

  premiumTag: {
    marginTop: hp(1),
    color: theme.colors.dark,
    fontSize: moderateScale(14),
    fontFamily: theme.typography.bold,
    textAlign: 'center',
  },

  dynamicPriceHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
  },

  heroPriceText: {
    marginTop: hp(1),
    color: theme.colors.dark,
    fontSize: moderateScale(18),
    fontFamily: theme.typography.bold,
    textAlign: 'center',
  },

  featuresMatrixBlock: {
    width: '100%',
    paddingHorizontal: isLandscape ? wp(8) : wp(2),
    marginBottom: hp(3.5),
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(0.8),
  },

  checkIconWrapper: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(29, 104, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(4),
  },

  checkMarkIcon: {
    fontSize: moderateScale(18),
  },

  featureText: {
    fontFamily: theme.typography.semiBold,
    fontSize: moderateScale(15),
    color: theme.colors.dark,
  },

  currentPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#D1FAE5',
    borderRadius: moderateScale(12),
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#10B981',
  },

  currentPlanIcon: {
    fontSize: moderateScale(24),
    marginRight: wp(3),
  },

  currentPlanInfo: {
    flex: 1,
  },

  currentPlanTitle: {
    fontSize: moderateScale(16),
    fontFamily: theme.typography.bold,
    color: '#065F46',
  },

  currentPlanSubtitle: {
    fontSize: moderateScale(12),
    fontFamily: theme.typography.medium,
    color: '#047857',
    marginTop: hp(0.3),
  },

  verticalCardsStack: {
    width: '100%',
    gap: hp(1.5),
    marginBottom: hp(3.5),
  },

  subscriptionCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: moderateScale(14),
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(4.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activeSubscriptionCard: {
    borderColor: '#1D68B2',
    backgroundColor: theme.colors.background,
  },

  cardLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  textWrapperCard: {
    flex: 1,
    paddingRight: wp(2),
  },

  customCheckbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(6),
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginRight: wp(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  customCheckboxActive: {
    borderColor: '#1D68B2',
    backgroundColor: '#1D68B2',
  },

  checkmarkInnerSymbol: {
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
    fontSize: moderateScale(10),
    textAlign: 'center',
  },

  cardPlanTitle: {
    fontSize: moderateScale(16),
    color: '#0F172A',
    fontFamily: theme.typography.bold,
  },

  cardSubtitle: {
    fontSize: moderateScale(12),
    color: theme.colors.textMuted,
    marginTop: hp(0.3),
    fontFamily: theme.typography.semiBold,
  },

  cardPriceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  cardPriceLabelText: {
    fontSize: moderateScale(19),
    color: '#0F172A',
    marginTop: hp(0.3),
    fontFamily: theme.typography.bold,
  },

  cardPriceSub: {
    color: '#475569',
    fontSize: moderateScale(12),
    fontFamily: theme.typography.semiBold,
    marginLeft: wp(0.5),
  },

  submitUpgradeButton: {
    width: '100%',
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    marginBottom: hp(2.5),
  },

  gradientButton: {
    height: hp(7.2),
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitUpgradeButtonText: {
    fontSize: moderateScale(16),
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
  },

  finePrintDescription: {
    width: '100%',
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: moderateScale(12.5),
    lineHeight: moderateScale(19),
    paddingHorizontal: wp(3),
    marginBottom: hp(2),
    fontFamily: theme.typography.semiBold,
  },

  securedVendorNotice: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: moderateScale(11.5),
    fontFamily: theme.typography.semiBold,
  },
});
