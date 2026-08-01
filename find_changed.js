/**
 * ARCHITECTURAL SYSTEM: FIND_CHANGED.JS
 * Role: Orchestrates remote repository tree analysis and local file delta detection.
 * Integration: Utilizes DiagnosticEngine for telemetry and FetchEngine for secure data retrieval.
 * Connectivity: Interfaces with GitHub API to fetch remote state and compares against local filesystem.
 * 
 * This module acts as the primary synchronization gatekeeper, identifying discrepancies between
 * the local environment and the remote source of truth (main branch).
 */

const fs = require('fs');
const path = require('path');
const { FetchEngine } = require('./lib/fetch-engine');
const { DiagnosticEngine } = require('./lib/diagnostic-engine');
const { DeltaProcessor } = require('./lib/delta-processor');

/**
 * Executes a comprehensive delta analysis between the remote repository and local files.
 * 
 * @returns {Promise<Object>} A summary report of the delta analysis.
 */
async function runDeltaAnalysis() {
  const engine = new DiagnosticEngine('DeltaAnalysis');
  const fetcher = new FetchEngine();
  const processor = new DeltaProcessor();

  // Configuration siphoned from environment or defaults
  const REPO_URL = process.env.REPO_TREE_URL || 'https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1';
  const TARGET_DIR = process.env.TARGET_SRC_DIR || process.cwd();
  const OUTPUT_FILE = 'remote_blobs.json';
  const REPORT_FILE = 'delta_report.json';

  try {
    engine.log('Initiating repository delta analysis sequence...');
    
    // 1. Fetch Remote State with Telemetry
    const remoteDataRaw = await engine.executeWithTelemetry(async () => {
      return await fetcher.secureFetch(REPO_URL);
    }, 'RemoteFetch');

    const tree = JSON.parse(remoteDataRaw).tree;
    const remoteFiles = tree.filter(f => f.type === 'blob');
    
    // Persist remote state for audit trail
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(remoteFiles, null, 2));
    engine.log(`Remote state synchronized. Found ${remoteFiles.length} blobs.`);

    // 2. Scan Local Filesystem
    engine.log(`Scanning local directory: ${TARGET_DIR}`);
    const localFiles = await engine.executeWithTelemetry(async () => {
      return await processor.scanLocalDirectory(TARGET_DIR);
    }, 'LocalScan');

    // 3. Perform Delta Comparison
    engine.log('Computing file deltas using Git-compatible SHA-1 hashes...');
    const deltaReport = await engine.executeWithTelemetry(async () => {
      return processor.compareStates(remoteFiles, localFiles);
    }, 'DeltaComputation');

    // 4. Summarize and Persist Results
    const summary = engine.summarizeResults(deltaReport);
    const finalReport = {
      status: summary.is_healthy ? 'SYNCED' : 'OUT_OF_SYNC',
      timestamp: engine.formatTimestamp(),
      summary,
      deltas: deltaReport
    };

    fs.writeFileSync(REPORT_FILE, JSON.stringify(finalReport, null, 2));
    
    engine.log(`Delta analysis complete. Status: ${finalReport.status}`);
    engine.log(`Changes detected: ${deltaReport.modified.length} modified, ${deltaReport.added.length} added, ${deltaReport.deleted.length} deleted.`);

    return { 
      status: 'SUCCESS', 
      count: remoteFiles.length, 
      summary: finalReport.summary 
    };
  } catch (error) {
    engine.error('Delta analysis failed during execution cycle', error);
    // Ensure we don't leave the system in an inconsistent state
    throw error;
  }
}

// Entry point execution with global error handling
if (require.main === module) {
  runDeltaAnalysis().catch(err => {
    console.error('[FATAL] Delta Analysis Engine crashed:', err);
    process.exit(1);
  });
}

module.exports = { runDeltaAnalysis };