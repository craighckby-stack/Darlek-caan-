/**
 * KERNEL TYPE DEFINITIONS
 * Role: Core system architecture definitions for the Darlek-caan kernel.
 * Integration: Provides the foundational type-safety layer for system telemetry,
 * diagnostic reporting, and kernel lifecycle management.
 * 
 * This file acts as the primary source of truth for the system's observability contract.
 */

import { DiagnosticReport, DiagnosticMetrics, SystemDiagnosticState } from './diagnostic-types';

export interface SystemTelemetry {
  timestamp: number;
  module: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL';
  metrics?: DiagnosticMetrics;
}

export interface KernelConfig {
  version: string;
  debugMode: boolean;
  diagnosticLevel: 'MINIMAL' | 'VERBOSE' | 'DEBUG';
}

export interface KernelDiagnosticGatekeeperConfig {
  enforceStrictIntegrity: boolean;
  autoRecover: boolean;
  telemetryEndpoint: string;
}

export interface KernelState {
  status: SystemDiagnosticState;
  lastReport: DiagnosticReport | null;
  uptime: number;
  config: KernelConfig;
}

export type KernelEvent = 
  | { type: 'KERNEL_BOOT'; payload: KernelConfig }
  | { type: 'KERNEL_DIAGNOSTIC_UPDATE'; payload: DiagnosticReport }
  | { type: 'KERNEL_FAILURE'; payload: { error: Error; code: string } };