/**
 * ARCHITECTURAL UTILITY HUB
 * Role: Provides core system utilities and diagnostic-aware wrappers for UI/Logic operations.
 * Integration: Centralized utility access point for the entire application.
 * Dependencies: clsx, tailwind-merge, ./utils-diagnostic
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { recordUtilityTelemetry } from "./utils-diagnostic";

/**
 * Merges tailwind classes with diagnostic tracking.
 * @param inputs - Array of class values to merge.
 * @returns Merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  try {
    const result = twMerge(clsx(inputs));
    recordUtilityTelemetry("cn", { success: true, inputCount: inputs.length });
    return result;
  } catch (error) {
    recordUtilityTelemetry("cn", { success: false, error: String(error) });
    return "";
  }
}

/**
 * Safely executes a utility function with diagnostic wrapping.
 * @param fn - The utility function to execute.
 * @param name - Identifier for telemetry.
 */
export function withDiagnosticTracking<T>(fn: () => T, name: string): T {
  try {
    const result = fn();
    recordUtilityTelemetry(name, { success: true });
    return result;
  } catch (error) {
    recordUtilityTelemetry(name, { success: false, error: String(error) });
    throw error;
  }
}