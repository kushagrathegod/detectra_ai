import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApi } from '../context/ApiContext';

const Sidebar = () => {
  const { tigerStatus, reportStatus } = useApi();

  return (
    <aside className="sidebar glass">
      <div className="logo-section">
        <div className="logo-glyph"></div>
        <h2 className="logo-text">DETECTRA</h2>
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
          <span title="TigerGraph API" style={{ width: 6, height: 6, borderRadius: '50%', background: tigerStatus === 'online' ? 'var(--secondary)' : tigerStatus === 'checking' ? 'var(--outline)' : 'var(--error)', display: 'inline-block' }}></span>
          <span title="Report AI" style={{ width: 6, height: 6, borderRadius: '50%', background: reportStatus === 'online' ? 'var(--secondary)' : reportStatus === 'checking' ? 'var(--outline)' : 'var(--error)', display: 'inline-block' }}></span>
        </div>
      </div>
      <nav className="side-nav">
        <div className="nav-group">
          <span className="nav-label">COMMAND</span>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end title="Fraud Command Center">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Command Center
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Case Management">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Transaction Check
          </NavLink>
          <NavLink to="/visualizer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Transaction Graph">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="3"></circle><circle cx="19" cy="19" r="3"></circle><circle cx="5" cy="19" r="3"></circle><line x1="12" y1="8" x2="12" y2="14"></line><line x1="12" y1="14" x2="19" y2="17"></line><line x1="12" y1="14" x2="5" y2="17"></line></svg>
            Network & Geo
          </NavLink>
        </div>
        <div className="nav-group">
          <span className="nav-label">ANALYSIS</span>
          <NavLink to="/investigation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Investigation Lab">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Investigation Lab
          </NavLink>
          <NavLink to="/patterns" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Pattern Detection">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Pattern Detection
          </NavLink>
          <NavLink to="/report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="SAR Report">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            SAR Report
          </NavLink>
        </div>
        <div className="nav-group">
          <span className="nav-label">SYSTEM</span>
          <NavLink to="/api" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="API Status">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            API Status
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Settings">
            <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Settings
          </NavLink>
        </div>
      </nav>
      <div className="user-profile glass">
        <div className="user-avatar">DT</div>
        <div className="user-info">
          <span className="user-name">Detectra AI</span>
          <span className="user-role">Fraud Detection v1.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
