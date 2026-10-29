import React from 'react';
import { useApp } from '../../context/AppContext';
import { validateSchema } from '../../utils/validation';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ValidationIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ValidationIssuesModal: React.FC<ValidationIssuesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { objects, relationships, setSelectedObjectId } = useApp();

  if (!isOpen) return null;

  const issues = validateSchema(objects, relationships);
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  return (
    <div className="modal-overlay" id="validation-report-modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div
              className="modal-icon-badge"
              style={{
                background: errors.length > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: errors.length > 0 ? '#f87171' : '#34d399'
              }}
            >
              {errors.length > 0 ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <div>
              <h3 className="modal-title">Schema Integrity Validation Report</h3>
              <p className="form-hint">
                Evaluated {objects.length} objects, {relationships.length} relationships
              </p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-area">
          {issues.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <CheckCircle2 size={44} color="#10b981" />
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
                All Validation Checks Passed!
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', maxWidth: '360px' }}>
                No orphaned references, duplicate keys, or broken relationship endpoints were found. The data model is consistent.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Summary Stats */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="role-chip" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                  {errors.length} Critical Errors
                </span>
                <span className="role-chip" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  {warnings.length} Warnings
                </span>
                <span className="role-chip" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
                  {infos.length} Suggestions
                </span>
              </div>

              {issues.map(iss => {
                const IconComp =
                  iss.severity === 'error'
                    ? AlertCircle
                    : iss.severity === 'warning'
                    ? AlertTriangle
                    : Info;
                const iconColor =
                  iss.severity === 'error'
                    ? '#ef4444'
                    : iss.severity === 'warning'
                    ? '#f59e0b'
                    : '#6366f1';

                return (
                  <div
                    key={iss.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: `1px solid ${iconColor}40`
                    }}
                  >
                    <IconComp size={18} color={iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                          {iss.targetName}
                        </span>
                        <span className="field-type-chip" style={{ textTransform: 'uppercase' }}>
                          {iss.targetType}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {iss.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-pill primary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
