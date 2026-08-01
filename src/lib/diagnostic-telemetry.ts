/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Captures and formats error telemetry for the system diagnostic engine.
 * Siphoned from AI_Agent_OS diagnostic patterns.
 */

export interface DiagnosticTelemetry {
  timestamp: string;
  error: string;
  digest?: string;
  severity: 'CRITICAL' | 'WARNING';
}

export function captureDiagnosticError(error: Error & { digest?: string }) {
  const telemetry: DiagnosticTelemetry = {
    timestamp: new Date().toISOString(),
    error: error.message,
    digest: error.digest,
    severity: 'CRITICAL'
  };

  // In a production environment, this would interface with the system's diagnostic registry
  console.error('[DIAGNOSTIC_TELEMETRY_CAPTURE]', telemetry);
  
  // Future integration: Send to /api/system/telemetry
  return telemetry;
}