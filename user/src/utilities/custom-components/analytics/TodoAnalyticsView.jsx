/**
 * @file TodoAnalyticsView.jsx
 * @module utilities/custom-components/analytics/TodoAnalyticsView
 * @description Highly legible, responsive interactive card component for todo analytics.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/Themes';

const TodoAnalyticsView = ({
  data,
  hp,
  wp,
  moderateScale,
  isLandscape,
  currentRange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = createStyles({ wp, hp, isLandscape, moderateScale });

  const targetData = data?.todos || data?.todosAnalytics?.todos || data;
  if (!targetData || !targetData.telemetrySummary) return null;

  const {
    telemetrySummary,
    typeBalanceAnalysis,
    rolloverFatigueBottlenecks,
    actionableOperationalDirectives,
  } = targetData;

  const resolveTargetTimelineBoundary = () => {
    if (data?.window?.start && data?.window?.end) {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      const startDateStr = new Date(data.window.start).toLocaleDateString(
        'en-US',
        options,
      );
      const endDateStr = new Date(data.window.end).toLocaleDateString(
        'en-US',
        options,
      );
      return `${startDateStr}  —  ${endDateStr}`;
    }

    if (data.startDateRange && data.endDateRange) {
      return `${data.startDateRange}  —  ${data.endDateRange}`;
    }

    const referenceDate = data.timestamp
      ? new Date(data.timestamp)
      : new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const endDateStr = referenceDate.toLocaleDateString('en-US', options);
    const startDate = new Date(
      referenceDate.getTime() - (currentRange || 15) * 24 * 60 * 60 * 1000,
    );
    const startDateStr = startDate.toLocaleDateString('en-US', options);

    return `${startDateStr}  —  ${endDateStr}`;
  };

  const resolveScoreStyles = score => {
    const matrix = {
      color: theme.colors.dashboard.todos,
      trackColor: theme.colors.gray,
      statusText: 'IN PROGRESS',
      rotation: (score / 100) * 180,
      scoreDisplay: score || 0,
    };

    if (score >= 80) {
      matrix.color = theme.colors.success;
      matrix.trackColor = theme.colors.successLight;
      matrix.statusText = 'EXCELLENT PROGRESS';
    } else if (score >= 50) {
      matrix.color = theme.colors.warning;
      matrix.trackColor = theme.colors.warningLight;
      matrix.statusText = 'MODERATE PROGRESS';
    } else if (score < 50) {
      matrix.color = theme.colors.error;
      matrix.trackColor = theme.colors.tertiary;
      matrix.statusText = 'NEEDS ATTENTION';
    }
    return matrix;
  };

  const scoreMetric = resolveScoreStyles(telemetrySummary.completionRate || 0);
  const velocityLabel = telemetrySummary.executionVelocity || 'Stable';

  return (
    <View style={styles.accordionShellCard}>
      {/* 🧭 DATE BANNER HEADER TRIGGER */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.accordionHeaderTrigger}
      >
        <View style={styles.metaTimeHeaderColumn}>
          <Text style={styles.dateDurationLabel}>
            {resolveTargetTimelineBoundary()}
          </Text>
        </View>

        <View
          style={[styles.chevronWrapper, isExpanded && styles.chevronRotated]}
        >
          <View style={styles.chevronPathLineLeft} />
          <View style={styles.chevronPathLineRight} />
        </View>
      </TouchableOpacity>

      {/* 🎯 MAIN OVERVIEW MODULE (RESPONSIVE SPLIT ON LANDSCAPE) */}
      <View style={styles.chartBlockSection}>
        <View style={styles.responsiveChartLayout}>
          {/* Chart Dial */}
          <View style={styles.pieContainer}>
            <View
              style={[
                styles.pieBaseCircle,
                { backgroundColor: scoreMetric.trackColor },
              ]}
            />
            {scoreMetric.scoreDisplay > 0 && (
              <View
                style={[
                  styles.pieProgressSlice,
                  {
                    backgroundColor: scoreMetric.color,
                    transform: [{ rotate: `${scoreMetric.rotation}deg` }],
                  },
                ]}
              />
            )}
            <View style={styles.pieInnerHoleMask}>
              <Text
                style={styles.dominantStateLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {scoreMetric.scoreDisplay}%
              </Text>
              <Text
                style={[styles.trendSubLabel, { color: scoreMetric.color }]}
              >
                {scoreMetric.statusText}
              </Text>
            </View>
          </View>

          {/* Stats Details Side Block */}
          <View style={styles.chartLegendSideColumn}>
            <View style={styles.legendNode}>
              <View
                style={[
                  styles.legendIndicatorDot,
                  { backgroundColor: scoreMetric.color },
                ]}
              />
              <Text style={styles.legendText}>
                Velocity:{' '}
                <Text style={styles.boldInlineText}>{velocityLabel}</Text>
              </Text>
            </View>
            <View style={[styles.legendNode, { marginTop: hp(0.8) }]}>
              <View
                style={[
                  styles.legendIndicatorDot,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <Text style={styles.legendText}>
                Average Drift:{' '}
                <Text style={styles.boldInlineText}>
                  {telemetrySummary.averageRolloverDrift ?? 0} days
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {typeBalanceAnalysis?.strategicInsight && (
          <Text style={styles.insightQuoteStr}>
            "{typeBalanceAnalysis.strategicInsight}"
          </Text>
        )}
      </View>

      {/* 🔓 CONDITIONAL DEEP INSIGHT DETAILS */}
      {isExpanded && (
        <View style={styles.expandedContentWrapper}>
          {/* 📊 MODULE 2: ALLOCATION RATIO ANALYSIS */}
          {typeBalanceAnalysis && (
            <View style={styles.internalSectionBlock}>
              <Text style={styles.sectionHeading}>
                TASK TYPE BALANCE ANALYSIS
              </Text>
              <View style={styles.trendMetricBlock}>
                <View style={styles.trendRow}>
                  <Text style={styles.trendLabel}>Allocation Ratio:</Text>
                  <View
                    style={[
                      styles.trendBadge,
                      { backgroundColor: theme.colors.warningLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.trendBadgeText,
                        { color: theme.colors.warning },
                      ]}
                    >
                      {typeBalanceAnalysis.allocationRatio || 'UNBALANCED'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.velocityText}>
                  Operational breakdown monitoring daily task distribution.
                </Text>
              </View>
            </View>
          )}

          {/* ⚠️ MODULE 3: ACTIVE SYSTEM BOTTLENECKS */}
          {rolloverFatigueBottlenecks &&
            rolloverFatigueBottlenecks.length > 0 && (
              <View style={styles.internalSectionBlock}>
                <Text style={styles.sectionHeading}>
                  ACTIVE ROLLOVER BOTTLENECKS
                </Text>
                {rolloverFatigueBottlenecks.map((item, index) => (
                  <View
                    key={`bottleneck-${index}`}
                    style={styles.metricRowWidget}
                  >
                    <View style={styles.widgetHeaderMeta}>
                      <Text style={styles.issueTitle}>
                        ⚡ {item.frictionFactor}
                      </Text>
                      <View
                        style={[
                          styles.intensityTag,
                          { backgroundColor: theme.colors.errorLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.intensityTagText,
                            { color: theme.colors.error },
                          ]}
                        >
                          CRITICAL IMPACT
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.coachingPillBox,
                        { borderLeftColor: scoreMetric.color },
                      ]}
                    >
                      <Text style={styles.coachingPillText}>
                        💡 {item.actionableFix}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

          {/* 🎯 MODULE 4: ACTIONABLE OPERATIONAL DIRECTIVES */}
          {actionableOperationalDirectives &&
            actionableOperationalDirectives.length > 0 && (
              <View style={styles.internalSectionBlock}>
                <Text style={styles.sectionHeading}>
                  ACTIONABLE OPERATIONAL DIRECTIVES
                </Text>
                {actionableOperationalDirectives.map((directive, index) => (
                  <View key={`directive-${index}`} style={styles.scheduleBlock}>
                    <Text style={styles.goalTitleText}>
                      🎯 DIRECTIVE {index + 1}
                    </Text>
                    <View
                      style={[
                        styles.adjustmentBox,
                        { borderLeftColor: theme.colors.dashboard.analytics },
                      ]}
                    >
                      <Text style={styles.adjustmentText}>{directive}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
        </View>
      )}
    </View>
  );
};

export default TodoAnalyticsView;

const createStyles = ({ wp, hp, isLandscape, moderateScale }) => {
  return StyleSheet.create({
    accordionShellCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: isLandscape ? hp(1.5) : hp(2),
      overflow: 'hidden',
      ...theme.elevation.depth1,
    },

    accordionHeaderTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(14),
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.tertiary,
    },

    metaTimeHeaderColumn: {
      flexDirection: 'column',
      flex: 1,
    },

    dateDurationLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(14),
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
      height: moderateScale(2.5),
      backgroundColor: theme.colors.textPrimary,
      borderRadius: 1,
      transform: [{ rotate: '45deg' }, { translateX: -2.5 }],
    },

    chevronPathLineRight: {
      position: 'absolute',
      width: moderateScale(7),
      height: moderateScale(2.5),
      backgroundColor: theme.colors.textPrimary,
      borderRadius: 1,
      transform: [{ rotate: '-45deg' }, { translateX: 2.5 }],
    },

    chartBlockSection: {
      padding: moderateScale(16),
      backgroundColor: theme.colors.white,
    },

    responsiveChartLayout: {
      flexDirection: isLandscape ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: isLandscape ? 'space-evenly' : 'center',
      marginVertical: hp(1.5),
      gap: isLandscape ? moderateScale(20) : moderateScale(8),
    },

    pieContainer: {
      width: moderateScale(140),
      height: moderateScale(140),
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },

    pieBaseCircle: {
      position: 'absolute',
      width: moderateScale(140),
      height: moderateScale(140),
      borderRadius: moderateScale(70),
    },

    pieProgressSlice: {
      position: 'absolute',
      width: moderateScale(140),
      height: moderateScale(140),
      borderRadius: moderateScale(70),
      overflow: 'hidden',
    },

    pieInnerHoleMask: {
      width: moderateScale(106),
      height: moderateScale(106),
      borderRadius: moderateScale(53),
      backgroundColor: theme.colors.white,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: moderateScale(8),
      zIndex: 10,
      ...theme.elevation.depth1,
    },

    dominantStateLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(22),
      textAlign: 'center',
    },

    trendSubLabel: {
      fontFamily: theme.typography.semiBold,
      fontSize: moderateScale(10),
      marginTop: moderateScale(2),
      textAlign: 'center',
    },

    chartLegendSideColumn: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: isLandscape ? 'flex-start' : 'center',
    },

    legendNode: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    legendIndicatorDot: {
      width: moderateScale(10),
      height: moderateScale(10),
      borderRadius: moderateScale(5),
      marginRight: moderateScale(8),
    },

    legendText: {
      fontFamily: theme.typography.regular,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
    },

    boldInlineText: {
      fontFamily: theme.typography.bold,
    },

    insightQuoteStr: {
      fontFamily: theme.typography.medium,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13.5),
      textAlign: 'center',
      lineHeight: moderateScale(20),
      marginTop: hp(1),
      fontStyle: 'italic',
    },

    expandedContentWrapper: {
      paddingHorizontal: moderateScale(16),
      paddingBottom: moderateScale(16),
      borderTopWidth: 1,
      borderTopColor: theme.colors.tertiary,
      backgroundColor: theme.colors.background,
    },

    internalSectionBlock: {
      marginTop: hp(2),
    },

    sectionHeading: {
      fontFamily: theme.typography.bold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12),
      letterSpacing: 1.2,
      marginBottom: hp(0.8),
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
      fontSize: moderateScale(13.5),
      flex: 1,
    },

    intensityTag: {
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: theme.borderRadius.small,
      marginLeft: moderateScale(8),
    },

    intensityTagText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(9.5),
    },

    coachingPillBox: {
      backgroundColor: theme.colors.white,
      padding: moderateScale(12),
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: moderateScale(4),
      ...theme.elevation.depth1,
    },

    coachingPillText: {
      fontFamily: theme.typography.medium,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(19),
    },

    trendMetricBlock: {
      backgroundColor: theme.colors.white,
      padding: moderateScale(14),
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: hp(0.6),
    },

    trendLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13.5),
    },

    trendBadge: {
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(4),
      borderRadius: theme.borderRadius.small,
    },

    trendBadgeText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(11),
    },

    velocityText: {
      fontFamily: theme.typography.regular,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12.5),
      marginTop: moderateScale(4),
      opacity: 0.8,
    },

    scheduleBlock: {
      backgroundColor: theme.colors.white,
      padding: moderateScale(12),
      borderRadius: theme.borderRadius.large,
      marginBottom: hp(1),
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    goalTitleText: {
      fontFamily: theme.typography.bold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13.5),
      marginBottom: moderateScale(6),
    },

    adjustmentBox: {
      backgroundColor: theme.colors.background,
      padding: moderateScale(10),
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: moderateScale(3),
    },

    adjustmentText: {
      fontFamily: theme.typography.regular,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
      lineHeight: moderateScale(18),
    },
  });
};
