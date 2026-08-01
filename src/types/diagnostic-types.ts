/**
 * DIAGNOSTIC TYPES CORE
 * Role: Standardized interfaces for system-wide observability and health monitoring.
 */

export interface DiagnosticMetrics {
  duration_ms: number;
  timestamp: string;
  thread_id?: string;
}

export interface DiagnosticReport {
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
  telemetry: Record<string, any>;
}

export interface SystemDiagnosticState {
  last_check: string;
  health_score: number;
  active_gatekeepers: string[];
}