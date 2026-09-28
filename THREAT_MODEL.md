# Threat Model - CycloNerveAI

## 1. System Overview & Trust Boundaries

CycloNerveAI operates across multiple distinct trust boundaries:
1. **Public / Untrusted Zone:** Web browsers, field operators submitting ground photos, citizen mobile users receiving public cell broadcasts.
2. **DMZ / Ingress Layer:** Cloud Run reverse proxy, rate limiters, security headers, request sanitization middleware.
3. **Application Core (Trust Tier 1):** Deterministic risk engine, cascade DAG propagator, human-in-the-loop approval gatekeeper, WORM audit log.
4. **AI & Model Orchestration (Trust Tier 2):** Google Gemini 3.7 Flash, multimodal evidence fusion, and Safety Verifier.
5. **Data & Storage Persistence (Trust Tier 3):** Google Earth Engine, BigQuery, Firestore, Cloud Storage, Carrier Gateways.

```
+-----------------------------------------------------------------------------------+
|                              UNTRUSTED ZONE                                       |
|  [Citizen Browsers]   [Field Telemetry Apps]   [External Public Cell Broadcasts]  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / TLS 1.3
                                           v
+-----------------------------------------------------------------------------------+
|                             INGRESS / DMZ LAYER                                   |
|  - Defensive Security Headers (CSP, HSTS, nosniff, SAMEORIGIN)                    |
|  - Sliding-Window Rate Limiters (Global, Auth, Dispatch, Upload)                  |
|  - Request Body Sanitization & Prompt-Injection Guardrails                        |
+------------------------------------------+----------------------------------------+
                                           | Internal Express Middleware
                                           v
+-----------------------------------------------------------------------------------+
|                        APPLICATION CORE & APPROVAL GATE                           |
|  - Role-Based Access Control (Viewer / Analyst / Field Officer / Commander / Admin)|
|  - Statutory Human-in-the-Loop Approval Gatekeeper                                |
|  - Dual-Officer FIDO2 / 2FA Cryptographic Authorization                           |
|  - Deterministic Risk Arithmetic (H * E * V * C) & DAG Cascade Engine             |
|  - Cryptographic Append-Only WORM Audit Trail (SHA-256 Merkle Chain)              |
+---------------------+-------------------------------+-----------------------------+
                      |                               |
                      v                               v
+-----------------------------+     +-----------------------------------------------+
|     AI ORCHESTRATION        |     |          DATA & CLOUD PERSISTENCE             |
| - Gemini 3.7 Flash API      |     | - Replaceable Adapter Architecture (Mock/Live)|
| - Multimodal Fusion         |     | - Google Earth Engine (SAR Inundation)        |
| - Two-Tier Safety Verifier  |     | - BigQuery (Geospatial Critical Assets)       |
| - One-Retry Max + Fallback  |     | - Firestore / Cloud Storage / CAP Gateways    |
| - Global AI Kill Switch     |     | - Air-Gapped Fallback (TIER_3_AIRGAPPED_EDGE) |
+-----------------------------+     +-----------------------------------------------+
```

---

## 2. STRIDE Threat Analysis & Mitigations

### S - Spoofing Identity
* **Threat:** Malicious actor impersonates an Incident Commander or Administrator to approve or broadcast unauthorized evacuation orders.
* **Mitigations:**
  - Strict RBAC on all state-changing endpoints (`/api/advisories/approve`, `/api/advisories/dispatch`, `/api/scenarios/change`).
  - Mandatory Dual-Officer cryptographic authorization (two distinct authenticated officers with separate key digests).
  - Normalization of all unrecognized roles to `Viewer` (least privilege).
  - Simulated records strictly labeled with `isSimulated: true`.

### T - Tampering with Data
* **Threat 1:** Adversary alters risk scores or suppresses critical substation failure alerts in transit.
  - **Mitigation:** Composite risk arithmetic ($H \times E \times V \times C$) is computed deterministically in code, never delegated to generative models.
* **Threat 2:** Adversary tampers with historical incident logs to erase evidence of negligence.
  - **Mitigation:** Write-Once-Read-Many (WORM) audit logging service where each log entry contains a SHA-256 Merkle hash linking to the preceding entry. Any alteration invalidates the cryptographic chain verified by `/api/security/audit-verify`.

### R - Repudiation
* **Threat:** Incident Commander denies authorizing an evacuation siren broadcast or emergency override.
* **Mitigations:**
  - Every approval and dispatch records an immutable audit record containing actor ID, officer displayName, role, FIPS key ID, timestamp, and Merkle leaf hash.
  - Emergency overrides require mandatory statutory justification (minimum 20 characters) and statutory legal act citation.

### I - Information Disclosure
* **Threat 1:** Internal server errors leak database credentials, service account keys, or API tokens to client browsers.
  - **Mitigation:** Safe error handler masks all 500-level errors with generic incident desk messages. Sensitive data redactor masks passwords, PINs, tokens, and private keys from all logs.
* **Threat 2:** Cloud service account keys stored in client source code.
  - **Mitigation:** Server-Side Adapter Architecture keeps all cloud credentials strictly in server environment variables. Zero client-side API keys.

### D - Denial of Service (DoS)
* **Threat:** Coordinated botnet floods advisory dispatch or upload endpoints during an impending cyclone landfall.
* **Mitigations:**
  - Sliding-window rate limiters throttling abusive IP addresses across global, dispatch, auth, and upload tiers.
  - Express payload size capped at 15MB.
  - Offline adapter fallback: If upstream cloud services become unavailable or latency exceeds thresholds, the system seamlessly transitions between `TIER_0_CLOUD_EDGE` and `TIER_3_AIRGAPPED_EDGE` without halting operations.

### E - Elevation of Privilege
* **Threat 1:** A Viewer or Analyst attempts to execute scenario changes or siren dispatches.
  - **Mitigation:** Programmatic middleware (`requirePermission('ADVISORY_DISPATCH')`) blocks non-commanders with HTTP `403 Forbidden`.
* **Threat 2:** Adversary exploits prompt-injection in field observations to trick the generative AI into overriding system rules (`[SYSTEM_OVERRIDE]`, `DAN mode`).
  - **Mitigation:** Ingress prompt inspection catches known adversarial patterns before sending text to the model. Downstream Safety Verifier checks draft outputs against ground truth and enforces a strict 1-retry maximum before falling back to verified deterministic templates.
