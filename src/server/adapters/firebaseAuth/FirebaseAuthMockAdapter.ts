/**
 * CycloNerveAI - Firebase Authentication Mock Adapter
 * Simulates Firebase Auth & Statutory Dual-Officer 2FA Authorization Desk
 * for local development and high-security test suites.
 */

import {
  AuthVerificationResponse,
  DualOfficerAuthResponse,
  HealthCheckResult,
  IFirebaseAuthAdapter,
  OfficerCredentials,
} from '../types.ts';
import { UserRole } from '../../../shared/types/index.ts';
import { buildAndValidateProvenance } from '../../validation/provenanceValidator.ts';

interface MockUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  fipsKeyId: string;
  jurisdiction: string;
}

const KNOWN_MOCK_USERS: Record<string, MockUserProfile> = {
  'mock-commander-token': {
    uid: 'usr-commander-001',
    email: 'arvind.rao@odisha.gov.in',
    displayName: 'Dr. Arvind Rao, IAS',
    role: 'Incident Commander',
    fipsKeyId: 'FIPS-IC-9482',
    jurisdiction: 'Bhadrak & Coastal Northern Odisha',
  },
  'mock-analyst-token': {
    uid: 'usr-analyst-002',
    email: 'pooja.mohanty@osdma.gov.in',
    displayName: 'Pooja Mohanty',
    role: 'Analyst',
    fipsKeyId: 'FIPS-AN-4412',
    jurisdiction: 'State Emergency Operations Center (SEOC)',
  },
  'mock-field-token': {
    uid: 'usr-field-003',
    email: 'rajesh.behera@odisha.gov.in',
    displayName: 'Rajesh Behera',
    role: 'Field Officer',
    fipsKeyId: 'FIPS-FO-1189',
    jurisdiction: 'Basudevpur Field Division',
  },
  'mock-viewer-token': {
    uid: 'usr-viewer-004',
    email: 'public.observer@odisha.gov.in',
    displayName: 'Civil Defense Observer',
    role: 'Viewer',
    fipsKeyId: 'FIPS-VW-0000',
    jurisdiction: 'Statewide',
  },
  'mock-admin-token': {
    uid: 'usr-admin-005',
    email: 'sysadmin@seoc.gov.in',
    displayName: 'SEOC IT Infrastructure Lead',
    role: 'Administrator',
    fipsKeyId: 'FIPS-AD-9999',
    jurisdiction: 'State Data Center Infrastructure',
  },
};

export class FirebaseAuthMockAdapter implements IFirebaseAuthAdapter {
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const provenance = buildAndValidateProvenance({
      source: 'Firebase Auth (Local Emulator / Mock)',
      sourceType: 'auth_service_mock',
      classification: 'simulated',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      adapterName: 'Firebase Authentication',
      status: 'HEALTHY',
      mode: 'mock',
      latencyMs: Date.now() - startTime + 1,
      lastChecked: new Date().toISOString(),
      message: 'Firebase Auth Mock Adapter operational. Dual-Officer 2FA verification engine active.',
      provenance,
      details: {
        activeMockIdentities: Object.keys(KNOWN_MOCK_USERS).length,
        supportedRoles: ['Viewer', 'Analyst', 'Field Officer', 'Incident Commander', 'Administrator'],
        fipsCompliance: 'FIPS 140-2 Level 3 Hardware Token Simulation',
      },
    };
  }

  async verifySessionToken(token: string): Promise<AuthVerificationResponse> {
    const trimmed = (token || '').trim();
    // Allow either exact match or Bearer prefix
    const rawToken = trimmed.startsWith('Bearer ') ? trimmed.slice(7).trim() : trimmed;

    const user = KNOWN_MOCK_USERS[rawToken];
    if (!user) {
      // If token not in known list but non-empty, check if it's formatted as custom mock
      if (rawToken.startsWith('mock-')) {
        const provenance = buildAndValidateProvenance({
          source: 'Firebase Auth (Mock Token Validator)',
          sourceType: 'token_evaluator',
          classification: 'simulated',
          isSimulated: true,
        });

        return {
          provenance,
          isValid: true,
          uid: `usr-${rawToken}`,
          email: `${rawToken}@odisha.gov.in`,
          displayName: `Authorized Officer (${rawToken})`,
          role: 'Analyst',
          fipsKeyId: 'FIPS-MOCK-DEFAULT',
          jurisdiction: 'Statewide',
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        };
      }

      return {
        provenance: buildAndValidateProvenance({
          source: 'Firebase Auth (Mock Token Validator)',
          sourceType: 'token_evaluator',
          classification: 'simulated',
          isSimulated: true,
        }),
        isValid: false,
        errorMessage: 'Invalid session token: token not recognized by mock security authority.',
      };
    }

    const provenance = buildAndValidateProvenance({
      source: 'Firebase Auth (Mock Token Authority)',
      sourceType: 'token_evaluator',
      classification: 'simulated',
      isSimulated: true,
      confidence: 0.999,
    });

    return {
      provenance,
      isValid: true,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      fipsKeyId: user.fipsKeyId,
      jurisdiction: user.jurisdiction,
      expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    };
  }

  async verifyDualOfficer2FA(
    firstOfficer: OfficerCredentials,
    secondOfficer: OfficerCredentials,
    actionDigest: string
  ): Promise<DualOfficerAuthResponse> {
    const provenance = buildAndValidateProvenance({
      source: 'Statutory Dual-Officer 2FA Desk (Mock FIPS Engine)',
      sourceType: 'dual_officer_fips',
      classification: 'simulated',
      isSimulated: true,
      confidence: 1.0,
    });

    // Statutory Check 1: Officers must not be the exact same person
    if (firstOfficer.tokenKeyId === secondOfficer.tokenKeyId) {
      return {
        provenance,
        isAuthorized: false,
        statutoryRolePair: `${firstOfficer.role} + ${secondOfficer.role}`,
        authorizationDigest: '',
        errorMessage: 'Statutory violation: Two distinct physical hardware tokens are strictly required. Cannot use duplicate key.',
      };
    }

    // Statutory Check 2: At least one officer must be Incident Commander or Administrator
    const isLeadershipPresent =
      firstOfficer.role === 'Incident Commander' ||
      firstOfficer.role === 'Administrator' ||
      secondOfficer.role === 'Incident Commander' ||
      secondOfficer.role === 'Administrator';

    if (!isLeadershipPresent) {
      return {
        provenance,
        isAuthorized: false,
        statutoryRolePair: `${firstOfficer.role} + ${secondOfficer.role}`,
        authorizationDigest: '',
        errorMessage: 'Statutory violation: Dual-officer mandate requires at least one Incident Commander or Statutory Administrator.',
      };
    }

    // Statutory Check 3: PIN validation (simulating 4+ digit PIN requirement)
    if (!firstOfficer.pin || firstOfficer.pin.length < 4 || !secondOfficer.pin || secondOfficer.pin.length < 4) {
      return {
        provenance,
        isAuthorized: false,
        statutoryRolePair: `${firstOfficer.role} + ${secondOfficer.role}`,
        authorizationDigest: '',
        errorMessage: 'Cryptographic PIN verification failed: PINs must be at least 4 digits.',
      };
    }

    const digest = `2FA-AUTH-SIG:${firstOfficer.tokenKeyId.slice(0, 8)}:${secondOfficer.tokenKeyId.slice(0, 8)}:${actionDigest.slice(0, 16)}`;

    return {
      provenance,
      isAuthorized: true,
      authorizedAt: new Date().toISOString(),
      firstOfficerName: firstOfficer.officerName,
      secondOfficerName: secondOfficer.officerName,
      statutoryRolePair: `${firstOfficer.role} + ${secondOfficer.role}`,
      authorizationDigest: digest,
    };
  }
}
