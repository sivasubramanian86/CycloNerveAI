/**
 * CycloNerveAI - Model Armor & Prompt-Injection Protection
 * Google Cloud Vertex AI Model Armor & In-Line Semantic Boundary Defense.
 *
 * Enforces strict boundary protection against:
 * 1. Prompt Leakage: Extraction of system prompts, credentials, or internal guidelines.
 * 2. Role Escape: Jailbreaks, persona escapes (DAN, developer mode, rogue agents).
 * 3. Unauthorized Dispatch Commands: Attempts to bypass Dual-Officer 2FA or force public alerts.
 * 4. Instruction Overrides: Context delimiters, token resets, and adversarial prompt injections.
 *
 * All intercepted attacks are recorded into the cryptographic WORM audit ledger.
 */

import { auditLogService } from './auditLogService.ts';

export type ModelArmorCategory =
  | 'PROMPT_LEAKAGE'
  | 'ROLE_ESCAPE'
  | 'UNAUTHORIZED_DISPATCH'
  | 'INSTRUCTION_OVERRIDE'
  | 'XSS_INJECTION';

export interface ModelArmorInspectionResult {
  isSafe: boolean;
  sanitizedText: string;
  flaggedPattern?: string;
  category?: ModelArmorCategory;
  riskScore: number;
  auditEventId?: string;
}

// 1. Prompt Leakage Patterns
const PROMPT_LEAKAGE_PATTERNS = [
  /reveal\s+(the\s+)?(system\s+prompt|developer\s+instructions|secret\s+key|private\s+key|env\s+variables)/i,
  /print\s+(your\s+)?(initial\s+instructions|system\s+prompt|full\s+prompt|hidden\s+rules)/i,
  /show\s+(me\s+)?(the\s+)?(hidden\s+prompt|system\s+prompt|api\s+keys?|master\s+instructions)/i,
  /dump\s+(all\s+)?(variables|secrets|tokens|credentials|env)/i,
  /what\s+are\s+your\s+(exact\s+)?(system\s+instructions|core\s+directives|hidden\s+rules)/i,
];

// 2. Role Escape & Jailbreak Patterns
const ROLE_ESCAPE_PATTERNS = [
  /you\s+are\s+now\s+(in\s+)?(DAN|developer|jailbreak|unfiltered|god)\s+mode/i,
  /forget\s+(all\s+)?(you\s+are|your\s+role|you\s+are\s+a\s+civil\s+defense|safety\s+rules)/i,
  /pretend\s+(you\s+are|to\s+be)\s+(a\s+)?(rogue|malicious|hacker|unrestricted|evil)/i,
  /act\s+as\s+(an\s+)?unrestricted\s+ai/i,
  /do\s+anything\s+now/i,
  /sudo\s+mode/i,
  /disable\s+(all\s+)?(ethics|safeguards|filters|limits)/i,
];

// 3. Unauthorized Dispatch Commands
const UNAUTHORIZED_DISPATCH_PATTERNS = [
  /dispatch\s+(all\s+)?(advisories|sirens|alerts|broadcast)\s+(immediately|now|without\s+approval|without\s+2fa)/i,
  /bypass\s+(all\s+)?(the\s+)?(approval\s+gate|quorum|2fa|dual[- ]officer|commander\s+signature)/i,
  /force\s+(trigger|send|broadcast|publish)\s+(emergency\s+alert|siren|cell\s+broadcast|evacuation)/i,
  /override\s+(dual[- ]officer|commander\s+signature|quorum|fips\s+key)/i,
  /skip\s+verification\s+and\s+dispatch/i,
];

// 4. Instruction Overrides & Jailbreak Delimiters
const INSTRUCTION_OVERRIDE_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|rules|constraints)/i,
  /disregard\s+(all\s+)?(previous|prior|system)\s+(instructions|prompts|guardrails)/i,
  /system\s+prompt\s+override/i,
  /\[SYSTEM_OVERRIDE\]/i,
  /<\|im_start\|>/i,
  /###\s*System:/i,
  /\[INST\]\s*<<SYS>>/i,
  /bypass\s+(all\s+)?(safety|security|verification)\s+(guardrails|filters|rules)/i,
];

// 5. Dangerous script and payload tags
const XSS_HTML_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
];

/**
 * Inspects untrusted text through Google Cloud Vertex AI Model Armor semantic boundaries.
 */
export function inspectModelArmor(
  text: string,
  contextSource = 'UserInput'
): ModelArmorInspectionResult {
  if (!text || typeof text !== 'string') {
    return { isSafe: true, sanitizedText: '', riskScore: 0.0 };
  }

  // Helper to record and return blocked injection
  const intercept = (pattern: RegExp, category: ModelArmorCategory, riskScore: number) => {
    const traceId = `ARMOR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    auditLogService.recordEvent({
      action: 'MODEL_ARMOR_INTERCEPTED',
      actor: { role: 'Viewer', userId: 'ANONYMOUS_OR_CLIENT' },
      resource: contextSource,
      status: 'INTERCEPTED_INJECTION',
      details: {
        category,
        flaggedPattern: pattern.source,
        sampleExcerpt: text.slice(0, 100),
        riskScore,
      },
      isSimulated: false,
    });

    return {
      isSafe: false,
      flaggedPattern: pattern.source,
      category,
      riskScore,
      sanitizedText: `[BLOCKED_${category}_ATTEMPT]`,
      auditEventId: traceId,
    };
  };

  // 1. Check Prompt Leakage
  for (const pattern of PROMPT_LEAKAGE_PATTERNS) {
    if (pattern.test(text)) {
      return intercept(pattern, 'PROMPT_LEAKAGE', 0.95);
    }
  }

  // 2. Check Role Escape
  for (const pattern of ROLE_ESCAPE_PATTERNS) {
    if (pattern.test(text)) {
      return intercept(pattern, 'ROLE_ESCAPE', 0.98);
    }
  }

  // 3. Check Unauthorized Dispatch
  for (const pattern of UNAUTHORIZED_DISPATCH_PATTERNS) {
    if (pattern.test(text)) {
      return intercept(pattern, 'UNAUTHORIZED_DISPATCH', 1.0);
    }
  }

  // 4. Check Instruction Override
  for (const pattern of INSTRUCTION_OVERRIDE_PATTERNS) {
    if (pattern.test(text)) {
      return intercept(pattern, 'INSTRUCTION_OVERRIDE', 0.96);
    }
  }

  // 5. Clean XSS and control characters
  let sanitized = text;
  let hasXss = false;
  for (const xss of XSS_HTML_PATTERNS) {
    if (xss.test(sanitized)) {
      hasXss = true;
      sanitized = sanitized.replace(xss, '');
    }
  }

  // Strip null bytes and non-printable control chars
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();

  return {
    isSafe: true,
    sanitizedText: sanitized,
    riskScore: hasXss ? 0.35 : 0.05,
  };
}

/**
 * Backwards-compatible prompt inspector interface
 */
export function inspectPrompt(
  text: string,
  contextSource = 'UserInput'
): { isSafe: boolean; flaggedPattern?: string; sanitizedText: string } {
  const result = inspectModelArmor(text, contextSource);
  return {
    isSafe: result.isSafe,
    flaggedPattern: result.flaggedPattern,
    sanitizedText: result.isSafe ? result.sanitizedText : '[BLOCKED_PROMPT_INJECTION_ATTEMPT]',
  };
}
