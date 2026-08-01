/**
 * DIAGNOSTIC-AWARE PATCHING ENGINE
 * Role: Orchestrates repository evolution and file system mutations with integrated health checks.
 * Integration: Connects to src/utils/governance-engine.ts for policy enforcement.
 * 
 * This script serves as the primary controller for applying patches to the repository,
 * ensuring that all modifications are validated against the system's diagnostic gatekeeper.
 */

const fs = require('fs');
const path = require('path');
const { validatePatchIntegrity } = require('./src/utils/governance-engine');

const TARGET_FILE = 'src/app/api/evolution/propose/route.ts';

/**
 * Executes the patching process with diagnostic validation.
 */
function applyPatch() {
  try {
    if (!fs.existsSync(TARGET_FILE)) {
      throw new Error(`Target file ${TARGET_FILE} not found.`);
    }

    let code = fs.readFileSync(TARGET_FILE, 'utf8');

    // Apply structural mutations
    code = code.replace(
      '1. MAXIMIZE USE OF THE "newFiles" ARRAY FOR DELEGATION & GENERATE MISSING FILES (CRITICAL):',
      '1. GENERATE ALL MISSING INTERCEPTED FILES AND LENGTHEN ENHANCEMENTS (EXTREMELY CRITICAL):'
    );

    code = code.replace(
      /If the active file contains ANY missing or intercepted imports \(files missing from the current repo tree\), or if you enhance the code with new external logic, you MUST generate the full source code for those missing files and place them in the "newFiles" array\./g,
      'You MUST cross-reference all imports in the active file against the EXISTING REPOSITORY FILES context. If the file contains ANY missing or intercepted imports (files missing from the current repo tree), or if you enhance the code with new external logic, you MUST generate the full, exhaustive source code for EVERY SINGLE ONE of those missing files and place them in the "newFiles" array. Do not miss any.'
    );

    code = code.replace(
      /SIGNIFICANTLY LENGTHEN ENHANCEMENTS: Provide deep, comprehensive, and exhaustive enhancements rather than small tweaks\. Expand the logic thoroughly and implement sophisticated capabilities without abbreviating\./g,
      'SIGNIFICANTLY LENGTHEN ENHANCEMENTS: You MUST provide deep, comprehensive, and exhaustive enhancements rather than small tweaks. Expand the logic thoroughly, write extensive implementations, and implement sophisticated capabilities. Do not artificially abbreviate or shorten the code. The length of the enhancement must be substantial.'
    );

    // Validate integrity before write
    if (validatePatchIntegrity(code)) {
      fs.writeFileSync(TARGET_FILE, code);
      console.log(`[DIAGNOSTIC] Patch applied successfully to ${TARGET_FILE}`);
    } else {
      throw new Error('Patch integrity validation failed.');
    }

  } catch (error) {
    console.error(`[DIAGNOSTIC] Fatal error during patch application: ${error.message}`);
    process.exit(1);
  }
}

applyPatch();