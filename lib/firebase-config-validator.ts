/**
 * FIREBASE CONFIG VALIDATOR
 * Role: Validates the integrity of the Firebase configuration object.
 * Integration: Called by firebase-applet-config.json during initialization.
 */

export interface ValidationResult {
  passed: boolean;
  message: string;
}

export function validateFirebaseConfig(config: any): ValidationResult {
  const requiredKeys = ['projectId', 'apiKey', 'appId'];
  
  for (const key of requiredKeys) {
    if (!config[key] || config[key].trim() === '') {
      return {
        passed: false,
        message: `Missing or empty required configuration key: ${key}`
      };
    }
  }

  // Check for potential API key leakage or malformation
  if (config.apiKey.length < 20) {
    return { passed: false, message: "API Key appears malformed or truncated." };
  }

  return { passed: true, message: "Configuration integrity verified." };
}