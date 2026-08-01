/**
 * Gemini Diagnostic Telemetry
 * Role: Tracks API health and performance metrics for the Gemini utility.
 */

export class GeminiDiagnosticGatekeeper {
  private healthMap: Map<string, boolean> = new Map();

  isModelHealthy(model: string): boolean {
    return this.healthMap.get(model) ?? true;
  }

  reportFailure(model: string) {
    this.healthMap.set(model, false);
    setTimeout(() => this.healthMap.set(model, true), 60000); // Reset after 1 min
  }
}

export function recordGeminiTelemetry(model: string, duration: number, success: boolean) {
  console.log(`[Telemetry] Gemini Model: ${model} | Duration: ${duration}ms | Success: ${success}`);
}