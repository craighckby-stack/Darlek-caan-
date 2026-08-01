/**
 * TELEMETRY & DIAGNOSTIC UTILITIES FOR FAST DOWNLOADER
 * Role: Provides telemetry computation, status formatting, and high-resolution performance metrics.
 * System: Darlek Caan Code Evolution Engine
 */

function formatTimestamp() {
  return new Date().toISOString();
}

function computeMetrics(total, updated, failed, durationMs) {
  const successRate = total > 0 ? ((total - failed) / total) * 100 : 100;
  return {
    timestamp: formatTimestamp(),
    metrics: {
      totalFilesProcessed: total,
      filesUpdated: updated,
      filesFailed: failed,
      executionDurationMs: parseFloat(durationMs.toFixed(2)),
      successRatePercent: parseFloat(successRate.toFixed(2))
    },
    status: failed > 0 ? 'WARNING' : 'HEALTHY'
  };
}

module.exports = {
  formatTimestamp,
  computeMetrics
};