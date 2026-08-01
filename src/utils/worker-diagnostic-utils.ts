/**
 * WORKER DIAGNOSTIC UTILITIES
 * Role: Provides telemetry and status reporting for background worker threads.
 */

export interface WorkerTelemetry {
  startTime: number;
  version: string;
  threadId: number;
}

export function initializeWorkerTelemetry(data: any): WorkerTelemetry {
  return {
    startTime: data?.startTime || Date.now(),
    version: '1.0.0-DIAGNOSTIC-AWARE',
    threadId: process.pid
  };
}

export function reportWorkerStatus(result: any) {
  return {
    ...result,
    timestamp: new Date().toISOString(),
    duration: Date.now() - (result.telemetry?.startTime || Date.now())
  };
}