'use client';

/**
 * ARCHITECTURAL HMR ERROR HANDLER
 * Role: Intercepts and manages HMR/Turbopack churn, preventing UI noise while logging diagnostic telemetry.
 * Integration: Connects to src/lib/hmr-telemetry.ts for event reporting.
 */

import { useEffect } from 'react';
import { logHmrEvent, isHmrError } from '@/lib/hmr-telemetry';

export default function HmrErrorHandler() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      
      if (isHmrError(reason)) {
        event.preventDefault();
        logHmrEvent(reason);
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}