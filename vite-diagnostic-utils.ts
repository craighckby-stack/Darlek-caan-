/**
 * VITE DIAGNOSTIC UTILITIES
 * Role: Validates build-time environment integrity and provides telemetry hooks.
 * Integration: Imported by vite.config.ts to ensure system health before compilation.
 */

export const validateBuildEnvironment = (): boolean => {
  const requiredEnv = ['NODE_ENV'];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`[DIAGNOSTIC] Environment check incomplete: Missing ${missing.join(', ')}`);
    return false;
  }
  
  console.info('[DIAGNOSTIC] Build environment validated successfully.');
  return true;
};

export const getBuildTelemetry = () => ({
  timestamp: new Date().toISOString(),
  version: '1.0.0-DIAGNOSTIC-AWARE',
  platform: process.platform
});