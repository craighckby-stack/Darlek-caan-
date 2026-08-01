/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Formatting and metadata generation for system observability.
 */

function formatTimestamp() {
  return new Date().toISOString();
}

function generateTelemetryMetadata() {
  return {
    timestamp: Date.now(),
    engine_version: '2.1.0-DARLEK-EVOLVED',
    node_version: process.version,
    platform: process.platform
  };
}

module.exports = { formatTimestamp, generateTelemetryMetadata };