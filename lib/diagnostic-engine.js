/**
 * DIAGNOSTIC ENGINE
 * Role: Telemetry, logging, and health monitoring for system processes.
 */

class DiagnosticEngine {
  constructor(context) {
    this.context = context;
    this.metrics = {};
  }

  log(message) {
    console.log(`[${this.context}] [${this.formatTimestamp()}] INFO: ${message}`);
  }

  error(message, err) {
    console.error(`[${this.context}] [${this.formatTimestamp()}] ERROR: ${message}`, err);
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  async executeWithTelemetry(fn, label) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.metrics[label] = { status: 'PASS', duration_ms: duration };
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.metrics[label] = { status: 'FAIL', duration_ms: duration, error: error.message };
      throw error;
    }
  }

  summarizeResults(deltaReport) {
    const totalChanges = deltaReport.added.length + deltaReport.modified.length + deltaReport.deleted.length;
    return {
      total_changes: totalChanges,
      is_healthy: totalChanges === 0,
      telemetry: this.metrics,
      pass_rate: this._calculatePassRate()
    };
  }

  _calculatePassRate() {
    const checks = Object.values(this.metrics);
    if (checks.length === 0) return 100;
    const passed = checks.filter(c => c.status === 'PASS').length;
    return (passed / checks.length) * 100;
  }
}

module.exports = { DiagnosticEngine };