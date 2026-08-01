/**
 * ARCHITECTURAL ENTRY POINT: src/main.tsx
 * Role: System-wide diagnostic-aware bootstrap sequence.
 * Integration: Validates system integrity via OmegaDiagnosticGatekeeper before mounting the React root.
 * Dependencies: src/lib/omega-bootstrap.ts, src/lib/types.ts
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeSystemDiagnostics } from './lib/omega-bootstrap';

async function bootstrapApplication() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  try {
    // Perform diagnostic gatekeeping before mounting
    const diagnosticReport = await initializeSystemDiagnostics();
    
    if (diagnosticReport.status === 'CRITICAL_FAILURE') {
      console.error('[BOOTSTRAP] System integrity check failed. Halting mount.', diagnosticReport);
      rootElement.innerHTML = '<div style="padding: 20px; color: red;">System Integrity Failure. Check console for details.</div>';
      return;
    }

    // Proceed with mount if healthy
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    console.error('[BOOTSTRAP] Fatal error during system initialization:', err);
  }
}

bootstrapApplication();