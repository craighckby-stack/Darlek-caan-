/**
 * HMR TELEMETRY UTILITIES
 * Role: Provides diagnostic filtering and event logging for HMR/Turbopack errors.
 * Integration: Used by HmrErrorHandler to maintain system health metrics.
 */

export const isHmrError = (reason: any): boolean => {
  const message = typeof reason === 'string' ? reason : (reason?.message || '');
  const name = reason?.name || '';

  return (
    name === 'ChunkLoadError' ||
    message.includes('hmr-client') ||
    message.includes('Failed to load chunk') ||
    message.includes('turbopack')
  );
};

export const logHmrEvent = (reason: any) => {
  // In a production-grade system, this would pipe to a diagnostic dashboard.
  // Currently, it acts as a silent telemetry sink to prevent console pollution.
  const timestamp = new Date().toISOString();
  console.debug(`[HMR-DIAGNOSTIC] Suppressed event at ${timestamp}:`, reason);
};