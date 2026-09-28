/**
 * CycloNerveAI - Google Cloud Storage Mock Adapter
 * In-memory binary/text blob store simulating GCS buckets, signed URLs,
 * and artifact provenance for satellite GeoTIFFs, field photos, and advisory manifests.
 */

import {
  HealthCheckResult,
  ICloudStorageAdapter,
  StorageMetadataResponse,
  StorageSignedUrlResponse,
  StorageUploadResponse,
} from '../types.ts';
import { buildAndValidateProvenance } from '../../validation/provenanceValidator.ts';

interface StoredBlob {
  content: Buffer | string;
  contentType: string;
  sizeBytes: number;
  md5Hash: string;
  updatedAt: string;
  metadata?: Record<string, string>;
}

export class CloudStorageMockAdapter implements ICloudStorageAdapter {
  private readonly bucketName = 'cyclonerve-disaster-assets-mock';
  private readonly blobs: Map<string, StoredBlob> = new Map();

  constructor() {
    this.seedDefaultArtifacts();
  }

  private seedDefaultArtifacts(): void {
    // Seed Sentinel-1 SAR GeoTIFF mock
    this.blobs.set('sar/dhamra-inundation-sentinel1.tif', {
      content: 'MOCK_GEOTIFF_BINARY_STREAM_SENTINEL1_SAR_POLARIZATION_VV_VH',
      contentType: 'image/tiff',
      sizeBytes: 1048576 * 4.2, // 4.2 MB
      md5Hash: '9a5f4c8b2e1d0a3f7c6e5d4b3a2f1e0d',
      updatedAt: '2025-10-25T03:32:00Z',
      metadata: { satellite: 'Sentinel-1A', pass: 'Ascending', orbit: '1244' },
    });

    // Seed field drone damage photo mock
    this.blobs.set('drone/basudevpur-floodwall-breach.jpg', {
      content: 'MOCK_JPEG_DRONE_SURVEY_BASUDEVPUR_PUMP_STATION',
      contentType: 'image/jpeg',
      sizeBytes: 1048576 * 2.1,
      md5Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      updatedAt: '2025-10-25T04:15:00Z',
      metadata: { altitudeAmsl: '45m', gpsFix: 'RTK_FIXED' },
    });

    // Seed CAP-v1.2 XML dispatch archive
    this.blobs.set('dispatches/adv-2025-089-cap.xml', {
      content: '<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2"><identifier>ADV-2025-089</identifier></alert>',
      contentType: 'application/xml',
      sizeBytes: 8192,
      md5Hash: 'f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9',
      updatedAt: '2025-10-25T05:00:00Z',
    });
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let totalStorageBytes = 0;
    this.blobs.forEach((b) => {
      totalStorageBytes += b.sizeBytes;
    });

    const provenance = buildAndValidateProvenance({
      source: 'Google Cloud Storage (Mock Bucket Engine)',
      sourceType: 'cloud_object_storage',
      classification: 'simulated',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      adapterName: 'Google Cloud Storage',
      status: 'HEALTHY',
      mode: 'mock',
      latencyMs: Date.now() - startTime + 1,
      lastChecked: new Date().toISOString(),
      message: 'Cloud Storage Mock operational. Seeded with SAR rasters and drone reconnaissance imagery.',
      provenance,
      details: {
        bucket: this.bucketName,
        totalObjects: this.blobs.size,
        totalBytesStored: totalStorageBytes,
      },
    };
  }

  async uploadArtifact(
    path: string,
    content: Buffer | string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<StorageUploadResponse> {
    const sizeBytes = typeof content === 'string' ? Buffer.byteLength(content) : content.length;
    const md5Hash = `md5-mock-${Date.now().toString(16)}`;

    this.blobs.set(path, {
      content,
      contentType,
      sizeBytes,
      md5Hash,
      updatedAt: new Date().toISOString(),
      metadata,
    });

    const provenance = buildAndValidateProvenance({
      source: `Google Cloud Storage (${this.bucketName}/${path})`,
      sourceType: 'object_upload',
      classification: 'observed',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      provenance,
      success: true,
      bucket: this.bucketName,
      objectPath: path,
      sizeBytes,
      contentType,
      md5Hash,
      publicUrl: `/api/storage/artifacts?path=${encodeURIComponent(path)}`,
    };
  }

  async getSignedUrl(path: string, expiresInMinutes = 60): Promise<StorageSignedUrlResponse> {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
    const signedUrl = `/api/storage/artifacts?path=${encodeURIComponent(path)}&token=mock-signed-sig-${Date.now()}`;

    const provenance = buildAndValidateProvenance({
      source: `Google Cloud Storage (Signed URL Engine)`,
      sourceType: 'signed_url_v4',
      classification: 'derived',
      isSimulated: true,
      confidence: 1.0,
    });

    return {
      provenance,
      signedUrl,
      expiresAt,
      objectPath: path,
      bucket: this.bucketName,
    };
  }

  async getArtifactMetadata(path: string): Promise<StorageMetadataResponse> {
    const blob = this.blobs.get(path);

    const provenance = buildAndValidateProvenance({
      source: `Google Cloud Storage Metadata (${this.bucketName}/${path})`,
      sourceType: 'object_metadata',
      classification: 'observed',
      isSimulated: true,
      confidence: 1.0,
    });

    if (!blob) {
      return {
        provenance,
        exists: false,
        objectPath: path,
      };
    }

    return {
      provenance,
      exists: true,
      objectPath: path,
      sizeBytes: blob.sizeBytes,
      contentType: blob.contentType,
      updatedAt: blob.updatedAt,
      md5Hash: blob.md5Hash,
    };
  }
}
