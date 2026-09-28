/**
 * CycloNerveAI - Server-Side Environment Configuration Loader
 * Keeps all cloud credentials securely on the server.
 * Never leaks API keys, service account secrets, or private keys to the client.
 */

export interface AdapterConfig {
  mode: 'mock' | 'cloud';
  projectId?: string;
  hasCredentials: boolean;
}

export interface ServerEnvironmentConfig {
  nodeEnv: string;
  port: number;
  appUrl: string;
  globalAdapterMode: 'mock' | 'cloud';
  useMockAdapters: boolean;
  gemini: {
    apiKey?: string;
    model: string;
    killSwitchActive: boolean;
  };
  earthEngine: AdapterConfig & {
    serviceAccount?: string;
    hasPrivateKey: boolean;
  };
  bigQuery: AdapterConfig & {
    dataset: string;
  };
  firebaseAuth: AdapterConfig & {
    clientEmail?: string;
  };
  firestore: AdapterConfig & {
    databaseId: string;
    clientEmail?: string;
    privateKey?: string;
  };
  cloudStorage: AdapterConfig & {
    bucketName: string;
  };
  googleMaps: AdapterConfig & {
    hasApiKey: boolean;
  };
  advisoryDispatch: AdapterConfig & {
    cellBroadcastCenterUrl?: string;
    hasSmsApiKey: boolean;
    hasWhatsAppToken: boolean;
  };
}

function resolveMode(specificEnvVar?: string, globalMode = 'mock', defaultUseMocks = true): 'mock' | 'cloud' {
  if (specificEnvVar === 'cloud') return 'cloud';
  if (specificEnvVar === 'mock') return 'mock';
  if (!defaultUseMocks && globalMode === 'cloud') return 'cloud';
  return 'mock';
}

export function loadServerConfig(): ServerEnvironmentConfig {
  const globalMode = (process.env.ADAPTER_MODE || 'mock').toLowerCase() === 'cloud' ? 'cloud' : 'mock';
  const useMocksDefault = process.env.USE_MOCK_ADAPTERS !== 'false';

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    globalAdapterMode: globalMode,
    useMockAdapters: useMocksDefault,

    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
      killSwitchActive: process.env.GLOBAL_AI_KILL_SWITCH === 'true',
    },

    earthEngine: {
      mode: resolveMode(process.env.EARTH_ENGINE_MODE, globalMode, useMocksDefault),
      projectId: process.env.EARTH_ENGINE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      serviceAccount: process.env.EARTH_ENGINE_SERVICE_ACCOUNT,
      hasPrivateKey: Boolean(process.env.EARTH_ENGINE_PRIVATE_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS),
      hasCredentials: Boolean(
        (process.env.EARTH_ENGINE_SERVICE_ACCOUNT && process.env.EARTH_ENGINE_PRIVATE_KEY) ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.K_SERVICE
      ),
    },

    bigQuery: {
      mode: resolveMode(process.env.BIGQUERY_MODE, globalMode, useMocksDefault),
      projectId: process.env.BIGQUERY_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      dataset: process.env.BIGQUERY_DATASET || 'cyclonerve_spatial_odisha',
      hasCredentials: Boolean(
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.BIGQUERY_PROJECT_ID ||
        process.env.K_SERVICE ||
        process.env.GOOGLE_CLOUD_PROJECT
      ),
    },

    firebaseAuth: {
      mode: resolveMode(process.env.FIREBASE_AUTH_MODE, globalMode, useMocksDefault),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      hasCredentials: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY),
    },

    firestore: {
      mode: resolveMode(process.env.FIRESTORE_MODE, globalMode, useMocksDefault),
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      hasCredentials: Boolean(
        (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) ||
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.K_SERVICE ||
        process.env.GOOGLE_CLOUD_PROJECT
      ),
    },

    cloudStorage: {
      mode: resolveMode(process.env.CLOUD_STORAGE_MODE, globalMode, useMocksDefault),
      projectId: process.env.GCS_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
      bucketName: process.env.GCS_BUCKET_NAME || 'cyclonerve-disaster-assets',
      hasCredentials: Boolean(
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.GCS_BUCKET_NAME ||
        process.env.K_SERVICE ||
        process.env.GOOGLE_CLOUD_PROJECT
      ),
    },

    googleMaps: {
      mode: resolveMode(process.env.GOOGLE_MAPS_MODE, globalMode, useMocksDefault),
      hasApiKey: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      hasCredentials: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    },

    advisoryDispatch: {
      mode: resolveMode(process.env.ADVISORY_DISPATCH_MODE, globalMode, useMocksDefault),
      cellBroadcastCenterUrl: process.env.CELL_BROADCAST_CENTER_URL,
      hasSmsApiKey: Boolean(process.env.SMS_GATEWAY_API_KEY),
      hasWhatsAppToken: Boolean(process.env.WHATSAPP_BUSINESS_API_TOKEN),
      hasCredentials: Boolean(process.env.CELL_BROADCAST_CENTER_URL || process.env.SMS_GATEWAY_API_KEY),
    },
  };
}

export const serverConfig = loadServerConfig();
