import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
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
