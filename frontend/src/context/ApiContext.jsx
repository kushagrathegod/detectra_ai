import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { healthCheck, reportHealthCheck } from '../api/fraudApi';

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('fraudnet_api_key') || '');
  // Removed localStorage so it defaults to false on every load/refresh
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tigerStatus, setTigerStatus] = useState('checking');
  const [reportStatus, setReportStatus] = useState('checking');
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);

  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const setApiKey = useCallback((key) => {
    localStorage.setItem('fraudnet_api_key', key);
    setApiKeyState(key);
  }, []);

  const addTransaction = useCallback((result) => {
    setTransactionHistory(prev => {
      const updated = [{ ...result, _timestamp: Date.now() }, ...prev];
      return updated.slice(0, 50);
    });
  }, []);

  const checkStatuses = useCallback(async () => {
    setTigerStatus('checking');
    setReportStatus('checking');
    const [tg, rpt] = await Promise.all([healthCheck(), reportHealthCheck()]);
    setTigerStatus(tg ? 'online' : 'offline');
    setReportStatus(rpt ? 'online' : 'offline');
  }, []);

  useEffect(() => {
    checkStatuses();
    const interval = setInterval(checkStatuses, 60000);
    return () => clearInterval(interval);
  }, [checkStatuses]);

  return (
    <ApiContext.Provider value={{
      apiKey,
      setApiKey,
      isAuthenticated,
      login,
      logout,
      tigerStatus,
      reportStatus,
      checkStatuses,
      transactionHistory,
      addTransaction,
      reportTarget,
      setReportTarget,
    }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}

export default ApiContext;
