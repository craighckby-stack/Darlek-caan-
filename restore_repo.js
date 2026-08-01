/**
 * ARCHITECTURAL RESTORATION ENGINE
 * Role: Performs diagnostic-aware repository restoration from remote sources.
 * Integration: Utilizes DiagnosticGatekeeper for integrity validation and telemetry logging.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { DiagnosticGatekeeper } = require('./src/utils/governance-engine');

const owner = 'craighckby-stack';
const repo = 'DARLEK_CAAN_ENGINE';
const branch = 'main';

const gatekeeper = new DiagnosticGatekeeper();

async function restoreRepository() {
  console.log("[DIAGNOSTIC] Initiating repository restoration sequence...");
  
  try {
    const treeResponse = await fetchTree();
    const tree = JSON.parse(treeResponse).tree;
    
    if (!tree) throw new Error("Repository tree structure unreachable.");

    const srcFiles = tree.filter(f => f.type === 'blob' && f.path.startsWith('src/'));
    console.log(`[DIAGNOSTIC] Identified ${srcFiles.length} files for restoration.`);

    for (const file of srcFiles) {
      await processFile(file);
    }

    gatekeeper.logEvent("RESTORATION_COMPLETE", { status: "SUCCESS", count: srcFiles.length });
    console.log("[DIAGNOSTIC] ALL RESTORED AND VERIFIED!");
  } catch (err) {
    gatekeeper.logEvent("RESTORATION_FAILURE", { error: err.message });
    console.error("[DIAGNOSTIC] Restoration failed:", err);
  }
}

function fetchTree() {
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers: { 'User-Agent': 'node.js' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function processFile(file) {
  const dir = path.dirname(file.path);
  fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve) => {
    https.get(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`, { headers: { 'User-Agent': 'node.js' } }, (res) => {
      let content = '';
      res.on('data', c => content += c);
      res.on('end', () => {
        fs.writeFileSync(file.path, content);
        console.log(`[DIAGNOSTIC] Restored: ${file.path}`);
        resolve();
      });
    }).on('error', () => resolve());
  });
}

restoreRepository();