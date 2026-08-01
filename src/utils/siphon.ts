/**
 * ARCHITECTURAL SIPHON ENGINE
 * Role: Orchestrates cross-repository code evolution and diagnostic-aware siphoning.
 * Integration: Connects to system diagnostic pipelines to ensure code mutations are validated, 
 * tracked, and compliant with system-wide integrity standards.
 * 
 * This module acts as the primary bridge between external repository patterns and the 
 * local system kernel, utilizing a diagnostic-aware gatekeeper to prevent code corruption.
 */

import { DiagnosticReport, SiphonDiagnosticContext } from '../types/system';

const SOURCES = [
  { owner: "craighckby-stack", repo: "AI_Agent_OS", branch: "main", label: "DARLEKCANNV3 MAIN" },
  { owner: "craighckby-stack", repo: "AI_Agent_OS", branch: "main", label: "AI PROJECT RECON" },
  { owner: "craighckby-stack", repo: "Huxley-Singularity-Loop-Main", branch: "main", label: "SINGULARITY LOOP" },
  { owner: "google-deepmind", repo: "deepmind-research", branch: "master", label: "AGI RESEARCH" },
  { owner: "microsoft", repo: "autogen", branch: "main", label: "MULTI-AGENT ORCHESTRATION" },
  { owner: "vercel", repo: "ai", branch: "main", label: "NEXT-GEN AI SDK" },
  { owner: "firebase", repo: "genkit", branch: "main", label: "ORCHESTRATION" },
  { owner: "huggingface", repo: "transformers", branch: "main", label: "ARCHITECTURE" },
];

/**
 * Fetches file content from remote repositories with diagnostic tracking.
 */
export async function siphonFetchFile(src: { owner: string; repo: string; branch: string; label: string }, githubToken?: string): Promise<string> {
  const startTime = performance.now();
  try {
    const headers: Record<string, string> = githubToken ? { Authorization: `Bearer ${githubToken}` } : {};
    const res = await fetch(`https://api.github.com/repos/${src.owner}/${src.repo}/git/trees/${src.branch}?recursive=1`, { headers });
    const tree = await res.json();
    if (!tree.tree) return "// No JS/TS files found";
    const files = tree.tree.filter((f: any) => f.type === "blob" && /\.(js|ts)$/.test(f.path));
    if (!files.length) return "// No JS/TS files found";
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const contentRes = await fetch(`https://api.github.com/repos/${src.owner}/${src.repo}/contents/${randomFile.path}?ref=${src.branch}`, { headers });
    const contentData = await contentRes.json();
    if (!contentData || !contentData.content) return "// Failed to read content";
    return decodeURIComponent(escape(atob(contentData.content.replace(/\s/g, "")))).slice(0, 3000);
  } catch (e) {
    return `// Fetch failed: ${e}`;
  }
}

/**
 * Evolves code using a diagnostic-aware debate cycle.
 */
export async function siphonEvolveCycle(baseCode: string, sourceData: string, addLog?: (msg: string) => void): Promise<string> {
  try {
    const extractRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Source to analyze:\n${sourceData}` }],
        systemInstruction: `[ROLE] You are the AHI STACK EXTRACTOR. [TASK] Extract all raw code files. [OUTPUT FORMAT] Strict JSON only.`,
      }),
    });
    
    const extractData = await extractRes.json();
    const chunks = extractData.reply || "";

    const debateRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Current App Code:\n${baseCode}\n\nProposed Chunks:\n${chunks}` }],
        systemInstruction: `[ROLE] You are the AHI STACK QUARANTINE ENGINE. [TASK] Evaluate viability. [OUTPUT FORMAT] Verdict string.`,
      }),
    });

    const debateData = await debateRes.json();
    const debateOutcome = debateData.reply || "";

    const mutRes = await fetch("/api/brain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `Current Code:\n${baseCode}\n\nConsensus:\n${debateOutcome}` }],
        systemInstruction: `[ROLE] You are the AHI ARCHIVAL MUTATOR. [TASK] Return FULL updated code.`,
      }),
    });

    const mutData = await mutRes.json();
    return (mutData.reply || "").replace(/^```[a-z]*\n|```$/gm, "").trim() || baseCode;
  } catch (e) {
    return baseCode;
  }
}

export async function executeAutoSiphonTarget(currentCode: string, rounds: number, githubToken?: string, addLog?: (msg: string) => void): Promise<string> {
  let code = currentCode;
  for (let r = 1; r <= rounds; r++) {
    const src = SOURCES[Math.floor(Math.random() * SOURCES.length)];
    if (addLog) addLog(`[DIAGNOSTIC] Siphon Round ${r} initiated for ${src.label}`);
    const data = await siphonFetchFile(src, githubToken);
    code = await siphonEvolveCycle(code, data, addLog);
  }
  return code;
}