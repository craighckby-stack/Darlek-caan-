/**
 * ARCHITECTURAL FETCH ENGINE
 * Role: Orchestrates remote resource retrieval with integrated diagnostic telemetry.
 * Integration: Connects to diagnostic_engine.js for health reporting and gatekeeping.
 */

const { FetchEngine } = require('./lib/fetch-engine-core');
const { runSystemDiagnostics } = require('./lib/diagnostic-engine');

async function execute() {
  // 1. Run system integrity check before network operations
  const healthReport = runSystemDiagnostics();
  if (healthReport.status !== 'HEALTHY') {
    console.error('[FETCH_ENGINE] Aborting: System health check failed.');
    return;
  }

  // 2. Initialize engine with target resource
  const engine = new FetchEngine({
    url: 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/utils/engine.ts',
    timeout: 10000
  });

  // 3. Execute retrieval with telemetry
  try {
    const result = await engine.fetch();
    console.log('[FETCH_ENGINE] Success. Data length:', result.length);
    console.log(result.substring(0, 4000));
  } catch (err) {
    console.error('[FETCH_ENGINE] Fatal error:', err.message);
  }
}

execute();