/**
 * ARCHITECTURAL FETCH DIAGNOSTIC ENGINE
 * Role: Orchestrates remote repository tree synchronization, missing file discovery, and integrity validation.
 * Integration: Connects to lib/fetch-engine-core.js and lib/diagnostic-engine-utils.js for network resilience and telemetry reporting.
 */

const fs = require('fs');
const path = require('path');
const { FetchEngine } = require('./lib/fetch-engine-core');
const { DiagnosticEngine } = require('./lib/diagnostic-engine-utils');

/**
 * Executes remote repository tree synchronization and missing file detection.
 */
async function runSyncDiagnostics() {
    const scope = process.env.DIAGNOSTIC_SCOPE || 'RepositorySync';
    const engine = new FetchEngine();
    const diagnostics = new DiagnosticEngine(scope);

    const targetUrl = process.env.REPO_TREE_URL || 
        'https://api.github.com/repos/craighckby-stack/epistemic_debate_engine/git/trees/main?recursive=1';
    const outputFilename = process.env.MISSING_FILES_OUTPUT || 'missing_files.json';
    const targetDir = process.env.TARGET_SRC_DIR || 'src';

    try {
        console.log(`[DIAGNOSTIC] Starting repository tree synchronization for scope: ${scope}...`);
        
        const remoteTree = await engine.fetchRemoteTree(targetUrl);
        const localFiles = engine.walkDirectory(targetDir);
        
        const missing = remoteTree.filter(f => 
            f && f.path && !localFiles.includes(f.path) && f.path.startsWith(`${targetDir}/`)
        );
        
        const reportPayload = {
            timestamp: new Date().toISOString(),
            targetUrl,
            targetDir,
            totalRemoteFiles: remoteTree.length,
            totalLocalFiles: localFiles.length,
            missingCount: missing.length,
            missingFiles: missing
        };

        fs.writeFileSync(outputFilename, JSON.stringify(missing, null, 2));
        
        diagnostics.logSuccess(`Sync complete. Identified ${missing.length} missing files out of ${remoteTree.length} remote entries.`, reportPayload);
        console.log(`[DIAGNOSTIC] Found ${missing.length} missing files. Report generated at ${outputFilename}.`);
        return reportPayload;
    } catch (error) {
        diagnostics.logFailure(error.message, { stack: error.stack });
        console.error(`[DIAGNOSTIC ERROR] Failed sync diagnostics: ${error.message}`);
        process.exit(1);
    }
}

runSyncDiagnostics();

module.exports = { runSyncDiagnostics };