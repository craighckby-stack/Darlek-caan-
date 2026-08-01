/**
 * DIAGNOSTIC TYPES & CORE UTILITIES
 * Role: Defines the structural contracts for diagnostic modules and registry management.
 */

export interface DiagnosticModule {
  id: string;
  check: () => Promise<number>;
}

export class DiagnosticRegistryManager {
  private modules: Map<string, DiagnosticModule> = new Map();

  register(module: DiagnosticModule): void {
    this.modules.set(module.id, module);
  }

  get(id: string): DiagnosticModule | undefined {
    return this.modules.get(id);
  }

  getAll(): DiagnosticModule[] {
    return Array.from(this.modules.values());
  }

  async runAll(): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    for (const [id, module] of this.modules) {
      results[id] = await module.check();
    }
    return results;
  }
}