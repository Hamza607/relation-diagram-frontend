import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertOctagon, ShieldAlert, ArrowRight, Trash2, X, AlertTriangle } from 'lucide-react';

export const DeleteImpactModal: React.FC = () => {
  const {
    isDeleteImpactOpen,
    setIsDeleteImpactOpen,
    deleteImpactData,
    deleteObject
  } = useApp();

  if (!isDeleteImpactOpen || !deleteImpactData) return null;

  const {
    canDelete,
    blockedReason,
    targetObject,
    incomingRelations,
    affectedRecordsCount,
    cascadedRecordsCount,
    policyNotes
  } = deleteImpactData;

  const handleConfirmDelete = () => {
    deleteObject(targetObject.id, true);
    setIsDeleteImpactOpen(false);
  };

  return (
    <div className="modal-overlay" id="delete-impact-modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div
              className="modal-icon-badge"
              style={{
                background: canDelete ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: canDelete ? '#f87171' : '#fbbf24'
              }}
            >
              {canDelete ? <AlertOctagon size={22} /> : <ShieldAlert size={22} />}
            </div>
            <div>
              <h3 className="modal-title">Delete Impact Analysis (FR-11)</h3>
              <p className="form-hint">Evaluating foreign key relationships and dependent records</p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={() => setIsDeleteImpactOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-area">
          {/* Target object pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem',
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '8px'
          }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: targetObject.color
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{targetObject.singularLabel}</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                Key: {targetObject.key} &bull; Fields: {targetObject.fields.length}
              </div>
            </div>
            <span className="role-chip" style={{ background: '#334155', color: '#e2e8f0' }}>
              {affectedRecordsCount} records stored
            </span>
          </div>

          {/* Blocked Alert or Warning */}
          {!canDelete ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              padding: '1rem',
              borderRadius: '8px',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <ShieldAlert size={22} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#fca5a5', display: 'block', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                  Deletion Blocked by RESTRICT Policy
                </strong>
                <p style={{ fontSize: '0.82rem', color: '#fecaca', lineHeight: 1.45 }}>
                  {blockedReason}
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              gap: '0.65rem',
              alignItems: 'center'
            }}>
              <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.82rem', color: '#fef3c7' }}>
                Are you sure? Removing this definition will permanently delete the schema definition and impact linked data.
              </p>
            </div>
          )}

          {/* Incoming Foreign References */}
          <div className="form-group">
            <label className="form-label">
              Incoming Foreign References ({incomingRelations.length})
            </label>
            {incomingRelations.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                No other objects currently reference this definition.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {incomingRelations.map(({ fromObject, relationship, policy }) => (
                  <div
                    key={relationship.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem',
                      background: '#162032',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{fromObject.singularLabel}</span>
                      <ArrowRight size={13} color="#64748b" />
                      <span style={{ color: '#94a3b8' }}>{targetObject.singularLabel}</span>
                    </div>
                    <span
                      className="role-chip"
                      style={{
                        background:
                          policy === 'restrict'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : policy === 'cascade'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(99, 102, 241, 0.2)',
                        color:
                          policy === 'restrict'
                            ? '#f87171'
                            : policy === 'cascade'
                            ? '#fbbf24'
                            : '#818cf8',
                        textTransform: 'uppercase'
                      }}
                    >
                      Policy: {policy}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Policy notes breakdown */}
          {policyNotes.length > 0 && (
            <div className="form-group">
              <label className="form-label">Data Impact Summary</label>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {policyNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
                {cascadedRecordsCount > 0 && (
                  <li style={{ color: '#f87171', fontWeight: 600 }}>
                    {cascadedRecordsCount} dependent records will be automatically wiped via CASCADE.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-pill" onClick={() => setIsDeleteImpactOpen(false)}>
            Cancel
          </button>
          {canDelete ? (
            <button
              className="btn-pill"
              onClick={handleConfirmDelete}
              style={{ background: '#ef4444', borderColor: '#dc2626', color: 'white' }}
            >
              <Trash2 size={15} /> Confirm &amp; Delete Object
            </button>
          ) : (
            <button className="btn-pill" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Deletion Blocked
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
