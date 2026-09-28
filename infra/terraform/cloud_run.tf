/**
 * CycloNerveAI - Production Google Cloud Run (v2) Service
 * Serverless container deployment with private VPC connector and IAM least privilege.
 */

resource "google_service_account" "cyclonerve_sa" {
  account_id   = "cyclonerve-app-sa-${var.environment}"
  display_name = "CycloNerveAI Production Workload Service Account"
  description  = "Least-privilege service account for CycloNerveAI Cloud Run and Firestore access"
}

# IAM Role: Firestore User
resource "google_project_iam_member" "firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cyclonerve_sa.email}"
}

# IAM Role: Vertex AI User (for Gemini 2.5 Flash and Model Armor)
resource "google_project_iam_member" "vertex_ai_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.cyclonerve_sa.email}"
}

resource "google_cloud_run_v2_service" "cyclonerve_service" {
  name     = "cyclonerve-ai-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    service_account = google_service_account.cyclonerve_sa.email

    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = 20
    }

    vpc_access {
      connector = google_vpc_access_connector.serverless_connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = var.container_image

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "8080"
      }
      env {
        name  = "ADAPTER_MODE"
        value = "cloud"
      }
      env {
        name  = "USE_MOCK_ADAPTERS"
        value = "false"
      }
      env {
        name  = "GEMINI_MODEL"
        value = "gemini-2.5-flash"
      }
      env {
        name  = "FIRESTORE_DATABASE_ID"
        value = "(default)"
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }

      startup_probe {
        http_get {
          path = "/api/health"
          port = 8080
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/api/health"
          port = 8080
        }
        period_seconds    = 15
        timeout_seconds   = 5
        failure_threshold = 3
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# Serverless Network Endpoint Group (NEG) pointing to the Cloud Run service
resource "google_compute_region_network_endpoint_group" "serverless_neg" {
  name                  = "cyclonerve-serverless-neg-${var.region}"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_v2_service.cyclonerve_service.name
  }
}
