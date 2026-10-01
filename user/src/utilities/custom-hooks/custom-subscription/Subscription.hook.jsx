/**
 * @file useSubscription.js
 * @module utilities/custom-hooks/useSubscription
 * @description Fine-tuned custom hook to coordinate stripe portal requests, validation gates, and link forwarding.
 */
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Linking, Alert } from 'react-native';
import {
  createSubscriptionCheckout,
  resetSubscriptionState,
} from '../../../redux/slices/subscription.slice';


export const useSubscription = () => {
  const dispatch = useDispatch();
  const { checkoutUrl, loading, error, message } = useSelector(
    state => state.subscription,
  );

  // 🔄 Listen to the state to trigger link forwarding as soon as the checkout URL hits the store
  useEffect(() => {
    if (checkoutUrl) {
      const openCheckoutPortal = async () => {
        try {
          const supported = await Linking.canOpenURL(checkoutUrl);
          if (supported) {
            await Linking.openURL(checkoutUrl);
          } else {
            Alert.alert(
              'Error 🚨',
              'Unable to redirect to Stripe payment portal.',
            );
          }
        } catch (err) {
          console.error('Portal Redirect Failure:', err);
        } finally {
          // Instantly wipe slice values to prevent link loop execution states on return focuses
          dispatch(resetSubscriptionState());
        }
      };

      openCheckoutPortal();
    }
  }, [checkoutUrl, dispatch]);

  // 🛑 Error reporting handler
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Subscription Blocked ❌',
        error.message || 'Payment pipeline execution failed.',
      );
      dispatch(resetSubscriptionState());
    }
  }, [error, dispatch]);

  const purchasePlan = useCallback(
    planType => {
      if (!['monthly', 'yearly'].includes(planType)) return;
      dispatch(createSubscriptionCheckout(planType));
    },
    [dispatch],
  );

  return {
    purchasePlan,
    isInitializingPortal: loading,
    subscriptionMessage: message,
  };
};
