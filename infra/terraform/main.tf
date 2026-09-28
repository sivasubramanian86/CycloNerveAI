/**
 * CycloNerveAI - Production Infrastructure Architecture
 * Main Terraform configuration for GCP deployment.
 */

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.30"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# -------------------------------------------------------------
# VPC Network & Serverless Connector for Private Cloud Egress
# -------------------------------------------------------------

resource "google_compute_network" "cyclonerve_vpc" {
  name                    = "cyclonerve-vpc-${var.environment}"
  auto_create_subnetworks = false
  description             = "VPC network for CycloNerveAI mission-critical coastal lifeline orchestration"
}

resource "google_compute_subnetwork" "cyclonerve_subnet" {
  name          = "cyclonerve-subnet-${var.region}"
  ip_cidr_range = "10.10.0.0/24"
  region        = var.region
  network       = google_compute_network.cyclonerve_vpc.id
}

# Subnet dedicated for Serverless VPC Access Connector (/28 required)
resource "google_compute_subnetwork" "connector_subnet" {
  name          = "cyclonerve-vpc-connector-subnet"
  ip_cidr_range = "10.10.10.0/28"
  region        = var.region
  network       = google_compute_network.cyclonerve_vpc.id
}

resource "google_vpc_access_connector" "serverless_connector" {
  name          = "cyclonerve-connector"
  region        = var.region
  subnet {
    name = google_compute_subnetwork.connector_subnet.name
  }
  min_instances = 2
  max_instances = 5
  machine_type  = "e2-micro"
}
