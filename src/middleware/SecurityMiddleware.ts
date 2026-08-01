/**
 * SecurityMiddleware: Enforces OMEGA ARCHITECTURE SECURITY PROTOCOL
 * Role: Validates repository integrity and prevents volatile state leakage.
 * Integration: Connects to SecurityDiagnosticGatekeeper for real-time telemetry reporting.
 */
import { SecurityDiagnosticGatekeeper } from './SecurityDiagnosticGatekeeper';

export class SecurityMiddleware {
  private static FORBIDDEN_EXTENSIONS = ['.consciousness.dump', '.quantum.data', '.env.local', '.secret'];

  /**
   * Validates staged files against security protocols and reports to diagnostic stream.
   */
  public static validateCommit(stagedFiles: string[]): boolean {
    const violations = stagedFiles.filter(file => 
      this.FORBIDDEN_EXTENSIONS.some(ext => file.endsWith(ext))
    );

    const isSecure = violations.length === 0;

    // Report status to diagnostic gatekeeper
    SecurityDiagnosticGatekeeper.reportSecurityEvent({
      event: 'COMMIT_VALIDATION',
      passed: isSecure,
      metadata: { violationsCount: violations.length, files: violations }
    });

    if (!isSecure) {
      console.error('SECURITY_VIOLATION_CODE_0x00: Forbidden files detected:', violations);
      return false;
    }
    return true;
  }
}