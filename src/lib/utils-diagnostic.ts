/**
 * UTILITY DIAGNOSTIC ENGINE
 * Role: Tracks health and performance metrics for core utility functions.
 * Integration: Used by src/lib/utils.ts to report system-level utility health.
 */

import { DiagnosticMetrics } from "./types";

export function recordUtilityTelemetry(utilityName: string, metadata: Record<string, any>): void {
  // In a production environment, this would interface with the global DiagnosticContext
  // or a centralized telemetry stream.
  const report: DiagnosticMetrics = {
    component: "utils",
    action: utilityName,
    timestamp: Date.now(),
    status: metadata.success ? "HEALTHY" : "DEGRADED",
    metadata
  };

  if (!metadata.success) {
    console.error(`[DIAGNOSTIC] Utility Failure in ${utilityName}:`, report);
  }
}

export function getUtilityHealthStatus(): string {
  return "OPERATIONAL";
}