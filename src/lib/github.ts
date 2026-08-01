/**
 * GitHub Configuration Provider
 * Role: Manages GitHub authentication and repository targeting.
 * Integration: Connects to GitHubDiagnosticGatekeeper for health-aware credential access.
 */

import { GitHubDiagnosticGatekeeper } from './github-telemetry';

export const getGitHubConfig = () => {
  const gatekeeper = new GitHubDiagnosticGatekeeper();
  
  try {
    const username = localStorage.getItem("af_github_username") || "craighckby-stack";
    const repoName = localStorage.getItem("af_github_repo") || "god-virus";
    const token = sessionStorage.getItem("af_github_token") || 
                  localStorage.getItem("af_github_token") || "";

    const config = {
      username,
      repoName,
      token,
      hasValidToken: token.length > 15,
      isDemoMode: username === "craighckby-stack" && repoName === "god-virus"
    };

    // Validate state via diagnostic gatekeeper
    gatekeeper.evaluateConfigState(config);

    return config;
  } catch (error) {
    console.error("[GitHubConfig] Critical retrieval error:", error);
    return {
      username: "",
      repoName: "",
      token: "",
      hasValidToken: false,
      isDemoMode: true
    };
  }
};