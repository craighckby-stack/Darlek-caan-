/**
 * OMEGA CORE TYPES
 * Role: Defines the fundamental task and result structures for the Omega system.
 * Integration: Connects to diagnostic-aware components via system-wide observability contracts.
 * 
 * This file acts as the primary type-definition layer for task orchestration,
 * ensuring all payloads and results are validated against diagnostic gatekeepers.
 */

import { DiagnosticReport, DiagnosticMetrics, SystemDiagnosticState } from './omega-core';

export interface Task {
  id: string;
  priority: number;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface Result {
  success: boolean;
  data?: unknown;
  error?: string;
  telemetry?: DiagnosticMetrics;
  report?: DiagnosticReport;
}

export interface OmegaTaskGatekeeperConfig {
  strictMode: boolean;
  validatePayload: boolean;
  maxExecutionTimeMs: number;
  allowedTaskTypes: string[];
}

export type Unsubscribe = () => void;

export interface OmegaSystemState {
  status: SystemDiagnosticState;
  lastReport: DiagnosticReport | null;
  activeTasks: number;
}
