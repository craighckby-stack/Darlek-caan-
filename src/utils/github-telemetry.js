/**
 * @file src/utils/github-telemetry.js
 * @description Telemetry and metric computation utilities for the GitHub Page Diagnostic Engine.
 * Siphoned and adapted from the AI_Agent_OS diagnostic framework.
 */

function formatTimestamp() {
  return new Date().toISOString();
}

function summarizeDiagnosticResults(checks) {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(v => v.passed).length;
  const failed = total - passed;
  const isHealthy = total > 0 && failed === 0;

  return {
    total,
    passed,
    failed,
    isHealthy,
    passRate: total > 0 ? parseFloat(((passed / total) * 100).toFixed(2)) : 0.0
  };
}

function generateTelemetryMetadata() {
  return {
    timestamp: Date.now(),
    processId: process.pid,
    version: "1.1.0-TELEMETRY-AWARE",
    platform: process.platform,
    nodeVersion: process.version
  };
}

function computeDiffMetrics(str1, str2) {
  const lines1 = str1.split('\n');
  const lines2 = str2.split('\n');
  
  const set1 = new Set(lines1.map(l => l.trim()));
  const set2 = new Set(lines2.map(l => l.trim()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const jaccardSimilarity = union.size > 0 ? (intersection.size / union.size) : 0;
  
  return {
    linesCount1: lines1.length,
    linesCount2: lines2.length,
    sizeBytes1: Buffer.byteLength(str1, 'utf8'),
    sizeBytes2: Buffer.byteLength(str2, 'utf8'),
    similarityIndex: parseFloat((jaccardSimilarity * 100).toFixed(2)),
    addedLinesApprox: Math.max(0, lines2.length - lines1.length),
    removedLinesApprox: Math.max(0, lines1.length - lines2.length)
  };
}

module.exports = {
  formatTimestamp,
  summarizeDiagnosticResults,
  generateTelemetryMetadata,
  computeDiffMetrics
};