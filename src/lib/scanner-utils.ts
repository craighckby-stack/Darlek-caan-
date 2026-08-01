/**
 * ARCHITECTURAL SCANNER UTILITIES
 * Role: Provides file system scanning, criticality validation, and diagnostic telemetry.
 * Integration: Used by the system orchestrator to audit repository health and file integrity.
 * Dependencies: scanner-telemetry.ts, scanner-diagnostic-gatekeeper.ts
 */

import { ScannerDiagnosticGatekeeper } from './scanner-diagnostic-gatekeeper';
import { recordScanTelemetry } from './scanner-telemetry';

const gatekeeper = new ScannerDiagnosticGatekeeper();

export const isCriticalFile = (path: string): boolean => {
  try {
    const criticalExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json', '.config'];
    const isCritical = criticalExtensions.some(ext => path.endsWith(ext));
    
    gatekeeper.validateAccess(path);
    return isCritical;
  } catch (error) {
    console.error(`[SCANNER] Criticality check failed for ${path}:`, error);
    return false;
  }
};

export const formatScanMetrics = (files: any[]) => {
  const startTime = performance.now();
  
  const metrics = {
    count: files.length,
    totalSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
    timestamp: new Date().toISOString(),
    durationMs: performance.now() - startTime
  };

  recordScanTelemetry(metrics);
  return metrics;
};