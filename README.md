# FraudNet — Unified Fraud Detection Platform

A unified fraud detection platform combining **TigerGraph graph-based detection**, **React UI**, and **AI-powered SAR report generation**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRAUDNET PLATFORM                         │
├───────────────┬─────────────────────┬───────────────────────┤
│   Frontend    │  TigerGraph API     │    Report AI          │
│   (React/Vite)│  (Deployed)         │    (Deployed)         │
│               │                     │                       │
│  Dashboard    │  /check-transaction │  /generate-fiu-report │
│  Transaction  │  /detect-fraud-     │  /generate-fiu-       │
│  Check        │   network           │   report/pdf          │
│  Network Viz  │  /detect-pattern/   │                       │
│  Pattern Det  │   {type}            │  Powered by:          │
│  SAR Reports  │  /detect-geo-       │  Groq (Llama 3.3 70B)│
│  Geo Anomaly  │   anomaly           │  LangChain            │
│               │  /analyze-dataset   │  ReportLab            │
│               │  /clear-data        │                       │
└───────────────┴─────────────────────┴───────────────────────┘
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Backend (Report AI) — Already deployed

The Report AI backend is deployed at: `https://report-ai-6gsh.onrender.com`

To run locally:

```bash
cd backend
pip install -r requirements.txt
# Create .env with your GROQ_API_KEY
cp .env.example .env
uvicorn app:app --reload
```

## API Keys

1. **TigerGraph API Key**: Enter in Settings page → saved to `localStorage`
2. **Groq API Key**: Set in `backend/.env` (only for local backend)

## Features

| Feature | Source | Status |
|---------|--------|--------|
| Transaction Check | TigerGraph API | ✅ Live |
| Fraud Network Scan | TigerGraph API | ✅ Live |
| Pattern Detection (7 types) | TigerGraph API | ✅ Live |
| Geo Anomaly Detection | TigerGraph API | ✅ Live |
| CSV Dataset Ingestion | TigerGraph API | ✅ Live |
| FIU SAR Report (JSON) | Report AI | ✅ Live |
| FIU SAR Report (PDF) | Report AI | ✅ Live |
| Investigation Lab | Frontend + APIs | ✅ Live |

## Tech Stack

- **Frontend**: React 19, Vite 8, React Router v7
- **Backend**: FastAPI, LangChain, Groq (Llama 3.3 70B)
- **Graph DB**: TigerGraph (GSQL)
- **PDF**: ReportLab
- **Deployment**: Render

## Deployment

### Frontend (Static Site on Render)

```bash
cd frontend
npm run build
# Deploy the `dist/` folder
```

### Backend (Web Service on Render)

- Set `GROQ_API_KEY` as environment variable
- Procfile: `web: uvicorn app:app --host 0.0.0.0 --port $PORT`
