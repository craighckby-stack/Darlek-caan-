/**
 * ARCHITECTURAL REPO FETCH ENGINE
 * Role: Fetches repository tree structures with integrated diagnostic telemetry.
 * Integration: Connects to diagnostic_engine.js for system health reporting.
 */

const { FetchEngine } = require('./lib/fetch_engine_core');
const { runSystemDiagnostics } = require('./lib/diagnostic_engine');

async function initializeRepositoryFetch() {
  const diagnostics = runSystemDiagnostics();
  if (diagnostics.status !== 'HEALTHY') {
    console.error('[CRITICAL] System health check failed. Aborting fetch.');
    return;
  }

  const engine = new FetchEngine('https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1');
  
  try {
    const data = await engine.execute();
    console.log('[SUCCESS] Repository tree retrieved:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[ERROR] Fetch operation failed:', error.message);
  }
}

initializeRepositoryFetch();