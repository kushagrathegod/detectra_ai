import React from 'react';

const LiveIngestion = () => (
  <div className="live-ingestion">
    <div className="ingestion-label">
      <span className="pulse-dot"></span>
      LIVE INGESTION
    </div>
    <div className="ingestion-visualizer">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="ingestion-bar" style={{ 
          height: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.1}s` 
        }}></div>
      ))}
    </div>
  </div>
);

export default LiveIngestion;
