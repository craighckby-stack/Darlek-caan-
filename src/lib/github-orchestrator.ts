/**
 * GitHub Orchestrator Service
 * Handles low-level GitHub API interactions with telemetry and error normalization.
 */
export class GitHubOrchestrator {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async createBranch(owner: string, repo: string, base: string, name: string) {
    const start = performance.now();
    
    // Fetch base SHA
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${base}`, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: "application/vnd.github.v3+json" }
    });

    if (!refRes.ok) throw { message: "Base branch not found", status: refRes.status };
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

    if (!createRes.ok) throw { message: "Branch creation failed", status: createRes.status };

    return {
      telemetry: { duration_ms: performance.now() - start }
    };
  }
}