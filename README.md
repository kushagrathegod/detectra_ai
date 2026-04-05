# 🛡️ Detectra AI — Neural Fraud Identification Network

**Detectra AI** (formerly FraudNet) is a unified, real-time fraud detection platform. It leverages the massive parallel processing power of **TigerGraph** to execute deep-link graph analytics for fraud ring detection, a highly responsive **React/Vite UI** for investigation, and **Llama 3.3 70B** for autonomous Suspicious Activity Report (SAR) generation.

---

## 🏗️ System Architecture

Our platform operates on a modernized 3-tier architecture:

1. **Frontend (React/Vite)**: The command center. Displays live transactions, renders visual interactive network graphs, and provides a unified "glassmorphism" premium interface.
2. **TigerGraph API Engine**: Processes complex transactional relationships, seeking out multi-hop money laundering patterns.
3. **Report AI Engine**: A FastAPI / Langchain microservice that digests TigerGraph JSON payloads and outputs fully-formatted PDF compliance reports.

```text
┌─────────────────────────────────────────────────────────────┐
│                   DETECTRA AI PLATFORM                      │
├───────────────┬─────────────────────┬───────────────────────┤
│   Frontend    │  TigerGraph API     │    Report AI          │
│   (React/Vite)│  (Deployed Web API) │    (Deployed FastAPI) │
│               │                     │                       │
│  Dashboard    │  /check-transaction │  /generate-fiu-report │
│  Transaction  │  /detect-fraud-     │  /generate-fiu-       │
│  Check        │   network           │   report/pdf          │
│  Network Viz  │  /detect-pattern/   │                       │
│  Pattern Det  │   {type}            │  Powered by:          │
│  SAR Reports  │  /detect-geo-       │  Groq (Llama 3 70B)   │
│  Geo Anomaly  │   anomaly           │  LangChain            │
│               │  /analyze-dataset   │  ReportLab            │
│               │  /clear-data        │                       │
└───────────────┴─────────────────────┴───────────────────────┘
```

---

## 🚀 Setup Instructions

Since the backend intelligence (TigerGraph & Report AI) is already live and deployed to the cloud, setting up the local environment is strictly for the frontend UI.

### Prerequisites
* **Node.js** (v18.x or higher)
* **npm** or **yarn**

### 1. Run the Frontend
```bash
# Clone the repository and navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

### 2. Login Mechanics
* Open your browser to `http://localhost:5173/` which will automatically redirect you to the localized login protocol.
* **Agent ID**: `admin`
* **Passkey**: `admin123`

*(Note: Authentication persists strictly in session memory for demo parity. Refreshing the browser will reset an active session so that you can show the login screen multiple times).*

---

## 🐯 TigerGraph Integration & Usage

Detectra AI leverages **TigerGraph GSQL** to calculate deep relationships between transactions. Rather than searching sequential rows in a standard SQL database, it calculates node-to-node hops instantly to find criminal structure.

### Supported Fraud Detection Patterns (TigerGraph Capabilities):
* 🔄 **Circular**: (A → B → C → A) Detects closed-loop money rings.
* 🔗 **Chain**: Multi-hop relay laundering across 4+ accounts.
* ⚡ **Velocity**: High-frequency, rapid burst transactions.
* 🫧 **Smurfing**: Breaking large deposits into structurally tiny sequential transfers.
* 📱 **Device Sharing**: Multiple diverse accounts operating from the same hardware signature.
* 💨 **Rapid Movement**: Receive and immediately resend ("mule" behavior).
* ↩️ **Round Tripping**: Funds returning directly to the originator after obfuscation.

### Supplying the TigerGraph API Key
TigerGraph requires authentication to intercept raw payloads. Within the Detectra AI frontend:
1. Navigate to the **Settings** page via the sidebar.
2. Enter your provided TigerGraph API key.
3. The frontend safely stores this in your browser's `localStorage` and automatically injects it into the `x-api-key` header for future analytic requests.

---

## 🌐 API Endpoints & Usage Details

The system communicates with two distinct remote backends. The centralized SDK for generating and receiving payloads lives inside `frontend/src/api/fraudApi.js`.

### 1. TigerGraph API 
*(Hosted securely via custom Render deployment)*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Healthcheck ping to ensure the TigerGraph cluster is online and responding. |
| `/check-transaction` | POST | Analyzes a single transaction's localized graph neighborhood for immediate decisioning (ALLOW, REVIEW, BLOCK). |
| `/detect-fraud-network` | GET | Pulls a macro-view of the entire global transaction graph to highlight syndicates. |
| `/detect-pattern/{patternType}`| GET | Queries a specific, deep-link graph algorithm based on the parameter (e.g., `/detect-pattern/circular`). |
| `/detect-geo-anomaly` | GET | Cross-references device IP and node transaction locations to flag impossible physical travel metrics. |
| `/analyze-dataset` | POST | Ingests a CSV payload directly into TigerGraph nodes/edges via a standard `FormData` stream. |
| `/clear-data` | DELETE | Wipes the entire remote graph schema data (Strictly for demo reset purposes). |

> **Header Requirement**: All TigerGraph calls MUST pass `{ 'x-api-key': 'YOUR_KEY_HERE' }` inside the request header. Usage of `tigerHeaders()` handles this contextually.

### 2. Report AI Core
*(Generative AI Service via Render)*

This backend utilizes a Large Language Model (Groq / Llama 3) to interpret TigerGraph's massive JSON output mathematically, crafting human-readable financial compliance narratives.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Checks if the AI inference engine is operational. |
| `/generate-fiu-report` | POST | Returns a formatted JSON string containing the AI narrative summarizing the fraudulent graph context. |
| `/generate-fiu-report/pdf`| POST | Identical generation pipeline, but utilizes Python `ReportLab` to return a binary `Blob` object resulting in a fully crafted compliance PDF ready for download. |

### Note on Normalizers
TigerGraph returns highly complex and deeply nested GSQL dictionaries. Our API SDK (`fraudApi.js`) utilizes custom "Normalizer" wrappers (e.g., `normalizeNetworkForReport`, `normalizeGeoForReport`) that mathematically flatten and standardize raw graph data before feeding it specifically into the Report AI payload parameters. This vital step prevents LLM hallucination and massive context-window bloat!
