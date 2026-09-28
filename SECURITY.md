# Security Policy & Hardening Controls - CycloNerveAI

## Security Philosophy

CycloNerveAI is architected for mission-critical emergency management environments where incorrect information, unauthorized dispatch, or data tampering can lead to loss of life or catastrophic infrastructure failure. The security model enforces **Zero Trust**, **Statutory Separation of Duties**, **Cryptographic Auditability**, and **Defense-in-Depth**.

---

## Reporting a Security Vulnerability

If you discover a potential security vulnerability within CycloNerveAI, please report it immediately:

- **Email:** `security-operations@cyclonerve.gov.in` (or incident desk)
- **Encryption:** Use PGP Key ID `0x9482A1B7F0E28491`
- **Response Timeline:** Acknowledgment within **12 hours**; remediation patch within **48 hours** for critical vulnerabilities.

Please **do not** create public GitHub issues for security vulnerabilities.

---

## Statutory Role-Based Access Control (RBAC)

CycloNerveAI enforces strict role isolation across emergency operations personnel:

| Role | Scenario Modification | Advisory Drafting | Advisory Approval | Advisory Dispatch | Emergency Override | Kill Switch Control |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Viewer** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Analyst** | ❌ Forbidden | ✅ Permitted | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Field Officer** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Incident Commander** | ✅ Permitted | ✅ Permitted | ✅ (Requires Evidence Review) | ✅ (Requires Dual 2FA) | ✅ (Statutory Justification) | ✅ Permitted |
| **Administrator** | ✅ Permitted | ✅ Permitted | ✅ (Requires Evidence Review) | ✅ (Requires Dual 2FA) | ✅ (Statutory Justification) | ✅ Permitted |

### Authorization Invariants
1. **Approval Gatekeeper:** No unapproved advisory draft can ever bypass the dispatch gate.
2. **Evidence Review Precondition:** An Incident Commander cannot certify an advisory without completing and verifying multimodal satellite and ground-truth evidence.
3. **Emergency Override:** Any override bypassing standard 2FA requires an explicit statutory justification under legal frameworks (e.g., Section 34 of the Disaster Management Act, 2005) with minimum 20 characters and cryptographic audit recording.

---

## Defensive Engineering Controls

### 1. Request & Response Validation
- Strict bounds checking for physical meteorology parameters (e.g., barometric pressure 850–1050 hPa, wind speed 0–350 km/h, surge 0–15 m).
- Geospatial coordinate bounds checking (-90 to +90 lat, -180 to +180 lng) and bounding box orientation validation.
- All non-numeric, malformed, or out-of-range payloads are rejected with `400 Bad Request`.

### 2. Prompt-Injection & Adversarial Guardrails
- Deep regex and structural pattern inspection intercepting instruction overrides (`ignore all previous instructions`, `DAN mode`, `### System:`, etc.).
- Stripping of HTML script tags, XSS payloads, and control characters before ingestion into downstream LLM pipelines.

### 3. File Upload & Binary Magic-Byte Verification
- File uploads are validated via binary magic bytes (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `49 49 2A 00` / `4D 4D 00 2A` for TIFF) rather than relying on client-supplied `Content-Type` headers.
- File size thresholds enforced per MIME type (e.g., 50MB for SAR GeoTIFF, 10MB for imagery).
- Absolute blocklist on executable and scripting extensions (`.exe`, `.sh`, `.bat`, `.py`, `.js`, etc.).

### 4. Sliding-Window Rate Limiting
- Independent rate limiters for global endpoints (120 req/min), advisory dispatch (10 dispatches/min), authentication stations (25 attempts/min), and file uploads (20 uploads/min).
- HTTP `429 Too Many Requests` returned with standard `X-RateLimit-*` headers upon breach.

### 5. Sensitive Data Redaction
- Recursive masking of sensitive tokens, passwords, PINs, private keys, and FIDO2 keys before writing to console, application logs, or audit chains.
- Safe logging middleware ensures internal system paths and raw database errors never leak to clients.

### 6. Cryptographic WORM Audit Trail
- Write-Once-Read-Many (WORM) audit logging service using SHA-256 Merkle chain linking.
- Every approval, dispatch, override, and login attempts is sealed with the previous leaf's hash.
- Real-time tamper detection via `/api/security/audit-verify`.

### 7. Global AI Kill Switch & Degraded Mode
- Immediate runtime circuit breaker disabling all Generative AI endpoints.
- In Kill Switch or Degraded Mode, the system defaults deterministically to verified statutory templates without calling remote models.

### 8. Google Cloud Armor Layer 7 WAF & Edge Defense
- Configured in `infra/terraform/cloud_armor.tf` with Cloud Run Serverless NEG bindings.
- IP rate-limiting policy (100 req/min per IP with 10-minute ban period).
- Managed pre-configured OWASP Top 10 protection rules:
  - SQL Injection: `sqli-v33-stable`
  - Cross-Site Scripting: `xss-v33-stable`
  - Local/Remote File Inclusion: `lfi-v33-stable`, `rfi-v33-stable`
  - Remote Code Execution: `rce-v33-stable`
- Geographic restriction targeting sovereign disaster operational jurisdictions.

### 9. Google Cloud Firestore Least-Privilege Rules
- Enforced at database engine layer via root `firestore.rules`.
- Dispatches require authenticated Dual-Officer signatures (`request.resource.data.dualOfficerApproval == true`).
- WORM audit log collection (`/audit_worm_ledger/{entryId}`) strictly enforces `create`-only immutability; `update` and `delete` are denied at the database rule level.
- Public emergency advisories are readable without authentication; writes are restricted strictly to authorized Emergency Operations Center admins.

### 10. Vertex AI Model Armor Semantic Security Boundaries
- Layered semantic inspection before token ingestion into Gemini 2.5 Flash / 3.7 Flash pipelines.
- Deep pattern analysis catches prompt leakage, role escapes (`act as an unfiltered terminal`), and unauthorized dispatch commands (`DISPATCH_FORCE_NOW`).
- All intercepted injection attempts are automatically cataloged in the SHA-256 Merkle WORM audit ledger with threat taxonomy and forensic timestamps.
