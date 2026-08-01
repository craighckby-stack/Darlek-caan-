/**
 * ARCHITECTURAL FETCH DIAGNOSTIC ENGINE
 * Role: Orchestrates remote repository tree synchronization and integrity validation.
 * Integration: Connects to diagnostic-utils.js for telemetry and gatekeeping.
 */

const fs = require('fs');
const path = require('path');
const { FetchEngine } = require('./lib/fetch-engine-core');
const { DiagnosticEngine } = require('./lib/diagnostic-engine-utils');

async function runSyncDiagnostics() {
    const engine = new FetchEngine();
    const diagnostics = new DiagnosticEngine('RepositorySync');

    try {
        console.log('[DIAGNOSTIC] Starting repository tree synchronization...');
        
        const remoteTree = await engine.fetchRemoteTree('https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1');
        const localFiles = engine.walkDirectory('src');
        
        const missing = remoteTree.filter(f => !localFiles.includes(f.path) && f.path.startsWith('src/'));
        
        fs.writeFileSync('missing_files.json', JSON.stringify(missing, null, 2));
        
        diagnostics.logSuccess(`Sync complete. Identified ${missing.length} missing files.`);
        console.log(`[DIAGNOSTIC] Found ${missing.length} missing files. Report generated.`);
    } catch (error) {
        diagnostics.logFailure(error.message);
        process.exit(1);
    }
}

runSyncDiagnostics();