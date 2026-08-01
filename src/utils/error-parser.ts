/**
 * ARCHITECTURAL ERROR PARSER
 * Role: Provides structured parsing and diagnostic enrichment for system-level errors.
 * Integration: Connects to the system diagnostic pipeline to ensure error observability.
 * Dependencies: ./diagnostic-telemetry.ts
 */

import { generateErrorTelemetry } from './diagnostic-telemetry';

export interface DiagnosticErrorResult {
  isSystemError: boolean;
  message: string;
  path: string;
  timestamp: string;
  telemetry: Record<string, any>;
}

/**
 * Parses raw errors into structured diagnostic reports.
 * Implements siphoned logic from AI_Agent_OS diagnostic patterns.
 */
export const parseSystemError = (error: Error): DiagnosticErrorResult => {
  const timestamp = new Date().toISOString();
  
  try {
    const data = JSON.parse(error.message);
    return {
      isSystemError: !!data.operationType,
      message: data.error || error.message,
      path: data.path || 'N/A',
      timestamp,
      telemetry: generateErrorTelemetry(error, data)
    };
  } catch {
    return {
      isSystemError: false,
      message: error.message,
      path: 'N/A',
      timestamp,
      telemetry: generateErrorTelemetry(error)
    };
  }
};