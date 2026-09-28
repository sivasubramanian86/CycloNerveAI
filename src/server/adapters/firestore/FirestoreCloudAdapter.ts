/**
 * CycloNerveAI - Google Cloud Firestore Cloud Adapter
 * Production client connecting to live Google Cloud Firestore using @google-cloud/firestore.
 *
 * Persists four core collections:
 * - /incidents/{basinId}: Live basin telemetry and storm status
 * - /dispatch_authorizations/{authId}: 2FA quorum officer signatures and cryptographic Merkle roots
 * - /audit_worm_ledger/{entryId}: Tamper-evident ledger receipts (write-once)
 * - /public_advisories/{advisoryId}: Multilingual civil protection warnings
 *
 * Statutory Rule: Never fabricate a successful cloud response when an integration fails.
 */

import { Firestore } from '@google-cloud/firestore';
import {
  AuditTraceEvent,
  FirestoreDocumentResponse,
  FirestoreFilter,
  FirestoreQueryResponse,
  FirestoreWriteResponse,
  HealthCheckResult,
  IFirestoreAdapter,
} from '../types.ts';
import {
  buildAndValidateProvenance,
  buildUnavailableProvenance,
} from '../../validation/provenanceValidator.ts';
import { serverConfig } from '../../config/serverConfig.ts';

export const FIRESTORE_COLLECTIONS = {
  INCIDENTS: 'incidents',
  DISPATCH_AUTHORIZATIONS: 'dispatch_authorizations',
  AUDIT_WORM_LEDGER: 'audit_worm_ledger',
  PUBLIC_ADVISORIES: 'public_advisories',
} as const;

export class FirestoreCloudAdapter implements IFirestoreAdapter {
  private readonly projectId?: string;
  private readonly databaseId: string;
  private readonly hasCredentials: boolean;
  private firestoreInstance: Firestore | null = null;

  constructor() {
    this.projectId = serverConfig.firestore.projectId;
    this.databaseId = serverConfig.firestore.databaseId;
    this.hasCredentials = serverConfig.firestore.hasCredentials;
  }

  private getClient(): Firestore | null {
    if (!this.hasCredentials) {
      return null;
    }

    if (!this.firestoreInstance) {
      try {
        const clientOptions: Record<string, unknown> = {
          projectId: this.projectId,
          databaseId: this.databaseId || '(default)',
        };

        if (serverConfig.firestore.clientEmail && serverConfig.firestore.privateKey) {
          clientOptions.credentials = {
            client_email: serverConfig.firestore.clientEmail,
            private_key: serverConfig.firestore.privateKey.replace(/\\n/g, '\n'),
          };
        }

        this.firestoreInstance = new Firestore(clientOptions);
      } catch {
        return null;
      }
    }

    return this.firestoreInstance;
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    if (!this.hasCredentials) {
      return {
        adapterName: 'Cloud Firestore',
        status: 'UNAVAILABLE',
        mode: 'cloud',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        message: 'Firestore cloud credentials not configured (FIREBASE_PROJECT_ID or FIREBASE_PRIVATE_KEY missing).',
        provenance: buildUnavailableProvenance(
          'Google Cloud Firestore (Live)',
          'nosql_cloud_db',
          'Missing credentials'
        ),
        details: { configured: false, databaseId: this.databaseId },
      };
    }

    try {
      if (!this.projectId) {
        throw new Error('Firestore project ID is empty');
      }

      const client = this.getClient();
      if (!client) {
        throw new Error('Unable to initialize @google-cloud/firestore client instance.');
      }

      // Execute a non-mutating ping to verify Firestore connectivity
      const pingPromise = client.listCollections();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firestore connection timed out after 3000ms')), 3000)
      );

      await Promise.race([pingPromise, timeoutPromise]);

      return {
        adapterName: 'Cloud Firestore',
        status: 'HEALTHY',
        mode: 'cloud',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        message: 'Successfully reached Firestore REST endpoint.',
        provenance: buildAndValidateProvenance({
          source: 'Google Cloud Firestore (Live)',
          sourceType: 'nosql_cloud_db',
          classification: 'observed',
          isSimulated: false,
          confidence: 1.0,
        }),
        details: { projectId: this.projectId, databaseId: this.databaseId },
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        adapterName: 'Cloud Firestore',
        status: 'UNAVAILABLE',
        mode: 'cloud',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        message: `Firestore connection failed: ${errMsg}`,
        provenance: buildUnavailableProvenance('Google Cloud Firestore (Live)', 'nosql_cloud_db', errMsg),
      };
    }
  }

  async getDocument<T>(collection: string, docId: string): Promise<FirestoreDocumentResponse<T>> {
    if (!this.hasCredentials) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_doc', 'Credentials missing'),
        exists: false,
        id: docId,
        error: 'Firestore credentials not configured. Refusing to fabricate cloud document state.',
      };
    }

    const client = this.getClient();
    if (!client) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_doc', 'Client init failed'),
        exists: false,
        id: docId,
        error: 'Cloud Firestore client could not be initialized.',
      };
    }

    try {
      const docRef = client.collection(collection).doc(docId);
      const snapshot = await docRef.get();

      if (!snapshot.exists) {
        return {
          provenance: buildAndValidateProvenance({
            source: 'Google Cloud Firestore (Live)',
            sourceType: 'nosql_cloud_db',
            classification: 'observed',
            isSimulated: false,
            confidence: 1.0,
          }),
          exists: false,
          id: docId,
        };
      }

      return {
        provenance: buildAndValidateProvenance({
          source: 'Google Cloud Firestore (Live)',
          sourceType: 'nosql_cloud_db',
          classification: 'observed',
          isSimulated: false,
          confidence: 1.0,
        }),
        exists: true,
        id: docId,
        data: snapshot.data() as T,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_doc', errMsg),
        exists: false,
        id: docId,
        error: `Firestore document fetch failed: ${errMsg}`,
      };
    }
  }

  async queryCollection<T>(
    collection: string,
    filters?: FirestoreFilter[]
  ): Promise<FirestoreQueryResponse<T>> {
    if (!this.hasCredentials) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_collection', 'Credentials missing'),
        collection,
        count: 0,
        documents: [],
        error: 'Firestore credentials missing.',
      };
    }

    const client = this.getClient();
    if (!client) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_collection', 'Client init failed'),
        collection,
        count: 0,
        documents: [],
        error: 'Cloud Firestore client uninitialized.',
      };
    }

    try {
      let queryRef: FirebaseFirestore.Query = client.collection(collection);

      if (filters && filters.length > 0) {
        for (const filter of filters) {
          queryRef = queryRef.where(
            filter.field,
            filter.operator as FirebaseFirestore.WhereFilterOp,
            filter.value
          );
        }
      }

      const querySnapshot = await queryRef.get();
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data() as T,
      }));

      return {
        provenance: buildAndValidateProvenance({
          source: 'Google Cloud Firestore (Live)',
          sourceType: 'nosql_cloud_db',
          classification: 'observed',
          isSimulated: false,
          confidence: 1.0,
        }),
        collection,
        count: documents.length,
        documents,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_collection', errMsg),
        collection,
        count: 0,
        documents: [],
        error: `Failed to query cloud Firestore collection: ${errMsg}`,
      };
    }
  }

  async saveDocument<T>(
    collection: string,
    docId: string,
    data: T
  ): Promise<FirestoreWriteResponse> {
    if (!this.hasCredentials) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_write', 'Credentials missing'),
        success: false,
        documentId: docId,
        writtenAt: new Date().toISOString(),
        version: 0,
        error: 'Cannot persist to cloud Firestore without valid credentials.',
      };
    }

    const client = this.getClient();
    if (!client) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_write', 'Client init failed'),
        success: false,
        documentId: docId,
        writtenAt: new Date().toISOString(),
        version: 0,
        error: 'Firestore client not initialized.',
      };
    }

    try {
      const docRef = client.collection(collection).doc(docId);
      await docRef.set(data as any, { merge: true });

      return {
        provenance: buildAndValidateProvenance({
          source: 'Google Cloud Firestore (Live)',
          sourceType: 'nosql_cloud_db',
          classification: 'observed',
          isSimulated: false,
          confidence: 1.0,
        }),
        success: true,
        documentId: docId,
        writtenAt: new Date().toISOString(),
        version: 1,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'nosql_write', errMsg),
        success: false,
        documentId: docId,
        writtenAt: new Date().toISOString(),
        version: 0,
        error: `Cloud Firestore document write failed: ${errMsg}`,
      };
    }
  }

  /**
   * Append WORM (Write Once, Read Many) tamper-evident audit receipt.
   * Uses doc.create() to guarantee immutability (fails if document ID already exists).
   */
  async appendAuditLog(log: AuditTraceEvent): Promise<FirestoreWriteResponse> {
    if (!this.hasCredentials) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'audit_log', 'Credentials missing'),
        success: false,
        documentId: log.traceId,
        writtenAt: new Date().toISOString(),
        version: 0,
        error: 'WORM audit log write failed: Cloud Firestore credentials missing.',
      };
    }

    const client = this.getClient();
    if (!client) {
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'audit_log', 'Client init failed'),
        success: false,
        documentId: log.traceId,
        writtenAt: new Date().toISOString(),
        version: 0,
        error: 'Firestore client not initialized for WORM audit log.',
      };
    }

    try {
      const docRef = client.collection(FIRESTORE_COLLECTIONS.AUDIT_WORM_LEDGER).doc(log.traceId);
      // create() strictly enforces write-once immutability
      await docRef.create({
        ...log,
        immutableCommittedAt: new Date().toISOString(),
      });

      return {
        provenance: buildAndValidateProvenance({
          source: 'Google Cloud Firestore (WORM Ledger)',
          sourceType: 'nosql_cloud_db',
          classification: 'observed',
          isSimulated: false,
          confidence: 1.0,
        }),
        success: true,
        documentId: log.traceId,
        writtenAt: new Date().toISOString(),
        version: 1,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        provenance: buildUnavailableProvenance('Cloud Firestore', 'audit_log', errMsg),
        success: false,
        documentId: log.traceId,
        writtenAt: new Date().toISOString(),
        version: 0,
        error: `WORM audit log write failed: ${errMsg}`,
      };
    }
  }

  // Domain persistence helpers for the 4 core collections
  async saveIncidentTelemetry(basinId: string, telemetry: unknown): Promise<FirestoreWriteResponse> {
    return this.saveDocument(FIRESTORE_COLLECTIONS.INCIDENTS, basinId, telemetry);
  }

  async saveDispatchAuthorization(authId: string, authorization: unknown): Promise<FirestoreWriteResponse> {
    return this.saveDocument(FIRESTORE_COLLECTIONS.DISPATCH_AUTHORIZATIONS, authId, authorization);
  }

  async publishPublicAdvisory(advisoryId: string, advisory: unknown): Promise<FirestoreWriteResponse> {
    return this.saveDocument(FIRESTORE_COLLECTIONS.PUBLIC_ADVISORIES, advisoryId, advisory);
  }
}
