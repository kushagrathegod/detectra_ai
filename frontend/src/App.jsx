import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApiProvider, useApi } from './context/ApiContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlertCenter from './pages/AlertCenter';
import NetworkVisualizer from './pages/NetworkVisualizer';
import InvestigationLab from './pages/InvestigationLab';
import ThreatIntelligence from './pages/ThreatIntelligence';
import PatternMapping from './pages/PatternMapping';
import AccessControl from './pages/AccessControl';
import APIIntegration from './pages/APIIntegration';
import Settings from './pages/Settings';
import ReportGenerator from './pages/ReportGenerator';
import './App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useApi();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout wrapper to inject protection
const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

function App() {
  return (
    <ApiProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/alerts" element={<AlertCenter />} />
                <Route path="/visualizer" element={<NetworkVisualizer />} />
                <Route path="/investigation" element={<InvestigationLab />} />
                <Route path="/intelligence" element={<ThreatIntelligence />} />
                <Route path="/patterns" element={<PatternMapping />} />
                <Route path="/access" element={<AccessControl />} />
                <Route path="/api" element={<APIIntegration />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/report" element={<ReportGenerator />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </ProtectedLayout>
          } />
        </Routes>
      </Router>
    </ApiProvider>
  );
}

export default App;
