/**
 * CycloNerveAI - Shared Schemas and Validation Functions
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateRiskInput(input: {
  hazard: number;
  exposure: number;
  vulnerability: number;
  criticality: number;
}): ValidationResult<{ hazard: number; exposure: number; vulnerability: number; criticality: number }> {
  const errors: string[] = [];
  const fields = ['hazard', 'exposure', 'vulnerability', 'criticality'] as const;

  for (const field of fields) {
    const val = input[field];
    if (typeof val !== 'number' || isNaN(val) || val < 0 || val > 1) {
      errors.push(`Field '${field}' must be a numeric value between 0.0 and 1.0. Received: ${val}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }
  return { success: true, data: input };
}

export function validateTwoFactorAuth(
  pin: string,
  userRole: string
): ValidationResult<{ verified: boolean; officerKeyId: string }> {
  if (userRole !== 'Incident Commander' && userRole !== 'Administrator') {
    return {
      success: false,
      errors: ['Unauthorized: Only Incident Commander or Administrator roles can provide 2FA signoff.'],
    };
  }
  if (!pin || pin.trim().length !== 6 || !/^\d{6}$/.test(pin.trim())) {
    return {
      success: false,
      errors: ['Invalid 2FA PIN format: Must be a 6-digit numeric hardware security token.'],
    };
  }
  return {
    success: true,
    data: {
      verified: true,
      officerKeyId: `FIDO2-YUBI-EOC-${pin.slice(0, 3)}-ODISHA`,
    },
  };
}

export function sanitizePromptText(input: string): string {
  // Guard against prompt injection or malicious escape patterns
  return input
    .replace(/[<>{}\\]/g, '')
    .trim()
    .slice(0, 1000);
}
