/**
 * @file analytics.controller.js
 * @module controllers/analyticsController
 * @description Fully read-only historical analytic log consumer layer fed by background chronos engine.
 */

const Analytics = require('../models/analytic.schema');
const AppError = require('../errors/app-error');

/**
 * @description Helper to streamline common read operations for all analytic scopes.
 * @param {string} type - System identifier ('GOALS', 'JOURNALS', 'TODOS', 'HABITS')
 * @param {string} fallbackLabel - Human-readable fallback status description
 */
const fetchLatestSnapshot = (type, fallbackLabel) => async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('Authentication credentials missing.', 401));
    }

    let rangeMode = 'biweekly';
    let label = fallbackLabel || `${type} performance context summary`;

    if (req.query.range === 'monthly') {
      rangeMode = 'monthly';
    } else if (req.query.range === 'quarterly') {
      rangeMode = 'quarterly';
    }

    const savedSnapshot = await Analytics.findOne({
      userId,
      analyticsType: type,
      rangeMode,
    }).sort({ computedAt: -1 });

    // 🛑 CACHE MISS HANDLING: No more live fallback computation, only clean warnings.
    if (!savedSnapshot) {
      return res.status(200).json({
        success: true,
        source: 'cache_miss_fallback',
        message: `Our AI engines are currently syncing your ${rangeMode} snapshot. Please refresh shortly.`,
        [`${type.toLowerCase()}Analytics`]: null,
        data: null, // Unified response formatting safety mapping
      });
    }

    // 🟢 SUCCESS RESPONSES
    return res.status(200).json({
      success: true,
      rangeEvaluated: rangeMode,
      source: 'automated_background_snapshot',
      message: `${label} loaded successfully.`,
      timestamp: savedSnapshot.computedAt,
      window: {
        start: savedSnapshot.windowStartDate,
        end: savedSnapshot.windowEndDate,
      },
      // Keep structural backwards compatibility for legacy endpoints mapping formats
      [`${type.toLowerCase()}Analytics`]: savedSnapshot.data,
      data: savedSnapshot.data,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @description Retrieves the latest pre-computed goals analytics from the historical sequence.
 * @access      Private
 */
exports.getGoalsAnalytics = fetchLatestSnapshot(
  'GOALS',
  'Goals performance report'
);

/**
 * @description Retrieves the latest pre-computed journal reflections. (Live evaluation block removed)
 * @access      Private
 */
exports.getJournalAnalytics = fetchLatestSnapshot(
  'JOURNALS',
  'Psychological alignment trend'
);

/**
 * @description Retrieves the latest pre-computed TODO analytics telemetry. (Live calculation bypassed)
 * @access      Private
 */
exports.getTodoAnalytics = fetchLatestSnapshot(
  'TODOS',
  'Telemetry alignment metrics'
);

/**
 * @description Compiles aggregate habit completion states alongside deep AI engine updates.
 * @access      Private
 */
exports.getHabitAnalytics = fetchLatestSnapshot(
  'HABITS',
  'Behavioral adherence analytics'
);

/**
 * @description Extracts and streams analytical layers directly into customized JSON/CSV pipelines.
 * @access      Private
 */
exports.exportAnalyticsData = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return next(new AppError('Authentication credentials missing.', 401));

    const targetType = req.query.type ? req.query.type.toUpperCase() : 'ALL';
    const rangeMode = ['biweekly', 'monthly', 'quarterly'].includes(
      req.query.range
    )
      ? req.query.range
      : 'biweekly';
    const fileFormat = req.query.format === 'csv' ? 'csv' : 'json';

    const daysLookback =
      rangeMode === 'quarterly' ? 90 : rangeMode === 'monthly' ? 30 : 15;
    const rangeDaysText = `${daysLookback}_days`;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysLookback);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    const dateRangeLabel = `${startDateStr}_to_${endDateStr}`;

    const queryConditions = { userId, rangeMode };
    if (targetType !== 'ALL') queryConditions.analyticsType = targetType;

    const records = await Analytics.find(queryConditions).sort({
      analyticsType: 1,
      computedAt: -1,
    });

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No operational analytics records found for the ${rangeMode} window.`,
      });
    }

    if (fileFormat === 'json') {
      const exportPayload = {
        meta: {
          app: 'WhiteBear Core Engine',
          exportedAt: new Date().toISOString(),
          timeHorizon: rangeMode,
          dateRange: `${startDateStr} to ${endDateStr}`,
          targetScope: targetType,
        },
        analyticsPayload: records.map((rec) => ({
          type: rec.analyticsType,
          computedAt: rec.computedAt,
          window: { start: rec.windowStartDate, end: rec.windowEndDate },
          insights: rec.data,
        })),
      };

      const fileName = `${targetType.toLowerCase()}_analytics_${rangeDaysText}(${dateRangeLabel}).json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );
      return res.send(JSON.stringify(exportPayload, null, 2));
    }

    if (fileFormat === 'csv') {
      let csvContent =
        'Type,Horizon,Computed At,Section,Metric Target,User Insight & Actionable Guidance\n';

      records.forEach((rec) => {
        const type = rec.analyticsType;
        const computed = rec.computedAt.toISOString();

        if (rec.data && typeof rec.data === 'object') {
          if (type === 'JOURNALS') {
            if (rec.data.emotionalTrajectory) {
              const et = rec.data.emotionalTrajectory;
              csvContent += `"${type}","${rangeMode}","${computed}","Emotional Trajectory","Dominant State","${et.dominantState || ''}"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Emotional Trajectory","Trend Direction","${et.trendDirection || ''}"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Emotional Trajectory","Mental Clarity Insight","${(et.mentalClarityInsight || '').replace(/"/g, '""')}"\n`;
            }
            if (Array.isArray(rec.data.psychologicalBottlenecks)) {
              rec.data.psychologicalBottlenecks.forEach((b, idx) => {
                const num = idx + 1;
                csvContent += `"${type}","${rangeMode}","${computed}","Psychological Bottlenecks","Block #${num} Core Issue","${(b.coreIssue || '').replace(/"/g, '""')}"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Psychological Bottlenecks","Block #${num} Evidence","${(b.evidenceSummary || '').replace(/"/g, '""')}"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Psychological Bottlenecks","Block #${num} Coaching Recommendation","${(b.coachingAdjustment || '').replace(/"/g, '""')}"\n`;
              });
            }
            if (Array.isArray(rec.data.weeklyReviewSyntheses)) {
              rec.data.weeklyReviewSyntheses.forEach((w) => {
                const range = w.weekRange || 'Review Window';
                csvContent += `"${type}","${rangeMode}","${computed}","Weekly Syntheses (${range})","Macro Win","${(w.macroWinInsight || '').replace(/"/g, '""')}"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Weekly Syntheses (${range})","Growth Takeaway","${(w.growthTakeaway || '').replace(/"/g, '""')}"\n`;
              });
            }
            if (Array.isArray(rec.data.mindfulnessActionItems)) {
              rec.data.mindfulnessActionItems.forEach((item, idx) => {
                csvContent += `"${type}","${rangeMode}","${computed}","Mindfulness Action Steps","Action Item #${idx + 1}","${item.replace(/"/g, '""')}"\n`;
              });
            }
          }

          if (type === 'GOALS') {
            if (rec.data.predictiveSuccessScore) {
              const pss = rec.data.predictiveSuccessScore;
              csvContent += `"${type}","${rangeMode}","${computed}","Predictive Metrics","Success Score","${pss.scorePercentage || 0}%"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Predictive Metrics","Confidence Interval","${pss.confidenceInterval || ''}"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Predictive Metrics","Score Rationale","${(pss.predictiveRationale || '').replace(/"/g, '""')}"\n`;
            }
            if (Array.isArray(rec.data.behavioralBottlenecks)) {
              rec.data.behavioralBottlenecks.forEach((b, idx) => {
                const num = idx + 1;
                csvContent += `"${type}","${rangeMode}","${computed}","Goal Performance Blocks","Friction Factor #${num}","${(b.frictionFactor || '').replace(/"/g, '""')}"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Goal Performance Blocks","Factor Impact Level","${b.impactLevel || ''}"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Goal Performance Blocks","Actionable Optimization Fix","${(b.actionableFix || '').replace(/"/g, '""')}"\n`;
              });
            }
            if (rec.data.momentumTrendAnalysis) {
              const mta = rec.data.momentumTrendAnalysis;
              csvContent += `"${type}","${rangeMode}","${computed}","Momentum Metrics","Trajectory Vector","${mta.trajectory || ''}"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Momentum Metrics","Velocity Description","${(mta.velocityDescription || '').replace(/"/g, '""')}"\n`;
            }
            if (Array.isArray(rec.data.adaptiveScheduleOptimizations)) {
              rec.data.adaptiveScheduleOptimizations.forEach((o, idx) => {
                csvContent += `"${type}","${rangeMode}","${computed}","Schedule Adjustments","Target Goal Scope","${(o.goalTitle || '').replace(/"/g, '""')}"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Schedule Adjustments","Proposed Routine Shift #${idx + 1}","${(o.proposedAdjustment || '').replace(/"/g, '""')}"\n`;
              });
            }
            if (Array.isArray(rec.data.underPerformingSectors)) {
              rec.data.underPerformingSectors.forEach((sector, idx) => {
                csvContent += `"${type}","${rangeMode}","${computed}","Lagging Focus Categories","Category Hazard Unit #${idx + 1}","${sector.replace(/"/g, '""')}"\n`;
              });
            }
          }

          if (type === 'TODOS') {
            if (rec.data.telemetrySummary) {
              const ts = rec.data.telemetrySummary;
              csvContent += `"${type}","${rangeMode}","${computed}","Telemetry Metrics","Completion Velocity Rate","${ts.completionRate || 0}%"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Telemetry Metrics","Average Calendar Rollover Count","${ts.averageRolloverDrift || 0} times"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Telemetry Metrics","Current Execution Speed Vector","${ts.executionVelocity || ''}"\n`;
            }
            if (rec.data.typeBalanceAnalysis) {
              const tba = rec.data.typeBalanceAnalysis;
              csvContent += `"${type}","${rangeMode}","${computed}","Workload Alignment Balance","Task Type Resource Allocation Ratio","${tba.allocationRatio || ''}"\n`;
              csvContent += `"${type}","${rangeMode}","${computed}","Workload Alignment Balance","Strategic Allocation Evaluation","${(tba.strategicInsight || '').replace(/"/g, '""')}"\n`;
            }
            if (Array.isArray(rec.data.rolloverFatigueBottlenecks)) {
              rec.data.rolloverFatigueBottlenecks.forEach((b, idx) => {
                const label = `Failing Task Item #${idx + 1}`;
                csvContent += `"${type}","${rangeMode}","${computed}","Rollover Slippage Critical Blocks","${label} Description Snippet","${(b.taskTitleSnippet || '').replace(/"/g, '""')}"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Rollover Slippage Critical Blocks","${label} Postponement Total Count","${b.accumulatedRollovers || 0} rollovers"\n`;
                csvContent += `"${type}","${rangeMode}","${computed}","Rollover Slippage Critical Blocks","${label} Bottleneck Friction Diagnosis","${(b.frictionDiagnosis || '').replace(/"/g, '""')}"\n`;
              });
            }
            if (Array.isArray(rec.data.actionableOperationalDirectives)) {
              rec.data.actionableOperationalDirectives.forEach(
                (directive, idx) => {
                  csvContent += `"${type}","${rangeMode}","${computed}","Workflow Execution Changes","Action Optimization Strategy #${idx + 1}","${directive.replace(/"/g, '""')}"\n`;
                }
              );
            }
          }
        } else {
          csvContent += `"${type}","${rangeMode}","${computed}","General Summary","Raw Data Payload","${(rec.data || '').toString().replace(/"/g, '""')}"\n`;
        }
      });

      const fileName = `${targetType.toLowerCase()}_analytics_${rangeDaysText}(${dateRangeLabel}).csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );
      return res.send(csvContent);
    }
  } catch (error) {
    return next(error);
  }
};
