/**
 * DIAGNOSTIC TYPES
 * Role: Shared diagnostic interfaces siphoned from AI_Agent_OS.
 */

export interface DiagnosticMetrics {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  durationMs: number;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, { passed: boolean; duration_ms: number }>;
  summary: DiagnosticMetrics;
  telemetry: Record<string, any>;
}

export type SystemDiagnosticState = 'INITIALIZING' | 'READY' | 'DEGRADED' | 'FATAL';