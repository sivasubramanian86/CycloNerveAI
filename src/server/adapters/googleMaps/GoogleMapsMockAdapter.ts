/**
 * CycloNerveAI - Google Maps Platform Mock Adapter
 * Simulates Routes API, Distance Matrix API, Geocoding API, and Elevation API
 * with flood hazard-aware evacuation routing and bridge outage detours.
 */

import {
  DistanceMatrixItem,
  DistanceMatrixResponse,
  GeocodeResponse,
  HealthCheckResult,
  IGoogleMapsAdapter,
  RouteResponse,
  RouteWaypoint,
} from '../types.ts';
import { buildAndValidateProvenance } from '../../validation/provenanceValidator.ts';

export class GoogleMapsMockAdapter implements IGoogleMapsAdapter {
  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const provenance = buildAndValidateProvenance({
      source: 'Google Maps Routes & Distance Matrix (Mock Engine)',
      sourceType: 'maps_api_mock',
      classification: 'simulated',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      adapterName: 'Google Maps Platform',
      status: 'HEALTHY',
      mode: 'mock',
      latencyMs: Date.now() - startTime + 2,
      lastChecked: new Date().toISOString(),
      message: 'Google Maps Mock operational. Hazard-aware evacuation routing grid loaded for Bhadrak & Dhamra.',
      provenance,
      details: {
        evacuationCorridors: ['SH-9 High Embankment', 'NH-16 Inland Bypass', 'Dhamra Port Expressway'],
        geocodedCoastalLocations: 12,
      },
    };
  }

  async calculateEvacuationRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    avoidAssetIds: string[] = []
  ): Promise<RouteResponse> {
    const isBridgeBlocked =
      avoidAssetIds.includes('BRG-BASUDEVPUR-12') || avoidAssetIds.includes('bridge-flooded');

    let waypoints: RouteWaypoint[];
    let distanceKm: number;
    let estimatedDurationMinutes: number;
    let routeSafetyStatus: 'SAFE_HIGH_GROUND' | 'CAUTION_PERIMETER' | 'SUBMERGED_BLOCKED';

    if (isBridgeBlocked) {
      // Detour route through inland high ground via SH-9 / NH-16 bypass
      distanceKm = 28.4;
      estimatedDurationMinutes = 42;
      routeSafetyStatus = 'SAFE_HIGH_GROUND';
      waypoints = [
        { lat: origin.lat, lng: origin.lng, elevationMeters: 2.1, isFlooded: false, instruction: 'Depart origin heading inland away from coast' },
        { lat: 20.87, lng: 86.78, elevationMeters: 6.8, isFlooded: false, instruction: 'Merge onto State Highway 9 Northward (Elevated Embankment)' },
        { lat: 20.94, lng: 86.75, elevationMeters: 9.4, isFlooded: false, instruction: 'Bypass flooded Basudevpur causeway via Western High Ridge' },
        { lat: destination.lat, lng: destination.lng, elevationMeters: 8.5, isFlooded: false, instruction: 'Arrive safely at Multipurpose Cyclone Shelter' },
      ];
    } else {
      // Direct coastal road route (lower elevation, susceptible to surge)
      distanceKm = 8.6;
      estimatedDurationMinutes = 14;
      routeSafetyStatus = 'CAUTION_PERIMETER';
      waypoints = [
        { lat: origin.lat, lng: origin.lng, elevationMeters: 2.1, isFlooded: false, instruction: 'Depart origin towards coastal road' },
        { lat: 20.89, lng: 86.84, elevationMeters: 1.9, isFlooded: false, instruction: 'Cross Basudevpur Causeway Bridge B-12' },
        { lat: destination.lat, lng: destination.lng, elevationMeters: 8.5, isFlooded: false, instruction: 'Arrive at Cyclone Shelter' },
      ];
    }

    const provenance = buildAndValidateProvenance({
      source: 'Google Maps Routes API (Hazard-Aware Deterministic Mock)',
      sourceType: 'routes_api',
      classification: 'derived',
      isSimulated: true,
      slaKey: 'evacuation_routes',
      confidence: 0.98,
    });

    return {
      provenance,
      origin,
      destination,
      distanceKm,
      estimatedDurationMinutes,
      isDetourRequired: isBridgeBlocked,
      avoidedAssetIds: isBridgeBlocked ? ['BRG-BASUDEVPUR-12'] : [],
      routeSafetyStatus,
      waypoints,
      polylineEncoded: 'mock_encoded_polyline_coastal_odisha_evac_corridor_v4',
    };
  }

  async computeDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>
  ): Promise<DistanceMatrixResponse> {
    const rows: DistanceMatrixItem[] = [];

    origins.forEach((orig, oIdx) => {
      destinations.forEach((dest, dIdx) => {
        const dLat = (dest.lat - orig.lat) * 111;
        const dLng = (dest.lng - orig.lng) * 111;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        rows.push({
          originIndex: oIdx,
          destinationIndex: dIdx,
          distanceKm: Number(dist.toFixed(1)),
          durationMinutes: Math.ceil(dist * 1.5),
          status: 'OK',
        });
      });
    });

    const provenance = buildAndValidateProvenance({
      source: 'Google Maps Distance Matrix API (Mock Grid)',
      sourceType: 'distance_matrix',
      classification: 'derived',
      isSimulated: true,
      confidence: 0.99,
    });

    return {
      provenance,
      rows,
    };
  }

  async geocodeLocation(query: string): Promise<GeocodeResponse> {
    const normalized = query.toLowerCase();
    let formattedAddress = 'Bhadrak, Odisha 756100, India';
    let coordinates = { lat: 20.898, lng: 86.837 };
    let placeId = 'ChIJ_bhadrak_mock_001';

    if (normalized.includes('dhamra') || normalized.includes('port')) {
      formattedAddress = 'Dhamra Port, Bhadrak District, Odisha 756171, India';
      coordinates = { lat: 20.805, lng: 86.953 };
      placeId = 'ChIJ_dhamra_port_mock';
    } else if (normalized.includes('hospital')) {
      formattedAddress = 'Bhadrak District Headquarters Hospital, Bhadrak, Odisha, India';
      coordinates = { lat: 20.902, lng: 86.512 };
      placeId = 'ChIJ_bhadrak_hosp_mock';
    } else if (normalized.includes('shelter') || normalized.includes('basudevpur')) {
      formattedAddress = 'Basudevpur Multi-Purpose Cyclone Shelter, Bhadrak, Odisha, India';
      coordinates = { lat: 20.912, lng: 86.837 };
      placeId = 'ChIJ_shelter_basudevpur_mock';
    }

    const provenance = buildAndValidateProvenance({
      source: 'Google Maps Geocoding API (Mock)',
      sourceType: 'geocoding',
      classification: 'derived',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      provenance,
      query,
      formattedAddress,
      coordinates,
      placeId,
      district: 'Bhadrak',
      state: 'Odisha',
    };
  }
}
