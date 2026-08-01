/**
 * ARCHITECTURAL FETCH ENGINE: README SYNC
 * Role: Fetches and validates remote documentation with integrated diagnostic telemetry.
 * Integration: Connects to FetchEngine and DiagnosticGatekeeper for system-level health monitoring.
 * Siphon Context: AI_Agent_OS diagnostic telemetry & resilient stream patterns.
 */

const { FetchEngine } = require('./src/lib/fetch_engine_core');
const { DiagnosticEngine } = require('./src/lib/diagnostic_engine_core');

/**
 * Main execution routine for fetching, validating, and reporting README documentation.
 */
async function run() {
  const targetUrl = process.env.README_URL || 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/README.md';
  const engine = new FetchEngine({
    timeoutMs: parseInt(process.env.FETCH_TIMEOUT_MS || '10000', 10),
    headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}
  });
  const diagnostics = new DiagnosticEngine('README_FETCH_SERVICE');

  try {
    diagnostics.start('fetch_operation');
    const data = await engine.fetch(targetUrl);
    
    if (data) {
      console.log(data);
      diagnostics.logSuccess('fetch_operation', {
        url: targetUrl,
        contentLength: Buffer.byteLength(data, 'utf8')
      });
    } else {
      throw new Error(`Received empty or null response payload from ${targetUrl}`);
    }
  } catch (err) {
    diagnostics.logFailure('fetch_operation', err.message);
    process.exit(1);
  } finally {
    diagnostics.report();
  }
}

run();