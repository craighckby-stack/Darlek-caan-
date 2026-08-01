/**
 * DIAGNOSTIC CONFIG GATEKEEPER
 * Role: Validates configuration integrity and environment health.
 * Siphoned from: AI_Agent_OS DiagnosticEngine patterns.
 */

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE';
  timestamp: string;
  metadata: Record<string, any>;
}

export function validateConfigIntegrity(config: any): DiagnosticReport {
  const isHealthy = !!config.allowedDevOrigins && Array.isArray(config.allowedDevOrigins);
  
  const report: DiagnosticReport = {
    status: isHealthy ? 'HEALTHY' : 'CRITICAL_FAILURE',
    timestamp: new Date().toISOString(),
    metadata: {
      version: "1.0.0-DIAGNOSTIC-AWARE",
      originCount: config.allowedDevOrigins?.length || 0
    }
  };

  if (!isHealthy) {
    console.error("[DIAGNOSTIC] Configuration integrity check failed: Missing or invalid origins.");
  }

  return report;
}