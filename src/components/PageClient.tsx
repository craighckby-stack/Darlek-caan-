/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/PageClient.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use client';

/**
 * PageClient.tsx
 * Role: Diagnostic-Aware entry point for the application.
 * Integrates the Diagnostic Boundary to ensure system health monitoring 
 * begins before the primary application UI (MainPage) is mounted.
 */

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { initializeDiagnosticBoundary } from '@/lib/diagnostic-boundary';

const MainPage = dynamic(() => import('@/components/MainPage'), { 
  ssr: false,
  loading: () => <div className="diagnostic-loading">Initializing System Kernel...</div>
});

export default function PageClient() {
  useEffect(() => {
    // Initialize the diagnostic gatekeeper and telemetry context on mount
    const cleanup = initializeDiagnosticBoundary();
    return () => cleanup();
  }, []);

  return (
    <main className="diagnostic-container">
      <MainPage />
    </main>
  );
}