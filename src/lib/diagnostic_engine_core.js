class DiagnosticEngine {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.metrics = {};
  }
  start(op) { this.metrics[op] = { start: Date.now() }; }
  logSuccess(op) { this.metrics[op].end = Date.now(); this.metrics[op].status = 'OK'; }
  logFailure(op, err) { this.metrics[op].end = Date.now(); this.metrics[op].status = 'FAIL'; this.metrics[op].err = err; }
  report() { console.error(`[DIAGNOSTIC] ${this.serviceName} Report:`, JSON.stringify(this.metrics)); }
}

module.exports = { DiagnosticEngine };