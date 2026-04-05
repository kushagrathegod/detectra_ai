import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="dashboard-root">
      <Sidebar />
      <main className="main-stage">
        {children}
      </main>
    </div>
  );
};

export default Layout;
