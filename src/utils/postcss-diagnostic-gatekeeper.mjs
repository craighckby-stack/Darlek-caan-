/**
 * POSTCSS DIAGNOSTIC GATEKEEPER
 * Role: Validates PostCSS configuration objects against system requirements.
 * Integration: Used by postcss.config.mjs to ensure build-time stability.
 */

export function validatePostCSSConfig(config) {
  try {
    if (!config || typeof config !== 'object') return false;
    if (!Array.isArray(config.plugins)) return false;
    
    // Verify required plugins exist
    const hasTailwind = config.plugins.includes('@tailwindcss/postcss');
    
    const report = {
      timestamp: new Date().toISOString(),
      status: hasTailwind ? 'HEALTHY' : 'DEGRADED',
      checks: {
        tailwind_plugin_present: hasTailwind
      }
    };

    if (!hasTailwind) {
      console.warn("[DIAGNOSTIC] PostCSS: Tailwind plugin missing from configuration.");
    }

    return hasTailwind;
  } catch (e) {
    console.error("[DIAGNOSTIC] PostCSS Validation Error:", e);
    return false;
  }
}