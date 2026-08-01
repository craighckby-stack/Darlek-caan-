/**
 * ARCHITECTURAL DATABASE CONTROLLER
 * Role: Provides a diagnostic-aware Prisma interface with automatic self-healing.
 * Integration: Connects to system-wide diagnostic registry and telemetry utilities.
 * Dependencies: src/lib/db-telemetry.ts
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { recordDatabaseDiagnostic, generateDbTelemetry } from './db-telemetry'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaDir = path.join(process.cwd(), 'prisma')
const dbPath = path.join(prismaDir, 'dev.db')

function cleanupWalFiles() {
  try {
    const walPath = path.join(prismaDir, 'dev.db-wal');
    const shmPath = path.join(prismaDir, 'dev.db-shm');
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  } catch (err) {}
}

let prismaInstance: PrismaClient | null = null;
let isHealing = false;
let isDbChecked = false;

function getPrismaInstance(): PrismaClient {
  if (!isDbChecked) {
    isDbChecked = true;
    if (!fs.existsSync(dbPath)) performSelfHealing();
  }

  if (prismaInstance) return prismaInstance;

  if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
    return prismaInstance;
  }

  const sqliteUrl = `file:${dbPath}?connection_limit=1&socket_timeout=15`;
  prismaInstance = new PrismaClient({
    datasources: { db: { url: sqliteUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaInstance;

  return prismaInstance;
}

export function performSelfHealing() {
  if (isHealing) return;
  isHealing = true;
  try {
    if (prismaInstance) {
      const staleInstance = prismaInstance;
      prismaInstance = null;
      if (globalForPrisma.prisma) globalForPrisma.prisma = undefined;
      staleInstance.$disconnect().catch(() => {});
    }

    if (fs.existsSync(dbPath)) try { fs.unlinkSync(dbPath); } catch (e) {}
    cleanupWalFiles();
    
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    recordDatabaseDiagnostic('HEALING_SUCCESS', { timestamp: Date.now() });
  } catch (healErr) {
    recordDatabaseDiagnostic('HEALING_FAILURE', { error: String(healErr) });
  } finally {
    isHealing = false;
  }
}

function createCallableProxy(prop: string | symbol): any {
  const dummy = () => {};
  return new Proxy(dummy, {
    apply(_, __, args) {
      const execute = async (attempt = 1): Promise<any> => {
        const activePrisma = getPrismaInstance();
        const method = (activePrisma as any)[prop];
        try {
          return await method.apply(activePrisma, args);
        } catch (err: any) {
          if (String(err?.message).toLowerCase().includes('corrupt')) {
            recordDatabaseDiagnostic('CORRUPTION_DETECTED', generateDbTelemetry(err));
            performSelfHealing();
            if (attempt < 2) return execute(attempt + 1);
          }
          throw err;
        }
      };
      return execute();
    },
    get(_, subProp) {
      if (subProp === 'then' || subProp === 'toJSON' || typeof subProp === 'symbol') return undefined;
      return function (...args: any[]) {
        const execute = async (attempt = 1): Promise<any> => {
          const activePrisma = getPrismaInstance();
          const model = (activePrisma as any)[prop];
          const method = model[subProp];
          try {
            return await method.apply(model, args);
          } catch (err: any) {
            if (String(err?.message).toLowerCase().includes('corrupt')) {
              recordDatabaseDiagnostic('CORRUPTION_DETECTED', generateDbTelemetry(err));
              performSelfHealing();
              if (attempt < 2) return execute(attempt + 1);
            }
            throw err;
          }
        };
        return execute();
      };
    }
  });
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (prop === 'then' || prop === 'toJSON' || typeof prop === 'symbol') return undefined;
    return createCallableProxy(prop);
  }
});