/**
 * @file JournalAnalyticsView.jsx
 * @module utilities/custom-components/analytics/JournalAnalyticsView
 * @description Clean interactive accordion card component with corrected native rotation transform strings.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/Themes';

const JournalAnalyticsView = ({
  data,
  hp,
  wp,
  moderateScale,
  isLandscape,
  currentRange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = createStyles({ wp, hp, isLandscape, moderateScale });

  if (!data) return null;

  const {
    emotionalTrajectory,
    psychologicalBottlenecks,
    mindfulnessActionItems,
    weeklyReviewSyntheses,
    timestamp,
  } = data;

  /**
   * 📅 TIME BOUNDARY RESOLVER
   */
  const resolveTargetTimelineBoundary = () => {
    if (data.startDateRange && data.endDateRange) {
      return `${data.startDateRange}  —  ${data.endDateRange}`;
    }
    const referenceDate = timestamp ? new Date(timestamp) : new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const endDateStr = referenceDate.toLocaleDateString('en-US', options);
    const startDate = new Date(
      referenceDate.getTime() - (currentRange || 15) * 24 * 60 * 60 * 1000,
    );
    const startDateStr = startDate.toLocaleDateString('en-US', options);

    return `${startDateStr}  —  ${endDateStr}`;
  };

  const resolveDynamicPieStyles = (state, trend) => {
    const matrix = {
      color: theme.colors.primary,
      trackColor: theme.colors.textPrimary,
      statusText: 'STABLE SEGMENT',
      angle: 90,
    };
    const targetTrend = trend?.toLowerCase() || '';
    const targetState = state?.toLowerCase() || '';

    if (targetTrend.includes('improv') || targetState.includes('product')) {
      matrix.color = theme.colors.success;
      matrix.trackColor = theme.colors.successLight;
      matrix.statusText = 'HIGH EFFICIENCY';
      matrix.angle = 140;
    } else if (
      targetTrend.includes('declin') ||
      targetState.includes('frustrat')
    ) {
      matrix.color = theme.colors.error;
      matrix.trackColor = theme.colors.gray;
      matrix.statusText = 'CRITICAL OVERLOAD';
      matrix.angle = 40;
    } else if (targetTrend.includes('stagnant')) {
      matrix.color = theme.colors.warning;
      matrix.trackColor = theme.colors.warningLight;
      matrix.statusText = 'STAGNANT PHASE';
      matrix.angle = 90;
    }
    return matrix;
  };

  const pieMetric = resolveDynamicPieStyles(
    emotionalTrajectory?.dominantState,
    emotionalTrajectory?.trendDirection,
  );

  return (
    <View style={styles.accordionShellCard}>
      {/* 🧭 DATE BANNER ACCORDION HEADER TRIGGER */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.accordionHeaderTrigger}
      >
        <View style={styles.metaTimeHeaderColumn}>
          <Text style={styles.dateDurationLabel}>
            {resolveTargetTimelineBoundary()}
          </Text>
        </View>

        {/* Custom Pure CSS Chevron Component using 'deg' tokens */}
        <View
          style={[styles.chevronWrapper, isExpanded && styles.chevronRotated]}
        >
          <View style={styles.chevronPathLineLeft} />
          <View style={styles.chevronPathLineRight} />
        </View>
      </TouchableOpacity>

      {/* 🥧 PERSISTENT VISIBLE MODULE: EMOTIONAL STATE SPECTRUM */}
      <View style={styles.chartBlockSection}>
        <Text style={styles.sectionHeading}>EMOTIONAL STATE SPECTRUM MAP</Text>
        <View style={styles.pieWrapperLayout}>
          <View
            style={[
              styles.pieBaseCircle,
              { backgroundColor: pieMetric.trackColor },
            ]}
          >
            <View
              style={[
                styles.pieHalfSlice,
                {
                  backgroundColor: pieMetric.color,
                  transform: [
                    { translateX: -75 },
                    { rotate: `${pieMetric.angle}deg` },
                    { translateX: 75 },
                  ],
                },
              ]}
            />
            <View style={styles.pieInnerHoleMask}>
              <Text
                style={styles.dominantStateLabel}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {emotionalTrajectory?.dominantState || 'Driven'}
              </Text>
              <Text style={[styles.trendSubLabel, { color: pieMetric.color }]}>
                {pieMetric.statusText}
              </Text>
            </View>
          </View>
          <View style={styles.chartLegendRow}>
            <View style={styles.legendNode}>
              <View
                style={[
                  styles.legendIndicatorDot,
                  { backgroundColor: pieMetric.color },
                ]}
              />
              <Text style={styles.legendText}>
                Trajectory Behavior:{' '}
                {emotionalTrajectory?.trendDirection || 'Stable'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.insightQuoteStr}>
          "{emotionalTrajectory?.mentalClarityInsight}"
        </Text>
      </View>

      {/* 🔓 CONDITIONAL DEEP INSIGHT DETAILS (Shows only when Accordion expands) */}
      {isExpanded && (
        <View style={styles.expandedContentWrapper}>
          {/* ⚠️ MODULE 2: PSYCHOLOGICAL BOTTLENECKS */}
          {psychologicalBottlenecks && psychologicalBottlenecks.length > 0 && (
            <View style={styles.internalSectionBlock}>
              <Text style={styles.sectionHeading}>
                ACTIVE PSYCHOLOGICAL BOTTLENECKS
              </Text>
              {psychologicalBottlenecks.map((item, index) => (
                <View
                  key={`bottleneck-${index}`}
                  style={styles.metricRowWidget}
                >
                  <View style={styles.widgetHeaderMeta}>
                    <Text style={styles.issueTitle}>⚡ {item.coreIssue}</Text>
                    <View
                      style={[
                        styles.intensityTag,
                        { backgroundColor: pieMetric.trackColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.intensityTagText,
                          { color: pieMetric.color },
                        ]}
                      >
                        DETECTED IMPACT
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.evidenceBodyText}>
                    <Text style={styles.boldLabel}>Evidence context: </Text>
                    {item.evidenceSummary}
                  </Text>
                  <View
                    style={[
                      styles.coachingPillBox,
                      { borderLeftColor: pieMetric.color },
                    ]}
                  >
                    <Text style={styles.coachingPillText}>
                      💡 {item.coachingAdjustment}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 🏆 MODULE 3: WEEKLY SYNTHESIS */}
          {weeklyReviewSyntheses && weeklyReviewSyntheses.length > 0 && (
            <View style={styles.internalSectionBlock}>
              <Text style={styles.sectionHeading}>
                LOGGED WEEKLY REVIEWS IN THIS HORIZON
              </Text>
              {weeklyReviewSyntheses.map((week, index) => (
                <View key={`week-${index}`} style={styles.weeklyMetricBlock}>
                  <Text style={styles.weekRangeLabel}>
                    📅 PERIOD RANGE: {week.weekRange}
                  </Text>
                  <Text style={styles.weekSubText}>
                    <Text style={styles.boldLabel}>Macro Win: </Text>
                    {week.macroWinInsight}
                  </Text>
                  <Text style={styles.weekSubText}>
                    <Text style={styles.boldLabel}>Growth Track: </Text>
                    {week.growthTakeaway}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ⚡ MODULE 4: MINDFULNESS DIRECTIVES */}
          {mindfulnessActionItems && mindfulnessActionItems.length > 0 && (
            <View
              style={[
                styles.internalSectionBlock,
                { marginBottom: moderateScale(4) },
              ]}
            >
              <Text style={styles.sectionHeading}>
                RECOMMENDED MIND/BODY ADJUSTMENTS
              </Text>
              {mindfulnessActionItems.map((step, index) => (
                <View key={`step-${index}`} style={styles.bulletPointRow}>
                  <View
                    style={[
                      styles.bulletMarkerSquare,
                      { backgroundColor: pieMetric.color },
                    ]}
                  />
                  <Text style={styles.bulletBodyText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default JournalAnalyticsView;

const createStyles = ({ wp, hp, isLandscape, moderateScale }) => {
  return StyleSheet.create({
    accordionShellCard: {
      backgroundColor: theme.colors.white,
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: hp(2),
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },

    accordionHeaderTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(16),
      backgroundColor: theme.colors.background,
    },

    metaTimeHeaderColumn: {
      flexDirection: 'column',
      flex: 1,
    },

    dateDurationLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13.5),
    },

    chevronWrapper: {
      width: moderateScale(20),
      height: moderateScale(20),
      justifyContent: 'center',
      alignItems: 'center',
    },

    chevronRotated: {
      transform: [{ rotate: '180deg' }],
    },

    chevronPathLineLeft: {
      position: 'absolute',
      width: moderateScale(7),
      height: moderateScale(2),
      backgroundColor: theme.colors.textMuted,
      borderRadius: 1,
      transform: [{ rotate: '45deg' }, { translateX: -2.5 }],
    },

    chevronPathLineRight: {
      position: 'absolute',
      width: moderateScale(7),
      height: moderateScale(2),
      backgroundColor: theme.colors.textMuted,
      borderRadius: 1,
      transform: [{ rotate: '-45deg' }, { translateX: 2.5 }],
    },

    chartBlockSection: {
      padding: moderateScale(16),
      backgroundColor: theme.colors.white,
    },

    expandedContentWrapper: {
      paddingHorizontal: moderateScale(16),
      paddingBottom: moderateScale(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.background,
      backgroundColor: theme.colors.background,
    },

    internalSectionBlock: {
      marginTop: hp(1.8),
    },

    sectionHeading: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textMuted,
      fontSize: moderateScale(11.5),
      letterSpacing: moderateScale(1),
      marginBottom: hp(1.2),
    },

    pieWrapperLayout: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: hp(1),
    },

    pieBaseCircle: {
      width: moderateScale(150),
      height: moderateScale(150),
      borderRadius: moderateScale(75),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },

    pieHalfSlice: {
      position: 'absolute',
      width: moderateScale(75),
      height: moderateScale(150),
      top: 0,
      left: moderateScale(75),
    },

    pieInnerHoleMask: {
      width: moderateScale(114),
      height: moderateScale(114),
      borderRadius: moderateScale(57),
      backgroundColor: theme.colors.white,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3,
      paddingHorizontal: moderateScale(10),
    },

    dominantStateLabel: {
      fontFamily: theme.typography.bold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(17),
      textAlign: 'center',
    },

    trendSubLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(8),
      marginTop: moderateScale(4),
      letterSpacing: moderateScale(0.5),
    },

    chartLegendRow: {
      flexDirection: 'row',
      marginTop: hp(1.5),
      justifyContent: 'center',
    },

    legendNode: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    legendIndicatorDot: {
      width: moderateScale(12),
      height: moderateScale(12),
      borderRadius: moderateScale(6),
      marginRight: moderateScale(8),
    },

    legendText: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12),
    },

    insightQuoteStr: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
      textAlign: 'center',
      lineHeight: moderateScale(19),
      marginTop: hp(1),
      fontStyle: 'italic',
    },

    metricRowWidget: {
      marginBottom: hp(1.2),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.tertiary,
      paddingBottom: hp(1.2),
    },

    widgetHeaderMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(0.8),
    },

    issueTitle: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
      flex: 1,
    },

    intensityTag: {
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(6),
      marginLeft: moderateScale(8),
    },

    intensityTagText: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(10),
    },

    evidenceBodyText: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12.5),
      lineHeight: moderateScale(18),
      marginBottom: hp(1),
    },

    coachingPillBox: {
      backgroundColor: theme.colors.background,
      padding: moderateScale(12),
      borderRadius: moderateScale(8),
      borderLeftWidth: moderateScale(4),
    },

    coachingPillText: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12.5),
      lineHeight: moderateScale(18),
    },

    weeklyMetricBlock: {
      backgroundColor: theme.colors.background,
      padding: moderateScale(12),
      borderRadius: moderateScale(12),
      marginBottom: hp(1),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    weekRangeLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12),
      marginBottom: hp(0.5),
    },

    weekSubText: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(18),
      marginTop: hp(0.4),
    },

    bulletPointRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: hp(1),
    },

    bulletMarkerSquare: {
      width: moderateScale(8),
      height: moderateScale(8),
      marginRight: moderateScale(12),
      borderRadius: moderateScale(2),
      marginTop: hp(0.6),
    },

    bulletBodyText: {
      flex: 1,
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(18),
    },

    boldLabel: {
      fontFamily: theme.typography.bold,
      color: theme.colors.textPrimary,
    },
  });
};
