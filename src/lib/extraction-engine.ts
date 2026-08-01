import mammoth from 'mammoth';
import { performance } from 'perf_hooks';

export class ExtractionEngine {
  async process(buffer: Buffer, mimeType: string, fileName: string) {
    const start = performance.now();
    let text = '';
    let success = true;

    try {
      const lowerName = fileName.toLowerCase();
      if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
        text = await this.extractPdf(buffer);
      } else if (mimeType.includes('wordprocessingml') || lowerName.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else {
        text = buffer.toString('utf-8');
      }
    } catch (e) {
      success = false;
      text = '';
    }

    return {
      text,
      success,
      telemetry: { durationMs: performance.now() - start }
    };
  }

  private async extractPdf(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const data = await pdfParse(buffer);
      return data.text;
    } catch {
      const raw = buffer.toString('binary');
      const matches = raw.match(/[\x20-\x7E\t\r\n]{4,}/g);
      return matches ? matches.filter(l => !l.includes('%PDF')).join('\n') : '';
    }
  }
}