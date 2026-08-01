/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Helper utilities for diagnostic execution formatting and timing.
 * Siphoned from: AI_Agent_OS/diagnostic_engine_utils.py
 */

/**
 * Returns ISO 8601 formatted UTC timestamp.
 */
function formatTimestamp() {
  return new Date().toISOString();
}

/**
 * Executes a function and measures execution duration.
 * @param {Function} fn 
 * @returns {Promise<{data: any, duration_ms: number}>}
 */
async function trackDiagnosticExecution(fn) {
  const start = process.hrtime.bigint();
  try {
    const data = await fn();
    const end = process.hrtime.bigint();
    const duration_ms = Number(end - start) / 1e6;
    return { data, duration_ms };
  } catch (err) {
    const end = process.hrtime.bigint();
    const duration_ms = Number(end - start) / 1e6;
    throw { error: err, duration_ms };
  }
}

module.exports = {
  formatTimestamp,
  trackDiagnosticExecution
};