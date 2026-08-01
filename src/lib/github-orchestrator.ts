/**
 * GitHub Orchestrator
 * Encapsulates GitHub API interactions with telemetry and error handling.
 */
export class GitHubOrchestrator {
  constructor(private token: string) {}

  async fetchBranches(owner: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error: any = new Error(errData.message || `GitHub API returned ${res.status}`);
      error.status = res.status;
      throw error;
    }

    const branches = await res.json();
    return branches.map((b: { name: string; protected?: boolean }) => ({
      name: b.name,
      protected: !!b.protected,
    }));
  }
}