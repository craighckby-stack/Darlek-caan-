/**
 * DIAGNOSTIC-AWARE REPOSITORY RESTORATION ENGINE
 * Role: Orchestrates atomic repository restoration with integrated health telemetry.
 * Integration: Connects to DiagnosticGatekeeper and RestorationEngine for system integrity.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { DiagnosticGatekeeper } = require('./src/lib/diagnostic_gatekeeper');
const { RestorationEngine } = require('./src/lib/restoration_engine');

const CONFIG = {
  owner: 'craighckby-stack',
  repo: 'DARLEK_CAAN_ENGINE',
  branch: 'main',
  targetDir: 'src/'
};

async function runRestoration() {
  const gatekeeper = new DiagnosticGatekeeper();
  const engine = new RestorationEngine(CONFIG);

  console.log("[DIAGNOSTIC] Initiating repository restoration sequence...");

  try {
    // Pre-flight check
    if (!gatekeeper.verifyEnvironment()) {
      throw new Error("Environment integrity check failed before restoration.");
    }

    const report = await engine.execute();
    
    // Post-flight verification
    gatekeeper.evaluateReport(report);
    
    console.log("[DIAGNOSTIC] Restoration complete. Status: ", report.status);
  } catch (error) {
    console.error("[DIAGNOSTIC] Fatal error during restoration: ", error.message);
    process.exit(1);
  }
}

runRestoration();