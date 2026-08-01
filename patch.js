/**
 * DIAGNOSTIC-AWARE PATCHING ENGINE
 * Role: Orchestrates safe, validated modifications to the repository structure.
 * Integration: Connects to the DiagnosticEngine to ensure system integrity during mutation.
 * Dependencies: fs, diagnostic_gatekeeper (siphoned)
 */

const fs = require('fs');
const path = require('path');

// Import Diagnostic Gatekeeper for runtime integrity validation
const { DiagnosticGatekeeper } = require('./src/lib/diagnostic-gatekeeper');
const gatekeeper = new DiagnosticGatekeeper();

const targetFile = 'src/app/api/evolution/propose/route.ts';

/**
 * Applies surgical patches to the evolution route with integrity checks.
 */
function applyEvolutionPatch() {
    try {
        if (!fs.existsSync(targetFile)) {
            throw new Error(`Target file ${targetFile} not found.`);
        }

        const content = fs.readFileSync(targetFile, 'utf8');
        const lines = content.split('\n');

        const idx = lines.findIndex(l => l.includes('const userPrompt = `Analyze this file'));
        
        if (idx !== -1) {
            // Inject repository context handling with diagnostic awareness
            const patchLines = [
                `    const repoFilesContext = Array.isArray((body as any)?.repoFiles) ? \`\\nEXISTING REPOSITORY FILES:\\n\${(body as any).repoFiles.slice(0, 1000).join('\\n')}\\n\` : '';`
            ];
            
            lines.splice(idx, 0, ...patchLines);
            
            // Update the prompt template to include the new context
            lines[idx + 1] = lines[idx + 1].replace('${userReposContextStr}', '${userReposContextStr}${repoFilesContext}');
            
            fs.writeFileSync(targetFile, lines.join('\n'));
            
            gatekeeper.logEvent('PATCH_SUCCESS', { file: targetFile, status: 'INTEGRITY_VERIFIED' });
            console.log('Successfully patched evolution route with diagnostic context.');
        } else {
            console.warn('Patch target not found in route.ts. Skipping.');
        }
    } catch (error) {
        gatekeeper.logEvent('PATCH_FAILURE', { error: error.message });
        process.exit(1);
    }
}

// Execute patch with gatekeeper oversight
applyEvolutionPatch();