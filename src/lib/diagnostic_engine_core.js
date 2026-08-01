/**
 * DIAGNOSTIC ENGINE CORE
 * Role: Enterprise diagnostic lifecycle management, performance telemetry tracking, and structured health reporting.
 * Integration: Siphoned pattern from AI_Agent_OS diagnostic_engine.py.
 */

class DiagnosticEngine {
  constructor(serviceName = 'DEFAULT_SERVICE') {
    this.serviceName = serviceName;
    this.operations = new Map();
    this.results = [];
  }

  /**
   * Starts timing a diagnostic operation.
   * @param {string} opName 
   */
  start(opName) {
    this.operations.set(opName, {
      startTime: process.hrtime.bigint(),
      status: 'RUNNING'
    });
  }

  /**
   * Logs successful completion of a named operation.
   * @param {string} opName 
   * @param {object} metadata 
   */
  logSuccess(opName, metadata = {}) {
    const op = this.operations.get(opName);
    const durationMs = op
      ? Number(process.hrtime.bigint() - op.startTime) / 1e6
      : 0;

    const result = {
      opName,
      status: 'PASSED',
      durationMs: Math.round(durationMs * 1000) / 1000,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);
    this.operations.delete(opName);
    return result;
  }

  /**
   * Logs failure of a named operation.
   * @param {string} opName 
   * @param {string} error 
   * @param {object} metadata 
   */
  logFailure(opName, error, metadata = {}) {
    const op = this.operations.get(opName);
    const durationMs = op
      ? Number(process.hrtime.bigint() - op.startTime) / 1e6
      : 0;

    const result = {
      opName,
      status: 'FAILED',
      durationMs: Math.round(durationMs * 1000) / 1000,
      error,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.results.push(result);
    this.operations.delete(opName);
    return result;
  }

  /**
   * Generates a comprehensive health report for all logged operations.
   * @returns {object}
   */
  report() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = total - passed;
    const isHealthy = total > 0 && failed === 0;

    const summary = {
      service: this.serviceName,
      status: isHealthy ? 'HEALTHY' : 'CRITICAL_FAILURE',
      totalOperations: total,
      passed,
      failed,
      passRatePercent: total > 0 ? Math.round((passed / total) * 10000) / 100 : 0,
      timestamp: new Date().toISOString()
    };

    console.log(`\n--- [DIAGNOSTIC TELEMETRY REPORT: ${this.serviceName}] ---`);
    console.log(JSON.stringify({ summary, details: this.results }, null, 2));
    console.log(`--------------------------------------------------------\n`);

    return summary;
  }
}

module.exports = { DiagnosticEngine };