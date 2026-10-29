import React from 'react';
import { useApp } from '../../context/AppContext';
import { GitCompare, X, PlusCircle, MinusCircle, RefreshCw, Check } from 'lucide-react';

export const VersionDiffModal: React.FC = () => {
  const { isDiffModalOpen, setIsDiffModalOpen, diffVersion, objects, relationships } = useApp();

  if (!isDiffModalOpen || !diffVersion) return null;

  const currentObjKeys = new Set(objects.map(o => o.key));
  const versionObjKeys = new Set(diffVersion.snapshot.objects.map(o => o.key));

  const addedObjects = objects.filter(o => !versionObjKeys.has(o.key));
  const removedObjects = diffVersion.snapshot.objects.filter(o => !currentObjKeys.has(o.key));
  const commonObjects = objects.filter(o => versionObjKeys.has(o.key));

  return (
    <div className="modal-overlay" id="version-diff-modal">
      <div className="modal-dialog wide">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <GitCompare size={20} />
            </div>
            <div>
              <h3 className="modal-title">
                Schema Diff: Current Draft vs. v{diffVersion.versionNumber}
              </h3>
              <p className="form-hint">
                Snapshot captured on {new Date(diffVersion.publishedAt).toLocaleDateString()} by {diffVersion.publishedBy}
              </p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={() => setIsDiffModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-area">
          {/* Summary counts */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span className="role-chip" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              +{addedObjects.length} Added Entities
            </span>
            <span className="role-chip" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              -{removedObjects.length} Removed Entities
            </span>
            <span className="role-chip" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
              {commonObjects.length} Retained Entities
            </span>
          </div>

          <div className="diff-comparison-grid">
            {/* Left: Snapshot Version */}
            <div className="diff-column-card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
                Snapshot v{diffVersion.versionNumber} ({diffVersion.snapshot.objects.length} Objects)
              </div>

              {diffVersion.snapshot.objects.map(obj => {
                const isRemovedInCurrent = !currentObjKeys.has(obj.key);

                return (
                  <div
                    key={obj.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: isRemovedInCurrent ? 'rgba(239, 68, 68, 0.1)' : '#0f172a',
                      border: isRemovedInCurrent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #1e293b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: obj.color }}>{obj.singularLabel}</span>
                      <span className="field-type-chip">{obj.key}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {obj.fields.length} fields defined
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Current Draft */}
            <div className="diff-column-card">
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#818cf8', borderBottom: '1px solid #1e293b', paddingBottom: '0.4rem' }}>
                Active Current Workspace ({objects.length} Objects)
              </div>

              {objects.map(obj => {
                const isNewlyAdded = !versionObjKeys.has(obj.key);

                return (
                  <div
                    key={obj.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: isNewlyAdded ? 'rgba(16, 185, 129, 0.1)' : '#0f172a',
                      border: isNewlyAdded ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #1e293b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: obj.color }}>{obj.singularLabel}</span>
                      {isNewlyAdded && (
                        <span className="role-chip" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {obj.fields.length} fields defined
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-pill primary" onClick={() => setIsDiffModalOpen(false)}>
            Close Diff
          </button>
        </div>
      </div>
    </div>
  );
};
