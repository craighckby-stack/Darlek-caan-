/**
 * ARCHITECTURAL REPOSITORY DEFINITION
 * Role: Defines the core schema for repository metadata and diagnostic-aware state management.
 * Integration: Connects to the system-wide observability contract via DiagnosticReport and SystemDiagnosticState.
 * Dependencies: src/types/diagnostic-core.ts
 */

import { DiagnosticReport, SystemDiagnosticState } from './diagnostic-core';

export interface RepositoryMetadata {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  url: string;
  description: string;
  language: string;
  lastUpdated: string;
  /** Diagnostic telemetry for repository health */
  diagnosticReport?: DiagnosticReport;
  /** Current system state of the repository */
  state?: SystemDiagnosticState;
}

export interface RepoResponse {
  success: boolean;
  count: number;
  repos: RepositoryMetadata[];
  /** Global diagnostic summary for the repository batch */
  telemetrySummary?: Record<string, any>;
}

export interface RepositoryDiagnosticGatekeeperConfig {
  /** Validation threshold for repository metadata integrity */
  integrityThreshold: number;
  /** Flag to enable/disable deep repository scanning */
  enableDeepScan: boolean;
  /** Allowed languages for repository validation */
  allowedLanguages: string[];
}
