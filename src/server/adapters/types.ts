/**
 * CycloNerveAI - Replaceable Server-Side Adapter Types
 * Defines contracts, provenance records, and health check schemas for all cloud & mock adapters.
 */

import type {
  AuditTraceEvent,
  DataClassification,
  DependencyEdge,
  InfrastructureAsset,
  InterventionPlan,
  MultilingualAdvisoryDraft,
  ResilienceTier,
  UserRole,
} from '../../shared/types/index.ts';

export type {
  AuditTraceEvent,
  DataClassification,
  DependencyEdge,
  InfrastructureAsset,
  InterventionPlan,
  MultilingualAdvisoryDraft,
  ResilienceTier,
  UserRole,
};

// -------------------------------------------------------------
// Common Health & Provenance Types
// -------------------------------------------------------------

export type AdapterStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
export type AdapterMode = 'mock' | 'cloud';
export type ProvenanceStatus = 'LIVE' | 'CACHED' | 'SIMULATED' | 'UNAVAILABLE';

export interface ProvenanceRecord {
  source: string;
  sourceType: string;
  classification: DataClassification;
  status: ProvenanceStatus;
  confidence: number; // 0.0 to 1.0
  observedAt: string; // ISO 8601
  ingestedAt: string; // ISO 8601
  freshness: string; // e.g. "12s ago", "2m ago"
  ageSeconds: number;
  isStale: boolean;
  isSimulated: boolean;
  cacheStatus: 'HIT' | 'MISS' | 'NONE';
  version?: string;
  sha256Digest?: string;
}

export interface HealthCheckResult {
  adapterName: string;
  status: AdapterStatus;
  mode: AdapterMode;
  latencyMs: number;
  lastChecked: string;
  message: string;
  provenance: ProvenanceRecord;
  details?: Record<string, unknown>;
}

export interface SystemHealthCheckReport {
  overallStatus: AdapterStatus;
  calculatedResilienceTier: ResilienceTier;
  timestamp: string;
  uptimeSeconds: number;
  adapterCount: {
    total: number;
    healthy: number;
    degraded: number;
    unavailable: number;
    mockCount: number;
    cloudCount: number;
  };
  adapters: {
    earthEngine: HealthCheckResult;
    bigQuery: HealthCheckResult;
    firebaseAuth: HealthCheckResult;
    firestore: HealthCheckResult;
    cloudStorage: HealthCheckResult;
    googleMaps: HealthCheckResult;
    advisoryDispatch: HealthCheckResult;
  };
}

// -------------------------------------------------------------
// 1. Google Earth Engine Types
// -------------------------------------------------------------

export interface SARFloodPolygon {
  id: string;
  depthMeters: number;
  areaKm2: number;
  backscatterDb: number;
  coordinates: Array<[number, number]>; // [lng, lat]
  severityBand: 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
}

export interface SARInundationResponse {
  provenance: ProvenanceRecord;
  boundingBox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  sensor: 'Sentinel-1A C-SAR' | 'Sentinel-1B C-SAR' | 'Synthetic Mock Sensor';
  orbitPass: 'ASCENDING' | 'DESCENDING';
  inundationAreaTotalKm2: number;
  maxSurgeDepthMeters: number;
  floodPolygons: SARFloodPolygon[];
  rawGeoTiffUrl?: string;
  error?: string;
}

export interface ElevationPoint {
  lat: number;
  lng: number;
  elevationAmslMeters: number;
  topographicSlopeDegrees: number;
  isBelowSurgeThreshold: boolean;
}

export interface ElevationResponse {
  provenance: ProvenanceRecord;
  points: ElevationPoint[];
  demSource: string;
  error?: string;
}

export interface IEarthEngineAdapter {
  healthCheck(): Promise<HealthCheckResult>;
  getSARInundation(
    bbox: [number, number, number, number],
    options?: { date?: string; maxStalenessHours?: number }
  ): Promise<SARInundationResponse>;
  getCoastalElevation(
    coordinates: Array<{ lat: number; lng: number }>
  ): Promise<ElevationResponse>;
}

// -------------------------------------------------------------
// 2. BigQuery Geospatial Queries Types
// -------------------------------------------------------------

export interface BigQueryAssetResponse {
  provenance: ProvenanceRecord;
  queryExecutionMs: number;
  bytesBilledMb: number;
  center: { lat: number; lng: number };
  radiusKm: number;
  totalAssetsFound: number;
  assets: InfrastructureAsset[];
  error?: string;
}

export interface TalukPopulationDensity {
  district: string;
  taluk: string;
  populationTotal: number;
  densityPerKm2: number;
  vulnerabilityIndex: number;
  elderlyAndChildrenCount: number;
}

export interface BigQueryPopulationResponse {
  provenance: ProvenanceRecord;
  district: string;
  taluks: TalukPopulationDensity[];
  totalVulnerablePopulation: number;
  error?: string;
}

export interface BigQueryQueryResponse<T = Record<string, unknown>> {
  provenance: ProvenanceRecord;
  sqlQuery: string;
  rows: T[];
  totalRows: number;
  executionTimeMs: number;
  error?: string;
}

export interface IBigQueryAdapter {
  healthCheck(): Promise<HealthCheckResult>;
  queryAssetsInRadius(
    center: { lat: number; lng: number },
    radiusKm: number
  ): Promise<BigQueryAssetResponse>;
  queryPopulationDensityGrid(district: string): Promise<BigQueryPopulationResponse>;
  executeGeospatialQuery<T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>
  ): Promise<BigQueryQueryResponse<T>>;
}

// -------------------------------------------------------------
// 3. Firebase Authentication Types
// -------------------------------------------------------------

export interface AuthVerificationResponse {
  provenance: ProvenanceRecord;
  isValid: boolean;
  uid?: string;
  email?: string;
  displayName?: string;
  role?: UserRole;
  fipsKeyId?: string;
  jurisdiction?: string;
  expiresAt?: string;
  errorMessage?: string;
}

export interface OfficerCredentials {
  officerName: string;
  role: UserRole;
  tokenKeyId: string;
  pin: string;
  signatureTimestamp: string;
}

export interface DualOfficerAuthResponse {
  provenance: ProvenanceRecord;
  isAuthorized: boolean;
  authorizedAt?: string;
  firstOfficerName?: string;
  secondOfficerName?: string;
  statutoryRolePair: string;
  authorizationDigest: string;
  errorMessage?: string;
}

export interface IFirebaseAuthAdapter {
  healthCheck(): Promise<HealthCheckResult>;
  verifySessionToken(token: string): Promise<AuthVerificationResponse>;
  verifyDualOfficer2FA(
    firstOfficer: OfficerCredentials,
    secondOfficer: OfficerCredentials,
    actionDigest: string
  ): Promise<DualOfficerAuthResponse>;
}

// -------------------------------------------------------------
// 4. Firestore Types
// -------------------------------------------------------------

export interface FirestoreFilter {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: unknown;
}

export interface FirestoreDocumentResponse<T> {
  provenance: ProvenanceRecord;
  exists: boolean;
  id: string;
  data?: T;
  version?: number;
  error?: string;
}

export interface FirestoreQueryResponse<T> {
  provenance: ProvenanceRecord;
  collection: string;
  count: number;
  documents: Array<{ id: string; data: T }>;
  error?: string;
}

export interface FirestoreWriteResponse {
  provenance: ProvenanceRecord;
  success: boolean;
  documentId: string;
  writtenAt: string;
  version: number;
  error?: string;
}

export interface IFirestoreAdapter {
  healthCheck(): Promise<HealthCheckResult>;
  getDocument<T>(collection: string, docId: string): Promise<FirestoreDocumentResponse<T>>;
  queryCollection<T>(collection: string, filters?: FirestoreFilter[]): Promise<FirestoreQueryResponse<T>>;
  saveDocument<T>(collection: string, docId: string, data: T): Promise<FirestoreWriteResponse>;
  appendAuditLog(log: AuditTraceEvent): Promise<FirestoreWriteResponse>;
}

// -------------------------------------------------------------
// 5. Cloud Storage Types
// -------------------------------------------------------------

export interface StorageUploadResponse {
  provenance: ProvenanceRecord;
  success: boolean;
  bucket: string;
  objectPath: string;
  sizeBytes: number;
  contentType: string;
  md5Hash: string;
  publicUrl?: string;
  error?: string;
}

export interface StorageSignedUrlResponse {
  provenance: ProvenanceRecord;
  signedUrl: string;
  expiresAt: string;
  objectPath: string;
  bucket: string;
  error?: string;
}

export interface StorageMetadataResponse {
  provenance: ProvenanceRecord;
  exists: boolean;
  objectPath: string;
  sizeBytes?: number;
  contentType?: string;
  updatedAt?: string;
  md5Hash?: string;
  error?: string;
}

export interface ICloudStorageAdapter {
  healthCheck(): Promise<HealthCheckResult>;
  uploadArtifact(
    path: string,
    content: Buffer | string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<StorageUploadResponse>;
  getSignedUrl(path: string, expiresInMinutes?: number): Promise<StorageSignedUrlResponse>;
  getArtifactMetadata(path: string): Promise<StorageMetadataResponse>;
}

// -------------------------------------------------------------
// 6. Google Maps Types
// -------------------------------------------------------------

export interface RouteWaypoint {
  lat: number;
  lng: number;
  elevationMeters: number;
  isFlooded: boolean;
  instruction?: string;
}

export interface RouteResponse {
  provenance: ProvenanceRecord;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  distanceKm: number;
  estimatedDurationMinutes: number;
  isDetourRequired: boolean;
  avoidedAssetIds: string[];
  routeSafetyStatus: 'SAFE_HIGH_GROUND' | 'CAUTION_PERIMETER' | 'SUBMERGED_BLOCKED';
  waypoints: RouteWaypoint[];
  polylineEncoded: string;
  error?: string;
}

export interface DistanceMatrixItem {
  originIndex: number;
  destinationIndex: number;
  distanceKm: number;
  durationMinutes: number;
  status: 'OK' | 'ZERO_RESULTS' | 'BLOCKED_BY_INUNDATION';
}

export interface DistanceMatrixResponse {
  provenance: ProvenanceRecord;
  rows: DistanceMatrixItem[];
  error?: string;
}

export interface GeocodeResponse {
  provenance: ProvenanceRecord;
  query: string;
  formattedAddress: string;
  coordinates: { lat: number; lng: number };
  placeId: string;
  district: string;
  state: string;
  error?: string;
}

export interface IGoogleMapsAdapter {
  healthCheck(): Promise<HealthCheckResult>;
  calculateEvacuationRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    avoidAssetIds?: string[]
  ): Promise<RouteResponse>;
  computeDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>
  ): Promise<DistanceMatrixResponse>;
  geocodeLocation(query: string): Promise<GeocodeResponse>;
}

// -------------------------------------------------------------
// 7. Simulated Advisory Dispatch Types
// -------------------------------------------------------------

export interface DispatchChannelResult {
  channel: 'cellBroadcast' | 'smsGateway' | 'municipalSirens' | 'whatsAppBot' | 'controlRoomLed';
  name: string;
  attempted: boolean;
  succeeded: boolean;
  subscribersOrNodesReached: number;
  deliveryLatencyMs: number;
  carrierAcks: Array<{ nodeName: string; status: 'ACK' | 'NACK' | 'QUEUED'; rttMs: number }>;
  errorMessage?: string;
}

export interface AdvisoryDispatchResult {
  provenance: ProvenanceRecord;
  advisoryCode: string;
  dispatchId: string;
  dispatchedAt: string;
  capv12Xml: string;
  authorizedBy: {
    primaryOfficer: string;
    secondaryOfficer: string;
    tokenDigest: string;
  };
  channels: Record<string, DispatchChannelResult>;
  totalAudienceReached: number;
  overallDeliveryRatePercent: number;
  auditMerkleHash: string;
  error?: string;
}

export interface ChannelStatusReport {
  provenance: ProvenanceRecord;
  channels: Array<{
    id: string;
    name: string;
    status: 'ONLINE' | 'STANDBY' | 'DEGRADED' | 'OFFLINE';
    carrier: string;
    coverageArea: string;
    lastPingMs: number;
  }>;
}

export interface IAdvisoryDispatchAdapter {
  healthCheck(): Promise<HealthCheckResult>;
  simulateDispatch(
    advisory: MultilingualAdvisoryDraft,
    dualAuthToken: { primaryOfficer: string; secondaryOfficer: string; tokenDigest: string }
  ): Promise<AdvisoryDispatchResult>;
  generateCAPXml(advisory: MultilingualAdvisoryDraft): string;
  getChannelStatus(): Promise<ChannelStatusReport>;
}
