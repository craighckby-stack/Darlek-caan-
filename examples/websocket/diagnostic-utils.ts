/**
 * DIAGNOSTIC UTILITIES
 * Role: Provides telemetry and health checks for the WebSocket server.
 */

export interface DiagnosticReport {
  status: string
  timestamp: string
  memoryUsage: NodeJS.MemoryUsage
  uptime: number
}

let startTime: number

export const initializeServerContext = () => {
  startTime = Date.now()
}

export const runSystemDiagnostics = async (): Promise<DiagnosticReport> => {
  return {
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
    uptime: (Date.now() - startTime) / 1000
  }
}