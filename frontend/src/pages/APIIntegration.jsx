import React, { useState, useEffect } from 'react';
import TopBar from '../components/TopBar';
import { useApi } from '../context/ApiContext';
import { healthCheck, reportHealthCheck, TIGERGRAPH_URL, REPORT_AI_URL } from '../api/fraudApi';

const EndpointCard = ({ name, url, method, status, description }) => (
  <div className="endpoint-card glass">
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span className="meta-main" style={{ fontSize: '0.95rem' }}>{name}</span>
      <span className="meta-sub" style={{ fontSize: '0.7rem' }}>{method} {url}</span>
      {description && <span className="meta-sub" style={{ fontSize: '0.65rem', marginTop: '4px' }}>{description}</span>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div className={`health-ribbon ${status.toLowerCase()}`}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
        {status}
      </div>
    </div>
  </div>
);

const APIIntegration = () => {
  const { tigerStatus, reportStatus, checkStatuses } = useApi();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await checkStatuses();
    setRefreshing(false);
  };

  const tigerEndpoints = [
    { name: 'Check Transaction', url: '/check-transaction', method: 'POST', description: 'Real-time fraud scoring with ML + graph features' },
    { name: 'Fraud Network', url: '/detect-fraud-network', method: 'GET', description: 'Detect high-activity account clusters' },
    { name: 'Pattern Detection', url: '/detect-pattern/{type}', method: 'GET', description: 'Graph-based fraud pattern queries' },
    { name: 'Geo Anomaly', url: '/detect-geo-anomaly', method: 'GET', description: 'Accounts transacting from unusual locations' },
    { name: 'Ingest Dataset', url: '/analyze-dataset', method: 'POST', description: 'Bulk CSV ingestion into TigerGraph' },
    { name: 'Clear Data', url: '/clear-data', method: 'DELETE', description: 'Remove all vertices and edges' },
  ];

  const reportEndpoints = [
    { name: 'Generate SAR (JSON)', url: '/generate-fiu-report', method: 'POST', description: 'AI-generated FIU Suspicious Transaction Report' },
    { name: 'Generate SAR (PDF)', url: '/generate-fiu-report/pdf', method: 'POST', description: 'Downloadable PDF with FIU branding' },
    { name: 'Health Check', url: '/health', method: 'GET', description: 'Service health status' },
  ];

  return (
    <>
      <TopBar title="API Status" subtitle="Service Health & Endpoint Registry" />

      <div className="grid-container">
        <div className="stats-row">
          <div className="stat-card glass">
            <span className="stat-label">TIGERGRAPH API</span>
            <div className="stat-value" style={{ marginTop: '8px', color: tigerStatus === 'online' ? 'var(--secondary)' : 'var(--error)' }}>
              {tigerStatus === 'online' ? 'ONLINE' : tigerStatus === 'checking' ? '...' : 'OFFLINE'}
            </div>
            <span className="meta-sub" style={{ fontSize: '0.65rem', marginTop: '4px', wordBreak: 'break-all' }}>{TIGERGRAPH_URL}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">REPORT AI (GenAI)</span>
            <div className="stat-value" style={{ marginTop: '8px', color: reportStatus === 'online' ? 'var(--secondary)' : 'var(--error)' }}>
              {reportStatus === 'online' ? 'ONLINE' : reportStatus === 'checking' ? '...' : 'OFFLINE'}
            </div>
            <span className="meta-sub" style={{ fontSize: '0.65rem', marginTop: '4px', wordBreak: 'break-all' }}>{REPORT_AI_URL}</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-label">OVERALL STATUS</span>
            <div className="stat-value" style={{ marginTop: '8px', color: tigerStatus === 'online' && reportStatus === 'online' ? 'var(--secondary)' : 'var(--error)' }}>
              {tigerStatus === 'online' && reportStatus === 'online' ? 'ALL SYSTEMS GO' : 'DEGRADED'}
            </div>
            <button className="panel-btn" style={{ marginTop: '8px' }} onClick={refresh} disabled={refreshing}>
              {refreshing ? 'REFRESHING...' : 'REFRESH'}
            </button>
          </div>
        </div>

        <div className="api-grid">
          <section className="main-panel glass" style={{ padding: '24px' }}>
            <div className="panel-header">
              <h3 className="panel-title">TIGERGRAPH FRAUD DETECTION API</h3>
              <span className={`status-badge ${tigerStatus === 'online' ? 'clear' : 'urgent'}`}>{tigerStatus === 'online' ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>
            <div className="endpoint-list" style={{ marginTop: '24px' }}>
              {tigerEndpoints.map((ep, i) => (
                <EndpointCard key={i} {...ep} status={tigerStatus === 'online' ? 'HEALTHY' : 'OFFLINE'} />
              ))}
            </div>
          </section>

          <section className="main-panel glass" style={{ padding: '24px' }}>
            <div className="panel-header">
              <h3 className="panel-title">REPORT AI (FIU SAR GENERATOR)</h3>
              <span className={`status-badge ${reportStatus === 'online' ? 'clear' : 'urgent'}`}>{reportStatus === 'online' ? 'CONNECTED' : 'OFFLINE'}</span>
            </div>
            <div className="endpoint-list" style={{ marginTop: '24px' }}>
              {reportEndpoints.map((ep, i) => (
                <EndpointCard key={i} {...ep} status={reportStatus === 'online' ? 'HEALTHY' : 'OFFLINE'} />
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <div className="drawer-label" style={{ marginBottom: '8px' }}>TECH STACK</div>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.8, color: 'var(--on-surface-variant)' }}>
                <div>🔷 TigerGraph — Graph database & GSQL queries</div>
                <div>🐍 FastAPI — Backend framework</div>
                <div>🤖 Groq (Llama 3.3 70B) — GenAI report generation</div>
                <div>🦜 LangChain — AI orchestration</div>
                <div>📄 ReportLab — PDF rendering</div>
                <div>⚛️ React (Vite) — Frontend</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default APIIntegration;
