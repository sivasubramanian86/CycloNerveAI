/**
 * CycloNerveAI - Google Earth Engine Mock Adapter
 * Provides deterministic, high-fidelity synthetic SAR inundation rasters and coastal DEM data
 * for local development and offline resilience drills.
 */

import type {
  ElevationPoint,
  ElevationResponse,
  HealthCheckResult,
  IEarthEngineAdapter,
  SARFloodPolygon,
  SARInundationResponse,
} from '../types.ts';
import { buildAndValidateProvenance } from '../../validation/provenanceValidator.ts';

export class EarthEngineMockAdapter implements IEarthEngineAdapter {
  private readonly defaultBbox: [number, number, number, number] = [86.7, 20.6, 87.2, 21.1];

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const provenance = buildAndValidateProvenance({
      source: 'Google Earth Engine (Mock Synthetic Engine)',
      sourceType: 'satellite_sar_mock',
      classification: 'simulated',
      isSimulated: true,
      slaKey: 'radar_sar',
      confidence: 0.99,
    });

    return {
      adapterName: 'Google Earth Engine',
      status: 'HEALTHY',
      mode: 'mock',
      latencyMs: Date.now() - startTime + 2,
      lastChecked: new Date().toISOString(),
      message: 'Earth Engine Mock Adapter operational. Pre-cached Sentinel-1 SAR flood rasters loaded.',
      provenance,
      details: {
        dataset: 'COPERNICUS/S1_GRD_MOCK',
        coverageDistrict: 'Bhadrak, Kendrapara, Balasore (Bay of Bengal)',
        syntheticPassTime: '2025-10-25T03:30:00Z',
      },
    };
  }

  async getSARInundation(
    bbox: [number, number, number, number] = this.defaultBbox,
    options?: { date?: string; maxStalenessHours?: number }
  ): Promise<SARInundationResponse> {
    // Synthetic flood polygons centered around Dhamra Port, Basudevpur, and Dhamra River Estuary
    const floodPolygons: SARFloodPolygon[] = [
      {
        id: 'SAR-DHAMRA-ESTUARY-01',
        depthMeters: 3.4,
        areaKm2: 48.6,
        backscatterDb: -22.4, // Open water backscatter threshold
        severityBand: 'CATASTROPHIC',
        coordinates: [
          [86.91, 20.79],
          [86.98, 20.80],
          [86.97, 20.86],
          [86.90, 20.84],
          [86.91, 20.79],
        ],
      },
      {
        id: 'SAR-BASUDEVPUR-SURGE-02',
        depthMeters: 2.1,
        areaKm2: 24.2,
        backscatterDb: -19.1,
        severityBand: 'SEVERE',
        coordinates: [
          [86.82, 20.88],
          [86.89, 20.89],
          [86.88, 20.94],
          [86.81, 20.93],
          [86.82, 20.88],
        ],
      },
      {
        id: 'SAR-CHANDBALI-CREEK-03',
        depthMeters: 1.4,
        areaKm2: 12.8,
        backscatterDb: -17.6,
        severityBand: 'MODERATE',
        coordinates: [
          [86.72, 20.75],
          [86.77, 20.76],
          [86.76, 20.80],
          [86.71, 20.79],
          [86.72, 20.75],
        ],
      },
    ];

    const provenance = buildAndValidateProvenance({
      source: 'Google Earth Engine (Sentinel-1 SAR C-Band Synthetic)',
      sourceType: 'copernicus_s1_grd',
      classification: 'observed',
      isSimulated: true,
      slaKey: 'radar_sar',
      confidence: 0.945,
      version: 'GEE-SAR-v2.4-LOCAL',
    });

    return {
      provenance,
      boundingBox: bbox,
      sensor: 'Synthetic Mock Sensor',
      orbitPass: 'ASCENDING',
      inundationAreaTotalKm2: 85.6,
      maxSurgeDepthMeters: 3.8,
      floodPolygons,
      rawGeoTiffUrl: '/api/storage/signed-url?path=sar/dhamra-inundation-sentinel1.tif',
    };
  }

  async getCoastalElevation(
    coordinates: Array<{ lat: number; lng: number }>
  ): Promise<ElevationResponse> {
    const points: ElevationPoint[] = coordinates.map((coord) => {
      // Deterministic synthetic elevation based on distance from coast (approx lng 87.0)
      const distFromCoastKm = Math.max(0, (87.0 - coord.lng) * 111);
      const elevationAmslMeters = Number(Math.max(0.8, 1.2 + distFromCoastKm * 0.45).toFixed(1));
      return {
        lat: coord.lat,
        lng: coord.lng,
        elevationAmslMeters,
        topographicSlopeDegrees: 0.4,
        isBelowSurgeThreshold: elevationAmslMeters < 4.0, // Vulnerable to 4m storm surge
      };
    });

    const provenance = buildAndValidateProvenance({
      source: 'Google Earth Engine (SRTM / NASADEM Coastal 30m)',
      sourceType: 'dem_raster',
      classification: 'derived',
      isSimulated: true,
      confidence: 0.96,
    });

    return {
      provenance,
      points,
      demSource: 'NASADEM_HGT/001 (Mocked)',
    };
  }
}
