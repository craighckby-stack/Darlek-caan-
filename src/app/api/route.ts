/**
 * ARCHITECTURAL SYSTEM ENTRY POINT: API ROOT
 * Role: Serves as the primary heartbeat and diagnostic gateway for the system.
 * Integration: Connects to the DiagnosticEngine to validate kernel integrity before responding.
 * 
 * This file acts as the root API endpoint, ensuring that any request to the system 
 * is preceded by a health check of the underlying infrastructure.
 */

import { NextResponse } from "next/server";
import { runSystemDiagnostics } from "@/lib/diagnostic-engine";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Perform system-wide integrity check before responding
    const diagnosticReport = await runSystemDiagnostics();

    const responsePayload = {
      message: "System Kernel Operational",
      timestamp: new Date().toISOString(),
      health: diagnosticReport.status,
      diagnostics: diagnosticReport
    };

    return NextResponse.json(responsePayload, {
      status: diagnosticReport.status === 'HEALTHY' ? 200 : 503
    });
  } catch (error) {
    return NextResponse.json(
      { 
        message: "System Kernel Error", 
        error: error instanceof Error ? error.message : "Unknown failure" 
      }, 
      { status: 500 }
    );
  }
}