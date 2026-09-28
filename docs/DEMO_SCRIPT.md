# Seven-Minute Demonstration Script: CycloNerveAI

**Audience:** Emergency Operations Leadership, Incident Commanders, Cloud Architects, and Evaluators.  
**Demonstrator:** Lead Operations Engineer / System Architect.  
**Environment:** CycloNerveAI Live Instance (`http://localhost:3000`).

---

## ⏱️ Timeline & Minute-by-Minute Cue Sheet

```
+-----------+-----------------------------------------------+-------------------------------------------+
| Time      | Segment                                       | Key Action on Screen                      |
+-----------+-----------------------------------------------+-------------------------------------------+
| 0:00-1:00 | Executive Context & Problem Statement         | Home Dashboard / Situation Header         |
| 1:00-2:15 | Situation Map & Deterministic Risk Arithmetic | Map Explorer & Substation Risk Modal      |
| 2:15-3:30 | Lifeline Cascade Propagation & DAG Graph      | Cascade Graph View & Node Traversal       |
| 3:30-4:45 | Counterfactual Intervention Optimizer         | Interventions Tab / Plan Alpha Staging    |
| 4:45-5:45 | Multilingual Drafting & Safety Verifier       | Advisory Drafting Desk & Token Accounting |
| 5:45-6:30 | Statutory Approval Gate & Dual-Officer 2FA    | Evidence Review & Dual 2FA Dispatch Modal |
| 6:30-7:00 | Cryptographic WORM Audit Log & Resilience     | Audit Chain Verification & Kill Switch    |
+-----------+-----------------------------------------------+-------------------------------------------+
```

---

### Minute 0:00 – 1:00: Executive Context & Mission Framing

**Spoken Script:**
> *"Good morning, Incident Commanders and Evaluators. When a Category 4 cyclone approaches the coastline, the greatest danger to human life is often not just the wind or the rain—it is the invisible cascade of critical infrastructure failures that follows.*
>
> *If a coastal electrical substation floods, hospital ventilators lose primary grid power, municipal dewatering pumps fail, and telecom towers go dark just as citizens need evacuation guidance.*
>
> *This is **CycloNerveAI**: a neuro-symbolic early warning and anticipatory action platform. It couples deterministic mathematical and graph engines with generative multimodal intelligence, strictly enforcing human-in-the-loop statutory approval gates. Everything you will see is running with full end-to-end cloud adapter resilience and rigorous security controls."*

**Action on Screen:**
- Present the main **CycloNerveAI Situation Room**.
- Point out the active cyclone badge: **Cyclone Samudra (Cat 4 VSCS)**, $195\text{ km/h}$, $938\text{ hPa}$, with Landfall at $T-14.0\text{ hours}$.
- Highlight the **Resilience Tier** indicator: `TIER_0_CLOUD_EDGE`, indicating all 7 cloud adapters are healthy.

---

### Minute 1:00 – 2:15: Situation Map & Deterministic Risk Arithmetic

**Spoken Script:**
> *"Let's examine the coastal theater. Here along the Odisha coast near Dhamra Port, our satellite Earth Engine integration shows Copernicus Sentinel-1 radar backscatter indicating rising sea inundation.*
>
> *Unlike conventional systems that hallucinate risk using unconstrained black-box LLMs, CycloNerveAI enforces **Deterministic Symbolic Arithmetic**: Risk equals Hazard times Exposure times Vulnerability times Criticality ($H \times E \times V \times C$).*
>
> *Clicking on the Dhamra 220kV Substation reveals the exact arithmetic: Hazard is 0.88, Exposure is 0.75, Vulnerability is 0.92, and Criticality is 0.95. Notice the physical trigger: the predicted storm surge of 3.6 meters exceeds the substation perimeter floodwall of 2.8 meters by 0.8 meters. This automatically triggers a statutory shutdown alert under Central Electricity Regulatory Commission Grid Code standards."*

**Action on Screen:**
- Zoom into the **Dhamra Substation** on the interactive map.
- Open the asset detail inspector to display the explicit factor multiplication:
  $$0.88 \times 0.75 \times 0.92 \times 0.95 = 0.576$$
- Show the physical units and floodwall overtopping margin ($+0.80\text{ m}$).

---

### Minute 2:15 – 3:30: Multi-Step Cascade Propagation & DAG Topology

**Spoken Script:**
> *"Now let's ask the critical question: What happens when Dhamra Substation trips?*
>
> *Let's switch to the **Cascade Graph**. Our Directed Acyclic Graph engine models the interdependence between power, healthcare, communications, and transport. Unlike simple linear models, our engine detects circular loops and prevents duplicate impact double-counting across diamond graphs.*
>
> *Watch Step 1: Dhamra Substation fails. Step 2: The power failure instantly propagates to Bhadrak District General Hospital, 4 telecom towers, and the port LNG terminal. Step 3: At the hospital, 24 ICU ventilators switch to emergency diesel backup with only 6 hours of fuel on site. Step 4: Telecom battery buffers drain in 4 hours, silencing cellular emergency broadcasts.*
>
> *We have identified the entire failure cascade fourteen hours before landfall."*

**Action on Screen:**
- Switch to the **Cascade Graph** tab.
- Click **Simulate Cascade** starting from `ASSET-SUB-DHAMRA-01`.
- Follow the animated step-by-step failure propagation across the power, health, and telecom nodes.

---

### Minute 3:30 – 4:45: Counterfactual Intervention Optimizer & ROI Ranking

**Spoken Script:**
> *"Knowing the cascade is half the battle; stopping it before landfall is the mission. We navigate to the **Intervention Optimizer**.*
>
> *Our engine evaluates three competing prepositioning plans under strict physical constraints: a time window of 14 hours and a staging budget.*
>
> *Plan Alpha stages four high-capacity dewatering pumps, erects a 1.2-meter inflatable sandbag berm around the substation, and delivers a mobile 500kVA generator to the hospital. Cost: ₹18.5 Lakhs. Avoided loss: ₹78 Lakhs. That is an auditable Return on Investment multiplier of 4.22x.*
>
> *Notice that Plan Gamma is automatically flagged with a red constraint breach because its staging time exceeds our 14-hour landfall window. We select Plan Alpha—instantly, our counterfactual engine proves that the cascade is arrested at Step 1."*

**Action on Screen:**
- Switch to the **Interventions** tab.
- Compare **Plan Alpha** vs **Plan Beta** vs **Plan Gamma**.
- Point out the constraint warning on Plan Gamma ($\Delta t > 14\text{h}$).
- Select Plan Alpha and demonstrate the before-and-after net risk reduction from $0.576$ to $0.142$.

---

### Minute 4:45 – 5:45: Generative Explanations, Multilingual Drafting & Safety Verifier

**Spoken Script:**
> *"Now we leverage the power of Generative AI—responsibly. We use Google Gemini 3.7 Flash strictly for natural-language briefings and multilingual synthesis.*
>
> *Notice how Gemini explains the mathematical factor calculations in clear language for the District Magistrate without altering a single digit of the underlying risk score.*
>
> *Look at the emergency advisory drafting desk: it generates actionable directives across four statutory languages—English, Hindi, Telugu, and Odia.*
>
> *Crucially, every word passes through our deterministic **Safety Verifier**. If an LLM hallucinates speculative death tolls or mentions out-of-boundary districts, the verifier intercepts it with a maximum of one retry, falling back to a certified template. Furthermore, all prompt-injection attacks are neutralized before reaching the model."*

**Action on Screen:**
- Open the **Advisories & Drafting** tab.
- Toggle between **English**, **Hindi**, **Telugu**, and **Odia** tabs.
- Show the **Safety Verifier Status** badge: `PASS - 0 Hallucinations, 100% Boundary Validated`.
- Display the telemetry cost accounting widget showing exact tokens and cost under the Gemini 3.7 Flash pricing schedule.

---

### Minute 5:45 – 6:30: Statutory Approval Gate, Dual-Officer 2FA & Dispatch

**Spoken Script:**
> *"Here is our core statutory guarantee: **No advisory ever bypasses the approval gate**.*
>
> *An Analyst or Field Officer cannot approve or dispatch. Even as Incident Commander, the system forbids me from approving until I have reviewed and certified the multimodal evidence—the satellite SAR flood mosaic and field ground truths.*
>
> *I check 'Evidence Reviewed' and certify the draft. Now the dispatch gate unlocks. To prevent accidental or compromised broadcasts, we require **Dual-Officer Cryptographic 2FA**.*
>
> *Incident Commander Dr. Arvind Rao and Police Superintendent Shri Manoj Das present their FIDO2 credentials. We click Authorize. The advisory is instantly disseminated via Common Alerting Protocol XML, cell broadcasts, SMS gateways, and coastal sirens."*

**Action on Screen:**
- Demonstrate the disabled dispatch button prior to certification.
- Check the **Certified Evidence Review** checkbox and click **Approve Advisory**.
- Launch the **Dual-Officer 2FA Modal**, fill credentials, and trigger **Authorize & Broadcast Dispatch**.
- Show the live dispatch confirmation with CAP XML output.

---

### Minute 6:30 – 7:00: Cryptographic WORM Audit Log & Resilience

**Spoken Script:**
> *"Every single action—from risk calculation to intervention selection to dual-officer dispatch—is permanently sealed into our Write-Once-Read-Many (WORM) audit log using a SHA-256 Merkle chain. Clicking 'Verify Chain Integrity' confirms zero tampering.*
>
> *If an emergency commander needs to shut down AI instantly, one click on the **Global AI Kill Switch** engages the circuit breaker, dropping all generative calls while keeping deterministic operations 100% active.*
>
> *Predict the cascade. Protect the lifeline. Act before landfall. Thank you."*

**Action on Screen:**
- Navigate to the **Audit & Security** tab.
- Click **Verify Cryptographic Chain Integrity**—show green confirmation: `CRYPTO_CHAIN_VALID`.
- Demonstrate the **Global AI Kill Switch** toggle in System Controls.
- Return to the Situation Room overview to conclude.
