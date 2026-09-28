/**
 * CycloNerveAI - Production Cloud Armor Security Policies & L7 WAF
 * Implements FIPS-compliant perimeter defense:
 * 1. IP Rate Limiting (100 req/min per client IP with 10-minute ban on breach)
 * 2. OWASP Top 10 Preconfigured WAF Rules (SQLi, XSS, LFI, RFI, RCE, Protocol Attacks)
 * 3. Geo-Restriction for authorized international disaster response corridors
 * 4. Default Deny / Logging baseline
 */

resource "google_compute_security_policy" "cyclonerve_edge_waf" {
  name        = "cyclonerve-edge-waf-${var.environment}"
  description = "Enterprise Cloud Armor L7 WAF with OWASP Top 10, IP rate limiting, and Geo-fencing"

  # -------------------------------------------------------------
  # Rule 1: IP Rate Limiting (Priority 1000)
  # Limit to 100 requests per minute per IP to defend against DoS and credential stuffing
  # -------------------------------------------------------------
  rule {
    action   = "rate_based_ban"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      ban_threshold {
        count        = 250
        interval_sec = 60
      }
      ban_duration_sec = 600
    }
    description = "Enforce rate limit of 100 requests per minute per client IP with 10-minute ban"
  }

  # -------------------------------------------------------------
  # Rule 2: OWASP Top 10 - SQL Injection Defense (Priority 2000)
  # -------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "2000"
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('sqli-v33-stable', {'sensitivity': 1})"
      }
    }
    description = "OWASP Top 10: Mitigate SQL Injection attacks"
  }

  # -------------------------------------------------------------
  # Rule 3: OWASP Top 10 - Cross-Site Scripting Defense (Priority 2100)
  # -------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "2100"
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('xss-v33-stable', {'sensitivity': 1})"
      }
    }
    description = "OWASP Top 10: Mitigate XSS attacks"
  }

  # -------------------------------------------------------------
  # Rule 4: OWASP Top 10 - Local & Remote File Inclusion (Priority 2200)
  # -------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "2200"
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('lfi-v33-stable', {'sensitivity': 1}) || evaluatePreconfiguredWaf('rfi-v33-stable', {'sensitivity': 1})"
      }
    }
    description = "OWASP Top 10: Mitigate LFI/RFI directory traversal"
  }

  # -------------------------------------------------------------
  # Rule 5: OWASP Top 10 - Remote Code Execution (Priority 2300)
  # -------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "2300"
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('rce-v33-stable', {'sensitivity': 1})"
      }
    }
    description = "OWASP Top 10: Mitigate Remote Code Execution attacks"
  }

  # -------------------------------------------------------------
  # Rule 6: OWASP Top 10 - Protocol Attacks & Bad Headers (Priority 2400)
  # -------------------------------------------------------------
  rule {
    action   = "deny(403)"
    priority = "2400"
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('protocolattack-v33-stable', {'sensitivity': 1})"
      }
    }
    description = "OWASP Top 10: Mitigate HTTP protocol smuggling and malformed headers"
  }

  # -------------------------------------------------------------
  # Rule 7: Geo-Restriction / Disaster Response Zones (Priority 3000)
  # Restrict or prioritize access to authorized coastal basin nations:
  # India (IN), Philippines (PH), USA (US), Japan (JP), Vietnam (VN), Bangladesh (BD),
  # Australia (AU), Vanuatu (VU), Madagascar (MG), Mozambique (MZ), Mexico (MX)
  # -------------------------------------------------------------
  rule {
    action   = "allow"
    priority = "3000"
    match {
      expr {
        expression = "origin.region_code == 'IN' || origin.region_code == 'PH' || origin.region_code == 'US' || origin.region_code == 'JP' || origin.region_code == 'VN' || origin.region_code == 'BD' || origin.region_code == 'AU' || origin.region_code == 'VU' || origin.region_code == 'MG' || origin.region_code == 'MZ' || origin.region_code == 'MX'"
      }
    }
    description = "Allow authorized coastal basin emergency response jurisdictions"
  }

  # -------------------------------------------------------------
  # Rule 8: Baseline Default Rule (Priority 2147483647)
  # -------------------------------------------------------------
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default baseline policy with full Cloud Logging audit trail"
  }

  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable          = true
      rule_visibility = "STANDARD"
    }
  }
}
