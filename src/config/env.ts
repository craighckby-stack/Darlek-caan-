/**
 * ==============================================================================
 * ARCHITECTURAL SYSTEM ENVIRONMENT VALIDATOR
 * File: src/config/env.ts
 * Role: Parses, sanitizes, and validates runtime environment variables to ensure
 *       absolute type safety and system integrity before kernel execution.
 * Connections: Imported by the system kernel entry point and diagnostic engines.
 * ==============================================================================
 */

export interface EnvironmentConfig {
  DATABASE_URL: string;
  MEMORY_PERSISTENCE_DIR: string;
  REDIS_URL?: string;
  VECTOR_DB_PROVIDER: 'chroma' | 'pinecone' | 'qdrant' | 'in-memory';
  VECTOR_DB_ENDPOINT?: string;
  VECTOR_DB_API_KEY?: string;
  GRAPHRAG_INDEX_PATH?: string;
  PRIMARY_LLM_PROVIDER: 'gemini' | 'openai' | 'deepseek' | 'local' | 'anthropic';
  LLM_FALLBACK_CHAIN: string[];
  CONSENSUS_VOTING_ENABLED: boolean;
  CONSENSUS_THRESHOLD: number;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL: string;
  LOCAL_LLM_ENDPOINT?: string;
  LOCAL_LLM_MODEL: string;
  LLM_TEMPERATURE: number;
  LLM_MAX_TOKENS: number;
  DIAGNOSTIC_LOG_LEVEL: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  DIAGNOSTIC_STRICT_GATEKEEPER: boolean;
  DIAGNOSTIC_CHECK_INTERVAL_MS: number;
  TELEMETRY_ENDPOINT?: string;
  TELEMETRY_ENABLED: boolean;
  PII_SANITIZER_ENABLED: boolean;
  PII_CUSTOM_RULES: string[];
  MEMORY_ENCRYPTION_KEY: string;
  SANDBOX_ENABLED: boolean;
  SANDBOX_TIMEOUT_MS: number;
  SANDBOX_MEMORY_LIMIT_MB: number;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  MODULE_LOADER_PATH: string;
  MAX_CONCURRENT_TASKS: number;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseCommaSeparated(value: string | undefined, defaultValues: string[]): string[] {
  if (!value) return defaultValues;
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

export function validateEnv(): EnvironmentConfig {
  const errors: string[] = [];

  const config: EnvironmentConfig = {
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
    MEMORY_PERSISTENCE_DIR: process.env.MEMORY_PERSISTENCE_DIR || './memory',
    REDIS_URL: process.env.REDIS_URL,
    VECTOR_DB_PROVIDER: (process.env.VECTOR_DB_PROVIDER || 'in-memory') as any,
    VECTOR_DB_ENDPOINT: process.env.VECTOR_DB_ENDPOINT,
    VECTOR_DB_API_KEY: process.env.VECTOR_DB_API_KEY,
    GRAPHRAG_INDEX_PATH: process.env.GRAPHRAG_INDEX_PATH,
    PRIMARY_LLM_PROVIDER: (process.env.PRIMARY_LLM_PROVIDER || 'gemini') as any,
    LLM_FALLBACK_CHAIN: parseCommaSeparated(process.env.LLM_FALLBACK_CHAIN, ['gemini', 'openai', 'deepseek', 'anthropic', 'local']),
    CONSENSUS_VOTING_ENABLED: parseBoolean(process.env.CONSENSUS_VOTING_ENABLED, false),
    CONSENSUS_THRESHOLD: parseNumber(process.env.CONSENSUS_THRESHOLD, 0.7),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
    LOCAL_LLM_ENDPOINT: process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434/v1',
    LOCAL_LLM_MODEL: process.env.LOCAL_LLM_MODEL || 'llama3',
    LLM_TEMPERATURE: parseNumber(process.env.LLM_TEMPERATURE, 0.7),
    LLM_MAX_TOKENS: parseNumber(process.env.LLM_MAX_TOKENS, 4096),
    DIAGNOSTIC_LOG_LEVEL: (process.env.DIAGNOSTIC_LOG_LEVEL || 'INFO') as any,
    DIAGNOSTIC_STRICT_GATEKEEPER: parseBoolean(process.env.DIAGNOSTIC_STRICT_GATEKEEPER, true),
    DIAGNOSTIC_CHECK_INTERVAL_MS: parseNumber(process.env.DIAGNOSTIC_CHECK_INTERVAL_MS, 60000),
    TELEMETRY_ENDPOINT: process.env.TELEMETRY_ENDPOINT,
    TELEMETRY_ENABLED: parseBoolean(process.env.TELEMETRY_ENABLED, false),
    PII_SANITIZER_ENABLED: parseBoolean(process.env.PII_SANITIZER_ENABLED, true),
    PII_CUSTOM_RULES: parseCommaSeparated(process.env.PII_CUSTOM_RULES, ['CREDIT_CARD', 'EMAIL', 'IP_ADDRESS', 'SSN']),
    MEMORY_ENCRYPTION_KEY: process.env.MEMORY_ENCRYPTION_KEY || '',
    SANDBOX_ENABLED: parseBoolean(process.env.SANDBOX_ENABLED, true),
    SANDBOX_TIMEOUT_MS: parseNumber(process.env.SANDBOX_TIMEOUT_MS, 5000),
    SANDBOX_MEMORY_LIMIT_MB: parseNumber(process.env.SANDBOX_MEMORY_LIMIT_MB, 128),
    NODE_ENV: (process.env.NODE_ENV || 'development') as any,
    PORT: parseNumber(process.env.PORT, 3000),
    HOST: process.env.HOST || '127.0.0.1',
    MODULE_LOADER_PATH: process.env.MODULE_LOADER_PATH || './modules',
    MAX_CONCURRENT_TASKS: parseNumber(process.env.MAX_CONCURRENT_TASKS, 10),
  };

  // Validate critical constraints
  if (config.PRIMARY_LLM_PROVIDER === 'gemini' && !config.GEMINI_API_KEY) {
    errors.push('GEMINI_API_KEY is required when PRIMARY_LLM_PROVIDER is set to "gemini"');
  }
  if (config.PRIMARY_LLM_PROVIDER === 'openai' && !config.OPENAI_API_KEY) {
    errors.push('OPENAI_API_KEY is required when PRIMARY_LLM_PROVIDER is set to "openai"');
  }
  if (config.PRIMARY_LLM_PROVIDER === 'deepseek' && !config.DEEPSEEK_API_KEY) {
    errors.push('DEEPSEEK_API_KEY is required when PRIMARY_LLM_PROVIDER is set to "deepseek"');
  }
  if (config.PRIMARY_LLM_PROVIDER === 'anthropic' && !config.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY is required when PRIMARY_LLM_PROVIDER is set to "anthropic"');
  }
  if (config.PII_SANITIZER_ENABLED && !config.MEMORY_ENCRYPTION_KEY) {
    errors.push('MEMORY_ENCRYPTION_KEY must be defined when PII_SANITIZER_ENABLED is true');
  }
  if (config.MEMORY_ENCRYPTION_KEY && config.MEMORY_ENCRYPTION_KEY.length < 32) {
    errors.push('MEMORY_ENCRYPTION_KEY must be a secure hex string of at least 32 characters');
  }

  if (errors.length > 0) {
    console.error('[ENV VALIDATION ERROR] Invalid environment configuration:');
    errors.forEach(err => console.error(` - ${err}`));
    if (config.DIAGNOSTIC_STRICT_GATEKEEPER) {
      throw new Error('System initialization halted due to strict gatekeeper environment validation failure.');
    }
  }

  return config;
}
