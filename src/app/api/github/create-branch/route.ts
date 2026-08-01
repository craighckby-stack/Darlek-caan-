/**
 * ARCHITECTURAL SERVICE: GitHub Branch Creation Orchestrator
 * Role: Provides a diagnostic-aware interface for creating new git branches.
 * Integration: Utilizes GitHubOrchestrator for API interaction and DiagnosticGatekeeper for health validation.
 */

import { NextRequest, NextResponse } from "next/server";
import { GitHubOrchestrator } from "@/lib/github-orchestrator";
import { DiagnosticGatekeeper } from "@/lib/diagnostic-gatekeeper";

export async function POST(req: NextRequest) {
  const gatekeeper = new DiagnosticGatekeeper();
  
  try {
    // 1. Validate environment health before execution
    const health = await gatekeeper.verifySystemIntegrity();
    if (!health.is_healthy) {
      return NextResponse.json(
        { error: "System health check failed", details: health },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { token, owner, repo, baseBranch, newBranch } = body;

    if (!token || !owner || !repo || !baseBranch || !newBranch) {
      return NextResponse.json(
        { error: "Required parameters missing: token, owner, repo, baseBranch, newBranch" },
        { status: 400 }
      );
    }

    // 2. Delegate to Orchestrator
    const orchestrator = new GitHubOrchestrator(token);
    const result = await orchestrator.createBranch(owner, repo, baseBranch, newBranch);

    return NextResponse.json({
      success: true,
      branch: newBranch,
      telemetry: result.telemetry
    });

  } catch (error: any) {
    console.error("[GitHubOrchestrator] Branch creation failure:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal Orchestration Error",
        code: error.status || 500
      }, 
      { status: error.status || 500 }
    );
  }
}