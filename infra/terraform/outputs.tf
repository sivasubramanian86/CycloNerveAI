/**
 * CycloNerveAI - Terraform Outputs
 */

output "load_balancer_ip" {
  description = "Public IPv4 address of the Cloud Armor-protected External Application Load Balancer"
  value       = google_compute_global_forwarding_rule.cyclonerve_forwarding_rule.ip_address
}

output "cloud_run_service_name" {
  description = "Name of the provisioned Cloud Run v2 service"
  value       = google_cloud_run_v2_service.cyclonerve_service.name
}

output "cloud_run_service_uri" {
  description = "Direct URI of the Cloud Run v2 service"
  value       = google_cloud_run_v2_service.cyclonerve_service.uri
}

output "cloud_armor_policy_id" {
  description = "Unique ID of the Cloud Armor WAF security policy"
  value       = google_compute_security_policy.cyclonerve_edge_waf.id
}

output "vpc_connector_name" {
  description = "Name of the Serverless VPC Access connector"
  value       = google_vpc_access_connector.serverless_connector.name
}
