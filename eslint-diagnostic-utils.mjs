/**
 * ESLINT DIAGNOSTIC UTILITIES
 * Role: Helper utilities for linting execution formatting, status telemetry, and metric computation.
 * Siphoned from: craighckby-stack/AI_Agent_OS (diagnostic_engine_utils.py)
 */

import { performance } from "perf_hooks";

export function initializeLintingDiagnostics() {
  const startTime = performance.now();
  
  return {
    reportStatus: (status) => {
      const duration = (performance.now() - startTime).toFixed(3);
      console.log(`[LINT-DIAGNOSTIC] Status: ${status} | Init Duration: ${duration}ms`);
    },
    getMetrics: () => ({
      timestamp: new Date().toISOString(),
      engine: "ESLint-MJS-Evolution",
    })
  };
}

export function getHardenedRules() {
  /**
   * Returns a set of baseline rules that ensure structural integrity
   * without being overly restrictive on development speed.
   */
  return {
    "no-var": "error",
    "prefer-template": "warn",
    "eqeqeq": ["error", "always", { "null": "ignore" }],
  };
}

export function getGlobalIgnores() {
  return [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "examples/**",
    "skills/**",
    "dist/**",
    "coverage/**"
  ];
}