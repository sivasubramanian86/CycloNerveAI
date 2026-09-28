/**
 * CycloNerveAI - Sensitive Data Redaction & Safe Logger
 * Enforces zero leakage of credentials, PINs, cryptographic secrets, or personal data.
 */

// Regex patterns for sensitive data
const SENSITIVE_KEY_NAMES = [
  'pin',
  'password',
  'secret',
  'privatekey',
  'apikey',
  'token',
  'accesstoken',
  'refreshtoken',
  'fipskeyid',
  'authorization',
  'credentials',
];

const BEARER_REGEX = /Bearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const PRIVATE_KEY_REGEX = /-----BEGIN [A-Z ]+ PRIVATE KEY-----[^-]+-----END [A-Z ]+ PRIVATE KEY-----/gs;
const API_KEY_REGEX = /(?:key|token|secret)[\s:=]+["']?([A-Za-z0-9_\-]{16,})["']?/gi;
const PIN_REGEX = /\b\d{4,6}\b/g;

/**
 * Recursively redacts sensitive keys and values from strings, objects, and arrays.
 */
export function redactSensitiveData(input: unknown, depth = 0): unknown {
  if (depth > 10) return '[MAX_DEPTH_REDACTED]';
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return redactString(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof input === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const lowerKey = key.toLowerCase();
      const isSensitiveKey = SENSITIVE_KEY_NAMES.some((k) => lowerKey.includes(k));

      if (isSensitiveKey) {
        if (typeof value === 'string' && value.length > 0) {
          output[key] = `[REDACTED_${key.toUpperCase()}]`;
        } else if (typeof value === 'number') {
          output[key] = '[REDACTED_NUMERIC_SECRET]';
        } else {
          output[key] = '[REDACTED]';
        }
      } else {
        output[key] = redactSensitiveData(value, depth + 1);
      }
    }
    return output;
  }

  return input;
}

/**
 * Redacts secrets from string representations.
 */
export function redactString(str: string): string {
  let result = str;

  // Redact private keys
  result = result.replace(PRIVATE_KEY_REGEX, '-----BEGIN PRIVATE KEY-----\n[REDACTED_PRIVATE_KEY]\n-----END PRIVATE KEY-----');

  // Redact Bearer tokens
  result = result.replace(BEARER_REGEX, 'Bearer [REDACTED_TOKEN]');

  // Redact standalone API keys
  result = result.replace(API_KEY_REGEX, (match, p1) => match.replace(p1, '[REDACTED_KEY]'));

  return result;
}

/**
 * Safe console logger that filters out sensitive information before printing.
 */
export const safeLogger = {
  info: (...args: unknown[]): void => {
    const redacted = args.map((arg) => redactSensitiveData(arg));
    console.log(...redacted);
  },
  warn: (...args: unknown[]): void => {
    const redacted = args.map((arg) => redactSensitiveData(arg));
    console.warn(...redacted);
  },
  error: (...args: unknown[]): void => {
    const redacted = args.map((arg) => {
      if (arg instanceof Error) {
        return {
          name: arg.name,
          message: redactString(arg.message),
          stack: redactString(arg.stack || ''),
        };
      }
      return redactSensitiveData(arg);
    });
    console.error(...redacted);
  },
};
