import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-notifications-root">
      {toasts.map(toast => {
        let Icon = Info;
        if (toast.type === 'success') Icon = CheckCircle2;
        if (toast.type === 'error') Icon = AlertCircle;
        if (toast.type === 'warning') Icon = AlertTriangle;

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <Icon size={18} style={{ marginTop: 2, flexShrink: 0 }} />
            <div className="toast-content">
              <span className="toast-title">{toast.title}</span>
              {toast.message && <span className="toast-desc">{toast.message}</span>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: '#94a3b8', padding: 2 }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
