/**
 * ARCHITECTURAL STYLE ORCHESTRATOR
 * Role: Manages UI theme mutations with integrated diagnostic telemetry.
 * Integration: Connects to system diagnostic pipeline to ensure style integrity.
 * Dependencies: fs, diagnostic-types.ts
 */

import fs from 'fs';
import { performDiagnosticCheck } from './src/lib/diagnostic-engine-utils';

const TARGET_FILE = 'src/App.tsx';

/**
 * Executes style mutations with diagnostic validation.
 */
function applyStyleMutations(): void {
  try {
    if (!fs.existsSync(TARGET_FILE)) {
      throw new Error(`Target file ${TARGET_FILE} not found.`);
    }

    let data = fs.readFileSync(TARGET_FILE, 'utf8');

    // Transformation Map
    const mutations = [
      [/font-scifi/g, 'font-display'],
      [/bg-zinc-900\/50/g, 'bg-white/[0.04] backdrop-blur-3xl shadow-xl'],
      [/bg-zinc-900\/80/g, 'bg-white/[0.06] backdrop-blur-3xl shadow-xl'],
      [/border-zinc-800\/80/g, 'border-white/[0.06]'],
      [/border-zinc-800\/40/g, 'border-white/[0.04]'],
      [/bg-black\/60/g, 'bg-black/[0.4] backdrop-blur-xl border border-white/[0.05] shadow-2xl'],
      [/bg-zinc-900/g, 'bg-white/[0.06]'],
      [/border-zinc-800/g, 'border-white/[0.06]'],
      [/bg-zinc-800/g, 'bg-white/[0.09]'],
      [/text-zinc-500/g, 'text-white/40'],
      [/text-zinc-400/g, 'text-white/60'],
      [/text-zinc-300/g, 'text-white/80'],
      [/text-zinc-200/g, 'text-white'],
      [/bg-zinc-950/g, 'bg-black/50'],
      [/text-green-500/g, 'text-emerald-400'],
      [/from-rose-500/g, 'from-rose-500/60'],
      [/to-orange-500/g, 'to-orange-500/60']
    ];

    mutations.forEach(([pattern, replacement]) => {
      data = data.replace(pattern, replacement as string);
    });

    fs.writeFileSync(TARGET_FILE, data);
    
    // Post-mutation diagnostic check
    performDiagnosticCheck('style_mutation_integrity');
    
  } catch (error) {
    console.error('[DIAGNOSTIC] Style mutation failed:', error);
    process.exit(1);
  }
}

applyStyleMutations();