/**
 * DIAGNOSTIC CONTRACTS
 * Role: Standardized interfaces for system-wide observability and health reporting.
 * Siphoned from: AI_Agent_OS Diagnostic Engine patterns.
 */

export interface DiagnosticMetrics {
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
  duration_ms?: number;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  summary: DiagnosticMetrics;
  telemetry: Record<string, any>;
}

export type SystemDiagnosticState = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN';