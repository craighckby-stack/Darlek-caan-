/**
 * DIAGNOSTIC TELEMETRY UTILS
 * Role: Captures and persists system error states for the diagnostic engine.
 */

export const ErrorTelemetry = {
  log: (data: { message: string; digest?: string; timestamp: string; severity: string }) => {
    console.error('[DIAGNOSTIC_TELEMETRY_REPORT]', data);
    // Future integration: Push to persistent storage or diagnostic registry
  }
};