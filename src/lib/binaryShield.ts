/**
 * BINARY SHIELD: CRYPTOGRAPHIC CONTROLLER
 * Role: Secure data encryption/decryption with integrated diagnostic telemetry.
 * Connects to: src/lib/shield-telemetry.ts for health monitoring and event logging.
 */

import { ShieldTelemetry, ShieldDiagnosticResult } from './shield-telemetry';

interface EncryptionPacket {
  data: string;
  iv: string;
  timestamp: number;
  algorithm: string;
}

interface DecryptionPacket {
  data: string;
  iv: string;
}

export class BinaryShield {
  private key: CryptoKey | null = null;
  private isInitializing = false;
  private telemetry: ShieldTelemetry;

  constructor(private keyHex: string) {
    if (typeof keyHex !== 'string' || keyHex.length !== 64) {
      throw new Error('Master Key must be a 64-character hex string.');
    }
    this.telemetry = new ShieldTelemetry();
  }

  private hexToBuffer(hex: string): ArrayBuffer {
    if (hex.length % 2 !== 0) throw new Error('Invalid hex string length.');
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))).buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))));
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    return new Uint8Array(Array.from(binaryString).map(char => char.charCodeAt(0))).buffer;
  }

  async initialize(): Promise<void> {
    if (this.key) return;
    
    if (this.isInitializing) {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.key) { clearInterval(checkInterval); resolve(); }
        }, 10);
      });
      return;
    }

    this.isInitializing = true;
    try {
      const keyBuffer = this.hexToBuffer(this.keyHex);
      this.key = await crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
      this.telemetry.logEvent('INITIALIZATION_SUCCESS');
    } catch (e) {
      this.telemetry.logEvent('INITIALIZATION_FAILURE', { error: String(e) });
      throw new Error(`Encryption initialization failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      this.isInitializing = false;
    }
  }

  async encryptPacket(plaintext: string): Promise<EncryptionPacket> {
    await this.initialize();
    const start = performance.now();
    try {
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(plaintext);
      const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, this.key!, encoded);
      
      this.telemetry.recordMetric('ENCRYPT_LATENCY', performance.now() - start);
      return {
        data: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(nonce),
        timestamp: Math.floor(Date.now() / 1000),
        algorithm: 'AES-256-GCM'
      };
    } catch (e) {
      this.telemetry.logEvent('ENCRYPTION_FAILURE', { error: String(e) });
      throw e;
    }
  }

  async decryptPacket(packet: DecryptionPacket): Promise<string> {
    await this.initialize();
    const start = performance.now();
    try {
      const nonce = this.base64ToArrayBuffer(packet.iv);
      const ciphertext = this.base64ToArrayBuffer(packet.data);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, this.key!, ciphertext);
      
      this.telemetry.recordMetric('DECRYPT_LATENCY', performance.now() - start);
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      this.telemetry.logEvent('DECRYPTION_FAILURE', { error: String(e) });
      throw new Error(`Decryption failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }

  async clear(): Promise<void> {
    this.key = null;
    this.telemetry.logEvent('SHIELD_CLEARED');
  }
}