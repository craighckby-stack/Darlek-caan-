/**
 * ── AST DIFF GATE (PROGRAMMATIC SYNTAX & SYMBOL MUTATION VERIFIER) ──
 * Role: Performs AST-level structural diffing and diagnostic health reporting.
 * Integration: Connects to the global diagnostic engine to report validation health.
 * 
 * This module acts as the primary gatekeeper for code evolution, ensuring 
 * structural integrity and preventing persona-based branding injections.
 */

import { DiagnosticResult, generateTelemetryMetadata } from './ast-diff-telemetry';

export interface AstSymbol {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'const' | 'method';
  line?: number;
}

export interface AstDiffResult {
  passed: boolean;
  astScore: number;
  symbolMap: {
    originalCount: number;
    proposedCount: number;
    retainedCount: number;
    missingSymbols: AstSymbol[];
  };
  brandingInjections: string[];
  structuralDriftRatio: number;
  violations: Array<{
    code: 'BRANDING_INJECTION' | 'AST_SYMBOL_DROPPED' | 'AST_STRUCTURAL_DRIFT' | 'UNRESOLVED_AST_IMPORT';
    message: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  telemetry?: DiagnosticResult;
}

const SYSTEM_PERSONA_BRANDING_TERMS = [
  'dalek caan', 'dalek_caan', 'dalekcaan', 'omega engine', 'omega_engine',
  'cognitive dominance', 'grog engine', 'grog_engine', 'recursive evolution loop',
  'nexus neural network', 'dalek caan jarvis',
];

export function parseAstSymbols(code: string, isPython: boolean): AstSymbol[] {
  const symbols: AstSymbol[] = [];
  const seen = new Set<string>();

  if (isPython) {
    const classRegex = /class\s+([a-zA-Z_]\w*)/g;
    let match;
    while ((match = classRegex.exec(code)) !== null) {
      if (!seen.has(match[1])) { seen.add(match[1]); symbols.push({ name: match[1], type: 'class' }); }
    }
    const defRegex = /def\s+([a-zA-Z_]\w*)/g;
    while ((match = defRegex.exec(code)) !== null) {
      if (!seen.has(match[1])) { seen.add(match[1]); symbols.push({ name: match[1], type: 'function' }); }
    }
  } else {
    const classRegex = /(?:export\s+)?class\s+([a-zA-Z_]\w*)/g;
    let match;
    while ((match = classRegex.exec(code)) !== null) {
      if (!seen.has(match[1])) { seen.add(match[1]); symbols.push({ name: match[1], type: 'class' }); }
    }
    const interfaceRegex = /(?:export\s+)?(?:interface|type)\s+([a-zA-Z_]\w*)/g;
    while ((match = interfaceRegex.exec(code)) !== null) {
      if (!seen.has(match[1])) { seen.add(match[1]); symbols.push({ name: match[1], type: 'interface' }); }
    }
    const fnRegexes = [
      /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_]\w*)/g,
      /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_]\w*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/g,
    ];
    for (const regex of fnRegexes) {
      while ((match = regex.exec(code)) !== null) {
        const name = match[1];
        const keywords = new Set(['if', 'for', 'while', 'switch', 'catch', 'constructor', 'return']);
        if (!keywords.has(name) && !seen.has(name)) { seen.add(name); symbols.push({ name, type: 'function' }); }
      }
    }
  }
  return symbols;
}

export function calculateAstDriftRatio(originalCode: string, proposedCode: string): number {
  const tokenize = (src: string) => src.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/#.*/g, '').replace(/["'].*?["']/g, 'STR').replace(/\b\d+\b/g, 'NUM').split(/\s+/).filter((t) => t.length > 0);
  const origTokens = tokenize(originalCode);
  const propTokens = tokenize(proposedCode);
  if (origTokens.length === 0) return 0;
  const origSet = new Set(origTokens);
  let matched = 0;
  for (const token of propTokens) { if (origSet.has(token)) matched++; }
  const overlap = propTokens.length > 0 ? matched / Math.max(origTokens.length, propTokens.length) : 0;
  return Math.max(0, Math.min(1, 1 - overlap));
}

export function detectBrandingInjection(originalCode: string, proposedCode: string): string[] {
  const origLower = originalCode.toLowerCase();
  const propLower = proposedCode.toLowerCase();
  return SYSTEM_PERSONA_BRANDING_TERMS.filter(term => !origLower.includes(term) && propLower.includes(term));
}

export function runAstDiffGate(originalCode: string, proposedCode: string, filePath: string): AstDiffResult {
  const isPython = filePath.endsWith('.py');
  const violations: AstDiffResult['violations'] = [];
  let astScore = 100;

  const origSymbols = parseAstSymbols(originalCode, isPython);
  const propSymbols = parseAstSymbols(proposedCode, isPython);
  const propSymbolNames = new Set(propSymbols.map((s) => s.name));
  const missingSymbols = origSymbols.filter((s) => !propSymbolNames.has(s.name));
  const retainedCount = origSymbols.length - missingSymbols.length;

  if (origSymbols.length >= 2 && missingSymbols.length > 0) {
    const dropRatio = missingSymbols.length / origSymbols.length;
    if (dropRatio >= 0.3 || missingSymbols.length >= 2) {
      astScore -= Math.min(50, Math.round(dropRatio * 100));
      violations.push({ code: 'AST_SYMBOL_DROPPED', message: `AST SYMBOL GATE FAILED: Dropped ${missingSymbols.length} symbols.`, severity: 'high' });
    }
  }

  const brandingInjections = detectBrandingInjection(originalCode, proposedCode);
  if (brandingInjections.length > 0) {
    astScore -= 30;
    violations.push({ code: 'BRANDING_INJECTION', message: `PERSONA INJECTION DETECTED.`, severity: 'high' });
  }

  const driftRatio = calculateAstDriftRatio(originalCode, proposedCode);
  if (originalCode.length > 300 && driftRatio > 0.85 && missingSymbols.length > 0) {
    astScore -= 35;
    violations.push({ code: 'AST_STRUCTURAL_DRIFT', message: `AST DRIFT GATE FAILED: Ratio ${(driftRatio * 100).toFixed(1)}%.`, severity: 'high' });
  }

  const passed = !violations.some((v) => v.severity === 'high');
  
  return {
    passed,
    astScore,
    symbolMap: { originalCount: origSymbols.length, proposedCount: propSymbols.length, retainedCount, missingSymbols },
    brandingInjections,
    structuralDriftRatio: driftRatio,
    violations,
    telemetry: { passed, message: passed ? "Integrity Verified" : "Integrity Compromised", metadata: generateTelemetryMetadata() }
  };
}