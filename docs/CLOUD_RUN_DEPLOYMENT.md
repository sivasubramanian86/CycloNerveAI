# Google Cloud Run Deployment Guide - CycloNerveAI

This guide provides end-to-end production deployment instructions for running **CycloNerveAI** on **Google Cloud Run** using containerized microservices and Google Cloud Secret Manager.

---

## Architecture Overview on Cloud Run

In Google Cloud Run, CycloNerveAI runs as a fully managed, stateless container with automated HTTPS, scale-to-zero during peacetime, and instant elasticity during cyclone emergencies:

```
[Internet / EOC Stations]
            |
            v
   Google Cloud Armor (DDoS / WAF)
            |
            v
   Cloud Run Service: cyclonerve-ai
   - Multi-stage Node.js 22 LTS container
   - Non-root user execution (`USER node`)
   - Healthcheck on `/api/health`
            |
            +---> Secret Manager (API Keys, Service Account Credentials)
            +---> Google Earth Engine (Copernicus Sentinel-1 SAR)
            +---> BigQuery (Geospatial Critical Infrastructure Data)
            +---> Firebase Authentication & Firestore (WORM Audit Trail)
            +---> Google Cloud Storage (SAR GeoTIFF Inundation Rasters)
            +---> Google Maps Platform (Evacuation Route Computations)
```

---

## 1. Prerequisites

1. **Google Cloud SDK (`gcloud` CLI)** installed and authenticated:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```
2. **Artifact Registry & Cloud Run APIs enabled**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     secretmanager.googleapis.com \
     cloudbuild.googleapis.com
   ```
3. **Artifact Registry Repository created**:
   ```bash
   gcloud artifacts repositories create cyclonerve-repo \
     --repository-format=docker \
     --location=asia-south1 \
     --description="CycloNerveAI Docker repository"
   ```

---

## 2. Configure Google Cloud Secret Manager

Store sensitive credentials securely in Secret Manager so no keys exist in plaintext:

```bash
# 1. Store Gemini API Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create cyclonerve-gemini-key \
  --data-file=- \
  --replication-policy="automatic"

# 2. Grant Cloud Run Service Account access to secrets
PROJECT_NUMBER=$(gcloud projects describe YOUR_GCP_PROJECT_ID --format='value(projectNumber)')
RUN_SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

gcloud secrets add-iam-policy-binding cyclonerve-gemini-key \
  --member="serviceAccount:${RUN_SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Build & Push Container Image

Build the container image using Google Cloud Build (or locally via Docker):

```bash
# Build and push to Artifact Registry
gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/cyclonerve-repo/cyclonerve-app:latest .
```

---

## 4. Deploy to Google Cloud Run

### Option A: Standard Deployment (Mock / Simulation Mode)
Default deployment operating with zero-dependency simulated adapters:

```bash
gcloud run deploy cyclonerve-ai \
  --image asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/cyclonerve-repo/cyclonerve-app:latest \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production,PORT=3000,ADAPTER_MODE=mock,USE_MOCK_ADAPTERS=true" \
  --set-secrets="GEMINI_API_KEY=cyclonerve-gemini-key:latest"
```

### Option B: Mission-Critical Cyclone Watch Deployment (High Availability)
During active tropical cyclone watches (T-72h), maintain warm instances to eliminate cold starts:

```bash
gcloud run deploy cyclonerve-ai \
  --image asia-south1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/cyclonerve-repo/cyclonerve-app:latest \
  --region asia-south1 \
  --platform managed \
  --port 3000 \
  --memory 4Gi \
  --cpu 4 \
  --min-instances 2 \
  --max-instances 50 \
  --concurrency 80 \
  --timeout 300 \
  --set-env-vars="NODE_ENV=production,PORT=3000,ADAPTER_MODE=cloud,USE_MOCK_ADAPTERS=false" \
  --set-secrets="GEMINI_API_KEY=cyclonerve-gemini-key:latest"
```

---

## 5. Verification & Health Monitoring

Verify the deployed Cloud Run instance using the integrated health endpoint:

```bash
# Obtain Cloud Run Service URL
SERVICE_URL=$(gcloud run services describe cyclonerve-ai --region asia-south1 --format='value(status.url)')

# Query aggregated adapter health
curl -s "${SERVICE_URL}/api/health" | jq .

# Query system control state
curl -s "${SERVICE_URL}/api/system/controls" | jq .
```

Expected health check response:
```json
{
  "overallStatus": "HEALTHY",
  "calculatedResilienceTier": "TIER_0_CLOUD_EDGE",
  "adapterCount": {
    "total": 7,
    "healthy": 7,
    "degraded": 0,
    "unavailable": 0
  }
}
```

---

## 6. Continuous Deployment via GitHub Actions

To enable automatic continuous deployment from GitHub:
1. Create a Google Cloud Workload Identity Federation pool.
2. Grant the GitHub Actions service account `roles/run.admin` and `roles/iam.serviceAccountUser`.
3. Add the GitHub Actions workflow in `.github/workflows/deploy-cloud-run.yml`.
