/**
 * DIAGNOSTIC TELEMETRY UTILITIES
 * Role: Provides standardized telemetry and logging for system operations.
 */

export function formatTimestamp(): string {
  return new Date().toISOString();
}

export async function executeWithTelemetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const start = process.hrtime();
  try {
    const result = await fn();
    const diff = process.hrtime(start);
    const ms = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(3);
    console.log(`[TELEMETRY] ${label} executed in ${ms}ms`);
    return result;
  } catch (err) {
    console.error(`[ERROR] ${label} failed:`, err);
    throw err;
  }
}