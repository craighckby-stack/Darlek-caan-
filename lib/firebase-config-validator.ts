/**
 * FIREBASE CONFIGURATION VALIDATOR
 * Role: Logic for validating Firebase configuration objects and generating telemetry.
 * Siphoned from AI_Agent_OS diagnostic patterns.
 */

export interface ValidationResult {
  passed: boolean;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Validates the structure and content of a Firebase configuration object.
 * @param config The configuration object to validate.
 * @returns A ValidationResult indicating success or failure.
 */
export function validateFirebaseConfig(config: any): ValidationResult {
  const requiredFields = [
    'projectId',
    'appId',
    'apiKey',
    'authDomain',
    'storageBucket',
    'messagingSenderId'
  ];

  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    return {
      passed: false,
      message: `Missing required configuration fields: ${missingFields.join(', ')}`,
      metadata: { missingFields, timestamp: new Date().toISOString() }
    };
  }

  // Check for common placeholder patterns
  if (config.apiKey.startsWith('AIza') && config.apiKey.length < 20) {
    return {
      passed: false,
      message: "API Key appears to be truncated or malformed.",
      metadata: { field: 'apiKey', length: config.apiKey.length }
    };
  }

  return {
    passed: true,
    message: "Firebase configuration integrity verified.",
    metadata: {
      timestamp: new Date().toISOString(),
      version: "1.0.0-CONFIG-AWARE"
    }
  };
}