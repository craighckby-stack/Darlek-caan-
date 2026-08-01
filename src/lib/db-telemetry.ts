/**
 * DATABASE TELEMETRY UTILITIES
 * Role: Provides diagnostic logging and telemetry metadata for database operations.
 */

export function recordDatabaseDiagnostic(event: string, metadata: Record<string, any>) {
  console.log(`[DB_DIAGNOSTIC][${event}]`, JSON.stringify({
    ...metadata,
    timestamp: new Date().toISOString(),
    source: 'db-controller'
  }));
}

export function generateDbTelemetry(error: any) {
  return {
    errorCode: error?.code || 'UNKNOWN',
    message: error?.message || 'No error message provided',
    stack: error?.stack?.substring(0, 200),
    thread_id: typeof process !== 'undefined' ? process.pid : 'unknown'
  };
}