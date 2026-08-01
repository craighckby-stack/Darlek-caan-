/**
 * ARCHITECTURAL FETCH ENGINE
 * Role: Orchestrates remote resource retrieval with integrated diagnostic telemetry.
 * Integration: Connects to lib/diagnostic-engine.js for health reporting and gatekeeping, and lib/fetch-engine-core.js for resilient HTTPS operations.
 */

const { FetchEngine } = require('./lib/fetch-engine-core');
const { runSystemDiagnostics } = require('./lib/diagnostic-engine');

/**
 * Executes system diagnostic checks and initiates resource retrieval.
 * @returns {Promise<string|null>} The retrieved content string or null if aborted/failed.
 */
async function execute() {
  // 1. Run system integrity check before network operations
  const healthReport = runSystemDiagnostics();
  if (healthReport.status !== 'HEALTHY') {
    console.error('[FETCH_ENGINE] Aborting: System health check failed.');
    console.error('[FETCH_ENGINE] Health details:', JSON.stringify(healthReport, null, 2));
    return null;
  }

  // 2. Initialize engine with target resource & configuration
  const targetUrl = process.env.FETCH_TARGET_URL || 
    'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/utils/engine.ts';
  
  const engine = new FetchEngine({
    url: targetUrl,
    timeout: parseInt(process.env.FETCH_TIMEOUT_MS || '10000', 10),
    retries: 3,
    headers: {
      'User-Agent': 'Darlek-Caan-FetchEngine/2.0.0-DIAGNOSTIC-AWARE',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
    }
  });

  // 3. Execute retrieval with telemetry
  try {
    const result = await engine.fetch();
    console.log('[FETCH_ENGINE] Success. Data length:', result.length);
    console.log(result.substring(0, 4000));
    return result;
  } catch (err) {
    console.error('[FETCH_ENGINE] Fatal error:', err.message);
    return null;
  }
}

if (require.main === module) {
  execute();
}

module.exports = { execute };