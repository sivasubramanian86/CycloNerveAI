/**
 * CycloNerveAI - Replaceable Server-Side Adapter Registry
 * Dependency Injection container instantiating Mock or Cloud adapters
 * based on environment configuration.
 */

import {
  AdapterStatus,
  IAdvisoryDispatchAdapter,
  IBigQueryAdapter,
  ICloudStorageAdapter,
  IEarthEngineAdapter,
  IFirebaseAuthAdapter,
  IFirestoreAdapter,
  IGoogleMapsAdapter,
  SystemHealthCheckReport,
} from './types.ts';
import { serverConfig } from '../config/serverConfig.ts';
import type { ResilienceTier } from '../../shared/types/index.ts';

// Adapters
import { EarthEngineMockAdapter } from './earthEngine/EarthEngineMockAdapter.ts';
import { EarthEngineCloudAdapter } from './earthEngine/EarthEngineCloudAdapter.ts';
import { BigQueryMockAdapter } from './bigQuery/BigQueryMockAdapter.ts';
import { BigQueryCloudAdapter } from './bigQuery/BigQueryCloudAdapter.ts';
import { FirebaseAuthMockAdapter } from './firebaseAuth/FirebaseAuthMockAdapter.ts';
import { FirebaseAuthCloudAdapter } from './firebaseAuth/FirebaseAuthCloudAdapter.ts';
import { FirestoreMockAdapter } from './firestore/FirestoreMockAdapter.ts';
import { FirestoreCloudAdapter } from './firestore/FirestoreCloudAdapter.ts';
import { CloudStorageMockAdapter } from './cloudStorage/CloudStorageMockAdapter.ts';
import { CloudStorageCloudAdapter } from './cloudStorage/CloudStorageCloudAdapter.ts';
import { GoogleMapsMockAdapter } from './googleMaps/GoogleMapsMockAdapter.ts';
import { GoogleMapsCloudAdapter } from './googleMaps/GoogleMapsCloudAdapter.ts';
import { AdvisoryDispatchMockAdapter } from './advisoryDispatch/AdvisoryDispatchMockAdapter.ts';
import { AdvisoryDispatchCloudAdapter } from './advisoryDispatch/AdvisoryDispatchCloudAdapter.ts';

export class AdapterRegistry {
  private static instance: AdapterRegistry;

  readonly earthEngine: IEarthEngineAdapter;
  readonly bigQuery: IBigQueryAdapter;
  readonly firebaseAuth: IFirebaseAuthAdapter;
  readonly firestore: IFirestoreAdapter;
  readonly cloudStorage: ICloudStorageAdapter;
  readonly googleMaps: IGoogleMapsAdapter;
  readonly advisoryDispatch: IAdvisoryDispatchAdapter;

  private readonly serverStartTime: number = Date.now();

  constructor(customConfig = serverConfig) {
    // 1. Google Earth Engine
    this.earthEngine =
      customConfig.earthEngine.mode === 'cloud'
        ? new EarthEngineCloudAdapter()
        : new EarthEngineMockAdapter();

    // 2. BigQuery Geospatial Queries
    this.bigQuery =
      customConfig.bigQuery.mode === 'cloud'
        ? new BigQueryCloudAdapter()
        : new BigQueryMockAdapter();

    // 3. Firebase Authentication
    this.firebaseAuth =
      customConfig.firebaseAuth.mode === 'cloud'
        ? new FirebaseAuthCloudAdapter()
        : new FirebaseAuthMockAdapter();

    // 4. Firestore
    this.firestore =
      customConfig.firestore.mode === 'cloud'
        ? new FirestoreCloudAdapter()
        : new FirestoreMockAdapter();

    // 5. Cloud Storage
    this.cloudStorage =
      customConfig.cloudStorage.mode === 'cloud'
        ? new CloudStorageCloudAdapter()
        : new CloudStorageMockAdapter();

    // 6. Google Maps Platform
    this.googleMaps =
      customConfig.googleMaps.mode === 'cloud'
        ? new GoogleMapsCloudAdapter()
        : new GoogleMapsMockAdapter();

    // 7. Simulated Advisory Dispatch
    this.advisoryDispatch =
      customConfig.advisoryDispatch.mode === 'cloud'
        ? new AdvisoryDispatchCloudAdapter()
        : new AdvisoryDispatchMockAdapter();
  }

  static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) {
      AdapterRegistry.instance = new AdapterRegistry();
    }
    return AdapterRegistry.instance;
  }

  async checkAllHealth(): Promise<SystemHealthCheckReport> {
    const [
      earthEngineHealth,
      bigQueryHealth,
      firebaseAuthHealth,
      firestoreHealth,
      cloudStorageHealth,
      googleMapsHealth,
      advisoryDispatchHealth,
    ] = await Promise.all([
      this.earthEngine.healthCheck(),
      this.bigQuery.healthCheck(),
      this.firebaseAuth.healthCheck(),
      this.firestore.healthCheck(),
      this.cloudStorage.healthCheck(),
      this.googleMaps.healthCheck(),
      this.advisoryDispatch.healthCheck(),
    ]);

    const adapterList = [
      earthEngineHealth,
      bigQueryHealth,
      firebaseAuthHealth,
      firestoreHealth,
      cloudStorageHealth,
      googleMapsHealth,
      advisoryDispatchHealth,
    ];

    let healthyCount = 0;
    let degradedCount = 0;
    let unavailableCount = 0;
    let mockCount = 0;
    let cloudCount = 0;

    for (const h of adapterList) {
      if (h.status === 'HEALTHY') healthyCount++;
      else if (h.status === 'DEGRADED') degradedCount++;
      else unavailableCount++;

      if (h.mode === 'mock') mockCount++;
      else cloudCount++;
    }

    // Determine overall status
    let overallStatus: AdapterStatus = 'HEALTHY';
    if (unavailableCount > 0 && unavailableCount <= 2) {
      overallStatus = 'DEGRADED';
    } else if (unavailableCount > 2) {
      overallStatus = 'UNAVAILABLE';
    }

    // Determine Resilience Tier based on adapter survivability
    let calculatedTier: ResilienceTier = 'TIER_0_CLOUD_EDGE';
    if (unavailableCount === 0 && degradedCount === 0) {
      calculatedTier = 'TIER_0_CLOUD_EDGE';
    } else if (unavailableCount <= 2) {
      calculatedTier = 'TIER_1_CLOUD_DEGRADED';
    } else if (unavailableCount <= 5) {
      calculatedTier = 'TIER_2_SATELLITE_ONLY';
    } else {
      calculatedTier = 'TIER_3_AIR_GAPPED';
    }

    return {
      overallStatus,
      calculatedResilienceTier: calculatedTier,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.serverStartTime) / 1000),
      adapterCount: {
        total: adapterList.length,
        healthy: healthyCount,
        degraded: degradedCount,
        unavailable: unavailableCount,
        mockCount,
        cloudCount,
      },
      adapters: {
        earthEngine: earthEngineHealth,
        bigQuery: bigQueryHealth,
        firebaseAuth: firebaseAuthHealth,
        firestore: firestoreHealth,
        cloudStorage: cloudStorageHealth,
        googleMaps: googleMapsHealth,
        advisoryDispatch: advisoryDispatchHealth,
      },
    };
  }
}

export const adapterRegistry = AdapterRegistry.getInstance();
