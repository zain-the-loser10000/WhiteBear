/**
 * @file HabitAnalyticsView.jsx
 * @module utilities/custom-components/analytics/HabitAnalyticsView
 * @description Clean interactive accordion card component for habits analytics with landscape optimization.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../../../styles/Themes';

const HabitAnalyticsView = ({
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
    globalAdherenceOverview,
    triadExecutionFriction,
    streakResilienceMatrix,
    psychologicalAdherenceDrivers,
    coachingDirectives,
    overallInsight,
  } = data;

  /**
   * 📅 TIME BOUNDARY RESOLVER
   */
  const resolveTargetTimelineBoundary = () => {
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

  /**
   * 🎯 DYNAMIC ADHERENCE METRIC STYLING
   */
  const resolveAdherenceStyles = rate => {
    const matrix = {
      color: theme.colors.primary,
      trackColor: theme.colors.gray,
      statusText: 'BUILDING',
      rotation: (rate / 100) * 180,
      scoreDisplay: rate || 0,
    };

    if (rate >= 80) {
      matrix.color = theme.colors.success;
      matrix.trackColor = theme.colors.successLight;
      matrix.statusText = 'EXCELLENT CONSISTENCY';
    } else if (rate >= 50) {
      matrix.color = theme.colors.warning;
      matrix.trackColor = theme.colors.warningLight;
      matrix.statusText = 'MODERATE CONSISTENCY';
    } else if (rate < 50 && rate > 0) {
      matrix.color = theme.colors.error;
      matrix.trackColor = theme.colors.tertiary;
      matrix.statusText = 'NEEDS ATTENTION';
    } else {
      matrix.color = theme.colors.gray;
      matrix.trackColor = theme.colors.tertiary;
      matrix.statusText = 'NO HABITS TRACKED';
    }
    return matrix;
  };

  /**
   * 🏷️ CONSISTENCY RATING BADGE
   */
  const getConsistencyBadgeStyle = rating => {
    const map = {
      Consistent: { bg: theme.colors.successLight, text: theme.colors.success },
      Building: { bg: theme.colors.warningLight, text: theme.colors.warning },
      Inconsistent: { bg: theme.colors.errorLight, text: theme.colors.error },
      Erratic: { bg: theme.colors.errorLight, text: theme.colors.error },
      None: { bg: theme.colors.tertiary, text: theme.colors.textMuted },
    };
    return map[rating] || map.None;
  };

  /**
   * 🏷️ STREAK TRAJECTORY BADGE
   */
  const getStreakBadgeStyle = trajectory => {
    const map = {
      Strengthening: {
        bg: theme.colors.successLight,
        text: theme.colors.success,
      },
      Plateaued: { bg: theme.colors.warningLight, text: theme.colors.warning },
      Vulnerable: { bg: theme.colors.errorLight, text: theme.colors.error },
      None: { bg: theme.colors.tertiary, text: theme.colors.textMuted },
    };
    return map[trajectory] || map.None;
  };

  const adherenceMetric = resolveAdherenceStyles(
    globalAdherenceOverview?.macroAdherenceRate || 0,
  );
  const consistencyBadge = getConsistencyBadgeStyle(
    globalAdherenceOverview?.consistencyRating || 'None',
  );
  const streakBadge = getStreakBadgeStyle(
    streakResilienceMatrix?.streakTrajectory || 'None',
  );

  return (
    <View style={styles.accordionShellCard}>
      {/* 🧭 DATE BANNER ACCORDION HEADER TRIGGER */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.accordionHeaderTrigger}
      >
        <View style={styles.metaTimeHeaderColumn}>
          <Text style={styles.dateDurationLabel}>
            {resolveTargetTimelineBoundary()}
          </Text>
          {globalAdherenceOverview?.consistencyRating && (
            <View style={styles.consistencyBadgeRow}>
              <View
                style={[
                  styles.consistencyBadge,
                  { backgroundColor: consistencyBadge.bg },
                ]}
              >
                <Text
                  style={[
                    styles.consistencyBadgeText,
                    { color: consistencyBadge.text },
                  ]}
                >
                  {globalAdherenceOverview.consistencyRating.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View
          style={[styles.chevronWrapper, isExpanded && styles.chevronRotated]}
        >
          <View style={styles.chevronPathLineLeft} />
          <View style={styles.chevronPathLineRight} />
        </View>
      </TouchableOpacity>

      {/* 🎯 PERSISTENT VISIBLE MODULE: ADHERENCE OVERVIEW */}
      <View style={styles.chartBlockSection}>
        <View style={styles.responsiveChartLayout}>
          {/* Chart Dial Indicator */}
          <View style={styles.pieContainer}>
            <View
              style={[
                styles.pieBaseCircle,
                { backgroundColor: adherenceMetric.trackColor },
              ]}
            />
            {adherenceMetric.scoreDisplay > 0 && (
              <View
                style={[
                  styles.pieProgressSlice,
                  {
                    backgroundColor: adherenceMetric.color,
                    transform: [{ rotate: `${adherenceMetric.rotation}deg` }],
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
                {adherenceMetric.scoreDisplay}%
              </Text>
              <Text
                style={[styles.trendSubLabel, { color: adherenceMetric.color }]}
              >
                {adherenceMetric.statusText}
              </Text>
            </View>
          </View>

          {/* Side Legend Metadata Pillar */}
          <View style={styles.chartLegendSideColumn}>
            <View style={styles.legendNode}>
              <View
                style={[
                  styles.legendIndicatorDot,
                  { backgroundColor: adherenceMetric.color },
                ]}
              />
              <Text style={styles.legendText}>
                Adherence Rate:{' '}
                <Text style={styles.boldInlineText}>
                  {adherenceMetric.scoreDisplay}%
                </Text>
              </Text>
            </View>
            <View style={styles.legendNode}>
              <View
                style={[
                  styles.legendIndicatorDot,
                  { backgroundColor: streakBadge.text },
                ]}
              />
              <Text style={styles.legendText}>
                Streak:{' '}
                <Text style={styles.boldInlineText}>
                  {streakResilienceMatrix?.streakTrajectory || 'None'}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Behavioral Drivers Quote */}
        {globalAdherenceOverview?.behavioralDrivers && (
          <Text style={styles.insightQuoteStr}>
            "{globalAdherenceOverview.behavioralDrivers}"
          </Text>
        )}
      </View>

      {/* 🔓 CONDITIONAL DEEP INSIGHT DETAILS */}
      {isExpanded && (
        <View style={styles.expandedContentWrapper}>
          {/* 📊 MODULE 2: STREAK RESILIENCE MATRIX */}
          {streakResilienceMatrix && (
            <View style={styles.internalSectionBlock}>
              <Text style={styles.sectionHeading}>STREAK RESILIENCE</Text>
              <View style={styles.streakMatrixBlock}>
                <View style={styles.streakRow}>
                  <Text style={styles.streakLabel}>Trajectory:</Text>
                  <View
                    style={[
                      styles.streakBadge,
                      { backgroundColor: streakBadge.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.streakBadgeText,
                        { color: streakBadge.text },
                      ]}
                    >
                      {streakResilienceMatrix.streakTrajectory || 'None'}
                    </Text>
                  </View>
                </View>
                <View style={styles.streakRow}>
                  <Text style={styles.streakLabel}>Relapse Risk:</Text>
                  <Text style={styles.riskText}>
                    {streakResilienceMatrix.relapseVulnerabilityRisk ||
                      'Unknown'}
                  </Text>
                </View>
                {streakResilienceMatrix.mostVulnerableHabit && (
                  <View style={styles.streakRow}>
                    <Text style={styles.streakLabel}>Most Vulnerable:</Text>
                    <Text style={styles.vulnerableHabitText}>
                      {streakResilienceMatrix.mostVulnerableHabit}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ⚠️ MODULE 3: TRIAD EXECUTION FRICTION */}
          {triadExecutionFriction && triadExecutionFriction.length > 0 && (
            <View style={styles.internalSectionBlock}>
              <Text style={styles.sectionHeading}>
                STOP • START • CONTINUE FRICTION
              </Text>
              {triadExecutionFriction.map((item, index) => (
                <View key={`friction-${index}`} style={styles.frictionWidget}>
                  <View style={styles.frictionHeader}>
                    <Text style={styles.frictionHabitTitle}>
                      {item.habitTitle || 'Unnamed Habit'}
                    </Text>
                    <View
                      style={[
                        styles.failingVectorBadge,
                        {
                          backgroundColor:
                            item.failingVector === 'STOP'
                              ? theme.colors.errorLight
                              : item.failingVector === 'START'
                              ? theme.colors.warningLight
                              : theme.colors.successLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.failingVectorText,
                          {
                            color:
                              item.failingVector === 'STOP'
                                ? theme.colors.error
                                : item.failingVector === 'START'
                                ? theme.colors.warning
                                : theme.colors.success,
                          },
                        ]}
                      >
                        {item.failingVector || 'START'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.frictionTriggerBox}>
                    <Text style={styles.frictionTriggerText}>
                      ⚡{' '}
                      {item.identifiedFrictionTrigger ||
                        'No friction identified'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.microActionBox,
                      { borderLeftColor: theme.colors.dashboard.analytics },
                    ]}
                  >
                    <Text style={styles.microActionText}>
                      💡{' '}
                      {item.microActionCorrection || 'No correction provided'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* 🧠 MODULE 4: PSYCHOLOGICAL ADHERENCE DRIVERS */}
          {psychologicalAdherenceDrivers && (
            <View style={styles.internalSectionBlock}>
              <Text style={styles.sectionHeading}>PSYCHOLOGICAL DRIVERS</Text>
              <View style={styles.psychBlock}>
                <View style={styles.psychRow}>
                  <Text style={styles.psychLabel}>Positive Drivers:</Text>
                  <Text style={styles.psychText}>
                    {psychologicalAdherenceDrivers.positiveDrivers ||
                      'None identified'}
                  </Text>
                </View>
                <View style={styles.psychRow}>
                  <Text style={styles.psychLabel}>Friction Sources:</Text>
                  <Text style={styles.psychText}>
                    {psychologicalAdherenceDrivers.frictionSources ||
                      'None identified'}
                  </Text>
                </View>
                <View style={styles.psychRow}>
                  <Text style={styles.psychLabel}>Motivation Profile:</Text>
                  <Text style={styles.psychText}>
                    {psychologicalAdherenceDrivers.motivationProfile ||
                      'Unknown'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 🎯 MODULE 5: COACHING DIRECTIVES */}
          {coachingDirectives && coachingDirectives.length > 0 && (
            <View style={styles.internalSectionBlock}>
              <Text style={styles.sectionHeading}>COACHING DIRECTIVES</Text>
              {coachingDirectives.map((directive, index) => (
                <View key={`directive-${index}`} style={styles.directiveBox}>
                  <Text style={styles.directiveNumber}>{index + 1}.</Text>
                  <Text style={styles.directiveText}>{directive}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 🌟 MODULE 6: OVERALL INSIGHT */}
          {overallInsight && (
            <View
              style={[styles.internalSectionBlock, styles.overallInsightBlock]}
            >
              <Text style={styles.sectionHeading}>OVERALL INSIGHT</Text>
              <Text style={styles.overallInsightText}>"{overallInsight}"</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default HabitAnalyticsView;

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

    consistencyBadgeRow: {
      marginTop: moderateScale(4),
    },

    consistencyBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(3),
      borderRadius: theme.borderRadius.small,
    },

    consistencyBadgeText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(9),
      letterSpacing: 0.5,
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
      gap: moderateScale(8),
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

    // ─── STREAK MATRIX ────────────────────────────────────
    streakMatrixBlock: {
      backgroundColor: theme.colors.white,
      padding: moderateScale(14),
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    streakRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: moderateScale(4),
    },

    streakLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
    },

    streakBadge: {
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(4),
      borderRadius: theme.borderRadius.small,
    },

    streakBadgeText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(11),
    },

    riskText: {
      fontFamily: theme.typography.medium,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
    },

    vulnerableHabitText: {
      fontFamily: theme.typography.medium,
      color: theme.colors.error,
      fontSize: moderateScale(13),
    },

    // ─── FRICTION WIDGET ──────────────────────────────────
    frictionWidget: {
      backgroundColor: theme.colors.white,
      padding: moderateScale(14),
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: hp(1.2),
    },

    frictionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: moderateScale(8),
    },

    frictionHabitTitle: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13.5),
      flex: 1,
    },

    failingVectorBadge: {
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(3),
      borderRadius: theme.borderRadius.small,
      marginLeft: moderateScale(8),
    },

    failingVectorText: {
      fontFamily: theme.typography.bold,
      fontSize: moderateScale(10),
      letterSpacing: 0.5,
    },

    frictionTriggerBox: {
      backgroundColor: theme.colors.background,
      padding: moderateScale(10),
      borderRadius: theme.borderRadius.medium,
      marginBottom: moderateScale(8),
    },

    frictionTriggerText: {
      fontFamily: theme.typography.regular,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12.5),
      lineHeight: moderateScale(18),
    },

    microActionBox: {
      backgroundColor: theme.colors.background,
      padding: moderateScale(10),
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: moderateScale(4),
    },

    microActionText: {
      fontFamily: theme.typography.medium,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12.5),
      lineHeight: moderateScale(18),
    },

    // ─── PSYCHOLOGICAL DRIVERS ────────────────────────────
    psychBlock: {
      backgroundColor: theme.colors.white,
      padding: moderateScale(14),
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    psychRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: moderateScale(4),
      flexWrap: 'wrap',
    },

    psychLabel: {
      fontFamily: theme.typography.semiBold,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12.5),
      marginRight: moderateScale(4),
      minWidth: moderateScale(110),
    },

    psychText: {
      fontFamily: theme.typography.regular,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(12.5),
      flex: 1,
      lineHeight: moderateScale(18),
    },

    // ─── COACHING DIRECTIVES ──────────────────────────────
    directiveBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.white,
      padding: moderateScale(12),
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: moderateScale(8),
    },

    directiveNumber: {
      fontFamily: theme.typography.bold,
      color: theme.colors.dashboard.analytics,
      fontSize: moderateScale(14),
      marginRight: moderateScale(10),
      minWidth: moderateScale(22),
    },

    directiveText: {
      fontFamily: theme.typography.regular,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13),
      flex: 1,
      lineHeight: moderateScale(18),
    },

    // ─── OVERALL INSIGHT ──────────────────────────────────
    overallInsightBlock: {
      backgroundColor: theme.colors.white,
      padding: moderateScale(14),
      borderRadius: theme.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    overallInsightText: {
      fontFamily: theme.typography.medium,
      color: theme.colors.textPrimary,
      fontSize: moderateScale(13.5),
      lineHeight: moderateScale(20),
      fontStyle: 'italic',
    },
  });
};
