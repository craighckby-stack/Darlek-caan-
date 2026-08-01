/**
 * ARCHITECTURAL SYSTEM TYPES & DIAGNOSTIC CONTRACTS
 * Role: Defines core game domain models and integrates system-wide diagnostic observability.
 * Integration: Serves as the central type registry for the game engine and diagnostic gatekeepers.
 */

export enum GameMode {
  PVP = 'PVP', // Player vs Player local
  PVE = 'PVE', // Player vs Local Engine
  PVD = 'PVD', // Player vs Dalek Caan AI
  AVA = 'AVA', // Dalek Caan (AI) vs Jesus (AI)
}

export enum GameDifficulty {
  EASY = 'EASY',     // Random/greedy moves
  MEDIUM = 'MEDIUM', // 2-ply search
  HARD = 'HARD'      // 3-ply search with piece-square tables
}

export enum BoardTheme {
  CRUCIBLE = 'CRUCIBLE',   // Red/Dark-Gray Dalek styling
  CYBER = 'CYBER',         // Neon Turquoise/Silver
  OBSIDIAN = 'OBSIDIAN',   // Black/Gold
  CLASSIC = 'CLASSIC'      // Traditional Wood-like tones
}

export interface MoveLog {
  id: string;
  from: string;
  to: string;
  piece: string;
  color: 'w' | 'b';
  san: string;
  timestamp: string;
}

export interface DalekDialogue {
  text: string;
  emotion: 'prophetic' | 'maniacal' | 'furious' | 'calculating' | 'victorious' | 'panicked';
  prophecyLevel: number; // 0 to 100 percentage
  timestamp: number;
}

export interface DebateDialogue {
  caanText: string;
  caanEmotion: 'prophetic' | 'maniacal' | 'furious' | 'calculating' | 'victorious' | 'panicked';
  jesusText: string;
  jesusTone: 'serene' | 'righteous' | 'compassionate' | 'majestic' | 'wrathful';
  prophecyLevel: number;
  timestamp: number;
}

export interface CapturedPieces {
  w: string[]; // Captured White pieces
  b: string[]; // Captured Black pieces
}

export interface GameSettings {
  mode: GameMode;
  difficulty: GameDifficulty;
  theme: BoardTheme;
  playerColor: 'w' | 'b';
  muteSounds: boolean;
  synthesizerVolume: number;
}

/**
 * DIAGNOSTIC-AWARE ARCHITECTURE CONTRACTS
 * Siphoned from AI_Agent_OS Diagnostic Engine
 */

export interface DiagnosticMetrics {
  duration_ms: number;
  timestamp: string;
  thread_id?: string;
}

export interface DiagnosticReport {
  status: 'HEALTHY' | 'CRITICAL_FAILURE' | 'ERROR';
  timestamp: string;
  checks: Record<string, { passed: boolean; duration_ms: number }>;
  summary: {
    total: number;
    passed: number;
    failed: number;
    is_healthy: boolean;
    pass_rate: number;
  };
  telemetry: DiagnosticMetrics;
}

export interface SystemDiagnosticState {
  lastReport: DiagnosticReport | null;
  isSystemReady: boolean;
  kernelIntegrity: boolean;
}

export interface DiagnosticGatekeeperConfig {
  strictMode: boolean;
  autoRecovery: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}