import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useApi } from '../context/ApiContext';
import { checkTransaction } from '../api/fraudApi';

const TimelineEntry = ({ time, event, description, isCritical }) => (
  <div className={`timeline-entry ${isCritical ? 'critical' : ''}`}>
    <div className="timeline-node"></div>
    <div className="timeline-content glass">
      <span className="timeline-time">{time}</span>
      <div className="meta-main" style={{ marginBottom: '4px' }}>{event}</div>
      <p className="meta-sub">{description}</p>
    </div>
  </div>
);

const InvestigationLab = () => {
  const navigate = useNavigate();
  const { addTransaction, transactionHistory, setReportTarget } = useApi();

  const goToSAR = (txn) => {
    setReportTarget(txn);
    navigate('/report');
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);

  // Form
  const [sender, setSender] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState(10000);
  const [location, setLocation] = useState('New York');
  const [channel, setChannel] = useState('online');
  const [deviceId, setDeviceId] = useState('DEV_001');

  const investigate = async () => {
    if (!sender.trim() || !receiver.trim()) {
      setError('Sender and receiver are required.');
      return;
    }
    setLoading(true);
    setError(null);
    setCurrentResult(null);
    try {
      const txnId = 'INV_' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const now = new Date().toISOString().slice(0, 16) + ':00';
      const data = await checkTransaction({
        sender: sender.trim(),
        receiver: receiver.trim(),
        txn_id: txnId,
        amount: parseFloat(amount),
        time: now,
        location: location.trim(),
        channel,
        device_id: deviceId.trim(),
      });
      setCurrentResult(data);
      addTransaction(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Build timeline from current result
  const timeline = [];
  if (currentResult) {
    timeline.push({ time: 'Step 1', event: 'Transaction Submitted', description: `Account ${currentResult.account} → receiver`, isCritical: false });
    timeline.push({ time: 'Step 2', event: `ML Scoring: ${(currentResult.confidence * 100).toFixed(1)}%`, description: `Model confidence on fraud prediction`, isCritical: currentResult.confidence > 0.7 });
    timeline.push({ time: 'Step 3', event: `Final Score: ${(currentResult.final_score * 100).toFixed(1)}%`, description: `Composite risk after graph feature analysis`, isCritical: currentResult.final_score > 0.5 });
    timeline.push({ time: 'Result', event: `Decision: ${currentResult.decision}`, description: currentResult.patterns_detected?.length > 0 ? `Patterns: ${currentResult.patterns_detected.join(', ')}` : 'No suspicious patterns found', isCritical: currentResult.decision === 'BLOCK' });
  }

  return (
    <>
      <TopBar title="Investigation Lab" subtitle="Deep Transaction Analysis & Forensic Investigation" />

      <div className="workbench-container">
        <aside className="workbench-sidebar">
          <div className="drawer-label">RECENT INVESTIGATIONS</div>
          {transactionHistory.length === 0 ? (
            <div style={{ padding: '16px', color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>No investigations yet</div>
          ) : (
            transactionHistory.slice(0, 6).map((t, i) => (
              <div key={i} className={`case-card glass ${currentResult?.account === t.account ? 'active' : ''}`} onClick={() => setCurrentResult(t)}>
                <span className="case-id-badge">{t.account}</span>
                <div className="meta-main" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>{t.decision}</div>
                <div className="risk-indicator">
                  <div className="risk-bar-bg"><div className="risk-bar-fill" style={{ width: `${t.final_score * 100}%`, background: t.final_score > 0.7 ? 'var(--error)' : 'var(--primary)' }}></div></div>
                  <span className="risk-value" style={{ fontSize: '0.65rem' }}>{(t.final_score * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))
          )}
        </aside>

        <main className="workbench-main">
          {/* INVESTIGATION FORM */}
          <section className="main-panel glass" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="panel-header">
              <h3 className="panel-title">NEW INVESTIGATION</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', margin: '16px 0' }}>
              <div className="config-field">
                <label className="config-label">SENDER</label>
                <input className="config-input" value={sender} onChange={e => setSender(e.target.value)} placeholder="A001" />
              </div>
              <div className="config-field">
                <label className="config-label">RECEIVER</label>
                <input className="config-input" value={receiver} onChange={e => setReceiver(e.target.value)} placeholder="B002" />
              </div>
              <div className="config-field">
                <label className="config-label">AMOUNT ($)</label>
                <input type="number" className="config-input" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="config-field">
                <label className="config-label">LOCATION</label>
                <input className="config-input" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="config-field">
                <label className="config-label">CHANNEL</label>
                <select className="config-input" value={channel} onChange={e => setChannel(e.target.value)}>
                  <option value="online">online</option><option value="mobile">mobile</option><option value="atm">atm</option><option value="branch">branch</option>
                </select>
              </div>
              <div className="config-field">
                <label className="config-label">DEVICE</label>
                <input className="config-input" value={deviceId} onChange={e => setDeviceId(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button className="btn-primary" onClick={investigate} disabled={loading}>{loading ? '⏳ ANALYZING...' : '🔍 INVESTIGATE'}</button>
              {error && <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>⚠ {error}</span>}
            </div>
          </section>

          {/* INVESTIGATION TIMELINE */}
          {currentResult && (
            <section className="main-panel glass" style={{ padding: '24px' }}>
              <div className="panel-header">
                <h3 className="panel-title">{currentResult.account}: INVESTIGATION THREAD</h3>
              </div>
              <div className="timeline-feed">
                {timeline.map((entry, i) => <TimelineEntry key={i} {...entry} />)}
              </div>
            </section>
          )}
        </main>

        <aside className="workbench-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AI REASONING */}
          <section className="ai-reasoning-card glass">
            <div className="copilot-header">
              <div className="copilot-ai-icon"></div>
              <h3 className="panel-title">AI REASONING</h3>
            </div>
            {currentResult ? (
              <div className="reasoning-list">
                <div className="reasoning-point">
                  <span>1.</span>
                  <p>ML model confidence: <strong>{(currentResult.confidence * 100).toFixed(1)}%</strong> — {currentResult.confidence > 0.7 ? 'High probability of fraud' : currentResult.confidence > 0.4 ? 'Moderate suspicion level' : 'Low fraud probability'}.</p>
                </div>
                <div className="reasoning-point">
                  <span>2.</span>
                  <p>Final composite score: <strong>{(currentResult.final_score * 100).toFixed(1)}%</strong> — combines ML + graph topology features.</p>
                </div>
                <div className="reasoning-point">
                  <span>3.</span>
                  <p>{currentResult.patterns_detected?.length > 0 ? `Patterns flagged: ${currentResult.patterns_detected.join(', ')}` : 'No suspicious behavioral patterns detected in graph neighborhood'}.</p>
                </div>
                {currentResult.graph?.nodes?.length > 0 && (
                  <div className="reasoning-point">
                    <span>4.</span>
                    <p>Graph neighborhood: {currentResult.graph.nodes.length} connected entities, {currentResult.graph.edges.length} transaction edges.</p>
                  </div>
                )}
                <div className="drawer-label" style={{ marginTop: '24px' }}>DECISION: {currentResult.decision}</div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                <p>Run an investigation to see AI analysis</p>
              </div>
            )}
          </section>

          {/* DECISION GRID */}
          <section className="main-panel glass" style={{ padding: '24px' }}>
            <h3 className="panel-title" style={{ marginBottom: '16px' }}>DECISION GRID</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => goToSAR(currentResult)} disabled={!currentResult}>📄 GENERATE SAR FOR {currentResult?.account || '...'}</button>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/visualizer')}>VIEW IN NETWORK</button>
              <button className="btn-secondary" style={{ width: '100%', borderColor: 'var(--secondary)', color: 'var(--secondary)' }} onClick={() => setCurrentResult(null)}>CLOSE INVESTIGATION</button>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
};

export default InvestigationLab;
