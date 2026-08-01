/**
 * ARCHITECTURAL RESTORATION ENGINE (DIAGNOSTIC-AWARE)
 * 
 * Role: Securely fetches, validates, and restores critical project files from remote repositories.
 * Integration: Orchestrates the FileDownloader, DiagnosticEngine, and Gatekeeper subsystems.
 * Siphoned From: AI_Agent_OS (Diagnostic-Aware Synchronization Patterns)
 * 
 * This engine acts as the primary recovery mechanism for the DARLEK_CAAN_ENGINE, 
 * ensuring that the core UI and kernel files are restored to a known-good state 
 * while maintaining full system observability.
 */

const { FileDownloader } = require('./lib/file-downloader');
const { runSystemDiagnostics } = require('./lib/diagnostic-engine');
const { formatTimestamp, generateTelemetryMetadata } = require('./lib/diagnostic-telemetry');
const { DiagnosticGatekeeper } = require('./lib/diagnostic-gatekeeper');

// Configuration Manifest
const CONFIG = {
  commitSha: process.env.TARGET_COMMIT_SHA || '71f4f383afa014a1255d977791d6531a2033e323',
  repoOwner: 'craighckby-stack',
  repoName: 'DARLEK_CAAN_ENGINE',
  targetPath: 'src/app/page.tsx',
  outputPath: 'src/app/page.tsx',
  githubToken: process.env.GITHUB_TOKEN || null
};

/**
 * Executes the full restoration cycle with integrated telemetry and gatekeeping.
 */
async function executeRestoration() {
  const startTime = Date.now();
  const gatekeeper = new DiagnosticGatekeeper();
  const downloader = new FileDownloader(CONFIG.githubToken);
  
  const targetUrl = `https://raw.githubusercontent.com/${CONFIG.repoOwner}/${CONFIG.repoName}/${CONFIG.commitSha}/${CONFIG.targetPath}`;

  console.log(`[${formatTimestamp()}] [INIT] Starting restoration sequence...`);
  console.log(`[INFO] Target: ${CONFIG.outputPath} | Source: ${CONFIG.commitSha.substring(0, 7)}`);

  try {
    // Phase 1: Secure Download
    const downloadResult = await downloader.download(targetUrl, CONFIG.outputPath);
    
    if (!downloadResult.success) {
      throw new Error(`Download failed: ${downloadResult.error}`);
    }

    const durationMs = Date.now() - startTime;
    console.log(`[SUCCESS] File restored. Size: ${downloadResult.bytesWritten} bytes. Duration: ${durationMs}ms`);

    // Phase 2: Post-Restoration Diagnostics
    console.log(`[DIAGNOSTIC] Initiating system health validation...`);
    const healthReport = await runSystemDiagnostics();
    
    // Phase 3: Gatekeeper Policy Evaluation
    const evaluation = gatekeeper.evaluateReport(healthReport);

    const finalTelemetry = {
      ...generateTelemetryMetadata(),
      restoration_duration_ms: durationMs,
      bytes_written: downloadResult.bytesWritten,
      health_status: healthReport.status,
      gatekeeper_decision: evaluation.decision
    };

    if (evaluation.decision === 'PASS') {
      console.log(`[COMPLETE] Restoration verified. System status: ${healthReport.status}`);
      console.log(`[TELEMETRY] Metrics:`, JSON.stringify(finalTelemetry, null, 2));
    } else {
      console.error(`[GATEKEEPER] Restoration failed validation: ${evaluation.reason}`);
      process.exit(1);
    }

  } catch (err) {
    console.error(`[CRITICAL] Restoration Engine Failure: ${err.message}`);
    console.error(`[STACK] ${err.stack}`);
    process.exit(1);
  }
}

// Entry Point Execution
if (require.main === module) {
  executeRestoration().catch(err => {
    console.error("Fatal unhandled exception in Restoration Engine:", err);
    process.exit(1);
  });
}

module.exports = { executeRestoration };