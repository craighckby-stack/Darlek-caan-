/**
 * DIAGNOSTIC THEME UTILITIES
 * Role: Bridges system health state to CSS variables for reactive UI styling.
 */

export const updateSystemTheme = (isHealthy: boolean) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--sys-health-status', isHealthy ? 'var(--color-diag-healthy)' : 'var(--color-diag-critical)');
};

export const getDiagnosticStatusClass = (isHealthy: boolean) => {
  return isHealthy ? 'text-diag-healthy' : 'text-diag-critical diag-pulse';
};