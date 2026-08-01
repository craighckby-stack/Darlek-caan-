/**
 * PROJECT MANIFEST DEFINITION
 * Role: Defines the core project structure, capabilities, and diagnostic-aware configuration.
 * Integration: Used by the system kernel and diagnostic engine to validate project integrity.
 * 
 * This file acts as the source of truth for the project's architectural state and 
 * diagnostic telemetry requirements.
 */

import { DiagnosticReport, DiagnosticMetrics, SystemDiagnosticState } from './diagnostic-types';

export interface ManifestDiagnosticGatekeeperConfig {
  enabled: boolean;
  strictMode: boolean;
  reportingIntervalMs: number;
  telemetryEndpoint: string;
}

export interface ProjectManifest {
  project: string;
  version: string;
  description: string;
  architecture: Record<string, string>;
  capabilities: {
    serverSide: string[];
    clientSide: string[];
  };
  deployment: {
    environment: string;
    autoScaling: boolean;
    telemetry: string;
  };
  dependencies: Record<string, string>;
  
  /** Diagnostic-Aware Extensions */
  diagnosticConfig: ManifestDiagnosticGatekeeperConfig;
  lastDiagnosticReport?: DiagnosticReport;
  systemState: SystemDiagnosticState;
}

export interface ManifestValidationResult {
  isValid: boolean;
  metrics: DiagnosticMetrics;
  timestamp: string;
  errors: string[];
}