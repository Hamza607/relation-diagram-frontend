import React from 'react';
import { useApp } from '../../context/AppContext';
import { History, X, Clock, User } from 'lucide-react';

export const ActivityHistoryDrawer: React.FC = () => {
  const { isActivityDrawerOpen, setIsActivityDrawerOpen, activityLogs } = useApp();

  if (!isActivityDrawerOpen) return null;

  return (
    <div className="side-drawer" id="activity-history-drawer">
      <div className="side-drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <History size={18} color="#10b981" />
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Project Audit &amp; Activity Log
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              SRS FR-09 Compliance Audit Trail
            </span>
          </div>
        </div>
        <button className="node-btn-icon" onClick={() => setIsActivityDrawerOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="side-drawer-content">
        {activityLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
            <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ fontWeight: 600 }}>No audit logs recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activityLogs.map(log => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: '#0f172a',
                  border: '1px solid #1e293b'
                }}
              >
                <img
                  src={log.userAvatar}
                  alt={log.userName}
                  className="avatar-circle"
                  style={{ width: 28, height: 28, flexShrink: 0, marginTop: 2 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f8fafc' }}>
                      {log.userName}
                    </span>
                    <span className="field-type-chip" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                      {log.entityType}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem', lineHeight: 1.35 }}>
                    {log.action}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
