import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role } from '../../types/schema';
import { Shield, UserPlus, Mail, Trash2, CheckCircle2, Clock, XCircle, Key } from 'lucide-react';

export const WorkspaceAccessSettings: React.FC = () => {
  const {
    currentWorkspace,
    currentProject,
    members,
    invitations,
    inviteCollaborator,
    revokeInvitation,
    canManageMembers,
    currentUser
  } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteCollaborator(inviteEmail.trim(), inviteRole);
    setInviteEmail('');
  };

  return (
    <div className="records-view-container" id="access-settings-view">
      {/* Header Bar */}
      <div className="records-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="modal-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Shield size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Workspace Access &amp; Member Roles</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Multi-tenant isolated security governance (FR-01, FR-02)
            </p>
          </div>
        </div>

        <span className="badge-version">Tenant: {currentWorkspace.id}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Active Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <div style={{
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', color: '#f8fafc' }}>
              Active Project Members ({members.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {members.map(member => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid #1e293b'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="avatar-circle"
                      style={{ width: 36, height: 36 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                        {member.name}
                        {member.userId === currentUser.id && (
                          <span style={{ fontSize: '0.72rem', color: '#818cf8', marginLeft: '0.4rem' }}>
                            (You)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{member.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className={`role-chip ${member.role}`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations with Revoke Tokens (FR-02) */}
          <div style={{
            background: '#111827',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem', color: '#f8fafc' }}>
              Pending Invitations ({invitations.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {invitations.map(inv => (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    opacity: inv.status === 'revoked' ? 0.45 : 1
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inv.email}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <Clock size={11} /> Expires: {new Date(inv.expiresAt).toLocaleDateString()} &bull; Token: {inv.tokenHash}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className={`role-chip ${inv.role}`}>{inv.role}</span>
                    <span
                      className="field-type-chip"
                      style={{
                        color: inv.status === 'pending' ? '#fbbf24' : '#ef4444'
                      }}
                    >
                      {inv.status}
                    </span>

                    {canManageMembers && inv.status === 'pending' && (
                      <button
                        className="node-btn-icon"
                        onClick={() => revokeInvitation(inv.id)}
                        title="Revoke invitation token (FR-02)"
                        style={{ color: '#f87171' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Invite Collaborator Form */}
        <div style={{
          background: '#111827',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          height: 'fit-content',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.45rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} color="#6366f1" /> Invite Collaborator (FR-02)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Generate a secure, expiring token hash and dispatch an invitation link.
          </p>

          <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Collaborator Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                  disabled={!canManageMembers}
                />
                <Mail size={14} style={{ position: 'absolute', right: 10, top: 11, color: '#64748b' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Role Assignment</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as Role)}
                disabled={!canManageMembers}
              >
                <option value="editor">Editor / Project Member (Build schema &amp; records)</option>
                <option value="viewer">Viewer / Stakeholder (Inspect diagrams &amp; comment)</option>
                <option value="owner">Workspace Owner / Client (Full governance &amp; publish)</option>
              </select>
            </div>

            {canManageMembers ? (
              <button type="submit" className="btn-pill primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                <Mail size={15} /> Send Revocable Invite
              </button>
            ) : (
              <div style={{ padding: '0.75rem', background: '#0f172a', borderRadius: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                Only Workspace Owners can manage team permissions and invitations.
              </div>
            )}
          </form>

          {/* Role Capabilities Reference Table (SRS Section 2) */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.65rem' }}>
              Role Capabilities Matrix
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div>
                <strong style={{ color: '#818cf8' }}>Owner:</strong> Create projects, invite users, publish versions, delete entities.
              </div>
              <div>
                <strong style={{ color: '#34d399' }}>Editor:</strong> Create &amp; edit objects, fields, relationships, records, comments.
              </div>
              <div>
                <strong style={{ color: '#cbd5e1' }}>Viewer:</strong> View diagrams, inspect records, post comments.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
