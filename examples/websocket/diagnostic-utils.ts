/**
 * WEBSOCKET DIAGNOSTIC UTILITIES
 * Role: Provides kernel-grade health monitoring, check execution with high-precision telemetry,
 *       and status summarization for the WebSocket server architecture.
 * Siphoned From: craighckby-stack/AI_Agent_OS (diagnostic_engine, diagnostic_engine_utils)
 */

export interface CheckResult {
  passed: boolean;
  durationMs: number;
  details?: string;
}

export interface DiagnosticSummary {
  total: number;
  passed: number;
  failed: number;
  isHealthy: boolean;
  passRate: number;
}

export interface DiagnosticTelemetry {
  timestamp: number;
  threadId: number;
  version: string;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, CheckResult>;
  summary: DiagnosticSummary;
  telemetry: DiagnosticTelemetry;
  error?: string;
}

let isContextInitialized = false;
let startTime = Date.now();

/**
 * Initializes the diagnostic server context and records baseline operational metadata.
 */
export function initializeServerContext(): void {
  isContextInitialized = true;
  startTime = Date.now();
  console.log('[DIAGNOSTIC] WebSocket diagnostic context initialized successfully.');
}

/**
 * Formats current UTC time as an ISO 8601 string.
 */
export function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Computes diagnostic metric summary from check results map.
 */
export function summarizeDiagnosticResults(checks: Record<string, boolean>): DiagnosticSummary {
  const total = Object.keys(checks).length;
  const passed = Object.values(checks).filter(Boolean).length;
  const failed = total - passed;
  const isHealthy = total > 0 && failed === 0;
  const passRate = total > 0 ? Number(((passed / total) * 100).toFixed(2)) : 0;

  return {
    total,
    passed,
    failed,
    isHealthy,
    passRate,
  };
}

/**
 * Generates standard diagnostic telemetry metadata.
 */
export function generateTelemetryMetadata(): DiagnosticTelemetry {
  return {
    timestamp: Date.now(),
    threadId: Math.floor(Math.random() * 1000000),
    version: '1.0.0-DIAGNOSTIC-AWARE',
  };
}

/**
 * Executes a diagnostic check function and measures execution duration in milliseconds.
 */
export async function executeCheckWithTelemetry(
  checkFn: () => boolean | Promise<boolean>
): Promise<CheckResult> {
  const start = performance.now();
  try {
    const passed = await Promise.resolve(checkFn());
    const durationMs = Number((performance.now() - start).toFixed(3));
    return { passed, durationMs };
  } catch (err: any) {
    const durationMs = Number((performance.now() - start).toFixed(3));
    return { passed: false, durationMs, details: err?.message || String(err) };
  }
}

const REGISTERED_CHECKS: Record<string, () => boolean | Promise<boolean>> = {
  context_initialization: () => isContextInitialized,
  memory_footprint: () => {
    const mem = process.memoryUsage();
    return mem.heapUsed < 1024 * 1024 * 1024;
  },
  process_uptime: () => process.uptime() >= 0,
  event_loop_latency: async () => {
    const start = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 5));
    const delta = performance.now() - start;
    return delta < 50;
  }
};

/**
 * Runs full system diagnostics and returns comprehensive telemetry report.
 */
export async function runSystemDiagnostics(): Promise<DiagnosticReport> {
  try {
    const checkKeys = Object.keys(REGISTERED_CHECKS);
    const checksRaw: Record<string, CheckResult> = {};
    const checksBool: Record<string, boolean> = {};

    for (const key of checkKeys) {
      const result = await executeCheckWithTelemetry(REGISTERED_CHECKS[key]);
      checksRaw[key] = result;
      checksBool[key] = result.passed;
    }

    const summary = summarizeDiagnosticResults(checksBool);
    const status = summary.isHealthy ? 'HEALTHY' : 'CRITICAL_FAILURE';

    return {
      status,
      timestamp: formatTimestamp(),
      checks: checksRaw,
      summary,
      telemetry: generateTelemetryMetadata(),
    };
  } catch (e: any) {
    return {
      status: 'ERROR',
      timestamp: formatTimestamp(),
      checks: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        isHealthy: false,
        passRate: 0,
      },
      telemetry: generateTelemetryMetadata(),
      error: e?.message || String(e),
    };
  }
}
