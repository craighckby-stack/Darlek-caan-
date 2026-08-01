/**
 * DIAGNOSTIC-AWARE NEXT.JS CONFIGURATION
 * Role: Orchestrates build-time configuration with integrated diagnostic validation.
 * Integration: Connects to 'lib/diagnostic-config-gatekeeper.ts' to ensure environment integrity.
 */

import type { NextConfig } from "next";
import { validateConfigIntegrity } from "./lib/diagnostic-config-gatekeeper";

// Perform pre-flight diagnostic validation of the configuration environment
const diagnosticReport = validateConfigIntegrity({
  output: "standalone",
  reactStrictMode: false,
  allowedDevOrigins: [
    "localhost:3000",
    "ais-dev-amubz4v3czr3772fnvrcru-483535245139.asia-southeast1.run.app",
    "ais-pre-amubz4v3czr3772fnvrcru-483535245139.asia-southeast1.run.app"
  ]
});

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Injected diagnostic metadata for runtime observability
  env: {
    DIAGNOSTIC_STATUS: diagnosticReport.status,
    DIAGNOSTIC_TIMESTAMP: diagnosticReport.timestamp,
  },
} as any;

export default nextConfig;