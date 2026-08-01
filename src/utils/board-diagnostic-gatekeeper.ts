/**
 * BOARD DIAGNOSTIC GATEKEEPER
 * Role: Validates board state integrity and generates telemetry for mutations.
 * Integration: Used by board-safety.ts to ensure observability of state changes.
 */

export interface DiagnosticMetadata {
  timestamp: string;
  duration_ms: number;
  success: boolean;
  error?: any;
}

export const validateBoardMutation = (
  action: 'put' | 'remove',
  square: string,
  success: boolean,
  duration: number,
  error?: any
): void => {
  const report = {
    action,
    square,
    success,
    duration_ms: parseFloat(duration.toFixed(3)),
    timestamp: new Date().toISOString(),
    error: error ? String(error) : null
  };

  if (!success) {
    console.error('[BOARD_DIAGNOSTIC] Mutation failure:', report);
  } else {
    console.debug('[BOARD_DIAGNOSTIC] Mutation successful:', report);
  }
};