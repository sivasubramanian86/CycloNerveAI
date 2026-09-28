# Support Policy & Operations Desk — CycloNerveAI

Thank you for utilizing **CycloNerveAI**, the neuro-symbolic coastal lifeline anticipatory action platform.

---

> [!CAUTION]
> **CRITICAL DISCLAIMER FOR REAL-WORLD EMERGENCIES**
> If you are experiencing an active disaster, imminent cyclone landfall, storm surge inundation, or immediate threat to life, **DO NOT FILE A GITHUB ISSUE**.
> Contact your national/state emergency helpline immediately:
> - **India:** National Disaster Helpline: `1078` | State Emergency Operations (Odisha): `1070` | Unified Emergency: `112`
> - **United States:** National Emergency: `911` | FEMA Helpline: `1-800-621-3362`
> - **Japan:** Coast Guard: `118` | Police: `110` | Fire/Ambulance: `119`
> - **Philippines:** NDRRMC: `(02) 8911-5061 to 65` | Unified: `911`

---

## 1. Supported Channels

| Channel | Intended Purpose | Response SLA |
|---|---|---|
| **GitHub Issues** | Bug reports, reproduction steps, UI issues, accessibility defects. | 24–48 hours |
| **GitHub Discussions** | Feature proposals, new coastal basin topologies, architectural discussions. | Community-driven |
| **Security Operations** | Vulnerability reports, Model Armor bypass attempts, prompt injection telemetry. | < 12 hours (`security-operations@cyclonerve.gov.in`) |
| **EOC Operations Desk** | Statutory integration guidance for district emergency managers. | Priority scheduling |

---

## 2. Filing a Bug Report

When reporting an issue, please ensure the following details are provided:
1. **Operating Environment:** OS, Node.js version (`node -v`), Browser (Chrome/Firefox/Safari) and version.
2. **Adapter Mode:** Mock Mode (`USE_MOCK_ADAPTERS=true`) vs Cloud Mode (`ADAPTER_MODE=cloud`).
3. **Region / Coastal Basin:** Target district (e.g., `odisha-dhamra`, `fiji-suva`, `florida-tampa`).
4. **Reproduction Steps:** Step-by-step actions leading to the observed behavior.
5. **Expected vs Actual Behavior:** Deterministic risk score mismatch, cascade DAG traversal defect, or UI rendering anomaly.
6. **Logs / Provenance Trace:** Provenance JSON snippet (`source`, `classification`, `isSimulated`, `confidence`).

---

## 3. Evaluator & Hackathon Judge Fast-Path

Hackathon evaluators and technical judges do not need to configure cloud credentials to test full platform capabilities:
- **Zero-Friction Sandbox:** Launch the web app (`npm run dev`) or access the deployed Cloud Run instance.
- **Role Switcher:** Toggle between *Incident Commander*, *Field Officer*, *Analyst*, and *Viewer* directly in the top header.
- **1-Click Guided Tour:** Click the **"60s Guided Tour"** button in the header or pitch drawer to trigger the 3 core "Aha!" moments.
- **Plain-English Storm Story:** Toggle the *Story of the Storm* tab on the home dashboard to evaluate human-centered, low-cognitive-load explanations.
