/**
 * DIAGNOSTIC GATEKEEPER
 * Role: Evaluates health reports against system policies.
 */

class DiagnosticGatekeeper {
  evaluateReport(report) {
    if (report.status === 'HEALTHY' && report.summary.pass_rate === 100) {
      return { decision: 'PASS', reason: 'All integrity checks passed.' };
    }

    if (report.summary.pass_rate > 80) {
      return { decision: 'WARNING', reason: 'System degraded but operational.' };
    }

    return { decision: 'FAIL', reason: 'Critical integrity failure detected.' };
  }
}

module.exports = { DiagnosticGatekeeper };