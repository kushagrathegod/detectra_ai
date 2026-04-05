import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../context/ApiContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useApi();

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // Hardcoded demo credentials
    if (username === 'admin' && password === 'admin123') {
      setTimeout(() => {
        login(); 
        setIsLoading(false);
        navigate('/');
      }, 1200);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setErrorMsg('Invalid Agent ID or Passkey. Access Denied.');
      }, 800);
    }
  };

  const handleLostKey = (e) => {
    e.preventDefault();
    alert("Authorization Reset: Please contact the central command node administrator to reset your passkey.");
  };

  return (
    <div className="login-container">
      <div className="login-bg-glow"></div>
      <div className="login-bg-glow secondary"></div>
      
      <div className="login-card glass-premium hologram-effect">
        <div className="login-header">
          <div className="login-logo">
            <span className="login-logo-icon"></span>
            Detectra AI
          </div>
          <p className="login-subtitle">Neural Fraud Identification Network</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {errorMsg && <div style={{ color: 'var(--status-critical)', fontSize: '13px', textAlign: 'center' }}>{errorMsg}</div>}
          <div className="input-group">
            <label className="input-label" htmlFor="username">Agent ID / Email</label>
            <input 
              id="username"
              type="text" 
              className="login-input" 
              placeholder="Use 'admin'" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="password">Passkey</label>
            <input 
              id="password"
              type="password" 
              className="login-input" 
              placeholder="Use 'admin123'" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" className="remember-checkbox" />
              <span>Remember session</span>
            </label>
            <a href="#" className="forgot-password" onClick={handleLostKey}>Lost Key?</a>
          </div>

          <div className="login-btn-container">
            <button type="submit" className="btn-primary login-submit-btn" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : (
                <>
                  Initialize Uplink
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="login-footer">
          Secured by Sentient Nexus Protocol v4.2
        </div>
      </div>
    </div>
  );
};

export default Login;
