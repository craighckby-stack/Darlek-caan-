/**
 * BRAIN RUNTIME DIAGNOSTIC ARCHITECTURE
 * Role: Defines core runtime types and diagnostic-aware interfaces for the brain system.
 * Integration: Connects to system-wide diagnostic telemetry and gatekeeper services.
 */

import { DiagnosticReport, DiagnosticMetrics, SystemDiagnosticState } from './diagnostic-types';

export interface BrainState {
  version: string;
  compressed_chunks: string;
  index: string[];
  last_sync: number;
  diagnostic_state: SystemDiagnosticState;
}

export interface RuntimeConfig {
  apiKey: string;
  databaseURL: string;
  projectId: string;
  telemetryEnabled: boolean;
}

export interface BrainRuntimeGatekeeperConfig {
  strictMode: boolean;
  reportThreshold: number;
  autoRecover: boolean;
}

export interface BrainDiagnosticReport extends DiagnosticReport {
  runtimeMetrics: DiagnosticMetrics;
  brainIntegrity: boolean;
}

export type BrainRuntimeStatus = 'INITIALIZING' | 'READY' | 'DEGRADED' | 'CRITICAL_FAILURE';