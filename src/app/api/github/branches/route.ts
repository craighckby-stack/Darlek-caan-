/**
 * ARCHITECTURAL SYSTEM: GitHub Branch Orchestration Service
 * Role: Fetches repository branch data with integrated diagnostic telemetry.
 * Integration: Connects to GitHubOrchestrator for API communication and DiagnosticGatekeeper for health validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GitHubOrchestrator } from '@/lib/github-orchestrator';
import { DiagnosticGatekeeper } from '@/lib/diagnostic-gatekeeper';

export async function POST(req: NextRequest) {
  const gatekeeper = new DiagnosticGatekeeper();
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { token, owner, repo } = body;

    if (!token || !owner || !repo) {
      return NextResponse.json({ error: 'token, owner, and repo are required' }, { status: 400 });
    }

    // Validate system health before external interaction
    if (!gatekeeper.isSystemHealthy()) {
      return NextResponse.json({ error: 'System health check failed' }, { status: 503 });
    }

    const orchestrator = new GitHubOrchestrator(token);
    const branches = await orchestrator.fetchBranches(owner, repo);

    return NextResponse.json({
      success: true,
      branches,
      telemetry: {
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('[GitHubBranchRoute] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal Server Error', 
        telemetry: { duration_ms: Date.now() - startTime }
      }, 
      { status: error.status || 500 }
    );
  }
}