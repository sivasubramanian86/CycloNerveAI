# Contributing to CycloNerveAI

Thank you for your interest in contributing to **CycloNerveAI**, the neuro-symbolic early warning and critical lifeline cascade mitigation platform for coastal emergency operations.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to a professional, respectful, and safety-focused standard of conduct. CycloNerveAI produces statutory mission-critical systems designed for emergency operations centers (EOCs); accuracy, reliability, and security are paramount.

---

## Development Principles & Architecture

1. **Neuro-Symbolic Separation:**
   - **Deterministic Engines (Symbolic):** Hazard arithmetic ($H \times E \times V \times C$), cascade graph propagation, cycle detection, and ROI budget constraints must remain 100% deterministic and mathematically auditable. Never replace mathematical calculations with generative model predictions.
   - **Generative AI (Neural):** LLM integration (Gemini 3.7 Flash) is restricted to natural-language explanations, multilingual drafting, and multimodal evidence synthesis. AI outputs must always be passed through the deterministic Safety Verifier.

2. **Statutory Approval Gates:**
   - No public advisory or siren broadcast may ever bypass human-in-the-loop authorization.
   - Dual-officer cryptographic authorization (FIDO2 / 2FA) is mandatory for simulated or live broadcasts.

3. **Replaceable Cloud Adapters:**
   - All cloud integrations (Earth Engine, BigQuery, Firestore, Cloud Storage, Google Maps, Advisory Dispatch) must implement the `Server-Side Adapter Architecture` (`src/server/adapters/`).
   - Mock adapters provide resilient, zero-dependency offline simulation (`TIER_3_AIRGAPPED_EDGE`).
   - Cloud adapters connect to live Google Cloud APIs with explicit provenance metadata. Never fabricate cloud success when an API call fails.

---

## Getting Started

### Prerequisites

- **Node.js:** v22.x LTS or higher
- **npm:** v10.x or higher
- **Docker:** (Optional, for containerized local execution)

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/organization/cyclonerve-ai.git
cd cyclonerve-ai

# 2. Install dependencies
npm install

# 3. Configure local environment
cp .env.example .env

# 4. Start full-stack development server (Express backend + Vite HMR)
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## Testing & Quality Assurance

Before submitting any Pull Request, ensure that all quality gates pass:

```bash
# 1. TypeScript syntax verification & type check
npm run lint
npm run type-check

# 2. Run unit tests (deterministic risk math, DAG cascade, prompt verifier)
npm run test:unit

# 3. Run integration tests (cloud adapters, health aggregation, RBAC, approval gates)
npm run test:integration

# 4. Run the complete test suite
npm test

# 5. Verify production Vite build
npm run build
```

All 75+ unit and integration tests across 32 suites must pass with zero failures.

---

## Submitting Pull Requests

1. **Create a Topic Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Commit Conventions:** Follow Conventional Commits:
   - `feat:` New feature or capability
   - `fix:` Bug fix in deterministic engine or adapter
   - `test:` Additional test cases
   - `docs:` Documentation improvements
   - `security:` Security controls or RBAC hardening
3. **Pull Request Description:**
   - Explain the operational or technical motivation.
   - Reference any relevant issues or statutory standards.
   - Include test output confirmation.

---

## Security Vulnerability Reporting

Please review [SECURITY.md](./SECURITY.md) for vulnerability disclosure guidelines. Do not report security vulnerabilities through public GitHub issues.
