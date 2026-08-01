/**
 * ARCHITECTURAL SYSTEM DIAGNOSTIC & FAST DOWNLOAD ENGINE
 * Role: Synchronizes changed local source files with remote repository blobs.
 * Integration: Reads remote_blobs.json, performs concurrency-limited HTTPS requests,
 *              validates HTTP responses, and updates local files with telemetry reporting.
 * Dependencies: fs, https, path, ./download_telemetry
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const { computeMetrics } = require('./download_telemetry');

// Configuration
const CONCURRENCY_LIMIT = 10;
const REMOTE_BASE_URL = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/';
const BLOBS_FILE = 'remote_blobs.json';

/**
 * Executes a concurrency-limited map over an array of items.
 */
async function limitConcurrency(limit, array, fn) {
  const results = [];
  const executing = new Set();
  for (const item of array) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

/**
 * Downloads a single file and updates it if remote content differs from local content.
 */
function downloadAndCompare(fileObj) {
  return new Promise((resolve) => {
    const localPath = fileObj.path;
    
    // Ensure the file exists locally and starts with src/
    if (!localPath.startsWith('src/') || !fs.existsSync(localPath)) {
      return resolve({ status: 'skipped', path: localPath });
    }

    let localContent;
    try {
      localContent = fs.readFileSync(localPath, 'utf8');
    } catch (err) {
      console.error(`[ERROR] Failed to read local file: ${localPath}`, err.message);
      return resolve({ status: 'failed', path: localPath, error: err.message });
    }

    const url = REMOTE_BASE_URL + localPath;
    const options = {
      headers: { 'User-Agent': 'node.js-fast-downloader' }
    };

    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        res.resume(); // Consume response data to free up memory
        return resolve({
          status: 'failed',
          path: localPath,
          error: `HTTP Status Code: ${res.statusCode}`
        });
      }

      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (data !== localContent) {
          try {
            // Ensure directory exists before writing (precautionary)
            const dir = path.dirname(localPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(localPath, data, 'utf8');
            console.log(`[UPDATED] Changed: ${localPath}`);
            resolve({ status: 'updated', path: localPath });
          } catch (writeErr) {
            console.error(`[ERROR] Failed to write file: ${localPath}`, writeErr.message);
            resolve({ status: 'failed', path: localPath, error: writeErr.message });
          }
        } else {
          resolve({ status: 'unchanged', path: localPath });
        }
      });
    }).on('error', (err) => {
      console.error(`[ERROR] Network error for ${localPath}:`, err.message);
      resolve({ status: 'failed', path: localPath, error: err.message });
    });
  });
}

/**
 * Main execution orchestrator.
 */
async function run() {
  const startTime = process.hrtime();
  console.log('[START] Initializing fast download synchronization engine...');

  let remoteBlobs = [];
  try {
    if (!fs.existsSync(BLOBS_FILE)) {
      throw new Error(`Metadata file ${BLOBS_FILE} not found.`);
    }
    remoteBlobs = JSON.parse(fs.readFileSync(BLOBS_FILE, 'utf8'));
  } catch (err) {
    console.error(`[FATAL] Failed to load remote blobs metadata:`, err.message);
    process.exit(1);
  }

  // Filter files that start with 'src/' and exist locally
  const targetFiles = remoteBlobs.filter(f => f.path && f.path.startsWith('src/') && fs.existsSync(f.path));
  console.log(`[INFO] Found ${targetFiles.length} candidate files for synchronization.`);

  try {
    const results = await limitConcurrency(CONCURRENCY_LIMIT, targetFiles, downloadAndCompare);

    const updated = results.filter(r => r.status === 'updated');
    const failed = results.filter(r => r.status === 'failed');
    const unchanged = results.filter(r => r.status === 'unchanged');

    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    const telemetryReport = computeMetrics(targetFiles.length, updated.length, failed.length, durationMs);

    console.log('\n================ SYNCHRONIZATION REPORT ================');
    console.log(`Status:          ${telemetryReport.status}`);
    console.log(`Timestamp:       ${telemetryReport.timestamp}`);
    console.log(`Total Processed: ${telemetryReport.metrics.totalFilesProcessed}`);
    console.log(`Updated:         ${telemetryReport.metrics.filesUpdated}`);
    console.log(`Unchanged:       ${unchanged.length}`);
    console.log(`Failed:          ${telemetryReport.metrics.filesFailed}`);
    console.log(`Duration:        ${telemetryReport.metrics.executionDurationMs} ms`);
    console.log(`Success Rate:    ${telemetryReport.metrics.successRatePercent}%`);
    console.log('========================================================\n');

    if (failed.length > 0) {
      console.warn('[WARNING] Some files failed to synchronize. See errors above.');
    }
  } catch (err) {
    console.error('[FATAL] Synchronization engine encountered an unhandled exception:', err);
    process.exit(1);
  }
}

run();