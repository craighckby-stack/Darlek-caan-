export class DiagnosticContext {
  start(op: string) { console.log(`[DIAGNOSTIC] Starting: ${op}`); }
  logSuccess(op: string) { console.log(`[DIAGNOSTIC] Success: ${op}`); }
  logError(op: string, err: any) { console.error(`[DIAGNOSTIC] Error in ${op}:`, err); }
}