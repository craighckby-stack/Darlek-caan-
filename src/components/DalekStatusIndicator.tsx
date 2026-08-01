/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/DalekStatusIndicator.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

export const DalekStatusIndicator = ({ status }: { status: string }) => (
  <div className={`text-[10px] uppercase tracking-widest ${status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
    {status === 'connected' ? '● SECURE' : '○ OFFLINE'}
  </div>
);