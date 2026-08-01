/**
 * ARCHITECTURAL FETCH ENGINE: README SYNC
 * Role: Fetches and validates remote documentation with integrated diagnostic telemetry.
 * Integration: Connects to FetchEngine and DiagnosticGatekeeper for system-level health monitoring.
 */

const { FetchEngine } = require('./src/lib/fetch_engine_core');
const { DiagnosticEngine } = require('./src/lib/diagnostic_engine_core');

async function run() {
  const engine = new FetchEngine();
  const diagnostics = new DiagnosticEngine('README_FETCH_SERVICE');

  try {
    diagnostics.start('fetch_operation');
    const data = await engine.fetch('https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/README.md');
    
    if (data) {
      console.log(data);
      diagnostics.logSuccess('fetch_operation');
    }
  } catch (err) {
    diagnostics.logFailure('fetch_operation', err.message);
    process.exit(1);
  } finally {
    diagnostics.report();
  }
}

run();