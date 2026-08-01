/**
 * GitHub Telemetry & Diagnostic Gatekeeper
 * Role: Monitors GitHub API health, tracks latency, and prevents cascading failures.
 */

export class GitHubDiagnosticGatekeeper {
  private failureCount = 0;
  private readonly MAX_FAILURES = 5;

  isHealthy(): boolean {
    return this.failureCount < this.MAX_FAILURES;
  }

  recordMetric(status: number, duration: number): void {
    if (status >= 500) {
      this.failureCount++;
    } else if (status < 400) {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
    console.debug(`[GitHubTelemetry] Status: ${status}, Latency: ${duration.toFixed(2)}ms`);
  }

  recordFailure(error: Error): void {
    this.failureCount++;
    console.error(`[GitHubTelemetry] Request failed: ${error.message}`);
  }
}