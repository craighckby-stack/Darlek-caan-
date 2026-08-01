/**
 * DIAGNOSTIC TYPE DEFINITIONS
 * Siphoned from AI_Agent_OS diagnostic_utils_core.py
 */

export interface DiagnosticMetrics {
  duration_ms: number;
  pass_rate: number;
  total_checks: number;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, { passed: boolean; duration_ms: number }>;
  summary: DiagnosticMetrics;
  telemetry: Record<string, any>;
}

export type SystemDiagnosticState = 'INITIALIZING' | 'READY' | 'DEGRADED' | 'FATAL';