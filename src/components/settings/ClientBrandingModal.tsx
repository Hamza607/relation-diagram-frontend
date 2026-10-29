import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Palette, X, Sparkles } from 'lucide-react';

export const ClientBrandingModal: React.FC = () => {
  const {
    isBrandingModalOpen,
    setIsBrandingModalOpen,
    currentWorkspace,
    updateWorkspaceBranding,
    canManageMembers
  } = useApp();

  const [name, setName] = useState(currentWorkspace.branding.name);
  const [tagline, setTagline] = useState(currentWorkspace.branding.tagline);
  const [primaryColor, setPrimaryColor] = useState(currentWorkspace.branding.primaryColor);
  const [accentColor, setAccentColor] = useState(currentWorkspace.branding.accentColor);

  if (!isBrandingModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspaceBranding({
      name,
      tagline,
      primaryColor,
      accentColor
    });
    setIsBrandingModalOpen(false);
  };

  return (
    <div className="modal-overlay" id="client-branding-modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: `${primaryColor}25`, color: primaryColor }}>
              <Palette size={20} />
            </div>
            <div>
              <h3 className="modal-title">Client Workspace Branding</h3>
              <p className="form-hint">Customize organization identity and theme accents</p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={() => setIsBrandingModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            <div className="form-group">
              <label className="form-label">Client / Organization Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={!canManageMembers}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline / Mission</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                disabled={!canManageMembers}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Primary Brand Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    disabled={!canManageMembers}
                    style={{ width: 44, height: 36, padding: 0, cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{primaryColor}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Secondary Accent Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    disabled={!canManageMembers}
                    style={{ width: 44, height: 36, padding: 0, cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{accentColor}</span>
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              background: '#090d16',
              border: '1px solid #1e293b',
              marginTop: '0.5rem'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
                Header Preview
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>{name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{tagline}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-pill" onClick={() => setIsBrandingModalOpen(false)}>
              Cancel
            </button>
            {canManageMembers && (
              <button type="submit" className="btn-pill primary">
                Save Branding
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
