/**
 * ARCHITECTURAL EXTRACTION ENGINE ROUTE
 * Role: Provides diagnostic-aware text extraction for various document formats.
 * Integration: Utilizes ExtractionEngine for processing and DiagnosticGatekeeper for system integrity.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ExtractionEngine } from '@/lib/extraction-engine';
import { DiagnosticGatekeeper } from '@/lib/diagnostic-gatekeeper';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const gatekeeper = new DiagnosticGatekeeper();
  
  try {
    // Validate system integrity before processing
    const health = await gatekeeper.verifySystemIntegrity();
    if (!health.is_healthy) {
      return NextResponse.json({ error: 'System integrity check failed', details: health }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided', success: false }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const engine = new ExtractionEngine();
    
    const result = await engine.process(buffer, file.type, file.name);

    return NextResponse.json({
      text: result.text,
      success: result.success,
      telemetry: result.telemetry
    });

  } catch (error: any) {
    console.error('[ExtractionRoute] Fatal error:', error);
    return NextResponse.json({ 
      error: error.message || 'Extraction failed', 
      success: false 
    }, { status: 500 });
  }
}