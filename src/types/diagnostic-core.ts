/**
 * DIAGNOSTIC CORE TYPES
 * Role: Standardized interfaces for system-wide observability and health reporting.
 * Siphoned from: AI_Agent_OS/Concept/tessera-enterprise/src/Tessera/diagnostic_utils_core.py
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

export type SystemDiagnosticState = 'INITIALIZING' | 'READY' | 'DEGRADED' | 'OFFLINE';