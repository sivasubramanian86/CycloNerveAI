/**
 * CycloNerveAI - BigQuery Geospatial Queries Mock Adapter
 * Simulates Google Cloud BigQuery GIS (ST_DWithin, ST_Buffer, ST_Intersects)
 * on coastal Odisha lifeline inventory and census population grids.
 */

import {
  BigQueryAssetResponse,
  BigQueryPopulationResponse,
  BigQueryQueryResponse,
  HealthCheckResult,
  IBigQueryAdapter,
  TalukPopulationDensity,
} from '../types.ts';
import { SCENARIO_ASSETS } from '../../../data/coastalScenarioData.ts';
import { InfrastructureAsset } from '../../../shared/types/index.ts';
import { buildAndValidateProvenance } from '../../validation/provenanceValidator.ts';

function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class BigQueryMockAdapter implements IBigQueryAdapter {
  private readonly assets: InfrastructureAsset[] = [...SCENARIO_ASSETS];

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const provenance = buildAndValidateProvenance({
      source: 'Google BigQuery GIS (Mock Spatial Engine)',
      sourceType: 'data_warehouse_gis',
      classification: 'simulated',
      isSimulated: true,
      confidence: 0.99,
    });

    return {
      adapterName: 'BigQuery Geospatial Engine',
      status: 'HEALTHY',
      mode: 'mock',
      latencyMs: Date.now() - startTime + 3,
      lastChecked: new Date().toISOString(),
      message: 'BigQuery Mock GIS operational. In-memory spatial index ready with Odisha lifeline dataset.',
      provenance,
      details: {
        dataset: 'cyclonerve_spatial_odisha_mock',
        indexedAssetCount: this.assets.length,
        spatialPartitioning: 'H3_HEX_RESOLUTION_8',
      },
    };
  }

  async queryAssetsInRadius(
    center: { lat: number; lng: number },
    radiusKm: number
  ): Promise<BigQueryAssetResponse> {
    const startTime = Date.now();
    const filteredAssets = this.assets.filter((asset) => {
      const dist = calculateHaversineDistanceKm(
        center.lat,
        center.lng,
        asset.coordinates.lat,
        asset.coordinates.lng
      );
      return dist <= radiusKm;
    });

    const provenance = buildAndValidateProvenance({
      source: 'BigQuery (ST_DWithin Spatial Query Mock)',
      sourceType: 'spatial_sql',
      classification: 'derived',
      isSimulated: true,
      confidence: 0.98,
      slaKey: 'baseline_inventory',
    });

    return {
      provenance,
      queryExecutionMs: Date.now() - startTime + 8,
      bytesBilledMb: 14.2,
      center,
      radiusKm,
      totalAssetsFound: filteredAssets.length,
      assets: filteredAssets,
    };
  }

  async queryPopulationDensityGrid(district: string): Promise<BigQueryPopulationResponse> {
    const taluks: TalukPopulationDensity[] = [
      {
        district: 'Bhadrak',
        taluk: 'Basudevpur',
        populationTotal: 184500,
        densityPerKm2: 642,
        vulnerabilityIndex: 0.88,
        elderlyAndChildrenCount: 46200,
      },
      {
        district: 'Bhadrak',
        taluk: 'Chandbali',
        populationTotal: 142000,
        densityPerKm2: 518,
        vulnerabilityIndex: 0.91,
        elderlyAndChildrenCount: 38100,
      },
      {
        district: 'Bhadrak',
        taluk: 'Dhamra Fringe Coastal',
        populationTotal: 68400,
        densityPerKm2: 380,
        vulnerabilityIndex: 0.95,
        elderlyAndChildrenCount: 19800,
      },
      {
        district: 'Bhadrak',
        taluk: 'Bhadrak Municipality',
        populationTotal: 210000,
        densityPerKm2: 1250,
        vulnerabilityIndex: 0.52,
        elderlyAndChildrenCount: 42000,
      },
    ];

    const totalVulnerable = taluks.reduce((sum, t) => sum + t.elderlyAndChildrenCount, 0);

    const provenance = buildAndValidateProvenance({
      source: 'BigQuery (Odisha Census 2021 Spatial Raster Mock)',
      sourceType: 'census_spatial_grid',
      classification: 'derived',
      isSimulated: true,
      confidence: 0.95,
    });

    return {
      provenance,
      district,
      taluks,
      totalVulnerablePopulation: totalVulnerable,
    };
  }

  async executeGeospatialQuery<T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>
  ): Promise<BigQueryQueryResponse<T>> {
    const startTime = Date.now();
    // Simulate realistic BigQuery SQL query result
    const mockRows: T[] = [
      {
        asset_id: 'SUB-DHAMRA-220KV',
        name: 'Dhamra Port 220/33kV Substation',
        st_distance_meters: 1420,
        within_surge_buffer: true,
        risk_category: 'CRITICAL',
      } as unknown as T,
      {
        asset_id: 'HOSP-BHADRAK-DIST',
        name: 'Bhadrak District Hospital',
        st_distance_meters: 18400,
        within_surge_buffer: false,
        risk_category: 'HIGH',
      } as unknown as T,
    ];

    const provenance = buildAndValidateProvenance({
      source: 'BigQuery (Standard SQL GIS Simulator)',
      sourceType: 'gis_sql',
      classification: 'derived',
      isSimulated: true,
      confidence: 0.97,
    });

    return {
      provenance,
      sqlQuery: sql,
      rows: mockRows,
      totalRows: mockRows.length,
      executionTimeMs: Date.now() - startTime + 12,
    };
  }
}
