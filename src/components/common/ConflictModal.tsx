import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, GitMerge, Check, X } from 'lucide-react';

export const ConflictModal: React.FC = () => {
  const { conflictState, resolveConflict } = useApp();

  if (!conflictState || !conflictState.isOpen) return null;

  return (
    <div className="modal-overlay" id="conflict-resolution-modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="modal-title">Concurrent Edit Conflict (FR-12)</h3>
              <p className="form-hint">Another collaborator updated this object while you were editing</p>
            </div>
          </div>
        </div>

        <div className="modal-content-area">
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '1rem', borderRadius: '8px' }}>
            <p style={{ fontSize: '0.88rem', color: '#fef3c7', lineHeight: 1.5 }}>
              The object <strong>&ldquo;{conflictState.objectName}&rdquo;</strong> was modified on the server and its revision moved to <strong>v{conflictState.remoteRevision}</strong>.
            </p>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
              To prevent silent overwrite loss, choose whether you want to force-apply your pending changes or discard them to sync with the latest remote version.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Pending Local Modifications</label>
            <pre style={{
              background: '#090d16',
              border: '1px solid #1e293b',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: '#38bdf8',
              maxHeight: '160px',
              overflow: 'auto'
            }}>
              {JSON.stringify(conflictState.localChanges, null, 2)}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-pill"
            onClick={() => resolveConflict(false)}
            title="Discard local changes and accept remote revision"
          >
            <X size={15} /> Discard My Changes
          </button>
          <button
            className="btn-pill primary"
            onClick={() => resolveConflict(true)}
            title="Force apply local changes"
          >
            <GitMerge size={15} /> Force Keep My Changes
          </button>
        </div>
      </div>
    </div>
  );
};
