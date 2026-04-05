import React, { useState } from 'react';
import TopBar from '../components/TopBar';

const HeatMap = () => (
  <section className="heatmap-viz glass">
    <div className="viz-header" style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
      <h3 className="panel-title">GLOBAL ATTACK ORIGINS</h3>
      <span className="viz-live">REAL-TIME MONITOR</span>
    </div>
    <svg className="heatmap-svg" viewBox="0 0 800 400">
      <path d="M150,100 L200,80 L300,120 L400,100 L600,150 L700,120 L650,250 L500,300 L300,280 L100,200 Z" fill="rgba(173, 198, 255, 0.05)" stroke="var(--outline-variant)" strokeWidth="1" />
      <circle className="heat-dot" cx="200" cy="150" r="6" />
      <circle className="heat-dot" cx="450" cy="120" r="4" style={{ animationDelay: '0.5s' }} />
      <circle className="heat-dot" cx="600" cy="200" r="5" style={{ animationDelay: '1s' }} />
      <circle className="heat-dot" cx="300" cy="250" r="4" style={{ animationDelay: '1.5s' }} />
      <circle className="heat-dot" cx="550" cy="280" r="6" style={{ animationDelay: '0.2s' }} />
    </svg>
  </section>
);

const CampaignCard = ({ title, severity, target, lastIdentified }) => (
  <div className={`campaign-card glass ${severity.toLowerCase()}`}>
    <span className={`severity-ribbon ${severity.toLowerCase()}`}>{severity} RISK</span>
    <h4 className="meta-main" style={{ marginBottom: '4px' }}>{title}</h4>
    <p className="meta-sub" style={{ fontSize: '0.75rem', marginBottom: '12px' }}>Targeting: {target}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="page-subtitle" style={{ fontSize: '0.65rem' }}>ID: {lastIdentified}</span>
      <button className="panel-btn">VIEW INTEL</button>
    </div>
  </div>
);

const ThreatIntelligence = () => {
  const iocs = [
    { type: 'IP', value: '185.22.104.12', score: 98, lastSeen: '2m ago' },
    { type: 'DOMAIN', value: 'auth-sec-nexus.cc', score: 85, lastSeen: '15m ago' },
    { type: 'HASH', value: 'df82...a901', score: 100, lastSeen: '1h ago' },
    { type: 'IP', value: '92.41.0.21', score: 42, lastSeen: '3h ago' },
    { type: 'DOMAIN', value: 'fraud-shield-api.net', score: 91, lastSeen: '5h ago' },
  ];

  return (
    <>
      <TopBar title="Threat Intelligence" subtitle="Global Marketplace Surveillance & Signature Registry" />
      
      <div className="grid-container">
        <div className="stats-row">
          <div className="stat-card glass" style={{ borderLeft: '4px solid var(--primary)' }}>
            <span className="stat-label">BLOCKED DOMAINS</span>
            <div className="stat-value" style={{ marginTop: '8px' }}>12,842</div>
            <span className="stat-trend up">+4.2%</span>
          </div>
          <div className="stat-card glass" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <span className="stat-label">NEW SIGNATURES</span>
            <div className="stat-value" style={{ marginTop: '8px' }}>142</div>
            <span className="stat-trend up">Active</span>
          </div>
          <div className="stat-card glass" style={{ borderLeft: '4px solid var(--error)' }}>
            <span className="stat-label">DARK WEB MENTIONS</span>
            <div className="stat-value" style={{ marginTop: '8px' }}>28</div>
            <span className="stat-trend down">Flagged</span>
          </div>
        </div>

        <div className="intel-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <HeatMap />
            <section className="main-panel glass" style={{ padding: '24px' }}>
              <div className="panel-header">
                <h3 className="panel-title">INDICATORS OF COMPROMISE (IOC)</h3>
                <input 
                  type="text" 
                  placeholder="SEARCH REGISTRY..." 
                  className="glass" 
                  style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--outline-variant)', background: 'transparent', color: 'var(--on-surface)', fontSize: '0.75rem' }}
                />
              </div>
              <table className="ioc-table-compact">
                <thead>
                  <tr className="ioc-row">
                    <td className="ioc-type-tag">TYPE</td>
                    <td className="ioc-type-tag">VALUE</td>
                    <td className="ioc-type-tag">SCORE</td>
                    <td className="ioc-type-tag">OBSERVED</td>
                  </tr>
                </thead>
                <tbody>
                  {iocs.map((ioc, i) => (
                    <tr key={i} className="ioc-row">
                      <td style={{ color: 'var(--primary)', fontWeight: '700' }}>{ioc.type}</td>
                      <td className="meta-main">{ioc.value}</td>
                      <td>
                        <span style={{ color: ioc.score > 80 ? 'var(--error)' : 'var(--on-surface)' }}>{ioc.score}/100</span>
                      </td>
                      <td className="meta-sub">{ioc.lastSeen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <aside className="campaign-list">
            <div className="drawer-label">ACTIVE CAMPAIGNS</div>
            <CampaignCard 
              title='Operation "Snowflake"' 
              severity="HIGH" 
              target="E-commerce Gateway" 
              lastIdentified="2024-C09" 
            />
            <CampaignCard 
              title='Protocol Injection "Hydra"' 
              severity="MEDIUM" 
              target="SWIFT Messengers" 
              lastIdentified="2024-C12" 
            />
            <CampaignCard 
              title='Metadata Hijack' 
              severity="HIGH" 
              target="Crypto Wallets" 
              lastIdentified="2024-C15" 
            />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ThreatIntelligence;
