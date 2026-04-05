import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { detectPattern, PATTERN_TYPES } from '../api/fraudApi';

const PatternCard = ({ pattern, active, onClick, results, loading }) => (
  <div className={`pattern-card glass ${active ? 'active' : ''}`} onClick={onClick}>
    <span className="pattern-tag">{pattern.icon}</span>
    <h4 className="meta-main" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{pattern.label}</h4>
    <p className="meta-sub" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>{pattern.desc}</p>
    <div className="match-probability" style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '4px' }}>
        <span className="meta-sub">DETECTIONS</span>
        <span style={{ color: 'var(--primary)' }}>{loading ? '...' : (results !== null ? results.length : '—')}</span>
      </div>
      <div className="prob-bar-container">
        <div className="prob-bar-fill" style={{ width: results !== null ? `${Math.min(results.length * 10, 100)}%` : '0%' }}></div>
      </div>
    </div>
  </div>
);

const PatternMapping = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [patternResults, setPatternResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const runDetection = async (patternKey) => {
    setLoading(prev => ({ ...prev, [patternKey]: true }));
    setError(null);
    try {
      const data = await detectPattern(patternKey);
      setPatternResults(prev => ({ ...prev, [patternKey]: data.results || [] }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(prev => ({ ...prev, [patternKey]: false }));
    }
  };

  const runAllDetections = async () => {
    setError(null);
    for (const p of PATTERN_TYPES) {
      await runDetection(p.key);
    }
  };

  const selectedPattern = PATTERN_TYPES[selectedIdx];
  const currentResults = patternResults[selectedPattern.key] || null;

  return (
    <>
      <TopBar title="Pattern Detection" subtitle="Graph-based Fraud Pattern Analysis — TigerGraph" />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn-primary" onClick={() => runDetection(selectedPattern.key)} disabled={loading[selectedPattern.key]}>
          {loading[selectedPattern.key] ? '⏳ DETECTING...' : `▶ DETECT ${selectedPattern.label.toUpperCase()}`}
        </button>
        <button className="btn-secondary" onClick={runAllDetections}>🔍 SCAN ALL PATTERNS</button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(255,45,85,0.08)', border: '1px solid var(--error)', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--error)' }}>⚠ {error}</div>}

      <div className="grid-container">
        <div className="pattern-library-grid">
          {PATTERN_TYPES.map((p, i) => (
            <PatternCard
              key={p.key}
              pattern={p}
              active={selectedIdx === i}
              onClick={() => setSelectedIdx(i)}
              results={patternResults[p.key] !== undefined ? patternResults[p.key] : null}
              loading={loading[p.key]}
            />
          ))}
        </div>

        {/* RESULTS PANEL */}
        <section className="behavior-flow-panel glass">
          <div className="panel-header">
            <h3 className="panel-title">{selectedPattern.icon} {selectedPattern.label.toUpperCase()} — DETECTION RESULTS</h3>
            <div className="panel-actions">
              <span className="meta-sub">{currentResults ? `${currentResults.length} found` : 'Not scanned'}</span>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {currentResults === null ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{selectedPattern.icon}</div>
                <p>Click "DETECT" to run {selectedPattern.label} pattern analysis</p>
              </div>
            ) : currentResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                <p>No {selectedPattern.label} patterns detected in current data</p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {currentResults.map((r, i) => {
                  const display = typeof r === 'object' ? JSON.stringify(r, null, 2) : String(r);
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--outline-variant)', fontSize: '0.8rem', alignItems: 'flex-start' }}>
                      <span className="meta-sub" style={{ minWidth: '30px', fontWeight: 700 }}>{String(i + 1).padStart(3, '0')}</span>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', flex: 1, fontFamily: 'inherit', color: 'var(--on-surface)' }}>{display}</pre>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PATTERN INFO */}
          <div style={{ padding: '0 24px 24px' }}>
            <div className="drawer-label" style={{ marginBottom: '16px' }}>PATTERN DESCRIPTION</div>
            <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="stat-card glass" style={{ padding: '16px' }}>
                <span className="meta-sub">TYPE</span>
                <p className="meta-main" style={{ fontSize: '0.85rem' }}>{selectedPattern.label}</p>
              </div>
              <div className="stat-card glass" style={{ padding: '16px' }}>
                <span className="meta-sub">MECHANISM</span>
                <p className="meta-main" style={{ fontSize: '0.85rem' }}>{selectedPattern.desc}</p>
              </div>
              <div className="stat-card glass" style={{ padding: '16px' }}>
                <span className="meta-sub">API ENDPOINT</span>
                <p className="meta-main" style={{ fontSize: '0.85rem' }}>/detect-pattern/{selectedPattern.key}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PatternMapping;
