/**
 * @file Loader.jsx
 * @module utilities/custom-components/loader/Loader
 * @description A premium, high-fidelity loading indicator featuring 5 vertical
 * bars that animate in a cascading zigzag wave formation, mimicking professional trading terminals.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../../../styles/Themes';

const BARS_COUNT = 5;
const ANIMATION_DURATION = 600;

// Mapping standard string sizes to numbers so mathematical scaling utilities don't return NaN
const SIZE_MAPPING = {
  small: 24,
  medium: 40,
  large: 60,
};

const Loader = ({ color = '#000', size = 'medium', scaleUtil }) => {
  // Use the layout scale utility hook passed down, falling back to a raw value if needed
  const normalize = scaleUtil || (val => val);

  // Resolve numeric size value if 'small', 'medium', or 'large' strings are passed
  const numericSize =
    typeof size === 'number' ? size : SIZE_MAPPING[size] || SIZE_MAPPING.medium;

  // Initialize dynamic transform metrics for each line segment
  const barAnimations = useRef(
    Array.from({ length: BARS_COUNT }, () => new Animated.Value(0.35)),
  ).current;

  useEffect(() => {
    // Build a continuous, smooth vertical scaling sequence loop
    const createWaveSequence = (animatedValue, delay) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1.1,
              duration: ANIMATION_DURATION / 2,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.35,
              duration: ANIMATION_DURATION / 2,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]);
    };

    // Stagger bars by 90ms intervals for a natural fluid movement ripple
    const cascadingLoop = Animated.parallel(
      barAnimations.map((anim, index) => createWaveSequence(anim, index * 90)),
    );

    cascadingLoop.start();

    return () => cascadingLoop.stop();
  }, [barAnimations]);

  return (
    <View
      style={[
        styles.container,
        { height: normalize(numericSize), width: normalize(numericSize * 1.8) },
      ]}
      accessibilityRole="progressbar"
    >
      {barAnimations.map((animatedValue, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              width: normalize(numericSize * 0.14),
              borderRadius: normalize(numericSize * 0.08),
              marginHorizontal: normalize(numericSize * 0.08),
              transform: [{ scaleY: animatedValue }],
            },
          ]}
        />
      ))}
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bar: {
    height: '100%',
  },
});
