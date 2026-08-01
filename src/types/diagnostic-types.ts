/**
 * DIAGNOSTIC TYPE DEFINITIONS
 * Role: Shared diagnostic interfaces siphoned from AI_Agent_OS.
 */

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, { passed: boolean; duration_ms: number }>;
  summary: DiagnosticMetrics;
  telemetry: Record<string, any>;
}

export interface DiagnosticMetrics {
  total: number;
  passed: number;
  failed: number;
  is_healthy: boolean;
  pass_rate: number;
}

export interface SystemDiagnosticState {
  lastCheck: string;
  healthScore: number;
  activeAlerts: string[];
}
