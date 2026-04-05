import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useApi } from '../context/ApiContext';
import { detectFraudNetwork, analyzeDataset, clearData } from '../api/fraudApi';

const FrequencyBars = ({ color }) => (
  <div className="frequency-bars">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="freq-bar" style={{
        height: `${Math.random() * 80 + 20}%`,
        background: `var(--${color})`,
        animationDelay: `${i * 0.05}s`
      }}></div>
    ))}
  </div>
);

const StatCard = ({ title, value, trend, trendDir, color, context }) => (
  <div className="stat-card glass">
    <div className="stat-header">
      <span className="drawer-label">{title}</span>
      <span className={`stat-trend ${trendDir}`}>{trend}</span>
    </div>
    <div className="stat-body">
      <span className="stat-value tabular" style={{ color: `var(--status-${color})`, fontWeight: 700 }}>{value}</span>
    </div>
    <div className="stat-footer">
      <span className="context-label">{context || 'LIVE DATA'}</span>
      <FrequencyBars color={color === 'primary' ? 'primary' : 'secondary'} />
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { transactionHistory, tigerStatus, reportStatus } = useApi();
  const [networkData, setNetworkData] = useState(null);
  const [networkLoading, setNetworkLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearResult, setClearResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchNetwork = async () => {
    setNetworkLoading(true);
    setError(null);
    try {
      const data = await detectFraudNetwork();
      setNetworkData(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setNetworkLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!uploadFile) return;
    setUploadLoading(true);
    setUploadResult(null);
    setError(null);
    try {
      const data = await analyzeDataset(uploadFile);
      setUploadResult(data.message || 'Dataset ingested successfully');
      setUploadFile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('This will delete ALL graph data permanently. Are you sure?')) return;
    setClearLoading(true);
    setClearResult(null);
    try {
      const data = await clearData();
      setClearResult(data.message || 'All data cleared');
    } catch (e) {
      setError(e.message);
    } finally {
      setClearLoading(false);
    }
  };

  // Derive stats from transaction history
  const urgentCount = transactionHistory.filter(t => t.decision === 'BLOCK').length;
  const reviewCount = transactionHistory.filter(t => t.decision === 'REVIEW').length;
  const allowCount = transactionHistory.filter(t => t.decision === 'ALLOW').length;
  const totalChecked = transactionHistory.length;

  return (
    <>
      <TopBar title="Fraud Command Center" subtitle="Real-time Transaction Risk & Intelligence" />
      <div className="grid-container">
        <div className="hero-action-row">
          <div className="copilot-widget glass-premium" style={{ borderLeft: '4px solid var(--status-critical)' }}>
            <div className="copilot-header">
              <div className="copilot-ai-icon"></div>
              <h3 className="panel-title">AI DECISION DESK</h3>
              {transactionHistory.length > 0 && transactionHistory[0].decision === 'BLOCK' && (
                <span className="status-badge urgent warning-pulse">HIGH RISK</span>
              )}
            </div>
            <div className="copilot-insight">
              {transactionHistory.length > 0 ? (
                <>
                  <p className="copilot-suggestion">
                    <strong>Latest Check:</strong> Account <em>{transactionHistory[0].account}</em> —
                    Decision: <strong>{transactionHistory[0].decision}</strong> |
                    Confidence: {(transactionHistory[0].confidence * 100).toFixed(1)}% |
                    Score: {(transactionHistory[0].final_score * 100).toFixed(1)}%
                  </p>
                  <div className="explainability-tags">
                    {transactionHistory[0].patterns_detected?.map((p, i) => (
                      <span key={i} className="explain-tag">{p}</span>
                    ))}
                    {(!transactionHistory[0].patterns_detected || transactionHistory[0].patterns_detected.length === 0) && (
                      <span className="explain-tag">No patterns</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="copilot-suggestion">
                  <strong>No transactions checked yet.</strong> Go to <em>Transaction Check</em> to analyze transactions against the TigerGraph fraud detection engine.
                </p>
              )}
            </div>
            <div className="copilot-actions">
              <button className="btn-primary" onClick={() => navigate('/alerts')}>
                CHECK TRANSACTION
              </button>
              <button className="btn-secondary" onClick={() => navigate('/report')}>GENERATE SAR</button>
              <button className="btn-secondary" onClick={() => navigate('/visualizer')}>VIEW NETWORK</button>
            </div>
          </div>

          <div className="critical-triage glass">
            <div className="panel-header">
              <span className="drawer-label">RECENT RESULTS</span>
            </div>
            <div className="triage-list">
              {transactionHistory.length === 0 ? (
                <div style={{ padding: '20px', color: 'var(--on-surface-variant)', fontSize: '0.8rem', textAlign: 'center' }}>
                  No checks performed yet
                </div>
              ) : (
                transactionHistory.slice(0, 4).map((t, i) => (
                  <div key={i} className={`triage-item ${t.decision === 'BLOCK' ? 'critical' : t.decision === 'REVIEW' ? 'warning' : ''}`}>
                    <div className="triage-info">
                      <span className="alert-id">{t.account}</span>
                      <span className="industrial-label">{t.decision} • {(t.final_score * 100).toFixed(0)}% risk</span>
                    </div>
                    <button className="triage-action" onClick={() => navigate('/alerts')}>VIEW</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="stats-row">
          <StatCard title="TRANSACTIONS CHECKED" value={totalChecked} trend={totalChecked > 0 ? 'ACTIVE' : '—'} trendDir="up" color="info" context="SESSION TOTAL" />
          <StatCard title="BLOCKED (HIGH RISK)" value={urgentCount} trend={urgentCount > 0 ? 'ALERT' : 'CLEAR'} trendDir={urgentCount > 0 ? 'down' : 'up'} color="critical" context="BLOCKED TXNS" />
          <StatCard title="FLAGGED FOR REVIEW" value={reviewCount} trend={reviewCount > 0 ? 'MONITOR' : 'CLEAR'} trendDir="up" color="warning" context="REVIEW QUEUE" />
          <StatCard title="ALLOWED (SAFE)" value={allowCount} trend={allowCount > 0 ? 'PASSED' : '—'} trendDir="up" color="success" context="SAFE TXNS" />
        </div>

        <div className="content-row">
          <div className="left-stack">
            {/* DATA MANAGEMENT */}
            <section className="main-panel glass">
              <div className="panel-header">
                <h3 className="panel-title">DATA MANAGEMENT</h3>
              </div>

              {error && (
                <div style={{ padding: '12px 24px', background: 'rgba(255,45,85,0.08)', borderLeft: '3px solid var(--error)', margin: '16px 24px 0', fontSize: '0.8rem', color: 'var(--error)' }}>
                  ⚠ {error}
                </div>
              )}

              {/* CSV UPLOAD */}
              <div style={{ padding: '24px' }}>
                <div className="drawer-label" style={{ marginBottom: '12px' }}>INGEST DATASET (CSV)</div>
                <div
                  style={{ border: '2px dashed var(--outline-variant)', padding: '24px', textAlign: 'center', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
                  onClick={() => document.getElementById('csv-upload').click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = 'var(--outline-variant)';
                    const f = e.dataTransfer.files[0];
                    if (f && f.name.endsWith('.csv')) setUploadFile(f);
                  }}
                >
                  <input type="file" id="csv-upload" accept=".csv" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files[0])} />
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📂</div>
                  <div className="meta-sub">{uploadFile ? `✓ ${uploadFile.name}` : 'Click or drag CSV to upload'}</div>
                  <div className="meta-sub" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                    Required: sender, receiver, txn_id, amount, time, location, channel, device_id
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="btn-primary" onClick={handleIngest} disabled={!uploadFile || uploadLoading}>
                    {uploadLoading ? 'INGESTING...' : 'INGEST DATASET'}
                  </button>
                  <button className="btn-secondary" onClick={fetchNetwork} disabled={networkLoading}>
                    {networkLoading ? 'SCANNING...' : 'SCAN NETWORK'}
                  </button>
                </div>
                {uploadResult && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,255,136,0.08)', border: '1px solid var(--secondary)', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                    ✓ {uploadResult}
                  </div>
                )}
              </div>

              {/* CLEAR DATA */}
              <div style={{ padding: '0 24px 24px' }}>
                <div style={{ border: '1px solid rgba(255,45,85,0.3)', padding: '16px', background: 'rgba(255,45,85,0.03)', borderRadius: '4px' }}>
                  <div className="drawer-label" style={{ color: 'var(--error)', marginBottom: '8px' }}>⚠ DANGER ZONE</div>
                  <p className="meta-sub" style={{ marginBottom: '12px' }}>Permanently delete all Account, Transaction, and Device vertices from the graph.</p>
                  <button className="btn-primary" style={{ background: 'var(--error)', borderColor: 'var(--error)', color: '#fff' }} onClick={handleClear} disabled={clearLoading}>
                    {clearLoading ? 'CLEARING...' : 'CLEAR ALL GRAPH DATA'}
                  </button>
                  {clearResult && (
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--secondary)' }}>✓ {clearResult}</div>
                  )}
                </div>
              </div>
            </section>

            {/* RECENT ACTIVITY TABLE */}
            <section className="main-panel glass">
              <div className="panel-header">
                <h3 className="panel-title">RECENT FRAUD ACTIVITY</h3>
              </div>
              <table className="alert-table">
                <thead>
                  <tr>
                    <th>ACCOUNT</th>
                    <th>DECISION</th>
                    <th>CONFIDENCE</th>
                    <th>RISK SCORE</th>
                    <th>PATTERNS</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>No transaction checks yet. Use Transaction Check to analyze.</td></tr>
                  ) : (
                    transactionHistory.slice(0, 10).map((t, i) => (
                      <tr key={i} className={`alert-row severity-${t.decision === 'BLOCK' ? 'urgent' : t.decision === 'REVIEW' ? 'monitor' : 'clear'}`}>
                        <td><span className="alert-id tabular">{t.account}</span></td>
                        <td>
                          <span className={`status-badge ${t.decision === 'BLOCK' ? 'urgent' : t.decision === 'REVIEW' ? 'monitor' : 'clear'} ${t.decision === 'BLOCK' ? 'warning-pulse' : ''}`}>
                            {t.decision}
                          </span>
                        </td>
                        <td><span className="stat-value tabular" style={{ fontSize: '0.9rem' }}>{(t.confidence * 100).toFixed(1)}%</span></td>
                        <td>
                          <div className="risk-indicator">
                            <span className="risk-value tabular" style={{ fontWeight: 700 }}>{(t.final_score * 100).toFixed(0)}%</span>
                            <div className="risk-bar-bg">
                              <div className="risk-bar-fill" style={{ width: `${t.final_score * 100}%`, background: t.final_score > 0.7 ? 'var(--status-critical)' : 'var(--status-info)' }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {t.patterns_detected?.map((p, j) => (
                              <span key={j} className="explain-tag" style={{ fontSize: '0.6rem' }}>{p}</span>
                            ))}
                            {(!t.patterns_detected || t.patterns_detected.length === 0) && <span className="meta-sub">None</span>}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </div>

          <aside className="side-panel glass">
            <div className="panel-header">
              <h3 className="panel-title">SYSTEM STATUS</h3>
            </div>
            <div className="health-metrics">
              <div className="health-item">
                <div className="health-info">
                  <span>TigerGraph API</span>
                  <span className="tabular">{tigerStatus === 'online' ? 'CONNECTED' : 'OFFLINE'} <span className={`health-trend ${tigerStatus === 'online' ? 'success' : 'critical'}`}>{tigerStatus === 'online' ? 'LIVE' : 'DOWN'}</span></span>
                </div>
                <div className="health-bar"><div className="health-fill" style={{ width: tigerStatus === 'online' ? '100%' : '0%', background: tigerStatus === 'online' ? 'var(--status-success)' : 'var(--status-critical)' }}></div></div>
              </div>
              <div className="health-item">
                <div className="health-info">
                  <span>Report AI (GenAI)</span>
                  <span className="tabular">{reportStatus === 'online' ? 'CONNECTED' : 'OFFLINE'} <span className={`health-trend ${reportStatus === 'online' ? 'success' : 'critical'}`}>{reportStatus === 'online' ? 'LIVE' : 'DOWN'}</span></span>
                </div>
                <div className="health-bar"><div className="health-fill" style={{ width: reportStatus === 'online' ? '100%' : '0%', background: reportStatus === 'online' ? 'var(--status-success)' : 'var(--status-critical)' }}></div></div>
              </div>
              <div className="health-item">
                <div className="health-info">
                  <span>Network Graph</span>
                  <span className="tabular">{networkData ? `${networkData.graph?.nodes?.length || 0} nodes` : 'Not scanned'}</span>
                </div>
                <div className="health-bar"><div className="health-fill" style={{ width: networkData ? '75%' : '0%', background: 'var(--status-info)' }}></div></div>
              </div>
            </div>
            <div className="threat-feed">
              <h4 className="feed-title">QUICK ACTIONS</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <button className="btn-primary" style={{ width: '100%', fontSize: '0.7rem' }} onClick={() => navigate('/alerts')}>▶ CHECK A TRANSACTION</button>
                <button className="btn-secondary" style={{ width: '100%', fontSize: '0.7rem' }} onClick={() => navigate('/patterns')}>🔍 DETECT PATTERNS</button>
                <button className="btn-secondary" style={{ width: '100%', fontSize: '0.7rem' }} onClick={() => navigate('/visualizer')}>🌐 SCAN NETWORK</button>
                <button className="btn-secondary" style={{ width: '100%', fontSize: '0.7rem' }} onClick={() => navigate('/report')}>📄 GENERATE SAR</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
