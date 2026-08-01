/**
 * ARCHITECTURAL GLOBAL ERROR BOUNDARY
 * Role: Primary system-wide error handler. Captures unhandled exceptions, 
 * provides diagnostic telemetry, and facilitates system recovery.
 * Integration: Connected to DiagnosticEngine for telemetry and system health reporting.
 */

'use client';

import { useEffect } from 'react';
import { captureDiagnosticError } from '@/lib/diagnostic-telemetry';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to diagnostic engine for telemetry persistence
    captureDiagnosticError(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-950 text-white font-sans">
        <div className="max-w-md p-8 border border-red-900/50 bg-gray-900 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">System Critical Failure</h2>
          <p className="text-gray-400 mb-6">
            The kernel has encountered an unhandled exception. Diagnostic telemetry has been recorded.
          </p>
          <div className="bg-black p-4 rounded border border-gray-800 font-mono text-xs text-red-400 mb-6 overflow-x-auto">
            {error.message || 'Unknown kernel exception'}
            {error.digest && <div className="mt-2 text-gray-600">Digest: {error.digest}</div>}
          </div>
          <button 
            onClick={() => reset()}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 transition-colors rounded font-semibold"
          >
            Initiate System Reset
          </button>
        </div>
      </body>
    </html>
  );
}