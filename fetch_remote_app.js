/**
 * ARCHITECTURAL REMOTE FETCH ENGINE
 * Role: Orchestrates secure, telemetry-backed retrieval of remote repository components.
 * Integration: Utilizes DiagnosticEngine for health monitoring and FetchEngine for stream-based data acquisition.
 * Dependencies: ./lib/fetch_engine_core, ./lib/diagnostic_engine_core
 */

const { FetchEngine } = require('./lib/fetch_engine_core');
const { DiagnosticEngine } = require('./lib/diagnostic_engine_core');

const REMOTE_ASSETS = [
  {
    url: process.env.REMOTE_APP_URL || 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/App.tsx',
    dest: process.env.REMOTE_APP_DEST || 'remote_App.tsx'
  },
  {
    url: process.env.REMOTE_MAIN_URL || 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/src/main.tsx',
    dest: process.env.REMOTE_MAIN_DEST || 'remote_main.tsx'
  }
];

async function executeRemoteSync() {
  const engine = new DiagnosticEngine('RemoteSync');
  
  for (const asset of REMOTE_ASSETS) {
    const fetcher = new FetchEngine(asset.url);
    try {
      console.log(`[SYNC] Initiating fetch: ${asset.url}`);
      const success = await fetcher.download(asset.dest);
      
      if (success) {
        engine.logSuccess(asset.dest, { url: asset.url });
      } else {
        engine.logFailure(asset.dest, 'Download stream interrupted');
      }
    } catch (err) {
      engine.logFailure(asset.dest, err.message);
    }
  }
  
  const report = engine.generateReport();
  console.log('[SYNC] Final Diagnostic Report:', JSON.stringify(report, null, 2));
  
  if (!report.summary.is_healthy && process.env.STRICT_SYNC_MODE === 'true') {
    throw new Error('Remote sync completed with health failures.');
  }

  return report;
}

executeRemoteSync().catch((err) => {
  console.error('[SYNC] Fatal execution failure:', err);
  if (process.env.CI || process.env.STRICT_SYNC_MODE === 'true') {
    process.exit(1);
  }
});
