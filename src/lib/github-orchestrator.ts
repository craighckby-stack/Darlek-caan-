/**
 * GitHub Orchestrator Service
 * Handles low-level GitHub API interactions with telemetry and error normalization.
 * Integrated with Diagnostic-Aware lifecycle for system health monitoring.
 */
import { GitHubDiagnosticGatekeeper } from './github-orchestrator-telemetry';

export class GitHubOrchestrator {
  private token: string;
  private gatekeeper: GitHubDiagnosticGatekeeper;

  constructor(token: string) {
    this.token = token;
    this.gatekeeper = new GitHubDiagnosticGatekeeper();
  }

  async createBranch(owner: string, repo: string, base: string, name: string) {
    const start = performance.now();
    
    // Verify system health before execution
    if (!this.gatekeeper.isSystemHealthy()) {
      throw new Error("GitHub Orchestrator: System health check failed. Operation aborted.");
    }

    try {
      // Fetch base SHA
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${base}`, {
        headers: { Authorization: `Bearer ${this.token}`, Accept: "application/vnd.github.v3+json" }
      });

      if (!refRes.ok) {
        this.gatekeeper.recordFailure(refRes.status);
        throw { message: "Base branch not found", status: refRes.status };
      }
      
      const { object: { sha } } = await refRes.json();

      // Create Ref
      const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ref: `refs/heads/${name}`, sha })
      });

      if (!createRes.ok) {
        this.gatekeeper.recordFailure(createRes.status);
        throw { message: "Branch creation failed", status: createRes.status };
      }

      return {
        telemetry: { duration_ms: performance.now() - start, status: 'SUCCESS' }
      };
    } catch (error) {
      this.gatekeeper.recordFailure(500);
      throw error;
    }
  }
}