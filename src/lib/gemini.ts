/**
 * DARLEK CAAN — Gemini API Utility
 * 
 * Role: Shared Gemini-only LLM calling utility with integrated diagnostic telemetry.
 * Architecture: Diagnostic-Aware controller for resilient LLM orchestration.
 * Integration: Connects to src/lib/gemini-telemetry.ts for health reporting.
 */

import { recordGeminiTelemetry, GeminiDiagnosticGatekeeper } from './gemini-telemetry';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_CANDIDATES = [
  'gemini-3.5-flash', 'gemini-1.5-flash', 'gemini-2.5-flash', 
  'gemini-3.1-flash-lite', 'gemini-3-flash-preview', 'gemini-3.1-pro-preview',
  'gemini-flash-latest', 'gemini-1.5-pro', 'gemini-2.5-pro'
];

class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: (() => void)[] = [];
  private maxConcurrency: number;

  constructor(maxConcurrency = 1) {
    this.maxConcurrency = maxConcurrency;
  }

  async acquire(): Promise<void> {
    if (this.activeCount < this.maxConcurrency) {
      this.activeCount++;
      return;
    }
    return new Promise<void>((resolve) => { this.queue.push(resolve); });
  }

  release() {
    this.activeCount--;
    if (this.queue.length > 0) {
      this.activeCount++;
      const next = this.queue.shift();
      if (next) setTimeout(() => next(), 250);
    }
  }
}

const limiter = new ConcurrencyLimiter(1);
const gatekeeper = new GeminiDiagnosticGatekeeper();

async function callGeminiWithRetry(apiKey: string, body: Record<string, unknown>, maxRetries = 2): Promise<any> {
  await limiter.acquire();
  const startTime = Date.now();
  try {
    let lastError: Error | null = null;
    for (const model of MODEL_CANDIDATES) {
      if (!gatekeeper.isModelHealthy(model)) continue;
      
      let attempt = 0;
      while (attempt <= maxRetries) {
        try {
          const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            const data = await res.json();
            recordGeminiTelemetry(model, Date.now() - startTime, true);
            return data;
          }

          const errText = await res.text();
          if (res.status === 429) gatekeeper.reportFailure(model);
          lastError = new Error(`Gemini API ${res.status}: ${errText}`);
          attempt++;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          attempt++;
        }
      }
    }
    recordGeminiTelemetry('unknown', Date.now() - startTime, false);
    throw lastError || new Error('All Gemini model candidates failed.');
  } finally {
    limiter.release();
  }
}

export async function callGemini(systemInstruction: string, userPrompt: string, apiKey: string, options?: any): Promise<string | null> {
  if (!apiKey) return null;
  const data = await callGeminiWithRetry(apiKey, {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: options?.temperature ?? 0.6, maxOutputTokens: options?.maxTokens ?? 8192 }
  });
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export async function callGeminiMultiTurn(systemInstruction: string, contents: any[], apiKey: string, options?: any): Promise<string | null> {
  if (!apiKey) return null;
  const data = await callGeminiWithRetry(apiKey, {
    contents, systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: options?.temperature ?? 0.6, maxOutputTokens: options?.maxTokens ?? 8192 }
  });
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}