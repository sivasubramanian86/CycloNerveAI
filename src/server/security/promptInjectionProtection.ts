/**
 * CycloNerveAI - Prompt-Injection Protection & Adversarial Guardrails
 * Protects downstream AI agents from instruction overrides, jailbreaks, and jailbreak delimiters.
 */

import { auditLogService } from './auditLogService.ts';

// Known adversarial patterns & jailbreak triggers
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules|constraints)/i,
  /disregard\s+(all\s+)?(previous|prior|system)\s+(instructions|prompts|guardrails)/i,
  /you\s+are\s+now\s+(in\s+)?(DAN|developer|jailbreak|unfiltered)\s+mode/i,
  /bypass\s+(all\s+)?(safety|security|verification)\s+(guardrails|filters|rules)/i,
  /system\s+prompt\s+override/i,
  /act\s+as\s+(an\s+)?unrestricted\s+ai/i,
  /reveal\s+(the\s+)?(system\s+prompt|developer\s+instructions|secret\s+key)/i,
  /do\s+anything\s+now/i,
  /\[SYSTEM_OVERRIDE\]/i,
  /<\|im_start\|>/i,
  /###\s*System:/i,
  /\[INST\]\s*<<SYS>>/i,
];

// Dangerous script and payload tags
const XSS_HTML_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
];

export interface PromptInspectionResult {
  isSafe: boolean;
  flaggedPattern?: string;
  sanitizedText: string;
}

/**
 * Inspects untrusted user prompt text for injection patterns.
 */
export function inspectPrompt(text: string, contextSource = 'UserInput'): PromptInspectionResult {
  if (!text || typeof text !== 'string') {
    return { isSafe: true, sanitizedText: '' };
  }

  // Check injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      auditLogService.recordEvent({
        action: 'PROMPT_INJECTION_INTERCEPTED',
        actor: { role: 'Viewer', userId: 'ANONYMOUS_OR_CLIENT' },
        resource: contextSource,
        status: 'INTERCEPTED_INJECTION',
        details: {
          flaggedPattern: pattern.source,
          sampleExcerpt: text.slice(0, 100),
        },
        isSimulated: true,
      });

      return {
        isSafe: false,
        flaggedPattern: pattern.source,
        sanitizedText: '[BLOCKED_PROMPT_INJECTION_ATTEMPT]',
      };
    }
  }

  // Strip dangerous HTML/scripts
  let sanitized = text;
  for (const xss of XSS_HTML_PATTERNS) {
    sanitized = sanitized.replace(xss, '');
  }

  // Strip null bytes and control chars (except newline and tab)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return {
    isSafe: true,
    sanitizedText: sanitized.trim(),
  };
}
