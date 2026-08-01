/**
 * ARCHITECTURAL REPOSITORY SYNCHRONIZATION ENGINE
 * Role: Performs high-fidelity synchronization diagnostics between local repository state 
 * and remote GitHub tree structures. Integrates with system telemetry for performance monitoring.
 * 
 * This engine acts as a gatekeeper for repository integrity, ensuring that local 
 * development environments remain aligned with the upstream 'main' branch.
 * 
 * Dependencies: ./lib/file-comparator-utils.js, ./lib/diagnostic-telemetry.js
 */

const https = require('node:https');
const { performComparison, summarizeSyncMetrics } = require('./lib/file-comparator-utils');
const { trackDiagnosticExecution, formatTimestamp } = require('./lib/diagnostic-telemetry');

/**
 * Fetches the remote repository tree from GitHub API.
 * @returns {Promise<string[]>} List of remote file paths.
 */
async function fetchRemoteTree() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1',
      headers: {
        'User-Agent': 'Node-Diagnostic-Engine/1.1.0',
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
      }
    };

    https.get(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`GitHub API returned status ${res.statusCode}`));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const tree = JSON.parse(data).tree;
          if (!tree) throw new Error('Invalid response structure from GitHub');
          const remoteFiles = tree
            .filter(f => f.type === 'blob')
            .map(f => f.path);
          resolve(remoteFiles);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Main execution orchestrator for the synchronization audit.
 */
async function runComparison() {
  console.log(`[${formatTimestamp()}] [DIAGNOSTIC] Initiating repository synchronization audit...`);

  const result = await trackDiagnosticExecution(async () => {
    try {
      // Step 1: Fetch remote state
      const remoteFiles = await fetchRemoteTree();
      
      // Step 2: Perform local vs remote comparison
      // Target 'src' directory as the primary source of truth
      const diff = performComparison(remoteFiles, 'src');
      
      // Step 3: Generate metrics (Siphoned from AI_Agent_OS pattern)
      const metrics = summarizeSyncMetrics(diff);

      return {
        success: true,
        diff,
        metrics
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  });

  // Output Report
  if (result.data.success) {
    const { diff, metrics } = result.data;
    
    console.log("\n--- REPOSITORY SYNC REPORT ---");
    console.log(`Status: ${metrics.is_healthy ? 'HEALTHY' : 'OUT_OF_SYNC'}`);
    console.log(`Pass Rate: ${metrics.pass_rate}%`);
    console.log("----------------------------");
    console.log("Remote-only files:", diff.remoteOnly.length ? diff.remoteOnly : "None");
    console.log("Local-only files: ", diff.localOnly.length ? diff.localOnly : "None");
    console.log("----------------------------");
    
    console.log(`\n[DIAGNOSTIC] Audit complete in ${result.duration_ms.toFixed(3)}ms.`);
    
    if (!metrics.is_healthy) {
      process.exit(1);
    }
  } else {
    console.error(`\n[DIAGNOSTIC] Critical failure during audit: ${result.data.error}`);
    process.exit(1);
  }
}

// Execute the engine
runComparison().catch(err => {
  console.error("[FATAL] Unhandled exception in Diagnostic Engine:", err);
  process.exit(1);
});