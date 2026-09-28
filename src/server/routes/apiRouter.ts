/**
 * CycloNerveAI - Hardened Server-Side REST API Router (Phase 5)
 * Protected with RBAC, schema validation, rate limiting, and statutory approval gates.
 */

import { Request, Response, Router } from 'express';
import { adapterRegistry } from '../adapters/AdapterRegistry.ts';
import type { OfficerCredentials } from '../adapters/types.ts';
import type { AuditTraceEvent, MultilingualAdvisoryDraft, UserRole } from '../../shared/types/index.ts';
import { ACTIVE_SCENARIO_META, INITIAL_ADVISORIES } from '../../data/coastalScenarioData.ts';

// Phase 5 Security Imports
import { extractUserContext, requirePermission, requireRole } from '../security/rbac.ts';
import {
  validateAdvisoryApprovalInput,
  validateBoundingBox,
  validateGeoCoordinates,
  validateRequestSanitizationMiddleware,
  validateScenarioUpdate,
} from '../security/schemaValidation.ts';
import {
  authRateLimiter,
  dispatchRateLimiter,
  globalApiLimiter,
  uploadRateLimiter,
} from '../security/rateLimiter.ts';
import { approvalGatekeeper } from '../security/approvalGate.ts';
import { systemControls } from '../security/systemControls.ts';
import { auditLogService } from '../security/auditLogService.ts';
import { validateUploadedBuffer } from '../security/uploadValidation.ts';
import { liveWeatherService } from '../services/liveWeatherService.ts';
import { geminiCompanionService } from '../services/geminiCompanionService.ts';

export const apiRouter = Router();

// Seed initial advisories into the approval gatekeeper
for (const adv of INITIAL_ADVISORIES) {
  approvalGatekeeper.registerAdvisory(adv);
}

// Active scenario state in memory
let currentScenario = { ...ACTIVE_SCENARIO_META };

// -------------------------------------------------------------
// Global Security Middlewares for /api/*
// -------------------------------------------------------------
apiRouter.use(globalApiLimiter.middleware());
apiRouter.use(validateRequestSanitizationMiddleware());

// -------------------------------------------------------------
// 1. Health Check Endpoints
// -------------------------------------------------------------

apiRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const report = await adapterRegistry.checkAllHealth();
    const httpStatus = report.overallStatus === 'UNAVAILABLE' ? 503 : 200;
    res.status(httpStatus).json(report);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to aggregate health checks', message: errMsg });
  }
});

apiRouter.get('/health/:adapter', async (req: Request, res: Response) => {
  const adapterName = req.params.adapter.toLowerCase();
  try {
    let result;
    switch (adapterName) {
      case 'earthengine':
      case 'earth-engine':
        result = await adapterRegistry.earthEngine.healthCheck();
        break;
      case 'bigquery':
        result = await adapterRegistry.bigQuery.healthCheck();
        break;
      case 'auth':
      case 'firebaseauth':
      case 'firebase-auth':
        result = await adapterRegistry.firebaseAuth.healthCheck();
        break;
      case 'firestore':
        result = await adapterRegistry.firestore.healthCheck();
        break;
      case 'storage':
      case 'cloudstorage':
      case 'cloud-storage':
        result = await adapterRegistry.cloudStorage.healthCheck();
        break;
      case 'maps':
      case 'googlemaps':
      case 'google-maps':
        result = await adapterRegistry.googleMaps.healthCheck();
        break;
      case 'dispatch':
      case 'advisorydispatch':
      case 'advisory-dispatch':
        result = await adapterRegistry.advisoryDispatch.healthCheck();
        break;
      default:
        res.status(404).json({ error: `Unknown adapter: ${req.params.adapter}` });
        return;
    }

    const httpStatus = result.status === 'UNAVAILABLE' ? 503 : 200;
    res.status(httpStatus).json(result);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Health check failed', message: errMsg });
  }
});

// -------------------------------------------------------------
// 2. Scenario Management & RBAC Protection
// -------------------------------------------------------------

apiRouter.get('/scenarios/active', (_req: Request, res: Response) => {
  res.json({
    ...currentScenario,
    isSimulated: true,
  });
});

apiRouter.post('/scenarios/change', requirePermission('SCENARIO_CHANGE'), (req: Request, res: Response) => {
  const user = extractUserContext(req);
  const { scenarioId, scenarioName } = req.body || {};

  if (!scenarioId || typeof scenarioId !== 'string' || scenarioId.trim().length === 0) {
    res.status(400).json({
      error: 'scenarioId is mandatory and must be a non-empty string.',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  currentScenario = {
    ...currentScenario,
    id: scenarioId.trim(),
    name: scenarioName || `Scenario ${scenarioId}`,
  };

  auditLogService.recordEvent({
    action: 'SCENARIO_CHANGED',
    actor: { userId: user.userId, role: user.role, tokenKeyId: user.tokenKeyId },
    resource: `/scenarios/${scenarioId}`,
    status: 'SUCCESS',
    details: { newScenarioId: scenarioId, name: currentScenario.name },
    isSimulated: true,
  });

  res.json({
    success: true,
    message: `Scenario successfully switched to '${scenarioId}'.`,
    scenario: currentScenario,
    isSimulated: true,
  });
});

apiRouter.post(
  '/scenarios/update-params',
  requirePermission('SCENARIO_UPDATE_PARAMS'),
  (req: Request, res: Response) => {
    const user = extractUserContext(req);
    const validation = validateScenarioUpdate(req.body);

    if (!validation.isValid) {
      res.status(400).json({
        error: 'Malformed scenario parameters provided.',
        code: 'VALIDATION_ERROR',
        issues: validation.issues,
      });
      return;
    }

    currentScenario = {
      ...currentScenario,
      ...req.body,
    };

    auditLogService.recordEvent({
      action: 'SCENARIO_PARAMETERS_UPDATED',
      actor: { userId: user.userId, role: user.role, tokenKeyId: user.tokenKeyId },
      resource: `/scenarios/${currentScenario.id}`,
      status: 'SUCCESS',
      details: req.body,
      isSimulated: true,
    });

    res.json({
      success: true,
      message: 'Scenario parameters updated successfully.',
      scenario: currentScenario,
      isSimulated: true,
    });
  }
);

// -------------------------------------------------------------
// 3. Early Warning Advisory Approval & Dispatch Gate
// -------------------------------------------------------------

apiRouter.post('/advisories/approve', requirePermission('ADVISORY_APPROVE'), (req: Request, res: Response) => {
  const user = extractUserContext(req);
  const validation = validateAdvisoryApprovalInput(req.body);

  if (!validation.isValid) {
    res.status(400).json({
      error: 'Advisory approval validation failed.',
      code: 'VALIDATION_ERROR',
      issues: validation.issues,
    });
    return;
  }

  const { advisoryCode, evidenceReviewed, evidenceSummaryRef, reviewNotes } = req.body;

  const result = approvalGatekeeper.approveAdvisory({
    advisoryCode,
    officerRole: user.role,
    officerName: user.displayName,
    evidenceReviewed,
    evidenceSummaryRef,
    reviewNotes,
    officerKeyId: user.tokenKeyId,
  });

  if (!result.success) {
    const statusCode = result.code === 'FORBIDDEN_APPROVAL_ROLE' ? 403 : 400;
    res.status(statusCode).json({
      error: result.error,
      code: result.code,
    });
    return;
  }

  res.json({
    success: true,
    message: `Advisory '${advisoryCode}' successfully certified and approved.`,
    approvalRecord: result.record,
    isSimulated: true,
  });
});

apiRouter.post(
  '/advisories/dispatch',
  dispatchRateLimiter.middleware(),
  requirePermission('ADVISORY_DISPATCH'),
  async (req: Request, res: Response) => {
    const user = extractUserContext(req);
    const { advisory, dualAuthToken, emergencyOverride } = req.body as {
      advisory?: MultilingualAdvisoryDraft;
      dualAuthToken?: { primaryOfficer: string; secondaryOfficer: string; tokenDigest: string };
      emergencyOverride?: { statutoryJustification: string; legalActReference?: string };
    };

    if (!advisory || !advisory.advisoryCode) {
      res.status(400).json({
        error: 'advisory object with valid advisoryCode is required.',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    // Verify through the Approval Gatekeeper
    const gateCheck = approvalGatekeeper.verifyDispatchGate({
      advisory,
      dispatcherRole: user.role,
      dispatcherName: user.displayName,
      dualAuthVerified: Boolean(dualAuthToken?.tokenDigest),
      emergencyOverride,
    });

    if (!gateCheck.allowed) {
      const statusCode = gateCheck.code === 'FORBIDDEN_DISPATCH_ROLE' ? 403 : 422;
      res.status(statusCode).json({
        error: gateCheck.error,
        code: gateCheck.code,
        isSimulated: true,
      });
      return;
    }

    // If gate passed, trigger dispatch via simulated dispatch adapter
    const dispatchPayload = dualAuthToken || {
      primaryOfficer: user.displayName,
      secondaryOfficer: 'Automated-Dual-Key-Escrow',
      tokenDigest: emergencyOverride ? 'EMERGENCY_OVERRIDE_STATUTORY_DIGEST' : 'DUAL_KEY_DIGEST',
    };

    const dispatchResult = await adapterRegistry.advisoryDispatch.simulateDispatch(advisory, dispatchPayload);

    res.json({
      success: true,
      message: emergencyOverride
        ? 'Emergency override dispatch completed under statutory powers.'
        : 'Advisory successfully disseminated to authorized broadcast channels.',
      dispatchResult,
      isSimulated: true,
      classification: 'simulated',
    });
  }
);

apiRouter.post(
  '/dispatch/simulate',
  dispatchRateLimiter.middleware(),
  requirePermission('ADVISORY_DISPATCH'),
  async (req: Request, res: Response) => {
    const user = extractUserContext(req);
    const { advisory, dualAuthToken, emergencyOverride } = req.body as {
      advisory: MultilingualAdvisoryDraft;
      dualAuthToken: { primaryOfficer: string; secondaryOfficer: string; tokenDigest: string };
      emergencyOverride?: { statutoryJustification: string };
    };

    if (!advisory || (!dualAuthToken && !emergencyOverride)) {
      res.status(400).json({
        error: 'advisory and dualAuthToken (or emergencyOverride) are required.',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const gateCheck = approvalGatekeeper.verifyDispatchGate({
      advisory,
      dispatcherRole: user.role,
      dispatcherName: user.displayName,
      dualAuthVerified: Boolean(dualAuthToken?.tokenDigest),
      emergencyOverride,
    });

    if (!gateCheck.allowed) {
      res.status(422).json({
        error: gateCheck.error,
        code: gateCheck.code,
        isSimulated: true,
      });
      return;
    }

    const result = await adapterRegistry.advisoryDispatch.simulateDispatch(advisory, dualAuthToken || {
      primaryOfficer: user.displayName,
      secondaryOfficer: 'Override Officer',
      tokenDigest: 'OVERRIDE_TOKEN',
    });

    if (result.error) {
      res.status(502).json(result);
      return;
    }

    res.json({
      ...result,
      isSimulated: true,
      classification: 'simulated',
    });
  }
);

apiRouter.get('/dispatch/channels', async (_req: Request, res: Response) => {
  try {
    const channels = await adapterRegistry.advisoryDispatch.getChannelStatus();
    res.json(channels);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to retrieve channel status', message: errMsg });
  }
});

apiRouter.post('/dispatch/cap-xml', (req: Request, res: Response) => {
  try {
    const advisory = req.body as MultilingualAdvisoryDraft;
    const xml = adapterRegistry.advisoryDispatch.generateCAPXml(advisory);
    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'CAP XML generation failed', message: errMsg });
  }
});

// -------------------------------------------------------------
// 4. File Upload & Binary MIME Validation
// -------------------------------------------------------------

apiRouter.post('/storage/upload-validate', uploadRateLimiter.middleware(), (req: Request, res: Response) => {
  const { filename, fileBase64, claimedMimeType } = req.body || {};

  if (!filename || typeof filename !== 'string' || !fileBase64 || typeof fileBase64 !== 'string') {
    res.status(400).json({
      error: 'filename and fileBase64 string are required.',
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(fileBase64, 'base64');
  } catch {
    res.status(400).json({
      error: 'Invalid base64 payload provided.',
      code: 'INVALID_BASE64',
    });
    return;
  }

  const result = validateUploadedBuffer(buffer, filename, claimedMimeType);

  if (!result.isValid) {
    res.status(400).json({
      error: result.validationError,
      code: 'UPLOAD_VALIDATION_FAILED',
      metadata: result,
    });
    return;
  }

  res.json({
    success: true,
    message: 'File passed MIME magic-byte signature and size validation.',
    metadata: result,
    isSimulated: true,
  });
});

// -------------------------------------------------------------
// 5. System Controls: Kill Switch & Degraded Mode
// -------------------------------------------------------------

apiRouter.get('/system/controls', (_req: Request, res: Response) => {
  res.json({
    ...systemControls.getState(),
    isSimulated: true,
  });
});

apiRouter.post(
  '/system/kill-switch',
  requireRole(['Incident Commander', 'Administrator']),
  (req: Request, res: Response) => {
    const user = extractUserContext(req);
    const { active, reason } = req.body || {};

    if (typeof active !== 'boolean' || !reason || typeof reason !== 'string') {
      res.status(400).json({
        error: "Body requires boolean 'active' and non-empty 'reason' string.",
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = systemControls.setGlobalKillSwitch(active, user.role, user.displayName, reason);
    if (!result.success) {
      res.status(403).json({ error: result.error, code: 'FORBIDDEN' });
      return;
    }

    res.json({
      success: true,
      message: active ? 'Global AI Kill Switch engaged.' : 'Global AI Kill Switch disengaged.',
      state: systemControls.getState(),
    });
  }
);

apiRouter.post(
  '/system/degraded-mode',
  requireRole(['Incident Commander', 'Administrator']),
  (req: Request, res: Response) => {
    const user = extractUserContext(req);
    const { active, reason } = req.body || {};

    if (typeof active !== 'boolean' || !reason || typeof reason !== 'string') {
      res.status(400).json({
        error: "Body requires boolean 'active' and non-empty 'reason' string.",
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = systemControls.setDegradedMode(active, user.role, user.displayName, reason);
    if (!result.success) {
      res.status(403).json({ error: result.error, code: 'FORBIDDEN' });
      return;
    }

    res.json({
      success: true,
      message: active ? 'Degraded operations mode activated.' : 'Degraded mode deactivated.',
      state: systemControls.getState(),
    });
  }
);

// -------------------------------------------------------------
// 6. Security Audit Log Queries & Merkle Verification
// -------------------------------------------------------------

apiRouter.get(
  '/security/audit-events',
  requireRole(['Incident Commander', 'Administrator']),
  (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const events = auditLogService.getRecentEvents(limit);
    res.json({
      totalReturned: events.length,
      events,
      isSimulated: true,
    });
  }
);

apiRouter.get(
  '/security/audit-verify',
  requireRole(['Incident Commander', 'Administrator']),
  (_req: Request, res: Response) => {
    const verification = auditLogService.verifyChainIntegrity();
    res.json({
      ...verification,
      status: verification.isValid ? 'CRYPTO_CHAIN_VALID' : 'INTEGRITY_BREACH',
      isSimulated: true,
    });
  }
);

// -------------------------------------------------------------
// 7. Google Earth Engine Endpoints (with bounds validation)
// -------------------------------------------------------------

apiRouter.get('/earthengine/sar', async (req: Request, res: Response) => {
  try {
    const minLng = parseFloat(req.query.minLng as string);
    const minLat = parseFloat(req.query.minLat as string);
    const maxLng = parseFloat(req.query.maxLng as string);
    const maxLat = parseFloat(req.query.maxLat as string);

    if (!isNaN(minLng) || !isNaN(minLat) || !isNaN(maxLng) || !isNaN(maxLat)) {
      const boundsCheck = validateBoundingBox(minLng, minLat, maxLng, maxLat);
      if (!boundsCheck.isValid) {
        res.status(400).json({ error: boundsCheck.error, code: 'VALIDATION_ERROR' });
        return;
      }
    }

    const bbox: [number, number, number, number] = [
      isNaN(minLng) ? 86.7 : minLng,
      isNaN(minLat) ? 20.6 : minLat,
      isNaN(maxLng) ? 87.2 : maxLng,
      isNaN(maxLat) ? 21.1 : maxLat,
    ];

    const response = await adapterRegistry.earthEngine.getSARInundation(bbox);
    if (response.error) {
      res.status(502).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Earth Engine SAR query failed', message: errMsg });
  }
});

apiRouter.get('/earthengine/elevation', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat !== undefined ? parseFloat(req.query.lat as string) : 20.805;
    const lng = req.query.lng !== undefined ? parseFloat(req.query.lng as string) : 86.953;

    const coordCheck = validateGeoCoordinates(lat, lng);
    if (!coordCheck.isValid) {
      res.status(400).json({ error: coordCheck.error, code: 'VALIDATION_ERROR' });
      return;
    }

    const response = await adapterRegistry.earthEngine.getCoastalElevation([{ lat, lng }]);
    if (response.error) {
      res.status(502).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Elevation lookup failed', message: errMsg });
  }
});

// -------------------------------------------------------------
// 8. BigQuery Geospatial Endpoints (with bounds validation)
// -------------------------------------------------------------

apiRouter.get('/bigquery/spatial-assets', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat !== undefined ? parseFloat(req.query.lat as string) : 20.805;
    const lng = req.query.lng !== undefined ? parseFloat(req.query.lng as string) : 86.953;
    const radiusKm = req.query.radiusKm !== undefined ? parseFloat(req.query.radiusKm as string) : 35.0;

    const coordCheck = validateGeoCoordinates(lat, lng);
    if (!coordCheck.isValid) {
      res.status(400).json({ error: coordCheck.error, code: 'VALIDATION_ERROR' });
      return;
    }

    if (isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
      res.status(400).json({ error: 'radiusKm must be a positive number up to 500.', code: 'VALIDATION_ERROR' });
      return;
    }

    const response = await adapterRegistry.bigQuery.queryAssetsInRadius({ lat, lng }, radiusKm);
    if (response.error) {
      res.status(502).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'BigQuery spatial query failed', message: errMsg });
  }
});

apiRouter.get('/bigquery/population', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || 'Bhadrak';
    const response = await adapterRegistry.bigQuery.queryPopulationDensityGrid(district);
    if (response.error) {
      res.status(502).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Population density query failed', message: errMsg });
  }
});

// -------------------------------------------------------------
// 9. Firebase Authentication & 2FA Endpoints
// -------------------------------------------------------------

apiRouter.post('/auth/verify', authRateLimiter.middleware(), async (req: Request, res: Response) => {
  try {
    const token = req.body?.token || req.headers.authorization || '';
    const response = await adapterRegistry.firebaseAuth.verifySessionToken(token);
    const httpStatus = response.isValid ? 200 : 401;
    res.status(httpStatus).json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Token verification failed', message: errMsg });
  }
});

apiRouter.post('/auth/verify-2fa', authRateLimiter.middleware(), async (req: Request, res: Response) => {
  try {
    const { firstOfficer, secondOfficer, actionDigest } = req.body as {
      firstOfficer: OfficerCredentials;
      secondOfficer: OfficerCredentials;
      actionDigest: string;
    };

    if (!firstOfficer || !secondOfficer) {
      res.status(400).json({ error: 'Both firstOfficer and secondOfficer credentials required' });
      return;
    }

    const response = await adapterRegistry.firebaseAuth.verifyDualOfficer2FA(
      firstOfficer,
      secondOfficer,
      actionDigest || 'EMERGENCY_DISPATCH_AUTHORIZATION'
    );

    const httpStatus = response.isAuthorized ? 200 : 403;
    res.status(httpStatus).json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Dual-officer 2FA validation failed', message: errMsg });
  }
});

// -------------------------------------------------------------
// 10. Firestore Endpoints
// -------------------------------------------------------------

apiRouter.get('/firestore/documents/:collection/:id', async (req: Request, res: Response) => {
  try {
    const { collection, id } = req.params;
    const response = await adapterRegistry.firestore.getDocument(collection, id);
    if (!response.exists) {
      res.status(404).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to retrieve document', message: errMsg });
  }
});

apiRouter.get('/firestore/collections/:collection', async (req: Request, res: Response) => {
  try {
    const { collection } = req.params;
    const response = await adapterRegistry.firestore.queryCollection(collection);
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to query collection', message: errMsg });
  }
});

apiRouter.post('/firestore/audit', async (req: Request, res: Response) => {
  try {
    const log = req.body as AuditTraceEvent;
    if (!log?.traceId) {
      res.status(400).json({ error: 'Invalid audit log: traceId required' });
      return;
    }

    const response = await adapterRegistry.firestore.appendAuditLog(log);
    res.status(201).json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to append audit log', message: errMsg });
  }
});

// -------------------------------------------------------------
// 11. Cloud Storage Endpoints
// -------------------------------------------------------------

apiRouter.get('/storage/signed-url', async (req: Request, res: Response) => {
  try {
    const objectPath = (req.query.path as string) || 'sar/dhamra-inundation-sentinel1.tif';
    const response = await adapterRegistry.cloudStorage.getSignedUrl(objectPath);
    if (response.error) {
      res.status(502).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Signed URL generation failed', message: errMsg });
  }
});

apiRouter.get('/storage/metadata', async (req: Request, res: Response) => {
  try {
    const objectPath = (req.query.path as string) || '';
    const response = await adapterRegistry.cloudStorage.getArtifactMetadata(objectPath);
    if (!response.exists) {
      res.status(404).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Metadata lookup failed', message: errMsg });
  }
});

apiRouter.get('/storage/artifacts', (req: Request, res: Response) => {
  const path = req.query.path as string;
  res.setHeader('Content-Type', 'text/plain');
  res.send(`MOCK_STORAGE_BINARY_PAYLOAD_FOR_${path}`);
});

// -------------------------------------------------------------
// 12. Google Maps Endpoints
// -------------------------------------------------------------

apiRouter.post('/maps/evacuation-route', async (req: Request, res: Response) => {
  try {
    const { origin, destination, avoidAssetIds } = req.body as {
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
      avoidAssetIds?: string[];
    };

    if (!origin || !destination) {
      res.status(400).json({ error: 'Both origin and destination coordinates required' });
      return;
    }

    const checkOrigin = validateGeoCoordinates(origin.lat, origin.lng);
    const checkDest = validateGeoCoordinates(destination.lat, destination.lng);
    if (!checkOrigin.isValid || !checkDest.isValid) {
      res.status(400).json({ error: checkOrigin.error || checkDest.error, code: 'VALIDATION_ERROR' });
      return;
    }

    const response = await adapterRegistry.googleMaps.calculateEvacuationRoute(
      origin,
      destination,
      avoidAssetIds
    );

    if (response.error) {
      res.status(502).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Route calculation failed', message: errMsg });
  }
});

apiRouter.get('/maps/geocode', async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || 'Dhamra Port';
    const response = await adapterRegistry.googleMaps.geocodeLocation(query);
    if (response.error) {
      res.status(502).json(response);
      return;
    }
    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Geocoding failed', message: errMsg });
  }
});

// -------------------------------------------------------------
// 13. Live Meteorological Feeds (Open-Meteo & Marine API)
// -------------------------------------------------------------

apiRouter.get('/weather/basins', (_req: Request, res: Response) => {
  res.json({
    basins: liveWeatherService.getSupportedBasins(),
  });
});

apiRouter.get('/weather/live/:basinId', async (req: Request, res: Response) => {
  try {
    const basinId = req.params.basinId;
    const forceRefresh = req.query.refresh === 'true';
    const telemetry = await liveWeatherService.getBasinTelemetry(basinId, forceRefresh);
    res.json(telemetry);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to retrieve live basin telemetry', message: errMsg });
  }
});

// -------------------------------------------------------------
// 14. Server-Side Gemini 2.5 Flash Companion Pipeline
// -------------------------------------------------------------

apiRouter.post('/ai/companion', async (req: Request, res: Response) => {
  try {
    const { query, basinId, mode } = req.body || {};

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        error: 'Query parameter is mandatory and must be a non-empty string.',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const response = await geminiCompanionService.answerQuery({
      query: query.trim(),
      basinId,
      mode,
    });

    res.json(response);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'AI Companion inference failed', message: errMsg });
  }
});

