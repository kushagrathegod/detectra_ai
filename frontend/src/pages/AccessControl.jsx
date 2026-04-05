import React from 'react';
import TopBar from '../components/TopBar';

const UserCard = ({ name, role, status, initials }) => (
  <div className="stat-card glass" style={{ minWidth: '220px', padding: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>{initials}</div>
      <div>
        <div className="meta-main" style={{ fontSize: '0.9rem' }}>{name}</div>
        <div className="meta-sub" style={{ fontSize: '0.7rem' }}>{role}</div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'ACTIVE' ? 'var(--secondary)' : 'var(--outline)' }}></div>
      <span className="meta-sub" style={{ fontSize: '0.65rem' }}>{status}</span>
    </div>
  </div>
);

const PermissionRow = ({ label, admin, Lead, analyst }) => (
  <tr>
    <td className="meta-main">{label}</td>
    <td><div className={`check-indicator ${admin ? 'active' : ''}`}>{admin && '✓'}</div></td>
    <td><div className={`check-indicator ${Lead ? 'active' : ''}`}>{Lead && '✓'}</div></td>
    <td><div className={`check-indicator ${analyst ? 'active' : ''}`}>{analyst && '✓'}</div></td>
  </tr>
);

const AccessControl = () => {
  const auditLogs = [
    { time: '10:42:15', user: 'YN', action: 'PERMISSION_OVERRIDE', target: 'CASE_SEC_04', critical: true },
    { time: '09:15:22', user: 'SA', action: 'ROLE_UPDATE', target: 'USER: JD', critical: false },
    { time: '08:02:11', user: 'SYS', action: 'MFA_SYNC_COMPLETE', target: 'GLOBAL', critical: false },
    { time: '07:45:00', user: 'ADMIN', action: 'CREDENTIAL_ROTATION', target: 'API_NODE_01', critical: true },
  ];

  return (
    <>
      <TopBar title="Access Control" subtitle="RBAC Governance & Multi-Entity Permissions" />
      
      <div className="grid-container">
        <div className="drawer-label">ACTIVE INVESTIGATORS</div>
        <div className="user-registry-row">
          <UserCard name="Yashu N." role="Chief Inspector" status="ACTIVE" initials="YN" />
          <UserCard name="Sarah A." role="Lead Analyst" status="ACTIVE" initials="SA" />
          <UserCard name="John D." role="Junior Auditor" status="OFFLINE" initials="JD" />
          <UserCard name="Mike R." role="Security Admin" status="ACTIVE" initials="MR" />
        </div>

        <div className="access-grid">
          <section className="main-panel glass" style={{ padding: '24px' }}>
            <div className="panel-header">
              <h3 className="panel-title">PERMISSION MATRIX</h3>
              <button className="panel-btn">EDIT POLICY</button>
            </div>
            <table className="permission-matrix">
              <thead>
                <tr>
                  <th>CAPABILITY</th>
                  <th>ADMIN</th>
                  <th>LEAD</th>
                  <th>ANALYST</th>
                </tr>
              </thead>
              <tbody>
                <PermissionRow label="Generate SAR Reports" admin Lead analyst />
                <PermissionRow label="Isolate Fraud Nodes" admin Lead analyst={false} />
                <PermissionRow label="View Full PII Data" admin Lead={false} analyst={false} />
                <PermissionRow label="Override AI Logic" admin Lead={false} analyst={false} />
                <PermissionRow label="Execute Batch Recovery" admin Lead analyst={false} />
              </tbody>
            </table>
          </section>

          <aside className="audit-panel">
            <div className="drawer-label" style={{ marginBottom: '16px' }}>SYSTEM AUDIT TRAIL</div>
            <div className="audit-stream">
              {auditLogs.map((log, i) => (
                <div key={i} className={`audit-event glass ${log.critical ? 'critical' : ''}`}>
                  <div className="audit-meta">
                    <span>{log.time}</span>
                    <span>UID: {log.user}</span>
                  </div>
                  <div className="meta-main" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{log.action}</div>
                  <div className="meta-sub" style={{ fontSize: '0.7rem' }}>TARGET: {log.target}</div>
                </div>
              ))}
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '24px' }}>EXPORT LOGS (.CSV)</button>
          </aside>
        </div>
      </div>
    </>
  );
};

export default AccessControl;
