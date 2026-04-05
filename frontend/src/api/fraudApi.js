/**
 * fraudApi.js — Centralized API service layer
 * Connects to TigerGraph Fraud Detection API and Report_AI GenAI service
 */

const TIGERGRAPH_BASE = 'https://tigergraph-fraud-detection.onrender.com';
const REPORT_AI_BASE = 'https://report-ai-6gsh.onrender.com';

// ── Helper ──────────────────────────────────────────────────────────────────

function getApiKey() {
  return localStorage.getItem('fraudnet_api_key') || '';
}

function tigerHeaders(json = false) {
  const h = { 'x-api-key': getApiKey() };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      // FastAPI 422 returns { detail: [ { loc, msg, type }, ... ] }
      if (Array.isArray(data.detail)) {
        msg = data.detail.map(d => (typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d))).join('; ');
      } else if (typeof data.detail === 'string') {
        msg = data.detail;
      } else if (data.message) {
        msg = data.message;
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(msg);
  }
  return res.json();
}

// ── TigerGraph API ──────────────────────────────────────────────────────────

export async function healthCheck() {
  try {
    const res = await fetch(`${TIGERGRAPH_BASE}/`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function checkTransaction(payload) {
  const res = await fetch(`${TIGERGRAPH_BASE}/check-transaction`, {
    method: 'POST',
    headers: tigerHeaders(true),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function detectFraudNetwork() {
  const res = await fetch(`${TIGERGRAPH_BASE}/detect-fraud-network`, {
    headers: tigerHeaders(),
  });
  return handleResponse(res);
}

export async function detectPattern(patternType) {
  const res = await fetch(`${TIGERGRAPH_BASE}/detect-pattern/${patternType}`, {
    headers: tigerHeaders(),
  });
  return handleResponse(res);
}

export async function detectGeoAnomaly() {
  const res = await fetch(`${TIGERGRAPH_BASE}/detect-geo-anomaly`, {
    headers: tigerHeaders(),
  });
  return handleResponse(res);
}

export async function analyzeDataset(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${TIGERGRAPH_BASE}/analyze-dataset`, {
    method: 'POST',
    headers: { 'x-api-key': getApiKey() },
    body: formData,
  });
  return handleResponse(res);
}

export async function clearData() {
  const res = await fetch(`${TIGERGRAPH_BASE}/clear-data`, {
    method: 'DELETE',
    headers: tigerHeaders(),
  });
  return handleResponse(res);
}

// ── Report AI API ───────────────────────────────────────────────────────────

export async function reportHealthCheck() {
  try {
    const res = await fetch(`${REPORT_AI_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function generateFIUReport(payload) {
  const res = await fetch(`${REPORT_AI_BASE}/generate-fiu-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function generateFIUReportPDF(payload) {
  const res = await fetch(`${REPORT_AI_BASE}/generate-fiu-report/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = 'PDF generation failed';
    try {
      const data = await res.json();
      if (Array.isArray(data.detail)) {
        msg = data.detail.map(d => (typeof d === 'object' ? (d.msg || JSON.stringify(d)) : String(d))).join('; ');
      } else if (typeof data.detail === 'string') {
        msg = data.detail;
      }
    } catch { /* not JSON */ }
    throw new Error(msg);
  }
  return res.blob();
}

// ── Data Normalization ──────────────────────────────────────────────────────
// Transforms raw TigerGraph responses into the format Report_AI expects

/**
 * Normalize graph nodes to { id, label } format required by Report_AI
 */
export function normalizeGraphNodes(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map(n => ({
    id: String(n.id || n.v_id || n.v_type || 'unknown'),
    label: String(n.label || n.type || n.v_type || n.id || 'node'),
  }));
}

/**
 * Normalize graph edges to { source, target, amount? } format
 */
export function normalizeGraphEdges(edges) {
  if (!Array.isArray(edges)) return [];
  return edges.map(e => ({
    source: String(e.source || e.from_id || e.from || ''),
    target: String(e.target || e.to_id || e.to || ''),
    ...(e.amount !== undefined ? { amount: e.amount } : {}),
  }));
}

/**
 * Normalize a full fraud network response for Report_AI input
 */
export function normalizeNetworkForReport(networkData) {
  if (!networkData?.graph) return null;
  return {
    message: networkData.message || 'Fraud network detected',
    graph: {
      nodes: normalizeGraphNodes(networkData.graph.nodes),
      edges: normalizeGraphEdges(networkData.graph.edges),
    },
  };
}

/**
 * Normalize transaction_data for Report_AI input
 */
export function normalizeTransactionForReport(txn) {
  if (!txn) return null;
  return {
    account: String(txn.account || 'unknown'),
    decision: txn.decision || 'ALLOW',
    confidence: Number(txn.confidence) || 0,
    final_score: Number(txn.final_score) || 0,
    patterns_detected: Array.isArray(txn.patterns_detected) ? txn.patterns_detected.map(String) : [],
    graph: txn.graph ? {
      nodes: normalizeGraphNodes(txn.graph.nodes),
      edges: normalizeGraphEdges(txn.graph.edges),
    } : { nodes: [], edges: [] },
  };
}

/**
 * Normalize geo anomaly results for Report_AI input
 * Limits to top 20 accounts to prevent payload overload
 */
export function normalizeGeoForReport(geoResults) {
  if (!Array.isArray(geoResults) || geoResults.length === 0) return null;
  const entries = geoResults.slice(0, 20).map(r => {
    const flat = (r.attributes && typeof r.attributes === 'object') ? r.attributes : r;
    return {
      account: String(flat.account || flat.account_id || r.v_id || 'unknown'),
      usual_location: String(flat.usual_location || flat.usualLocation || 'unknown'),
      anomalous_locations: Array.isArray(flat.anomalous_locations || flat.anomalousLocations)
        ? (flat.anomalous_locations || flat.anomalousLocations).map(String)
        : [],
      anomaly_count: Number(flat.anomaly_count || flat.anomalyCount || 0),
    };
  });
  return {
    pattern: 'geographic_anomaly',
    results: entries,
  };
}

/**
 * Normalize pattern results for Report_AI input
 * Each result object is stringified to ensure it's Dict[str, Any]
 */
export function normalizePatternsForReport(patternResults) {
  if (!Array.isArray(patternResults) || patternResults.length === 0) return [];
  return patternResults.filter(p => p.results && p.results.length > 0).map(p => ({
    pattern: String(p.pattern || 'unknown'),
    results: p.results.slice(0, 20).map(r => {
      if (typeof r === 'object' && r !== null) {
        // Flatten nested objects to simple key-value for the LLM
        const flat = {};
        for (const [k, v] of Object.entries(r)) {
          flat[k] = typeof v === 'object' ? JSON.stringify(v) : v;
        }
        return flat;
      }
      return { value: String(r) };
    }),
  }));
}

// ── Constants ───────────────────────────────────────────────────────────────

export const PATTERN_TYPES = [
  { key: 'circular', label: 'Circular', icon: '🔄', desc: 'A→B→C→A money loops' },
  { key: 'chain', label: 'Chain', icon: '🔗', desc: '4-hop relay laundering' },
  { key: 'velocity', label: 'Velocity', icon: '⚡', desc: 'High-frequency bursts' },
  { key: 'smurfing', label: 'Smurfing', icon: '🫧', desc: 'Small txn structuring' },
  { key: 'device_sharing', label: 'Device Sharing', icon: '📱', desc: 'Multi-account devices' },
  { key: 'rapid_movement', label: 'Rapid Movement', icon: '💨', desc: 'Receive-resend mules' },
  { key: 'round_tripping', label: 'Round Tripping', icon: '↩️', desc: 'Funds return to origin' },
];

export const TIGERGRAPH_URL = TIGERGRAPH_BASE;
export const REPORT_AI_URL = REPORT_AI_BASE;
