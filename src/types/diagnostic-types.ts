/**
 * DIAGNOSTIC TYPES
 * Role: Standardized interfaces for system-wide observability and health monitoring.
 */

export interface DiagnosticMetrics {
  executionTimeMs: number;
  memoryUsageBytes: number;
  threadId: string | number;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  metrics: DiagnosticMetrics;
  summary: Record<string, any>;
}

export type SystemDiagnosticState = 'idle' | 'monitoring' | 'recovering' | 'locked';