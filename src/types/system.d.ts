/**
 * SYSTEM DIAGNOSTIC DEFINITIONS
 * Role: Defines the core system configuration and orchestrator prop structures.
 * Integration: Connected to the system-wide observability contract via Diagnostic-Aware interfaces.
 * 
 * This file acts as the primary type-safe foundation for system-level telemetry and 
 * diagnostic gatekeeping, ensuring all configurations are validated at runtime.
 */

import { DiagnosticReport, DiagnosticMetrics, SystemDiagnosticState } from './diagnostic-types';

export interface SystemConfig {
  version: string;
  mode: 'development' | 'production';
  debug: boolean;
  /** Diagnostic telemetry state for the system */
  telemetryState?: SystemDiagnosticState;
  /** Last known diagnostic report */
  lastReport?: DiagnosticReport;
}

export interface AgentOrchestratorProps {
  orchestratorId: string;
  priority: number;
  /** Diagnostic metrics for the orchestrator */
  metrics?: DiagnosticMetrics;
}

export interface SystemGatekeeperConfig {
  enforceStrictValidation: boolean;
  maxAllowedLatencyMs: number;
  criticalThreshold: number;
}
