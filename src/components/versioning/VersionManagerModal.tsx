import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectVersion } from '../../types/schema';
import { History, GitCommit, GitBranch, ArrowUpRight, RotateCcw, GitCompare, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VersionManagerModal: React.FC = () => {
  const {
    isVersionModalOpen,
    setIsVersionModalOpen,
    versions,
    publishVersion,
    restoreVersion,
    setIsDiffModalOpen,
    setDiffVersion,
    canPublish
  } = useApp();

  const [versionLabel, setVersionLabel] = useState('');
  const [versionNotes, setVersionNotes] = useState('');

  if (!isVersionModalOpen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;

    publishVersion(versionLabel, versionNotes);

    // Trigger celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setVersionLabel('');
    setVersionNotes('');
  };

  const handleOpenDiff = (ver: ProjectVersion) => {
    setDiffVersion(ver);
    setIsDiffModalOpen(true);
  };

  return (
    <div className="modal-overlay" id="version-manager-modal">
      <div className="modal-dialog wide">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <History size={20} />
            </div>
            <div>
              <h3 className="modal-title">Model Versioning &amp; Releases (FR-09, FR-14)</h3>
              <p className="form-hint">Publish immutable schema snapshots and inspect historical revisions</p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={() => setIsVersionModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-area">
          {/* Publish New Snapshot Form */}
          {canPublish && (
            <form
              onSubmit={handlePublish}
              style={{
                padding: '1.2rem',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.07)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontWeight: 700, fontSize: '0.9rem' }}>
                <Sparkles size={16} /> Publish New Immutable Release Snapshot
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Release Title / Milestone</label>
                  <input
                    type="text"
                    placeholder="e.g. Q4 Retail Architecture Baseline"
                    value={versionLabel}
                    onChange={e => setVersionLabel(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Release Notes &amp; Changelog</label>
                  <input
                    type="text"
                    placeholder="e.g. Added line item unit prices and payment gateway references"
                    value={versionNotes}
                    onChange={e => setVersionNotes(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-pill primary">
                  <GitCommit size={15} /> Freeze &amp; Publish v1.{versions.length}.0
                </button>
              </div>
            </form>
          )}

          {/* Versions List */}
          <div className="form-group">
            <label className="form-label">Published Release Snapshots ({versions.length})</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {versions.map(ver => (
                <div
                  key={ver.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#818cf8',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem'
                      }}
                    >
                      v{ver.versionNumber}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                        {ver.label}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                        {ver.notes}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                        Published by {ver.publishedBy} &bull; {new Date(ver.publishedAt).toLocaleString()} &bull; {ver.snapshot.objects.length} Objects &bull; {ver.snapshot.relationships.length} Relations
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn-pill"
                      onClick={() => handleOpenDiff(ver)}
                      title="Compare differences with current schema"
                    >
                      <GitCompare size={14} /> Diff
                    </button>

                    {canPublish && (
                      <button
                        className="btn-pill"
                        onClick={() => restoreVersion(ver.id)}
                        title="Restore this schema snapshot into active workspace"
                        style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-pill primary" onClick={() => setIsVersionModalOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
