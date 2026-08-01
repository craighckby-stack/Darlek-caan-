/**
 * ARCHITECTURAL FILE COMPARATOR ENGINE
 * Role: Performs high-fidelity synchronization diagnostics between local repository state 
 * and remote GitHub tree structures. Integrates with system telemetry for performance monitoring.
 * 
 * Dependencies: ./lib/file-comparator-utils.js
 */

const https = require('https');
const { performComparison } = require('./lib/file-comparator-utils');

async function runComparison() {
  const startTime = process.hrtime();
  console.log("[DIAGNOSTIC] Initiating repository synchronization audit...");

  const options = {
    hostname: 'api.github.com',
    path: '/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1',
    headers: { 'User-Agent': 'Node-Diagnostic-Engine/1.0.0' }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const tree = JSON.parse(data).tree;
        const remoteFiles = tree.filter(f => f.type === 'blob').map(f => f.path);
        
        const diff = performComparison(remoteFiles, 'src');
        
        console.log("\n--- SYNC REPORT ---");
        console.log("Remote-only files:", diff.remoteOnly);
        console.log("Local-only files:", diff.localOnly);
        
        const diffTime = process.hrtime(startTime);
        console.log(`\n[DIAGNOSTIC] Audit complete in ${diffTime[0]}s ${diffTime[1] / 1e6}ms.`);
      } catch (err) {
        console.error("[DIAGNOSTIC] Critical failure during audit:", err.message);
      }
    });
  }).on('error', (e) => {
    console.error("[DIAGNOSTIC] Network failure:", e.message);
  });
}

runComparison();