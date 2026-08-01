/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Standardizes error metadata and diagnostic reporting across the system.
 * Integration: Used by error-parser and system-wide diagnostic engines.
 */

export const generateErrorTelemetry = (error: Error, context?: any) => {
  return {
    version: "1.0.0-DIAGNOSTIC-AWARE",
    stack: error.stack,
    context: context || {},
    runtime: typeof window !== 'undefined' ? 'browser' : 'node'
  };
};