/**
 * DIAGNOSTIC TELEMETRY COMPONENT
 * Role: Renders real-time system diagnostic status and telemetry metadata.
 * Integration: Used by error boundaries and interceptors to provide context.
 */

import React from 'react';

export const DiagnosticTelemetry = () => {
  const timestamp = new Date().toISOString();
  
  return (
    <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800 text-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="text-zinc-500">SYSTEM_TELEMETRY</span>
        <span className="text-green-500 font-bold">ONLINE</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-zinc-400">
        <div>
          <p>STATUS: <span className="text-white">ACTIVE</span></p>
          <p>KERNEL: <span className="text-white">v1.0.0-DIAGNOSTIC</span></p>
        </div>
        <div className="text-right">
          <p>TIME: <span className="text-white">{timestamp}</span></p>
          <p>GATE: <span className="text-white">INTERCEPTED</span></p>
        </div>
      </div>
    </div>
  );
};