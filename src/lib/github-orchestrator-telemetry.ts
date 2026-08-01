/**
 * GitHub Orchestrator Telemetry & Diagnostic Gatekeeper
 * Provides health monitoring and status tracking for GitHub API operations.
 */
export class GitHubDiagnosticGatekeeper {
  private failureCount: number = 0;
  private readonly MAX_FAILURES = 5;

  isSystemHealthy(): boolean {
    return this.failureCount < this.MAX_FAILURES;
  }

  recordFailure(status: number): void {
    if (status >= 400) {
      this.failureCount++;
    }
  }

  reset(): void {
    this.failureCount = 0;
  }

  getTelemetryMetadata() {
    return {
      timestamp: new Date().toISOString(),
      failureCount: this.failureCount,
      isHealthy: this.isSystemHealthy()
    };
  }
}