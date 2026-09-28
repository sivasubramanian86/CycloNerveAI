/**
 * CycloNerveAI - Replaceable Server-Side Adapters Test Suite (Phase 4)
 * Comprehensive unit and integration verification for:
 * 1. Provenance and freshness validation (fresh, stale, unavailable labeling)
 * 2. Google Earth Engine (Mock SAR/DEM vs Cloud failure mode)
 * 3. BigQuery Geospatial Queries (Mock ST_DWithin vs Cloud failure mode)
 * 4. Firebase Authentication & Dual-Officer 2FA Desk
 * 5. Google Cloud Firestore (ACID collections, WORM audit appends)
 * 6. Google Cloud Storage (Artifacts, signed URLs, metadata)
 * 7. Google Maps Platform (Hazard-aware evacuation routing & bridge detours)
 * 8. Simulated Advisory Dispatch Hub (OASIS CAP v1.2, Cell Broadcast, sirens)
 * 9. Adapter Registry & System Health Check Report Aggregation
 * 10. Preserved Domain Repository Contracts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Validation & Config
import {
  buildAndValidateProvenance,
  buildUnavailableProvenance,
  formatAgeString,
} from '../src/server/validation/provenanceValidator.ts';
import { loadServerConfig } from '../src/server/config/serverConfig.ts';

// Adapters
import { EarthEngineMockAdapter } from '../src/server/adapters/earthEngine/EarthEngineMockAdapter.ts';
import { EarthEngineCloudAdapter } from '../src/server/adapters/earthEngine/EarthEngineCloudAdapter.ts';
import { BigQueryMockAdapter } from '../src/server/adapters/bigQuery/BigQueryMockAdapter.ts';
import { BigQueryCloudAdapter } from '../src/server/adapters/bigQuery/BigQueryCloudAdapter.ts';
import { FirebaseAuthMockAdapter } from '../src/server/adapters/firebaseAuth/FirebaseAuthMockAdapter.ts';
import { FirebaseAuthCloudAdapter } from '../src/server/adapters/firebaseAuth/FirebaseAuthCloudAdapter.ts';
import { FirestoreMockAdapter } from '../src/server/adapters/firestore/FirestoreMockAdapter.ts';
import { FirestoreCloudAdapter } from '../src/server/adapters/firestore/FirestoreCloudAdapter.ts';
import { CloudStorageMockAdapter } from '../src/server/adapters/cloudStorage/CloudStorageMockAdapter.ts';
import { CloudStorageCloudAdapter } from '../src/server/adapters/cloudStorage/CloudStorageCloudAdapter.ts';
import { GoogleMapsMockAdapter } from '../src/server/adapters/googleMaps/GoogleMapsMockAdapter.ts';
import { GoogleMapsCloudAdapter } from '../src/server/adapters/googleMaps/GoogleMapsCloudAdapter.ts';
import { AdvisoryDispatchMockAdapter } from '../src/server/adapters/advisoryDispatch/AdvisoryDispatchMockAdapter.ts';
import { AdvisoryDispatchCloudAdapter } from '../src/server/adapters/advisoryDispatch/AdvisoryDispatchCloudAdapter.ts';
import { AdapterRegistry } from '../src/server/adapters/AdapterRegistry.ts';

// Domain Repositories
import {
  AdapterBackedDependencyRepository,
  AdapterBackedInfrastructureRepository,
  AdapterBackedInterventionRepository,
  AdapterBackedScenarioRepository,
} from '../src/domain/repositories/AdapterBackedRepositories.ts';
import { INITIAL_ADVISORIES } from '../src/data/coastalScenarioData.ts';

// -------------------------------------------------------------
// 1. Provenance and Freshness Validation Tests
// -------------------------------------------------------------

describe('1. Provenance and Freshness Validation', () => {
  it('validates fresh data and assigns correct LIVE / SIMULATED provenance metadata', () => {
    const prov = buildAndValidateProvenance({
      source: 'IMD Doppler Radar (Paradip)',
      sourceType: 'radar_sweep',
      classification: 'observed',
      isSimulated: false,
      slaKey: 'radar_sar',
      confidence: 0.98,
    });

    assert.equal(prov.source, 'IMD Doppler Radar (Paradip)');
    assert.equal(prov.status, 'LIVE');
    assert.equal(prov.isStale, false);
    assert.equal(prov.isSimulated, false);
    assert.ok(prov.confidence >= 0.95);
    assert.ok(typeof prov.freshness === 'string');
  });

  it('detects stale data exceeding SLA, marks as CACHED, and applies confidence penalty', () => {
    // 5 hours ago observation with 3-hour SLA
    const fiveHoursAgo = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
    const prov = buildAndValidateProvenance({
      source: 'Sentinel-1 SAR Flood Inundation Raster',
      sourceType: 'satellite_sar',
      classification: 'observed',
      observedAt: fiveHoursAgo,
      slaKey: 'radar_sar', // 3 hour SLA
      confidence: 0.95,
    });

    assert.equal(prov.isStale, true);
    assert.equal(prov.status, 'CACHED');
    assert.ok(prov.ageSeconds >= 5 * 3600);
    // Confidence should have penalized for the 2 hours of staleness
    assert.ok(prov.confidence < 0.95);
  });

  it('generates authoritative UNAVAILABLE provenance when an integration fails, refusing to fabricate', () => {
    const errorProv = buildUnavailableProvenance(
      'Google Earth Engine (Cloud)',
      'satellite_sar',
      'SERVICE_UNAVAILABLE_HTTP_503'
    );

    assert.equal(errorProv.status, 'UNAVAILABLE');
    assert.equal(errorProv.confidence, 0.0);
    assert.equal(errorProv.isStale, true);
    assert.equal(errorProv.freshness, 'UNAVAILABLE');
    assert.ok(errorProv.sha256Digest?.includes('SERVICE_UNAVAILABLE'));
  });

  it('correctly formats human-readable age strings', () => {
    assert.equal(formatAgeString(2), 'Just now');
    assert.equal(formatAgeString(45), '45s ago');
    assert.equal(formatAgeString(180), '3m ago');
    assert.equal(formatAgeString(7200), '2h ago');
    assert.equal(formatAgeString(86400 * 2), '2d ago');
  });
});

// -------------------------------------------------------------
// 2. Google Earth Engine Adapter Tests
// -------------------------------------------------------------

describe('2. Google Earth Engine Adapters', () => {
  it('Mock Adapter: returns high-fidelity SAR flood polygons and coastal elevation', async () => {
    const adapter = new EarthEngineMockAdapter();
    const health = await adapter.healthCheck();
    assert.equal(health.status, 'HEALTHY');
    assert.equal(health.mode, 'mock');
    assert.equal(health.provenance.status, 'SIMULATED');

    const sarResult = await adapter.getSARInundation([86.7, 20.6, 87.2, 21.1]);
    assert.ok(sarResult.floodPolygons.length >= 3);
    assert.ok(sarResult.inundationAreaTotalKm2 > 50);
    assert.equal(sarResult.provenance.isSimulated, true);

    const elevResult = await adapter.getCoastalElevation([
      { lat: 20.805, lng: 86.953 }, // Dhamra Substation area
      { lat: 20.912, lng: 86.837 }, // Basudevpur shelter
    ]);
    assert.equal(elevResult.points.length, 2);
    assert.ok(elevResult.points[0].elevationAmslMeters > 0);
  });

  it('Cloud Adapter without credentials: strictly fails with UNAVAILABLE and does not fabricate data', async () => {
    const cloudAdapter = new EarthEngineCloudAdapter();
    const health = await cloudAdapter.healthCheck();
    assert.equal(health.status, 'UNAVAILABLE');
    assert.equal(health.mode, 'cloud');
    assert.equal(health.provenance.status, 'UNAVAILABLE');

    const sarResult = await cloudAdapter.getSARInundation([86.7, 20.6, 87.2, 21.1]);
    assert.ok(sarResult.error);
    assert.equal(sarResult.floodPolygons.length, 0);
    assert.equal(sarResult.provenance.status, 'UNAVAILABLE');
  });
});

// -------------------------------------------------------------
// 3. BigQuery Geospatial Queries Adapter Tests
// -------------------------------------------------------------

describe('3. BigQuery Geospatial Adapters', () => {
  it('Mock Adapter: executes spatial radius queries and population density lookups', async () => {
    const adapter = new BigQueryMockAdapter();
    const health = await adapter.healthCheck();
    assert.equal(health.status, 'HEALTHY');
    assert.equal(health.mode, 'mock');

    // Query assets within 35km of Dhamra Port (lat 20.805, lng 86.953)
    const assetRes = await adapter.queryAssetsInRadius({ lat: 20.805, lng: 86.953 }, 35.0);
    assert.ok(assetRes.totalAssetsFound > 0);
    assert.ok(assetRes.bytesBilledMb > 0);
    assert.equal(assetRes.provenance.status, 'SIMULATED');

    const popRes = await adapter.queryPopulationDensityGrid('Bhadrak');
    assert.ok(popRes.taluks.length >= 3);
    assert.ok(popRes.totalVulnerablePopulation > 50000);
  });

  it('Cloud Adapter without credentials: returns UNAVAILABLE without fabricating query execution', async () => {
    const cloudAdapter = new BigQueryCloudAdapter();
    const health = await cloudAdapter.healthCheck();
    assert.equal(health.status, 'UNAVAILABLE');
    assert.equal(health.mode, 'cloud');

    const queryRes = await cloudAdapter.executeGeospatialQuery('SELECT * FROM assets WHERE ST_DWithin(...)');
    assert.ok(queryRes.error);
    assert.equal(queryRes.totalRows, 0);
    assert.equal(queryRes.provenance.status, 'UNAVAILABLE');
  });
});

// -------------------------------------------------------------
// 4. Firebase Authentication & Dual-Officer 2FA Tests
// -------------------------------------------------------------

describe('4. Firebase Authentication & Dual-Officer 2FA', () => {
  it('Mock Adapter: verifies known session tokens and extracts user role and jurisdiction', async () => {
    const auth = new FirebaseAuthMockAdapter();
    const health = await auth.healthCheck();
    assert.equal(health.status, 'HEALTHY');

    // Incident Commander token
    const icRes = await auth.verifySessionToken('mock-commander-token');
    assert.equal(icRes.isValid, true);
    assert.equal(icRes.role, 'Incident Commander');
    assert.equal(icRes.displayName, 'Dr. Arvind Rao, IAS');
    assert.equal(icRes.fipsKeyId, 'FIPS-IC-9482');

    // Analyst token
    const anRes = await auth.verifySessionToken('mock-analyst-token');
    assert.equal(anRes.isValid, true);
    assert.equal(anRes.role, 'Analyst');

    // Invalid token
    const invalidRes = await auth.verifySessionToken('unknown-fake-token');
    assert.equal(invalidRes.isValid, false);
  });

  it('Statutory Dual-Officer 2FA: enforces distinct physical keys, leadership role, and 4-digit PIN', async () => {
    const auth = new FirebaseAuthMockAdapter();

    const officer1 = {
      officerName: 'Dr. Arvind Rao',
      role: 'Incident Commander' as const,
      tokenKeyId: 'FIPS-KEY-IC-01',
      pin: '9482',
      signatureTimestamp: new Date().toISOString(),
    };

    const officer2 = {
      officerName: 'Pooja Mohanty',
      role: 'Analyst' as const,
      tokenKeyId: 'FIPS-KEY-AN-02',
      pin: '4412',
      signatureTimestamp: new Date().toISOString(),
    };

    // Valid dual-officer authorization
    const validAuth = await auth.verifyDualOfficer2FA(officer1, officer2, 'DISPATCH_ACTION_HASH');
    assert.equal(validAuth.isAuthorized, true);
    assert.ok(validAuth.authorizationDigest.includes('2FA-AUTH-SIG'));

    // Rejection 1: Same token used for both officers (duplicate key violation)
    const duplicateKeyAuth = await auth.verifyDualOfficer2FA(
      officer1,
      { ...officer2, tokenKeyId: officer1.tokenKeyId },
      'DISPATCH_ACTION_HASH'
    );
    assert.equal(duplicateKeyAuth.isAuthorized, false);
    assert.ok(duplicateKeyAuth.errorMessage?.includes('distinct physical hardware tokens'));

    // Rejection 2: Neither officer is Incident Commander or Administrator
    const officer3 = { ...officer1, role: 'Field Officer' as const, tokenKeyId: 'FIPS-KEY-FO-03' };
    const noLeadershipAuth = await auth.verifyDualOfficer2FA(officer3, officer2, 'DISPATCH_ACTION_HASH');
    assert.equal(noLeadershipAuth.isAuthorized, false);
    assert.ok(noLeadershipAuth.errorMessage?.includes('at least one Incident Commander'));

    // Rejection 3: Inadequate PIN length
    const weakPinAuth = await auth.verifyDualOfficer2FA(
      { ...officer1, pin: '12' },
      officer2,
      'DISPATCH_ACTION_HASH'
    );
    assert.equal(weakPinAuth.isAuthorized, false);
    assert.ok(weakPinAuth.errorMessage?.includes('PIN'));
  });

  it('Cloud Adapter without credentials: fails verification safely with UNAVAILABLE', async () => {
    const cloudAuth = new FirebaseAuthCloudAdapter();
    const health = await cloudAuth.healthCheck();
    assert.equal(health.status, 'UNAVAILABLE');

    const verifyRes = await cloudAuth.verifySessionToken('test-token');
    assert.equal(verifyRes.isValid, false);
    assert.equal(verifyRes.provenance.status, 'UNAVAILABLE');
  });
});

// -------------------------------------------------------------
// 5. Firestore Adapter Tests
// -------------------------------------------------------------

describe('5. Google Cloud Firestore Adapters', () => {
  it('Mock Adapter: handles document CRUD, querying with filters, and WORM audit logging', async () => {
    const store = new FirestoreMockAdapter();
    const health = await store.healthCheck();
    assert.equal(health.status, 'HEALTHY');

    // Document retrieval
    const assetDoc = await store.getDocument('assets', 'SUB-OD-DH01');
    assert.equal(assetDoc.exists, true);
    assert.equal((assetDoc.data as { assetId: string }).assetId, 'SUB-OD-DH01');

    // Query with filter
    const powerAssets = await store.queryCollection('assets', [
      { field: 'sector', operator: '==', value: 'power' },
    ]);
    assert.ok(powerAssets.documents.length >= 1);

    // Save updated document
    const writeRes = await store.saveDocument('testCollection', 'testDoc-1', {
      name: 'Mobile Dewatering Unit',
      staged: true,
    });
    assert.equal(writeRes.success, true);
    assert.equal(writeRes.version, 1);

    // Append WORM audit log
    const auditRes = await store.appendAuditLog({
      traceId: 'TR-UNIT-TEST-001',
      scenarioId: 'SCENARIO-COASTAL-01',
      timestamp: new Date().toISOString(),
      agentName: 'CycloneCommander',
      toolName: 'executeIntervention',
      inputSource: 'UnitTest',
      outputStatus: 'SUCCESS',
      latencyMs: 14,
      tokenMetrics: { inputTokens: 100, cachedTokens: 0, outputTokens: 50, costUsd: 0.0001 },
      cacheHit: false,
      validationResult: 'PASSED',
      approvalStatus: 'APPROVED_DUAL_2FA',
      merkleHash: 'merkle_sha256_mock_hash_unit_test',
    });
    assert.equal(auditRes.success, true);
    assert.equal(auditRes.documentId, 'TR-UNIT-TEST-001');
  });

  it('Cloud Adapter without credentials: refuses to write or retrieve without authorization', async () => {
    const cloudStore = new FirestoreCloudAdapter();
    const health = await cloudStore.healthCheck();
    assert.equal(health.status, 'UNAVAILABLE');

    const getRes = await cloudStore.getDocument('assets', 'SUB-OD-DH01');
    assert.equal(getRes.exists, false);
    assert.ok(getRes.error);
  });
});

// -------------------------------------------------------------
// 6. Cloud Storage Adapter Tests
// -------------------------------------------------------------

describe('6. Google Cloud Storage Adapters', () => {
  it('Mock Adapter: uploads artifacts, queries metadata, and generates signed URLs', async () => {
    const storage = new CloudStorageMockAdapter();
    const health = await storage.healthCheck();
    assert.equal(health.status, 'HEALTHY');

    // Seeded artifact lookup
    const meta = await storage.getArtifactMetadata('sar/dhamra-inundation-sentinel1.tif');
    assert.equal(meta.exists, true);
    assert.equal(meta.contentType, 'image/tiff');
    assert.ok((meta.sizeBytes || 0) > 1000000);

    // Signed URL generation
    const signedUrlRes = await storage.getSignedUrl('sar/dhamra-inundation-sentinel1.tif', 30);
    assert.ok(signedUrlRes.signedUrl.includes('/api/storage/artifacts'));
    assert.ok(signedUrlRes.expiresAt);

    // Upload new artifact
    const uploadRes = await storage.uploadArtifact(
      'field/incident-photo-b12.jpg',
      'MOCK_IMAGE_BYTES',
      'image/jpeg',
      { bridgeId: 'BRG-BASUDEVPUR-12' }
    );
    assert.equal(uploadRes.success, true);
    assert.equal(uploadRes.objectPath, 'field/incident-photo-b12.jpg');
  });

  it('Cloud Adapter without credentials: fails gracefully and does not fabricate signed URLs', async () => {
    const cloudStorage = new CloudStorageCloudAdapter();
    const health = await cloudStorage.healthCheck();
    assert.equal(health.status, 'UNAVAILABLE');

    const signedUrlRes = await cloudStorage.getSignedUrl('sar/test.tif');
    assert.ok(signedUrlRes.error);
    assert.equal(signedUrlRes.signedUrl, '');
  });
});

// -------------------------------------------------------------
// 7. Google Maps Platform Adapter Tests
// -------------------------------------------------------------

describe('7. Google Maps Platform Adapters', () => {
  it('Mock Adapter: computes hazard-aware evacuation route and detects bridge flood detours', async () => {
    const maps = new GoogleMapsMockAdapter();
    const health = await maps.healthCheck();
    assert.equal(health.status, 'HEALTHY');

    const origin = { lat: 20.805, lng: 86.953 }; // Dhamra Port
    const destination = { lat: 20.912, lng: 86.837 }; // Basudevpur Shelter

    // Normal direct route
    const directRoute = await maps.calculateEvacuationRoute(origin, destination, []);
    assert.equal(directRoute.isDetourRequired, false);
    assert.ok(directRoute.distanceKm < 15);

    // Hazard detour when Causeway Bridge B-12 is flooded / avoided
    const detourRoute = await maps.calculateEvacuationRoute(origin, destination, ['BRG-BASUDEVPUR-12']);
    assert.equal(detourRoute.isDetourRequired, true);
    assert.ok(detourRoute.distanceKm > 20); // Detour via high embankment SH-9 is 28.4km
    assert.equal(detourRoute.routeSafetyStatus, 'SAFE_HIGH_GROUND');
    assert.ok(detourRoute.avoidedAssetIds.includes('BRG-BASUDEVPUR-12'));
  });

  it('Mock Adapter: provides distance matrix and coastal geocoding', async () => {
    const maps = new GoogleMapsMockAdapter();
    const matrix = await maps.computeDistanceMatrix(
      [{ lat: 20.805, lng: 86.953 }],
      [{ lat: 20.912, lng: 86.837 }, { lat: 20.902, lng: 86.512 }]
    );
    assert.equal(matrix.rows.length, 2);
    assert.ok(matrix.rows[0].distanceKm > 0);

    const geo = await maps.geocodeLocation('Dhamra Port, Bhadrak');
    assert.equal(geo.district, 'Bhadrak');
    assert.equal(geo.state, 'Odisha');
    assert.ok(geo.coordinates.lat > 20.0);
  });

  it('Cloud Adapter without API key: strictly returns UNAVAILABLE without fabricating routes', async () => {
    const cloudMaps = new GoogleMapsCloudAdapter();
    const health = await cloudMaps.healthCheck();
    assert.equal(health.status, 'UNAVAILABLE');

    const route = await cloudMaps.calculateEvacuationRoute(
      { lat: 20.8, lng: 86.9 },
      { lat: 20.9, lng: 86.8 }
    );
    assert.ok(route.error);
    assert.equal(route.distanceKm, 0);
  });
});

// -------------------------------------------------------------
// 8. Simulated Advisory Dispatch Adapter Tests
// -------------------------------------------------------------

describe('8. Simulated Advisory Dispatch Adapters', () => {
  it('Mock Adapter: generates OASIS CAP-v1.2 XML with 4 languages and simulates multi-channel broadcast', async () => {
    const dispatch = new AdvisoryDispatchMockAdapter();
    const health = await dispatch.healthCheck();
    assert.equal(health.status, 'HEALTHY');

    const advisory = INITIAL_ADVISORIES[0];
    const dualToken = {
      primaryOfficer: 'Dr. Arvind Rao, IAS',
      secondaryOfficer: 'Pooja Mohanty',
      tokenDigest: '2FA-SIG-IC9482-AN4412-CONFIRMED',
    };

    // CAP-v1.2 XML generation check
    const capXml = dispatch.generateCAPXml(advisory);
    assert.ok(capXml.includes('urn:oasis:names:tc:emergency:cap:1.2'));
    assert.ok(capXml.includes('<language>en</language>'));
    assert.ok(capXml.includes('<language>or</language>'));
    assert.ok(capXml.includes('<language>hi</language>'));
    assert.ok(capXml.includes('<language>te</language>'));
    assert.ok(capXml.includes('NDMA-DISASTER-ACT-2005'));

    // Full dispatch simulation
    const result = await dispatch.simulateDispatch(advisory, dualToken);
    assert.ok(result.dispatchId.startsWith('DISPATCH-'));
    assert.ok(result.totalAudienceReached > 100000);
    assert.ok(result.overallDeliveryRatePercent > 98);
    assert.ok(result.auditMerkleHash.startsWith('MERKLE-DISPATCH-LEAF'));

    // Check specific channel deliveries
    assert.equal(result.channels.cellBroadcast.succeeded, true);
    assert.equal(result.channels.municipalSirens.succeeded, true);
    assert.ok(result.channels.cellBroadcast.carrierAcks.length >= 3);
  });

  it('Cloud Adapter without credentials: returns UNAVAILABLE without fabricating live broadcast', async () => {
    const cloudDispatch = new AdvisoryDispatchCloudAdapter();
    const health = await cloudDispatch.healthCheck();
    assert.equal(health.status, 'UNAVAILABLE');

    const result = await cloudDispatch.simulateDispatch(INITIAL_ADVISORIES[0], {
      primaryOfficer: 'Officer 1',
      secondaryOfficer: 'Officer 2',
      tokenDigest: 'DIGEST',
    });
    assert.ok(result.error);
    assert.equal(result.totalAudienceReached, 0);
  });
});

// -------------------------------------------------------------
// 9. Adapter Registry & System Health Check Tests
// -------------------------------------------------------------

describe('9. Adapter Registry & Unified Health Checks', () => {
  it('instantiates all 7 adapters and aggregates system health report with Resilience Tier', async () => {
    const registry = new AdapterRegistry();
    const report = await registry.checkAllHealth();

    assert.equal(report.adapterCount.total, 7);
    assert.equal(report.overallStatus, 'HEALTHY');
    assert.equal(report.calculatedResilienceTier, 'TIER_0_CLOUD_EDGE');
    assert.ok(report.uptimeSeconds >= 0);

    // Verify all 7 individual adapter health results exist
    assert.equal(report.adapters.earthEngine.adapterName, 'Google Earth Engine');
    assert.equal(report.adapters.bigQuery.adapterName, 'BigQuery Geospatial Engine');
    assert.equal(report.adapters.firebaseAuth.adapterName, 'Firebase Authentication');
    assert.equal(report.adapters.firestore.adapterName, 'Cloud Firestore');
    assert.equal(report.adapters.cloudStorage.adapterName, 'Google Cloud Storage');
    assert.equal(report.adapters.googleMaps.adapterName, 'Google Maps Platform');
    assert.equal(report.adapters.advisoryDispatch.adapterName, 'Simulated Advisory Dispatch Gateway');
  });

  it('correctly degrades calculated Resilience Tier when adapters become unavailable', async () => {
    // Custom registry with 3 cloud adapters without credentials
    const degradedConfig = loadServerConfig();
    degradedConfig.earthEngine.mode = 'cloud';
    degradedConfig.bigQuery.mode = 'cloud';
    degradedConfig.googleMaps.mode = 'cloud';

    const degradedRegistry = new AdapterRegistry(degradedConfig);
    const report = await degradedRegistry.checkAllHealth();

    assert.equal(report.adapterCount.unavailable, 3);
    assert.equal(report.overallStatus, 'UNAVAILABLE');
    assert.equal(report.calculatedResilienceTier, 'TIER_2_SATELLITE_ONLY');
  });
});

// -------------------------------------------------------------
// 10. Preserved Domain Interfaces Tests
// -------------------------------------------------------------

describe('10. Preserved Domain Repository Contracts', () => {
  it('AdapterBacked repositories conform to IInfrastructureRepository and IDependencyRepository', async () => {
    const firestoreMock = new FirestoreMockAdapter();
    const infraRepo = new AdapterBackedInfrastructureRepository(firestoreMock);
    const depRepo = new AdapterBackedDependencyRepository(firestoreMock);
    const intervRepo = new AdapterBackedInterventionRepository(firestoreMock);
    const scenarioRepo = new AdapterBackedScenarioRepository();

    // Test asset retrieval
    const assets = await infraRepo.getAllAssets();
    assert.ok(assets.length >= 8);

    const asset = await infraRepo.getAssetById('SUB-OD-DH01');
    assert.ok(asset);
    assert.equal(asset.assetId, 'SUB-OD-DH01');

    // Test status update
    const updateSuccess = await infraRepo.updateAssetStatus('SUB-OD-DH01', 'safeguarded');
    assert.equal(updateSuccess, true);

    // Test edges retrieval and severing
    const edges = await depRepo.getAllEdges();
    assert.ok(edges.length >= 6);

    const severSuccess = await depRepo.severEdge(edges[0].id, 'Storm surge inundation');
    assert.equal(severSuccess, true);

    // Test intervention plans
    const plans = await intervRepo.getAllPlans();
    assert.ok(plans.length >= 3);
    const stageSuccess = await intervRepo.stagePlan(plans[0].id);
    assert.equal(stageSuccess, true);

    // Test scenario meta
    const meta = await scenarioRepo.getActiveScenarioMeta();
    assert.equal(meta.id, 'SCENARIO-ODISHA-SAMUDRA-01');
    assert.equal(meta.centralPressureHpa, 938);
  });
});
