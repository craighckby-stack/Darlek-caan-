/**
 * ARCHITECTURAL DIAGNOSTIC TYPES
 * Role: Defines the core interfaces for system-wide telemetry and health monitoring.
 * Siphoned from: AI_Agent_OS/Concept/tessera-enterprise/src/Tessera/diagnostic_utils_core.py
 */

export interface DiagnosticMetadata {
  timestamp: string;
  thread_id: string | number;
  version: string;
}

export interface DiagnosticResult {
  passed: boolean;
  message: string;
  metadata: DiagnosticMetadata;
  duration_ms?: number;
}

export interface SystemHealthReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, { passed: boolean; duration_ms: number }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    is_healthy: boolean;
    pass_rate: number;
  };
  telemetry: DiagnosticMetadata;
}
