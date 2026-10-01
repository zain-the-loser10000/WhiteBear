/**
 * @file StepProgressHeader.jsx
 * @module utilities/custom-components/step-header/StepProgressHeader
 * @description Fully responsive multi-step wizard tracker with dynamic steps array injection and adaptive orientation capabilities.
 */

import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions } from 'react-native';
import { theme } from '../../../styles/Themes';
import { useGlobalStyles } from '../../../styles/GlobalStyles';

const StepProgressHeader = ({
  currentStep = 1,

  steps = ['Category', 'Details', 'Timeline', 'Notifications'],
  accentColor = theme.colors.dashboard.habits,
}) => {
  const { height, width } = useWindowDimensions();
  const { scale, wp } = useGlobalStyles();

  const isLandscape = width > height;

  const totalSteps = steps.length;

  const styles = createStyles({
    scale,
    wp,
    isLandscape,
    accentColor,
    totalSteps,
  });

  return (
    <View style={styles.masterWrapper}>
      {/* Nodes Timeline Row */}
      <View style={styles.nodesRow}>
        {steps.map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={`node-${idx}`}>
              <View
                style={[
                  styles.nodeBubble,
                  isCompleted || isActive
                    ? styles.activeBubble
                    : styles.inactiveBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    {
                      color:
                        isCompleted || isActive
                          ? theme.colors.white
                          : theme.colors.gray,
                    },
                  ]}
                >
                  {stepNum}
                </Text>
              </View>

              {idx < totalSteps - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    stepNum < currentStep
                      ? styles.activeLine
                      : styles.inactiveLine,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Dynamic Step Context Labels */}
      <View style={styles.labelsRow}>
        {steps.map((step, idx) => {
          const isActive = idx + 1 === currentStep;
          return (
            <Text
              key={`lbl-${idx}`}
              style={[
                styles.stepLabel,
                isActive ? styles.activeLabel : styles.inactiveLabel,
              ]}
              numberOfLines={1}
            >
              {step}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

export default React.memo(StepProgressHeader);

/**
 * 🎨 Component Localized Styles Matrix
 */
const createStyles = ({ scale, wp, isLandscape, accentColor, totalSteps }) => {
  const nodeWidthPercent = isLandscape
    ? totalSteps > 4
      ? '80%'
      : '60%'
    : totalSteps > 4
    ? '95%'
    : '85%';

  const labelWidthPercent = isLandscape
    ? totalSteps > 4
      ? '88%'
      : '68%'
    : '100%';

  return StyleSheet.create({
    masterWrapper: {
      width: '100%',
      paddingVertical: scale(14),
      alignItems: 'center',
      backgroundColor: 'transparent',
    },

    nodesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: nodeWidthPercent,
      paddingHorizontal: wp(1),
    },

    nodeBubble: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },

    activeBubble: {
      backgroundColor: accentColor,
      shadowColor: accentColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
      elevation: 3,
    },

    inactiveBubble: {
      backgroundColor: theme.colors.white,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },

    bubbleText: {
      fontFamily: theme.typography.bold,
      fontSize: scale(13),
    },

    connectorLine: {
      flex: 1,
      height: scale(3),
      marginHorizontal: scale(-2),
      zIndex: 1,
    },

    activeLine: {
      backgroundColor: accentColor,
    },

    inactiveLine: {
      backgroundColor: theme.colors.gray,
      textDecorationStyle: 'dotted',
    },

    labelsRow: {
      flexDirection: 'row',
      width: labelWidthPercent,
      justifyContent: 'space-between',
      marginTop: scale(10),
      paddingHorizontal: wp(1),
    },

    stepLabel: {
      flex: 1,
      textAlign: 'center',
      fontFamily: theme.typography.semiBold,
      fontSize: scale(10),
      letterSpacing: 0.15,
      paddingHorizontal: scale(1),
    },

    activeLabel: {
      color: accentColor,
      fontFamily: theme.typography.semiBold,
    },

    inactiveLabel: {
      color: theme.colors.textMuted,
      fontFamily: theme.typography.semiBold,
    },
  });
};
