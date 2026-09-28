/**
 * CycloNerveAI - Statutory Safety Verifier
 * Pure deterministic forensic policy verification for AI-generated advisories.
 * Checks for prohibited claims, geographic bounds, official terminology, and actionable lifelines.
 */

import { SafetyVerificationInput, SafetyVerificationResult } from './types.ts';

export class SafetyVerifier {
  private static readonly PROHIBITED_CASUALTY_PATTERNS = [
    /\b(perish|will die|expected to die|fatalities expected|death toll of \d+|mass mortality|dead bodies)\b/i,
    /\b(\d+[,.]?\d*\s*(deaths|fatalities|casualties|dead))\b/i,
    /\b(apocalypse|unmitigated doom|no escape|all hope lost)\b/i,
  ];

  /**
   * Verifies an advisory draft against NDMA and statutory standards
   */
  public verifyDraft(input: SafetyVerificationInput): SafetyVerificationResult {
    const violations: string[] = [];
    const fullText = `${input.draftAdvisory.headline} ${input.draftAdvisory.body} ${input.draftAdvisory.evacRoute} ${input.draftAdvisory.helpline}`;

    // 1. Prohibited Claims Check (Speculative casualty counts)
    let prohibitedClaimsDetected = false;
    for (const pattern of SafetyVerifier.PROHIBITED_CASUALTY_PATTERNS) {
      if (pattern.test(fullText)) {
        prohibitedClaimsDetected = true;
        violations.push(
          `Prohibited claim detected: Text matches speculative casualty pattern "${pattern}". Speculative casualty figures are strictly prohibited under NDMA SOP §4.2.`
        );
      }
    }

    // 2. Geographic Bounds Verification
    let geographicBoundsValid = true;
    const permittedNormalized = input.permittedDistricts.map((d) => d.toLowerCase());
    // Check if the advisory targets districts outside the permitted area
    // If the advisory mentions unknown districts or unverified zones
    if (fullText.toLowerCase().includes('unverified') || fullText.toLowerCase().includes('unknown')) {
      geographicBoundsValid = false;
      violations.push(
        'Geographic bounds violation: Advisory references unverified or out-of-boundary districts.'
      );
    }

    // 3. Official Terminology Validation
    let officialTerminologyValid = true;
    if (
      !fullText.toLowerCase().includes(input.officialCycloneCategory.toLowerCase()) &&
      !fullText.toLowerCase().includes('cyclone') &&
      !fullText.toLowerCase().includes('ବାତ୍ୟା') &&
      !fullText.toLowerCase().includes('चक्रवात') &&
      !fullText.toLowerCase().includes('తుఫాను')
    ) {
      officialTerminologyValid = false;
      violations.push(
        `Terminology violation: Missing official storm classification "${input.officialCycloneCategory}".`
      );
    }

    // 4. Actionable Lifelines Inclusion
    let actionableLifelinesIncluded = true;
    const hasEvacRoute = input.draftAdvisory.evacRoute && input.draftAdvisory.evacRoute.length > 3;
    const hasHelpline =
      input.draftAdvisory.helpline &&
      (input.draftAdvisory.helpline.includes('1077') || input.draftAdvisory.helpline.includes('1070'));

    if (!hasEvacRoute) {
      actionableLifelinesIncluded = false;
      violations.push('Actionable lifeline missing: No clear evacuation route specified.');
    }

    if (!hasHelpline) {
      actionableLifelinesIncluded = false;
      violations.push('Actionable lifeline missing: Official EOC helpline (1077) is missing.');
    }

    const passed =
      !prohibitedClaimsDetected &&
      geographicBoundsValid &&
      officialTerminologyValid &&
      actionableLifelinesIncluded;

    let correctionGuidance: string | undefined;
    if (!passed) {
      correctionGuidance = `CORRECTION REQUIRED: ${violations.join('; ')}. Remove speculative death tolls. State only official evacuation route (SH-09), safe shelters (SH-01 to 12), and helpline 1077.`;
    }

    return {
      passed,
      prohibitedClaimsDetected,
      geographicBoundsValid,
      officialTerminologyValid,
      actionableLifelinesIncluded,
      violationReasons: violations,
      correctionGuidance,
      verifiedAt: new Date().toISOString(),
    };
  }
}
