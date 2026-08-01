/**
 * ARCHITECTURAL ERROR BOUNDARY: Diagnostic-Aware System Controller
 * Role: Intercepts runtime exceptions, logs diagnostic telemetry, and provides
 * a recovery interface for the application kernel.
 * 
 * Integration: Connects to the global diagnostic registry to report state degradation.
 */

'use client';

import { useEffect } from 'react';
import { ErrorTelemetry } from '@/lib/diagnostic-telemetry';

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void; 
}) {
  useEffect(() => {
    // Siphoned telemetry reporting pattern
    ErrorTelemetry.log({
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL'
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-950 text-zinc-100 font-mono">
      <div className="max-w-md w-full border border-zinc-800 p-6 rounded-lg bg-zinc-900 shadow-2xl">
        <h2 className="text-red-500 text-lg font-bold mb-4">[KERNEL_EXCEPTION_DETECTED]</h2>
        <p className="text-sm text-zinc-400 mb-6">
          The system has encountered an unrecoverable state. Diagnostic telemetry has been captured.
        </p>
        <div className="bg-black p-4 rounded border border-zinc-800 mb-6 overflow-auto">
          <code className="text-xs text-red-400">
            {error.message || 'Unknown system failure'}
          </code>
        </div>
        <button
          onClick={() => reset()}
          className="w-full px-4 py-2 bg-zinc-100 text-zinc-900 font-bold rounded hover:bg-white transition-colors"
        >
          REINITIALIZE_KERNEL
        </button>
      </div>
    </div>
  );
}