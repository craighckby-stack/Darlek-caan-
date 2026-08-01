/**
 * ARCHITECTURAL TYPE DEFINITIONS
 * Role: Defines the core data contracts for the system's diagnostic and mutation lifecycle.
 * Integration: Used by the DiagnosticEngine and MutationController to ensure type safety 
 * across all system health reports and repository evolution payloads.
 */

export interface MutationPayload {
  sessionId: string;
  filePath: string;
  status: 'pending' | 'applied' | 'rejected';
  riskScore: number;
  analysis: string;
  timestamp: string;
  [key: string]: any;
}

export interface HealthMetrics {
  structuralChange: number;
  semanticSaturation: number;
  velocity: number;
  identityPreservation: number;
  capabilityAlignment: number;
  crossFileImpact: number;
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
  telemetry: SystemTelemetry;
}

export interface SystemTelemetry {
  timestamp: number;
  thread_id: number;
  version: string;
  engine_id?: string;
}

export interface BrainState {
  lastDiagnostic: DiagnosticReport | null;
  activeMutations: MutationPayload[];
  systemHealth: HealthMetrics;
}
