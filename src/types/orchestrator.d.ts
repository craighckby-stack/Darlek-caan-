/**
 * ARCHITECTURAL ORCHESTRATOR TYPES
 * Role: Defines the core interfaces for agent orchestration and system state management.
 * Integration: Connects to system-wide diagnostic contracts and telemetry-aware gatekeepers.
 * Dependencies: ./diagnostic-contracts.d.ts (via import)
 */

import { DiagnosticReport, DiagnosticMetrics, SystemDiagnosticState } from './diagnostic-contracts.d';

export interface AgentConfig {
  id: string;
  role: 'controller' | 'worker' | 'observer';
  priority: number;
  memoryBuffer: boolean;
  /** Telemetry-aware metadata for agent lifecycle tracking */
  lastHeartbeat?: string;
  diagnosticState?: SystemDiagnosticState;
}

export interface SystemState {
  status: 'active' | 'dormant' | 'evolving';
  lastSync: string;
  activeAgents: AgentConfig[];
  /** Global system health metrics */
  telemetry?: DiagnosticMetrics;
  latestReport?: DiagnosticReport;
}

export interface OrchestratorGatekeeperConfig {
  enforceStrictValidation: boolean;
  maxAllowedDegradation: number;
  autoRecover: boolean;
}

export interface OrchestratorContext {
  config: OrchestratorGatekeeperConfig;
  state: SystemState;
  updateState: (newState: Partial<SystemState>) => void;
}