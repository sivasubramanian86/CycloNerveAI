/**
 * CycloNerveAI - Production Cloud Load Balancer
 * Global External Application Load Balancer integrated with Cloud Armor WAF and Serverless NEG.
 */

resource "google_compute_backend_service" "cyclonerve_backend" {
  name                  = "cyclonerve-backend-service-${var.environment}"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  enable_cdn            = false
  load_balancing_scheme = "EXTERNAL_MANAGED"
  security_policy       = google_compute_security_policy.cyclonerve_edge_waf.id

  backend {
    group = google_compute_region_network_endpoint_group.serverless_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_url_map" "cyclonerve_url_map" {
  name            = "cyclonerve-url-map-${var.environment}"
  default_service = google_compute_backend_service.cyclonerve_backend.id
}

resource "google_compute_target_http_proxy" "cyclonerve_http_proxy" {
  name    = "cyclonerve-http-proxy-${var.environment}"
  url_map = google_compute_url_map.cyclonerve_url_map.id
}

resource "google_compute_global_forwarding_rule" "cyclonerve_forwarding_rule" {
  name                  = "cyclonerve-forwarding-rule-${var.environment}"
  target                = google_compute_target_http_proxy.cyclonerve_http_proxy.id
  port_range            = "80"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  ip_protocol           = "TCP"
}

# Grant Cloud Run invoker permission to the load balancer / public ingress
resource "google_cloud_run_service_iam_member" "public_run_invoker" {
  location = var.region
  service  = google_cloud_run_v2_service.cyclonerve_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
