/**
 * CORE SYSTEM TYPES & DIAGNOSTIC INTERFACES
 * Role: Defines the foundational data structures for the system, including 
 * diagnostic telemetry, evolution states, and node lifecycle management.
 * Integration: Used by the DiagnosticEngine and EvolutionController to ensure 
 * type-safe communication across the system.
 */

export interface DiagnosticMetadata {
  timestamp: string;
  version: string;
  thread_id: string | number;
  node_id: string;
}

export type SystemHealthState = 'STABLE' | 'MUTATING' | 'CRITICAL' | 'DEGRADED' | 'INITIALIZING';

export interface TelemetryPayload {
  duration_ms: number;
  status: SystemHealthState;
  metadata: DiagnosticMetadata;
}

export interface QuantumNode {
  id: string;
  state: SystemHealthState;
  execute: (input: any) => Promise<any>;
  teardown: () => void;
  getTelemetry: () => TelemetryPayload;
}

export type EvolutionResult = {
  success: boolean;
  logs: string[];
  timestamp: string;
  telemetry: TelemetryPayload;
};

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
  telemetry: DiagnosticMetadata;
}