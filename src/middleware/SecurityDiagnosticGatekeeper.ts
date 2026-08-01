/**
 * SecurityDiagnosticGatekeeper
 * Role: Manages security-specific telemetry and diagnostic health states.
 * Integration: Used by SecurityMiddleware to report security-critical events.
 */
import { DiagnosticReport } from '../lib/types';

export class SecurityDiagnosticGatekeeper {
  private static securityLog: any[] = [];

  public static reportSecurityEvent(event: { event: string, passed: boolean, metadata: any }) {
    const report: DiagnosticReport = {
      status: event.passed ? 'SECURE' : 'VULNERABLE',
      timestamp: new Date().toISOString(),
      checks: { [event.event]: event.passed },
      telemetry: { ...event.metadata, version: '1.0.0-SEC-DIAG' }
    };

    this.securityLog.push(report);
    
    if (!event.passed) {
      console.warn('[SECURITY_DIAGNOSTIC] Security breach attempt detected:', report);
    }
  }

  public static getSecurityStatus(): any[] {
    return this.securityLog;
  }
}