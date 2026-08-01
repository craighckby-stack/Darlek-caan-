/**
 * OMEGA CORE TYPE DEFINITIONS
 * Role: Defines the foundational state and configuration interfaces for the Omega system.
 * Integration: Connects to system-wide diagnostic observability contracts.
 * 
 * This file serves as the primary type-safe schema for system state management,
 * ensuring all core components adhere to the diagnostic-aware architecture.
 */

import { 
  DiagnosticReport, 
  DiagnosticMetrics, 
  SystemDiagnosticState 
} from './diagnostic-types';

export interface OmegaState {
  id: string;
  status: 'initializing' | 'active' | 'quantum-locked' | 'error';
  timestamp: number;
  agentOrchestrationActive: boolean;
  diagnosticState: SystemDiagnosticState;
  lastReport?: DiagnosticReport;
}

export interface TemporalCrucibleConfig {
  simulationRate: number;
  maxAgents: number;
  enableQuantumFallback: boolean;
  telemetryEnabled: boolean;
}

export interface OmegaGatekeeperConfig {
  enforceStrictIntegrity: boolean;
  heartbeatIntervalMs: number;
  maxAllowedLatencyMs: number;
  diagnosticMetrics: DiagnosticMetrics;
}

export type OmegaCoreModule = {
  state: OmegaState;
  config: TemporalCrucibleConfig;
  gatekeeper: OmegaGatekeeperConfig;
};