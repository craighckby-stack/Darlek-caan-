/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/types/evolution.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

export interface IQuantumNode {
  stateVector: Record<string, any>;
  entanglementKey: string;
  collapse(): Promise<void>;
}

export interface EvolutionSnapshot {
  timestamp: number;
  checksum: string;
  affectedFiles: string[];
}