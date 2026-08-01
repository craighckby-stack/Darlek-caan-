/**
 * ARCHITECTURAL INTERCEPTOR: NOT_FOUND
 * Role: Diagnostic-aware 404 handler. Provides system telemetry and recovery path.
 * Integration: Connects to diagnostic-telemetry.ts for real-time system health reporting.
 */

import { DiagnosticTelemetry } from '@/components/DiagnosticTelemetry';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="border border-red-900/50 bg-black/80 p-8 max-w-2xl w-full rounded-lg shadow-[0_0_30px_-10px_rgba(255,0,0,0.3)]">
        <div className="mb-8">
          <h2 className="text-red-500 text-2xl font-bold tracking-widest mb-2">404 - COGNITIVE INTERCEPT</h2>
          <p className="text-gray-400">The requested matrix coordinates could not be found within the containment grid.</p>
        </div>

        <DiagnosticTelemetry />

        <div className="mt-8 pt-6 border-t border-red-900/30">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 transition-colors text-white font-bold rounded-sm text-sm tracking-wider"
          >
            RETURN TO OMEGA DOCK
          </a>
        </div>
      </div>
    </div>
  );
}