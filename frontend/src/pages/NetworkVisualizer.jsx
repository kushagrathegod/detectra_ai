import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { detectFraudNetwork, detectGeoAnomaly } from '../api/fraudApi';

const Node = ({ x, y, type, id, risk, isSelected, isHovered, isDimmed, onClick, onMouseEnter, onMouseLeave }) => {
  const colors = { Account: 'var(--primary)', Transaction: 'var(--secondary)', Device: 'var(--tertiary)', DEFAULT: 'var(--error)' };
  const baseColor = colors[type] || colors.DEFAULT;
  const radius = isSelected || isHovered ? 14 : 9;

  return (
    <g className={`node-group ${isDimmed ? 'dimmed' : ''}`} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} style={{ cursor: 'pointer' }}>
      <circle cx={x} cy={y} r={radius + 8} fill={baseColor} fillOpacity={isSelected || isHovered ? 0.15 : 0.05} />
      <circle cx={x} cy={y} r={radius} fill={baseColor} fillOpacity={0.3} stroke={baseColor} strokeWidth={1} strokeOpacity={0.6}
        style={{ filter: isSelected || isHovered ? `drop-shadow(0 0 12px ${baseColor})` : 'none' }} />
      <text x={x} y={y + radius + 14} textAnchor="middle" style={{ fontSize: '9px', fill: isSelected || isHovered ? 'var(--on-surface)' : 'var(--on-surface-variant)', fontWeight: isSelected ? '600' : '400', letterSpacing: '0.05em' }}>
        {id.length > 10 ? id.slice(0, 10) : id}
      </text>
    </g>
  );
};

const Edge = ({ x1, y1, x2, y2, strength, isActive, isDimmed }) => {
  const pathData = `M ${x1} ${y1} L ${x2} ${y2}`;
  return (
    <g className={isDimmed ? 'dimmed' : ''}>
      <path d={pathData} stroke="var(--outline-variant)" strokeWidth={strength || 1} fill="none" opacity={isActive ? 0.8 : 0.2} style={{ transition: 'all 0.3s' }} />
      {isActive && (
        <path d={pathData} stroke="var(--primary)" strokeWidth={(strength || 1) + 1} fill="none" strokeDasharray="10, 20" style={{ filter: 'drop-shadow(0 0 4px var(--primary))' }}>
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </g>
  );
};

const NetworkVisualizer = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Geo anomaly state
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const scanNetwork = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await detectFraudNetwork();
      if (!data.graph || !data.graph.nodes || data.graph.nodes.length === 0) {
        setError('No fraud network found in current data. Ingest a dataset first.');
        return;
      }
      // Layout nodes in a force-like circular pattern
      const w = 800, h = 600;
      const cx = w / 2, cy = h / 2;
      const layoutNodes = data.graph.nodes.map((n, i) => {
        const angle = (2 * Math.PI * i) / data.graph.nodes.length;
        const r = Math.min(w, h) * 0.35;
        return { ...n, x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 40, y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 40, type: n.type || 'Account' };
      });
      setNodes(layoutNodes);
      // Map edges to node indices
      const nodeMap = {};
      layoutNodes.forEach((n, i) => { nodeMap[n.id] = i; });
      const layoutEdges = data.graph.edges.map(e => ({
        from: nodeMap[e.source] ?? 0,
        to: nodeMap[e.target] ?? 0,
        strength: e.amount ? Math.min(Math.log(e.amount + 1), 5) : 1,
      })).filter(e => e.from !== undefined && e.to !== undefined);
      setEdges(layoutEdges);
      setStats({ nodes: layoutNodes.length, edges: layoutEdges.length, message: data.message });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const scanGeo = async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const data = await detectGeoAnomaly();
      const results = data.results || [];
      // Normalize results
      const normalized = results.map(r => {
        const flat = (r.attributes && typeof r.attributes === 'object') ? r.attributes : r;
        return {
          account: flat.account || flat.account_id || r.v_id || 'unknown',
          usual_location: flat.usual_location || flat.usualLocation || 'unknown',
          anomaly_count: flat.anomaly_count || flat.anomalyCount || 0,
          anomalous_locations: flat.anomalous_locations || flat.anomalousLocations || [],
        };
      });
      setGeoResults(normalized);
    } catch (e) {
      setGeoError(e.message);
    } finally {
      setGeoLoading(false);
    }
  };

  const isConnected = (nodeIdx) => {
    if (!hoveredNode && !selectedNode) return false;
    const targetIdx = nodes.findIndex(n => n.id === (hoveredNode?.id || selectedNode?.id));
    return edges.some(e => (e.from === nodeIdx && e.to === targetIdx) || (e.from === targetIdx && e.to === nodeIdx));
  };

  return (
    <>
      <TopBar title="Network & Geo Analysis" subtitle="Live Fraud Network Visualization & Geographic Anomaly Detection" />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn-primary" onClick={scanNetwork} disabled={loading}>
          {loading ? '⏳ SCANNING...' : '🌐 SCAN FRAUD NETWORK'}
        </button>
        <button className="btn-primary" onClick={scanGeo} disabled={geoLoading} style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
          {geoLoading ? '⏳ ANALYZING...' : '📍 DETECT GEO ANOMALIES'}
        </button>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(255,45,85,0.08)', border: '1px solid var(--error)', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--error)' }}>⚠ {error}</div>}

      <div className="visualizer-container">
        <section className="graph-stage glass-premium">
          <div className="viz-header" style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
            <h3 className="panel-title">FRAUD NETWORK: {selectedNode ? selectedNode.id : stats ? `${stats.nodes} nodes · ${stats.edges} edges` : 'CLICK SCAN TO BEGIN'}</h3>
          </div>

          <svg className="graph-svg" viewBox="0 0 800 600">
            <defs>
              <radialGradient id="grad-account" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#d8e2ff" /><stop offset="100%" stopColor="var(--primary)" /></radialGradient>
              <radialGradient id="grad-transaction" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#72fe88" /><stop offset="100%" stopColor="var(--secondary)" /></radialGradient>
              <radialGradient id="grad-device" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#e2e2e7" /><stop offset="100%" stopColor="var(--tertiary)" /></radialGradient>
            </defs>

            {nodes.length === 0 && (
              <text x="400" y="300" textAnchor="middle" fill="var(--on-surface-variant)" fontSize="14" fontFamily="inherit">
                Click "SCAN FRAUD NETWORK" to visualize
              </text>
            )}

            {edges.map((e, i) => {
              if (!nodes[e.from] || !nodes[e.to]) return null;
              const hoverIdx = nodes.findIndex(n => n.id === hoveredNode?.id);
              const selectIdx = nodes.findIndex(n => n.id === selectedNode?.id);
              const isActive = (e.from === hoverIdx || e.to === hoverIdx) || (e.from === selectIdx || e.to === selectIdx);
              const isDimmed = (hoveredNode || selectedNode) && !isActive;
              return <Edge key={i} x1={nodes[e.from].x} y1={nodes[e.from].y} x2={nodes[e.to].x} y2={nodes[e.to].y} strength={e.strength} isActive={isActive} isDimmed={isDimmed} />;
            })}

            {nodes.map((n, i) => {
              const isHovered = hoveredNode?.id === n.id;
              const isSel = selectedNode?.id === n.id;
              const isDimmed = (hoveredNode || selectedNode) && !isHovered && !isSel && !isConnected(i);
              return <Node key={n.id} {...n} isSelected={isSel} isHovered={isHovered} isDimmed={isDimmed} onClick={() => setSelectedNode(n)} onMouseEnter={() => setHoveredNode(n)} onMouseLeave={() => setHoveredNode(null)} />;
            })}
          </svg>
        </section>

        <aside className="viz-sidebar">
          <section className="entity-detail-card glass">
            <div className="drawer-label" style={{ textAlign: 'center' }}>ENTITY DETAIL</div>
            {selectedNode ? (
              <>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <h2 className="logo-text" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{selectedNode.id}</h2>
                  <span className="page-subtitle">{selectedNode.label || selectedNode.type || 'NODE'}</span>
                </div>
                <div className="drawer-section">
                  <span className="drawer-label">CONNECTIONS</span>
                  <div className="connection-list">
                    {edges.filter(e => nodes[e.from]?.id === selectedNode.id || nodes[e.to]?.id === selectedNode.id).slice(0, 5).map((e, i) => {
                      const other = nodes[e.from]?.id === selectedNode.id ? nodes[e.to] : nodes[e.from];
                      return (
                        <div key={i} className="connection-item">
                          <span className="connection-type">{other?.id || '?'}</span>
                          <span className="meta-sub">{other?.label || other?.type || ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <p className="page-subtitle">SELECT A NODE TO<br />VIEW CONNECTIONS</p>
              </div>
            )}
          </section>

          <section className="cluster-analytics glass">
            <div className="drawer-label">CLUSTER ANALYTICS</div>
            <div style={{ marginTop: '16px' }}>
              <div className="metric-mini"><span className="metric-label">TOTAL NODES</span><span className="metric-value">{stats?.nodes || 0}</span></div>
              <div className="metric-mini" style={{ marginTop: '12px' }}><span className="metric-label">TOTAL EDGES</span><span className="metric-value">{stats?.edges || 0}</span></div>
            </div>
          </section>
        </aside>
      </div>

      {/* GEO ANOMALY SECTION */}
      <section className="main-panel glass" style={{ marginTop: '32px' }}>
        <div className="panel-header">
          <h3 className="panel-title">GEOGRAPHIC ANOMALY DETECTION</h3>
          <span className="meta-sub">{geoResults.length} accounts flagged</span>
        </div>
        {geoError && <div style={{ padding: '12px 24px', color: 'var(--error)', fontSize: '0.8rem' }}>⚠ {geoError}</div>}
        <table className="alert-table">
          <thead>
            <tr>
              <th>ACCOUNT</th>
              <th>USUAL LOCATION</th>
              <th>ANOMALOUS LOCATIONS</th>
              <th>ANOMALY COUNT</th>
            </tr>
          </thead>
          <tbody>
            {geoResults.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--on-surface-variant)' }}>
                Click "DETECT GEO ANOMALIES" to scan
              </td></tr>
            ) : (
              geoResults.map((g, i) => (
                <tr key={i} className="alert-row">
                  <td><span className="alert-id tabular" style={{ color: 'var(--primary)' }}>{g.account}</span></td>
                  <td><span style={{ color: 'var(--secondary)' }}>{g.usual_location}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {Array.isArray(g.anomalous_locations) ? g.anomalous_locations.filter((v, j, a) => a.indexOf(v) === j).map((loc, j) => (
                        <span key={j} className="explain-tag" style={{ background: 'rgba(255,149,0,0.1)', borderColor: 'rgba(255,149,0,0.3)', color: '#ff9500' }}>{loc}</span>
                      )) : <span>{String(g.anomalous_locations)}</span>}
                    </div>
                  </td>
                  <td><span className="tabular" style={{ color: '#ff9500', fontWeight: 700 }}>{g.anomaly_count}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default NetworkVisualizer;
