import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import LiveIngestion from './LiveIngestion';

const TopBar = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { tigerStatus, reportStatus } = useApi();

  return (
    <header className="top-bar">
      <div className="top-left">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle || 'TigerGraph · Fraud Detection Intelligence'}</p>
      </div>
      <div className="top-right">
        <LiveIngestion />
        <div className="system-status">
          <span className={`status-dot ${tigerStatus === 'online' ? 'pulse' : ''}`} style={{ background: tigerStatus === 'online' ? 'var(--secondary)' : 'var(--error)' }}></span>
          <span className="status-label">{tigerStatus === 'online' ? 'API ONLINE' : tigerStatus === 'checking' ? 'CHECKING...' : 'API OFFLINE'}</span>
        </div>
        <div className="metrics-summary">
          <div className="metric-mini">
            <span className="metric-label">TIGERGRAPH</span>
            <span className="metric-value" style={{ color: tigerStatus === 'online' ? 'var(--secondary)' : 'var(--error)' }}>{tigerStatus === 'online' ? 'LIVE' : 'DOWN'}</span>
          </div>
          <div className="metric-mini">
            <span className="metric-label">REPORT AI</span>
            <span className="metric-value" style={{ color: reportStatus === 'online' ? 'var(--secondary)' : 'var(--error)' }}>{reportStatus === 'online' ? 'LIVE' : 'DOWN'}</span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/report')}>GENERATE SAR</button>
      </div>
    </header>
  );
};

export default TopBar;
