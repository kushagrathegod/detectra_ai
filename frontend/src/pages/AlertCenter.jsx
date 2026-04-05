import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useApi } from '../context/ApiContext';
import { checkTransaction } from '../api/fraudApi';

const AlertCenter = () => {
  const navigate = useNavigate();
  const { addTransaction, transactionHistory, setReportTarget } = useApi();

  const goToSAR = (txn) => {
    setReportTarget(txn);
    navigate('/report');
  };
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Form fields
  const [sender, setSender] = useState('A001');
  const [receiver, setReceiver] = useState('B002');
  const [txnId, setTxnId] = useState(() => 'TXN_' + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [amount, setAmount] = useState(5000);
  const [time, setTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState('New York');
  const [channel, setChannel] = useState('online');
  const [deviceId, setDeviceId] = useState('DEV_001');

  const randomize = () => {
    const locs = ['New York', 'London', 'Tokyo', 'Mumbai', 'Dubai', 'Singapore', 'Lagos', 'Berlin'];
    const chs = ['online', 'mobile', 'atm', 'branch'];
    setSender('A' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'));
    setReceiver('A' + String(Math.floor(Math.random() * 1000)).padStart(3, '0'));
    setTxnId('TXN_' + Math.random().toString(36).slice(2, 8).toUpperCase());
    setAmount(Math.floor(Math.random() * 50000 + 100));
    setLocation(locs[Math.floor(Math.random() * locs.length)]);
    setChannel(chs[Math.floor(Math.random() * chs.length)]);
    setDeviceId('DEV_' + Math.random().toString(36).slice(2, 6).toUpperCase());
  };

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        sender: sender.trim(),
        receiver: receiver.trim(),
        txn_id: txnId.trim(),
        amount: parseFloat(amount),
        time: time + ':00',
        location: location.trim(),
        channel,
        device_id: deviceId.trim(),
      };

      if (!payload.sender || !payload.receiver || !payload.txn_id) {
        setError('Sender, receiver, and transaction ID are required.');
        setLoading(false);
        return;
      }

      const data = await checkTransaction(payload);
      addTransaction(data);
      setTxnId('TXN_' + Math.random().toString(36).slice(2, 8).toUpperCase());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = activeFilter === 'ALL'
    ? transactionHistory
    : transactionHistory.filter(t => t.decision === activeFilter);

  return (
    <>
      <TopBar title="Transaction Check" subtitle="Real-time Fraud Scoring with Graph Features" />

      {/* TRANSACTION FORM */}
      <section className="main-panel glass" style={{ margin: '0 0 24px' }}>
        <div className="panel-header">
          <h3 className="panel-title">CHECK TRANSACTION</h3>
          <div className="panel-actions">
            <button className="panel-btn" onClick={randomize}>RANDOMIZE</button>
          </div>
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="config-field">
              <label className="config-label">SENDER ACCOUNT</label>
              <input className="config-input" value={sender} onChange={e => setSender(e.target.value)} placeholder="A001" />
            </div>
            <div className="config-field">
              <label className="config-label">RECEIVER ACCOUNT</label>
              <input className="config-input" value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="B002" />
            </div>
            <div className="config-field">
              <label className="config-label">TRANSACTION ID</label>
              <input className="config-input" value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="TXN_001" />
            </div>
            <div className="config-field">
              <label className="config-label">AMOUNT ($)</label>
              <input type="number" className="config-input" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="config-field">
              <label className="config-label">TIMESTAMP</label>
              <input type="datetime-local" className="config-input" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div className="config-field">
              <label className="config-label">LOCATION</label>
              <input className="config-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="New York" />
            </div>
            <div className="config-field">
              <label className="config-label">CHANNEL</label>
              <select className="config-input" value={channel} onChange={e => setChannel(e.target.value)}>
                <option value="online">online</option>
                <option value="mobile">mobile</option>
                <option value="atm">atm</option>
                <option value="branch">branch</option>
              </select>
            </div>
            <div className="config-field">
              <label className="config-label">DEVICE ID</label>
              <input className="config-input" value={deviceId} onChange={e => setDeviceId(e.target.value)} placeholder="DEV_001" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn-primary" onClick={handleCheck} disabled={loading}>
              {loading ? '⏳ ANALYZING...' : '▶ RUN CHECK'}
            </button>
            {error && <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>⚠ {error}</span>}
          </div>
        </div>
      </section>

      {/* LATEST RESULT CARD */}
      {transactionHistory.length > 0 && (
        <section className="main-panel glass" style={{ margin: '0 0 24px', borderLeft: `4px solid ${transactionHistory[0].decision === 'BLOCK' ? 'var(--error)' : transactionHistory[0].decision === 'REVIEW' ? 'var(--status-warning)' : 'var(--secondary)'}` }}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="drawer-label">LATEST RESULT</span>
                <h3 className="meta-main" style={{ fontSize: '1.1rem' }}>Account: {transactionHistory[0].account}</h3>
              </div>
              <span className={`status-badge ${transactionHistory[0].decision === 'BLOCK' ? 'urgent warning-pulse' : transactionHistory[0].decision === 'REVIEW' ? 'monitor' : 'clear'}`} style={{ fontSize: '1.2rem', padding: '8px 20px' }}>
                {transactionHistory[0].decision}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <span className="meta-sub">ML CONFIDENCE</span>
                <div className="stat-value tabular" style={{ fontSize: '1.5rem' }}>{(transactionHistory[0].confidence * 100).toFixed(1)}%</div>
              </div>
              <div>
                <span className="meta-sub">FINAL SCORE</span>
                <div className="stat-value tabular" style={{ fontSize: '1.5rem' }}>{(transactionHistory[0].final_score * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span className="meta-sub" style={{ marginBottom: '8px', display: 'block' }}>SCORE BAR</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, marginBottom: '4px', color: 'var(--on-surface-variant)' }}>
                <span>ALLOW</span><span>REVIEW</span><span>BLOCK</span>
              </div>
              <div style={{ height: '4px', background: 'var(--outline-variant)', position: 'relative', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${transactionHistory[0].final_score * 100}%`, background: 'linear-gradient(90deg, var(--secondary), #ffd60a, var(--error))', backgroundSize: '200% 100%', borderRadius: '2px' }}></div>
                <div style={{ position: 'absolute', top: '-3px', left: `${transactionHistory[0].final_score * 100}%`, width: '10px', height: '10px', borderRadius: '50%', background: '#fff', transform: 'translateX(-50%)', boxShadow: '0 0 6px rgba(255,255,255,0.5)' }}></div>
              </div>
            </div>
            <div>
              <span className="meta-sub" style={{ marginBottom: '8px', display: 'block' }}>PATTERNS DETECTED</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {transactionHistory[0].patterns_detected?.length > 0 ? (
                  transactionHistory[0].patterns_detected.map((p, i) => (
                    <span key={i} className="explain-tag">{p}</span>
                  ))
                ) : (
                  <span className="meta-sub">No suspicious patterns detected</span>
                )}
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button className="btn-primary" onClick={() => goToSAR(transactionHistory[0])}>📄 GENERATE SAR FOR {transactionHistory[0].account}</button>
            </div>
          </div>
        </section>
      )}

      {/* FILTERS & HISTORY TABLE */}
      <div className="alert-filters">
        <div className="filter-group">
          {['ALL', 'BLOCK', 'REVIEW', 'ALLOW'].map(f => (
            <button
              key={f}
              className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="panel-actions">
          <span className="meta-sub">{filteredResults.length} results</span>
        </div>
      </div>

      <section className="main-panel glass">
        <div className="panel-header">
          <h3 className="panel-title">CHECK HISTORY</h3>
        </div>
        <table className="alert-table">
          <thead>
            <tr>
              <th>ACCOUNT</th>
              <th>DECISION</th>
              <th>CONFIDENCE</th>
              <th>RISK SCORE</th>
              <th>PATTERNS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>No results to display</td></tr>
            ) : (
              filteredResults.map((t, i) => (
                <tr key={i} className={`alert-row severity-${t.decision === 'BLOCK' ? 'urgent' : t.decision === 'REVIEW' ? 'monitor' : 'clear'}`}>
                  <td><span className="alert-id tabular">{t.account}</span></td>
                  <td>
                    <span className={`status-badge ${t.decision === 'BLOCK' ? 'urgent' : t.decision === 'REVIEW' ? 'monitor' : 'clear'}`}>
                      {t.decision}
                    </span>
                  </td>
                  <td><span className="tabular">{(t.confidence * 100).toFixed(1)}%</span></td>
                  <td>
                    <div className="risk-indicator">
                      <span className="risk-value tabular">{(t.final_score * 100).toFixed(0)}%</span>
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
                      {(!t.patterns_detected || t.patterns_detected.length === 0) && '—'}
                    </div>
                  </td>
                  <td>
                    <div className="action-cluster">
                      <button className="mini-action-btn" onClick={() => setSelectedAlert(t)}>DETAIL</button>
                      {(t.decision === 'BLOCK' || t.decision === 'REVIEW') && (
                        <button className="mini-action-btn" style={{ color: 'var(--error)' }} onClick={() => goToSAR(t)} title="Generate SAR for this account">📄 SAR</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* DETAIL DRAWER */}
      {selectedAlert && (
        <div className="drawer-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">{selectedAlert.account} — Detail</h2>
              <button className="close-drawer" onClick={() => setSelectedAlert(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="drawer-section">
              <span className="drawer-label">RISK ASSESSMENT</span>
              <div className="stat-card glass" style={{ padding: '16px', borderLeft: `4px solid ${selectedAlert.decision === 'BLOCK' ? 'var(--error)' : 'var(--primary)'}` }}>
                <h3 style={{ margin: 0 }}>Decision: {selectedAlert.decision}</h3>
                <p className="meta-sub" style={{ marginTop: '8px' }}>
                  ML Confidence: <strong>{(selectedAlert.confidence * 100).toFixed(1)}%</strong> | Final Score: <strong>{(selectedAlert.final_score * 100).toFixed(1)}%</strong>
                </p>
              </div>
            </div>
            <div className="drawer-section">
              <span className="drawer-label">PATTERNS DETECTED</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {selectedAlert.patterns_detected?.length > 0
                  ? selectedAlert.patterns_detected.map((p, i) => <span key={i} className="explain-tag">{p}</span>)
                  : <span className="meta-sub">None</span>
                }
              </div>
            </div>
            {selectedAlert.graph && selectedAlert.graph.nodes?.length > 0 && (
              <div className="drawer-section">
                <span className="drawer-label">GRAPH NEIGHBORHOOD</span>
                <p className="meta-sub">{selectedAlert.graph.nodes.length} nodes, {selectedAlert.graph.edges.length} edges</p>
              </div>
            )}
            <div className="drawer-section">
              <span className="drawer-label">ACTIONS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => { setSelectedAlert(null); goToSAR(selectedAlert); }}>📄 GENERATE SAR FOR {selectedAlert.account}</button>
                <button className="btn-secondary" style={{ width: '100%', padding: '12px' }} onClick={() => setSelectedAlert(null)}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertCenter;
