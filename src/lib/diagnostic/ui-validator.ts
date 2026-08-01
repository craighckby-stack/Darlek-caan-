/**
 * UI CONFIGURATION VALIDATOR
 * Role: Validates the integrity of the components.json configuration against the filesystem.
 * Siphoned from: AI_Agent_OS Diagnostic Gatekeeper patterns.
 */

import { existsSync } from 'fs';
import { join } from 'path';

export interface UIConfig {
  aliases: Record<string, string>;
  diagnostic_manifest: {
    integrity_check: string;
  };
}

export const validateUIConfiguration = (config: UIConfig): boolean => {
  console.log('[DIAGNOSTIC] Validating UI Component Aliases...');
  
  const entries = Object.entries(config.aliases);
  for (const [alias, path] of entries) {
    const resolvedPath = path.replace('@/', './src/');
    if (!existsSync(join(process.cwd(), resolvedPath))) {
      if (config.diagnostic_manifest.integrity_check === 'strict') {
        console.error(`[CRITICAL] UI Alias path missing: ${alias} -> ${resolvedPath}`);
        return false;
      }
      console.warn(`[WARNING] UI Alias path missing: ${alias} -> ${resolvedPath}`);
    }
  }
  
  return true;
};