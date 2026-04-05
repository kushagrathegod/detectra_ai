import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { useApi } from '../context/ApiContext';

const ToggleCard = ({ label, description, initialOn = false }) => {
  const [on, setOn] = useState(initialOn);
  return (
    <div className="toggle-card">
      <div>
        <div className="meta-main" style={{ fontSize: '0.85rem' }}>{label}</div>
        <div className="meta-sub" style={{ fontSize: '0.7rem' }}>{description}</div>
      </div>
      <div className={`switch ${on ? 'on' : ''}`} onClick={() => setOn(!on)}></div>
    </div>
  );
};

const Settings = () => {
  const { apiKey, setApiKey } = useApi();
  const [localKey, setLocalKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState(75);

  const handleSaveKey = () => {
    setApiKey(localKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <TopBar title="Settings" subtitle="System Configuration & API Key Management" />

      <div className="grid-container">
        <div className="settings-grid">
          <aside className="main-panel glass" style={{ padding: '24px' }}>
            {/* API KEY CONFIG */}
            <div className="drawer-label" style={{ marginBottom: '24px' }}>🔑 API KEY CONFIGURATION</div>
            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--primary)', borderRadius: '4px', background: 'rgba(173,198,255,0.04)' }}>
              <p className="meta-sub" style={{ marginBottom: '12px' }}>
                Enter your TigerGraph Fraud Detection API key. This is stored locally in your browser and sent as the <code>x-api-key</code> header with every request.
              </p>
              <div className="config-field" style={{ marginBottom: '12px' }}>
                <label className="config-label">X-API-KEY</label>
                <input
                  type="password"
                  className="config-input"
                  value={localKey}
                  onChange={e => setLocalKey(e.target.value)}
                  placeholder="Enter your API key..."
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button className="btn-primary" onClick={handleSaveKey}>SAVE API KEY</button>
                {saved && <span style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>✓ Saved to localStorage</span>}
              </div>
            </div>

            <div className="drawer-label" style={{ marginBottom: '24px' }}>SYSTEM PROFILE</div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="profile-avatar-large" style={{ margin: '0 auto 16px' }}>FN</div>
              <h3 className="meta-main">Detectra System</h3>
              <p className="meta-sub">TigerGraph + Groq AI Detection</p>
            </div>

            <div className="config-field" style={{ marginBottom: '16px' }}>
              <label className="config-label">API Endpoint (TigerGraph)</label>
              <input type="text" className="config-input" defaultValue="https://tigergraph-fraud-detection.onrender.com" disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="config-field">
              <label className="config-label">Report AI Endpoint</label>
              <input type="text" className="config-input" defaultValue="https://report-ai-6gsh.onrender.com" disabled style={{ opacity: 0.6 }} />
            </div>
          </aside>

          <section className="settings-section">
            <div className="glass" style={{ padding: '24px' }}>
              <div className="panel-header" style={{ marginBottom: '20px' }}>
                <h3 className="panel-title">NOTIFICATION SETTINGS</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <ToggleCard label="Auto-Collect Intelligence" description="Auto-fetch all sources before report generation" initialOn />
                <ToggleCard label="Show Pattern Details" description="Show raw JSON in pattern detection results" />
                <ToggleCard label="Persist Transaction History" description="Keep check results across page refreshes" initialOn />
                <ToggleCard label="Dark Mode" description="Always enabled for Detectra" initialOn />
              </div>
            </div>

            <div className="glass" style={{ padding: '24px' }}>
              <div className="panel-header" style={{ marginBottom: '20px' }}>
                <h3 className="panel-title">DETECTION PARAMETERS</h3>
              </div>
              <div>
                <div className="meta-main" style={{ fontSize: '0.85rem' }}>Risk Score Alert Threshold</div>
                <div className="meta-sub" style={{ fontSize: '0.7rem', marginBottom: '16px' }}>Show alert badges when score exceeds threshold</div>
                <div className="slider-container">
                  <input type="range" min="0" max="100" value={riskThreshold} onChange={(e) => setRiskThreshold(e.target.value)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span className="meta-sub">{riskThreshold}/100</span>
                    <span className="meta-sub">{riskThreshold > 70 ? 'HIGH SENSITIVITY' : 'MODERATE'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button className="btn-secondary">RESET TO DEFAULTS</button>
              <button className="btn-primary">SAVE CONFIGURATION</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Settings;
