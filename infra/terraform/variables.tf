/**
 * CycloNerveAI - Terraform Variable Definitions
 */

variable "project_id" {
  type        = string
  description = "The Google Cloud Project ID"
  default     = "cyclonerve-ai-prod"
}

variable "region" {
  type        = string
  description = "The primary Google Cloud region for compute and networking resources"
  default     = "asia-south1" # Primary EOC region (Mumbai/India for Bay of Bengal coverage)
}

variable "environment" {
  type        = string
  description = "Deployment environment (prod, staging, dev)"
  default     = "prod"
}

variable "container_image" {
  type        = string
  description = "Artifact Registry container image URI for CycloNerveAI server"
  default     = "asia-south1-docker.pkg.dev/cyclonerve-ai-prod/cyclonerve/app:latest"
}
