/**
 * POSTCSS DIAGNOSTIC-AWARE CONFIGURATION ENGINE
 * Role: Manages CSS transformation pipelines with integrated system health validation.
 * Integration: Connects to the global DiagnosticGatekeeper to ensure build-time integrity.
 * 
 * This configuration acts as a gatekeeper for the styling layer, ensuring that
 * Tailwind CSS and associated plugins are correctly initialized within the 
 * diagnostic-aware build environment.
 */

import { validatePostCSSConfig } from './src/utils/postcss-diagnostic-gatekeeper.mjs';

// Initialize configuration with diagnostic validation
const rawConfig = {
  plugins: ["@tailwindcss/postcss"],
};

// Validate configuration integrity before export
const isValid = validatePostCSSConfig(rawConfig);

if (!isValid) {
  console.error("[DIAGNOSTIC] PostCSS Configuration Integrity Failure detected.");
}

export default rawConfig;