// /**
//  * @file SessionCheck.hook.jsx
//  * @module utilities/custom-hooks/custom-session-check/SessionCheck
//  * @description Validates first-launch state and session tokens on app startup to route users correctly.
//  */

// import { useEffect } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { useNavigation } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const FIRST_LAUNCH_KEY = '@white_bear_has_launched';
// const SESSION_TOKEN_KEY = '@white_bear_session_token';

// export const useSessionCheck = (delay = 2500) => {
//   const navigation = useNavigation();

//   const query = useQuery({
//     queryKey: ['sessionInitialization'],
//     queryFn: async () => {
//       // 1. Run splash timer concurrently for clean visual transitions
//       const timerPromise = new Promise(resolve => setTimeout(resolve, delay));

//       // 2. Fetch launch state flag and session token from local storage
//       const checkLaunchPromise = AsyncStorage.getItem(FIRST_LAUNCH_KEY);
//       const checkTokenPromise = AsyncStorage.getItem(SESSION_TOKEN_KEY);

//       // 3. Resolve all three items concurrently
//       const [, hasLaunched, sessionToken] = await Promise.all([
//         timerPromise,
//         checkLaunchPromise,
//         checkTokenPromise,
//       ]);

//       // State determination logic
//       if (hasLaunched === null) {
//         // Flag the app as launched once so onboarding is skipped next time
//         await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
//         return { route: 'OnBoarding' };
//       }

//       if (sessionToken) {
//         return { route: 'Main' };
//       }

//       return { route: 'Signin' };
//     },
//     staleTime: Infinity,
//     gcTime: Infinity,
//   });

//   useEffect(() => {
//     if (query.isSuccess && query.data) {
//       const { route } = query.data;

//       navigation.reset({
//         index: 0,
//         routes: [{ name: route }],
//       });
//     }
//   }, [query.isSuccess, query.data, navigation]);

//   return query;
// };

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser } from '../../../redux/slices/user.slice';

const FIRST_LAUNCH_KEY = '@white_bear_has_launched';
const SESSION_TOKEN_KEY = '@white_bear_session_token';

export const useSessionCheck = (delay = 2500) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const query = useQuery({
    queryKey: ['sessionInitialization'],
    queryFn: async () => {
      const timerPromise = new Promise(resolve => setTimeout(resolve, delay));
      const checkLaunchPromise = AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      const checkTokenPromise = AsyncStorage.getItem(SESSION_TOKEN_KEY);

      const [, hasLaunched, sessionToken] = await Promise.all([
        timerPromise,
        checkLaunchPromise,
        checkTokenPromise,
      ]);

      if (hasLaunched === null) {
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'true');
        return { route: 'OnBoarding' };
      }

      if (!sessionToken) {
        return { route: 'Signin' };
      }

      try {
        const result = await dispatch(getUser()).unwrap();
        const userData = result.user;

        const subscriptionPlan = userData.subscriptionPlan || 'free_trial';
        const subscriptionStatus = userData.subscriptionStatus || 'trialing';
        const trialExpiresAt = userData.trialExpiresAt;

        // 1. Check if trial has expired chronologically
        let trialEnded = false;
        if (subscriptionPlan === 'free_trial' && trialExpiresAt) {
          const trialExpiry = new Date(trialExpiresAt);
          const now = new Date();
          trialEnded = now > trialExpiry;
        }

        // 2. Determine if the user has an active premium subscription
        const isPremiumActive =
          subscriptionPlan !== 'free_trial' && subscriptionStatus === 'active';

        // 3. Determine if the user has a valid active trial
        const isTrialActive =
          subscriptionPlan === 'free_trial' &&
          subscriptionStatus === 'trialing' &&
          !trialEnded;

        // 🚨 FIX: Force subscription ONLY if they are not premium AND their trial has expired
        if (!isPremiumActive && !isTrialActive) {
          return {
            route: 'Subscription_Plans',
            params: {
              forceSubscription: true,
              trialEnded: trialEnded,
              trialExpiresAt: trialExpiresAt,
            },
          };
        }

        // If their trial is still active or they are a premium subscriber, route to Main
        return { route: 'Main' };
      } catch (error) {
        console.error('❌ Failed to fetch user data:', error);
        return { route: 'Signin' };
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      const { route, params } = query.data;

      navigation.reset({
        index: 0,
        routes: [
          {
            name: route,
            params: params || {},
          },
        ],
      });
    }
  }, [query.isSuccess, query.data, navigation]);

  return query;
};
