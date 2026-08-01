/**
 * GitHubClient: Diagnostic-Aware API Controller
 * Role: Orchestrates GitHub API interactions with integrated health monitoring and telemetry.
 * Integration: Connects to diagnostic-registry and github-telemetry for system-wide health tracking.
 */

import { GitHubDiagnosticGatekeeper } from './github-telemetry';

const gatekeeper = new GitHubDiagnosticGatekeeper();

export const GitHubClient = {
  async request(token: string, url: string, options: RequestInit = {}): Promise<Response> {
    const startTime = performance.now();
    const endpoint = url.startsWith('/') ? url.substring(1) : url;
    
    // Gatekeeper check: Prevent requests if system health is critical
    if (!gatekeeper.isHealthy()) {
      throw new Error('GitHub API access suspended: System health degraded.');
    }

    try {
      const response = await fetch(`https://api.github.com/${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        }
      });

      const duration = performance.now() - startTime;
      gatekeeper.recordMetric(response.status, duration);

      return response;
    } catch (error) {
      gatekeeper.recordFailure(error as Error);
      throw error;
    }
  }
};