/**
 * ARCHITECTURAL DOWNLOADER ENGINE
 * Role: Synchronizes remote repository state with local file system.
 * Integration: Utilizes DiagnosticEngine for telemetry and health reporting.
 * Dependencies: ./src/utils/diagnostic-telemetry.ts
 */

const fs = require('fs');
const https = require('https');
const { executeWithTelemetry, formatTimestamp } = require('./src/utils/diagnostic-telemetry');

const remoteBlobs = JSON.parse(fs.readFileSync('remote_blobs.json', 'utf8'));
let changed = [];

async function downloadFile(fileObj) {
  return new Promise((resolve) => {
    const url = 'https://raw.githubusercontent.com/craighckby-stack/epistemic_debate_engine/main/' + fileObj.path;
    https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const localContent = fs.readFileSync(fileObj.path, 'utf8');
          if (data !== localContent) {
            fs.writeFileSync(fileObj.path, data);
            changed.push(fileObj);
            console.log(`[SYNC] Updated: ${fileObj.path}`);
          }
          resolve(true);
        } else {
          resolve(false);
        }
      });
    }).on('error', () => resolve(false));
  });
}

async function runSync() {
  console.log(`[${formatTimestamp()}] Starting repository synchronization...`);
  
  for (const fileObj of remoteBlobs) {
    if (!fileObj.path.startsWith('src/')) continue;
    if (fs.existsSync(fileObj.path)) {
      await executeWithTelemetry(async () => await downloadFile(fileObj), fileObj.path);
    }
  }

  fs.writeFileSync('changed_files.json', JSON.stringify(changed, null, 2));
  console.log(`[SYNC] Complete. Found ${changed.length} changed files.`);
}

runSync().catch(console.error);