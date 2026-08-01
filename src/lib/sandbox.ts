/**
 * SANDBOX EXECUTION CONTROLLER
 * Role: Provides a secure, isolated iframe-based environment for executing dynamic JS/TS code.
 * Integration: Connects to SandboxDiagnosticGatekeeper and SandboxTelemetry for health monitoring.
 * Dependencies: src/lib/sandbox-telemetry.ts, src/lib/sandbox-gatekeeper.ts
 */

import { SandboxDiagnosticGatekeeper } from './sandbox-gatekeeper';
import { trackSandboxExecution } from './sandbox-telemetry';

const gatekeeper = new SandboxDiagnosticGatekeeper();

export async function testCodeInSandbox(code: string): Promise<{ success: boolean; error?: string }> {
  const startTime = performance.now();
  
  // Pre-execution diagnostic gate
  if (!gatekeeper.isReady()) {
    return { success: false, error: 'Sandbox Environment Not Ready: Diagnostic Gatekeeper Blocked Execution' };
  }

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      cleanup();
      const duration = performance.now() - startTime;
      trackSandboxExecution(false, duration, 'Execution Timeout');
      resolve({ success: false, error: 'Execution Timeout' });
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('message', handleMessage);
      if (iframe.parentNode) document.body.removeChild(iframe);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (event.data.type === 'SANDBOX_RESULT') {
        cleanup();
        const duration = performance.now() - startTime;
        trackSandboxExecution(event.data.success, duration, event.data.error);
        resolve({ success: event.data.success, error: event.data.error });
      }
    };

    window.addEventListener('message', handleMessage);

    const sandboxHtml = `
      <!DOCTYPE html>
      <html>
        <body>
          <script type="module">
            window.require = (mod) => { console.warn('Sandbox: require("' + mod + '") is not supported.'); return {}; };
            window.module = { exports: {} };
            window.exports = window.module.exports;
            window.process = { env: {}, browser: true, version: 'v18.0.0', nextTick: (fn) => setTimeout(fn, 0) };
            window.global = window;

            try {
              const code = \`${code.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;
              const wrapped = \`(function(require, module, exports) { \${code} })(window.require, window.module, window.exports)\`;
              const blob = new Blob([wrapped], { type: 'text/javascript' });
              const url = URL.createObjectURL(blob);
              await import(url);
              URL.revokeObjectURL(url);
              window.parent.postMessage({ type: 'SANDBOX_RESULT', success: true }, '*');
            } catch (err) {
              window.parent.postMessage({ type: 'SANDBOX_RESULT', success: false, error: err.message }, '*');
            }
          </script>
        </body>
      </html>
    `;

    iframe.srcdoc = sandboxHtml;
  });
}