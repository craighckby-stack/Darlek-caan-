/**
 * DIAGNOSTIC-AWARE VARIABLE REFACTORING ENGINE
 * Role: Performs safe, validated variable renaming across the repository.
 * Integration: Utilizes DiagnosticGatekeeper to ensure file integrity during transformation.
 */

import fs from 'fs';
import path from 'path';
import { RefactorEngine } from './src/utils/refactor-engine';
import { DiagnosticGatekeeper } from './src/utils/governance-engine';

const targetFile = 'src/App.tsx';
const gatekeeper = new DiagnosticGatekeeper();

async function executeRefactor() {
    try {
        if (!fs.existsSync(targetFile)) {
            throw new Error(`Target file ${targetFile} not found.`);
        }

        const content = fs.readFileSync(targetFile, 'utf8');
        const engine = new RefactorEngine(content);

        // Apply transformations
        engine.rename('showDebateOverlay', 'isDebating');
        engine.rename('setShowDebateOverlay', 'setIsDebating');

        const newContent = engine.getContent();

        // Validate before write
        const report = await gatekeeper.validateTransformation(targetFile, content, newContent);

        if (report.passed) {
            fs.writeFileSync(targetFile, newContent);
            console.log(`[SUCCESS] Refactoring complete for ${targetFile}`);
        } else {
            console.error(`[FAILURE] Refactoring blocked by gatekeeper: ${report.message}`);
        }
    } catch (error) {
        console.error(`[CRITICAL] Refactor engine failure: ${error}`);
    }
}

executeRefactor();