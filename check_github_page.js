/**
 * @file check_github_page.js
 * @description Architectural GitHub Page Diagnostic & Comparison Engine.
 * This script fetches, analyzes, and compares different versions of the Darlek Caan Engine source files.
 * It integrates advanced telemetry, execution timing, and structural diff metrics siphoned from the
 * AI_Agent_OS diagnostic framework to ensure absolute code integrity and prevent regression.
 * 
 * Role in System:
 * - Validates remote repository state against local expectations.
 * - Measures network latency and payload integrity.
 * - Computes similarity metrics and line-by-line structural differences.
 * 
 * Connections:
 * - Integrates with `src/utils/github-telemetry.js` for telemetry generation and metric computation.
 */

const https = require('https');
const telemetry = require('./src/utils/github-telemetry.js');

const resultsStore = {};

/**
 * Triggers a deep structural comparison once both pages are fetched and loaded.
 */
function triggerComparisonIfReady() {
  const keys = Object.keys(resultsStore);
  if (keys.includes('MAIN BRANCH') && keys.includes('COMMIT 71f4f383')) {
    const main = resultsStore['MAIN BRANCH'];
    const commit = resultsStore['COMMIT 71f4f383'];
    
    if (main.statusCode === 200 && commit.statusCode === 200) {
      console.log('\n==================================================');
      console.log('       DEEP STRUCTURAL TELEMETRY COMPARISON       ');
      console.log('==================================================');
      
      const diffMetrics = telemetry.computeDiffMetrics(main.data, commit.data);
      const summary = telemetry.summarizeDiagnosticResults({
        mainFetch: { passed: main.statusCode === 200 },
        commitFetch: { passed: commit.statusCode === 200 },
        integrityCheck: { passed: diffMetrics.similarityIndex > 50 }
      });
      
      console.log(`Timestamp: ${telemetry.formatTimestamp()}`);
      console.log(`Similarity Index: ${diffMetrics.similarityIndex}%`);
      console.log(`Main Branch Size: ${diffMetrics.sizeBytes1} bytes (${diffMetrics.linesCount1} lines)`);
      console.log(`Commit Branch Size: ${diffMetrics.sizeBytes2} bytes (${diffMetrics.linesCount2} lines)`);
      console.log(`Approximate Added Lines: ${diffMetrics.addedLinesApprox}`);
      console.log(`Approximate Removed Lines: ${diffMetrics.removedLinesApprox}`);
      console.log(`System Health Status: ${summary.isHealthy ? 'HEALTHY ✅' : 'DEGRADED ⚠️'}`);
      console.log(`Pass Rate: ${summary.passRate}%`);
      console.log('Telemetry Metadata:', JSON.stringify(telemetry.generateTelemetryMetadata(), null, 2));
      console.log('==================================================\n');
    } else {
      console.log('\n⚠️ Deep comparison skipped due to non-200 status codes.');
    }
  }
}

/**
 * Fetches a page from GitHub, logs its basic statistics, and records telemetry.
 * 
 * @param {string} url - The URL to fetch.
 * @param {string} label - The label for the page (e.g., 'MAIN BRANCH').
 */
function checkPage(url, label) {
  const startTime = process.hrtime();
  
  https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
    const statusCode = res.statusCode;
    let data = '';
    
    res.on('data', chunk => {
      data += chunk;
    });
    
    res.on('end', () => {
      const diff = process.hrtime(startTime);
      const durationMs = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2);
      
      console.log(`=== ${label} ===`);
      console.log(`Status Code: ${statusCode} ${statusCode === 200 ? '✅' : '❌'}`);
      console.log(`Latency: ${durationMs} ms`);
      console.log(`Length: ${data.length} bytes`);
      console.log(`Lines: ${data.split('
').length}`);
      console.log(`First 5 lines:\n`, data.split('\n').slice(0, 5).join('\n'));
      console.log(`Last 5 lines:\n`, data.split('\n').slice(-5).join('\n'));
      console.log('--------------------------------------------------');
      
      resultsStore[label] = {
        data,
        statusCode,
        durationMs,
        length: data.length,
        lines: data.split('\n').length
      };
      
      triggerComparisonIfReady();
    });
  }).on('error', (err) => {
    console.error(`[ERROR] Request failed for ${label}: ${err.message}`);
  });
}

// Execute checks
checkPage('https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/main/src/app/page.tsx', 'MAIN BRANCH');
checkPage('https://raw.githubusercontent.com/craighckby-stack/DARLEK_CAAN_ENGINE/71f4f383afa014a1255d977791d6531a2033e323/src/app/page.tsx', 'COMMIT 71f4f383');