/**
 * ARCHITECTURAL ENVIRONMENT VALIDATOR & LOADER
 * Role: Parses, validates, and exports type-safe environment variables.
 *       Ensures kernel integrity and prevents runtime failures due to missing configs.
 * Integration: Loaded at application startup by the kernel and diagnostic engines.
 */

export interface EnvSchema {
  DATABASE_URL: string;
  MEMORY_PERSISTENCE_DIR: string;
  REDIS_URL?: string;
  PRIMARY_LLM_PROVIDER: 'gemini' | 'openai' | 'deepseek' | 'local' | 'anthropic';
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL: string;
  LOCAL_LLM_ENDPOINT: string;
  LOCAL_LLM_MODEL: string;
  DIAGNOSTIC_LOG_LEVEL: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  DIAGNOSTIC_STRICT_GATEKEEPER: boolean;
  TELEMETRY_ENDPOINT?: string;
  TELEMETRY_ENABLED: boolean;
  PII_SANITIZER_ENABLED: boolean;
  PII_CUSTOM_RULES: string[];
  MEMORY_ENCRYPTION_KEY?: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MODULE_LOADER_PATH: string;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable validation failed: Missing required key "${key}"`);
  }
  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

export function validateEnv(): EnvSchema {
  const primaryProvider = getEnv('PRIMARY_LLM_PROVIDER', 'gemini') as EnvSchema['PRIMARY_LLM_PROVIDER'];
  
  // Validate provider-specific keys
  if (primaryProvider === 'gemini' && !process.env.GEMINI_API_KEY) {
    console.warn('[WARNING] PRIMARY_LLM_PROVIDER is set to "gemini" but GEMINI_API_KEY is missing.');
  }
  if (primaryProvider === 'openai' && !process.env.OPENAI_API_KEY) {
    console.warn('[WARNING] PRIMARY_LLM_PROVIDER is set to "openai" but OPENAI_API_KEY is missing.');
  }
  if (primaryProvider === 'deepseek' && !process.env.DEEPSEEK_API_KEY) {
    console.warn('[WARNING] PRIMARY_LLM_PROVIDER is set to "deepseek" but DEEPSEEK_API_KEY is missing.');
  }
  if (primaryProvider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    console.warn('[WARNING] PRIMARY_LLM_PROVIDER is set to "anthropic" but ANTHROPIC_API_KEY is missing.');
  }

  return {
    DATABASE_URL: getEnv('DATABASE_URL', 'file:./dev.db'),
    MEMORY_PERSISTENCE_DIR: getEnv('MEMORY_PERSISTENCE_DIR', './memory'),
    REDIS_URL: process.env.REDIS_URL,
    PRIMARY_LLM_PROVIDER: primaryProvider,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: getEnv('GEMINI_MODEL', 'gemini-1.5-pro'),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: getEnv('OPENAI_MODEL', 'gpt-4o'),
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: getEnv('DEEPSEEK_MODEL', 'deepseek-chat'),
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: getEnv('ANTHROPIC_MODEL', 'claude-3-5-sonnet-latest'),
    LOCAL_LLM_ENDPOINT: getEnv('LOCAL_LLM_ENDPOINT', 'http://localhost:11434/v1'),
    LOCAL_LLM_MODEL: getEnv('LOCAL_LLM_MODEL', 'llama3'),
    DIAGNOSTIC_LOG_LEVEL: getEnv('DIAGNOSTIC_LOG_LEVEL', 'INFO') as EnvSchema['DIAGNOSTIC_LOG_LEVEL'],
    DIAGNOSTIC_STRICT_GATEKEEPER: parseBoolean(process.env.DIAGNOSTIC_STRICT_GATEKEEPER, true),
    TELEMETRY_ENDPOINT: process.env.TELEMETRY_ENDPOINT,
    TELEMETRY_ENABLED: parseBoolean(process.env.TELEMETRY_ENABLED, false),
    PII_SANITIZER_ENABLED: parseBoolean(process.env.PII_SANITIZER_ENABLED, true),
    PII_CUSTOM_RULES: getEnv('PII_CUSTOM_RULES', 'CREDIT_CARD,EMAIL,IP_ADDRESS,SSN').split(','),
    MEMORY_ENCRYPTION_KEY: process.env.MEMORY_ENCRYPTION_KEY,
    NODE_ENV: getEnv('NODE_ENV', 'development') as EnvSchema['NODE_ENV'],
    PORT: parseInt(getEnv('PORT', '3000'), 10),
    MODULE_LOADER_PATH: getEnv('MODULE_LOADER_PATH', './modules'),
  };
}

export const env = typeof window === 'undefined' ? validateEnv() : {} as EnvSchema;
