/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/MutationStatusIndicator.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

export const MutationStatusIndicator = ({ status }: { status: 'pending' | 'evolving' | 'stable' }) => (
  <div className="flex items-center gap-1 px-2 py-1 rounded bg-black border border-white/10">
    <div className={`w-2 h-2 rounded-full ${status === 'evolving' ? 'animate-pulse bg-cyan-500' : 'bg-green-500'}`} />
    <span className="text-[8px] uppercase tracking-widest text-white">{status}</span>
  </div>
);