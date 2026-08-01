/**
 * ARCHITECTURAL REPO FETCH ENGINE
 * Role: Fetches repository tree structures with integrated diagnostic telemetry.
 * Integration: Connects to ./lib/diagnostic_engine.js for system health reporting and ./lib/fetch_engine_core.js for resilient network operations.
 */

const { FetchEngine } = require('./lib/fetch_engine_core');
const { runSystemDiagnostics } = require('./lib/diagnostic_engine');

async function initializeRepositoryFetch() {
  const diagnostics = runSystemDiagnostics();
  if (diagnostics.status !== 'HEALTHY') {
    console.error('[CRITICAL] System health check failed. Aborting fetch.', diagnostics);
    return diagnostics;
  }

  const targetUrl = process.env.REPO_TREE_URL || 'https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1';
  const options = {
    headers: {
      'User-Agent': 'Darlek-Caan-Repo-Engine/1.0',
      ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
    }
  };

  const engine = new FetchEngine(targetUrl, options);
  
  try {
    const data = await engine.execute();
    console.log('[SUCCESS] Repository tree retrieved:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('[ERROR] Fetch operation failed:', error.message);
    throw error;
  }
}

// Direct execution support
if (require.main === module || !module.parent) {
  initializeRepositoryFetch();
}

module.exports = {
  initializeRepositoryFetch
};
