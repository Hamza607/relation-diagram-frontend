import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Activity,
  Layers,
  Database,
  Shield,
  MessageSquare,
  History,
  Download,
  Share2,
  Palette,
  ChevronDown,
  Check,
  UserCheck,
  FileJson,
  FileImage,
  FileCode,
  Sparkles,
  GitCommit
} from 'lucide-react';
import {
  exportDiagramPNG,
  exportDiagramSVG,
  exportDiagramPDF,
  exportSchemaJSON
} from '../../utils/exportDiagram';

export const Header: React.FC = () => {
  const {
    currentUser,
    allUsers,
    setCurrentUser,
    currentWorkspace,
    allWorkspaces,
    setCurrentWorkspace,
    currentProject,
    allProjects,
    setCurrentProject,
    activeView,
    setActiveView,
    objects,
    relationships,
    records,
    comments,
    setIsCommentsDrawerOpen,
    setIsActivityDrawerOpen,
    setIsVersionModalOpen,
    setIsBrandingModalOpen,
    canPublish
  } = useApp();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const handleExportPNG = async () => {
    setIsExportMenuOpen(false);
    await exportDiagramPNG('diagram-canvas-viewport', currentProject.name);
  };

  const handleExportSVG = () => {
    setIsExportMenuOpen(false);
    exportDiagramSVG(currentProject.name, objects, relationships);
  };

  const handleExportPDF = async () => {
    setIsExportMenuOpen(false);
    await exportDiagramPDF('diagram-canvas-viewport', currentProject.name);
  };

  const handleExportJSON = () => {
    setIsExportMenuOpen(false);
    exportSchemaJSON(currentProject, objects, relationships, records);
  };

  return (
    <>
      <header className="top-navbar" id="app-top-header">
        {/* Left: Branding & Workspace Switcher */}
        <div className="brand-section">
          <div
            className="brand-logo-badge"
            style={{
              background: `linear-gradient(135deg, ${currentWorkspace.branding.primaryColor}, ${currentWorkspace.branding.accentColor})`
            }}
          >
            <Boxes size={22} />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', textAlign: 'left' }}
            >
              <div className="brand-titles">
                <span className="brand-name">{currentWorkspace.branding.name}</span>
                <span className="brand-tagline">{currentProject.name}</span>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
            </button>

            {/* Workspace Dropdown */}
            {isWorkspaceMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.5rem',
                  background: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '260px',
                  zIndex: 60,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Select Client Workspace (FR-01)
                </div>
                {allWorkspaces.map(ws => (
                  <div
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    style={{
                      padding: '0.65rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: ws.id === currentWorkspace.id ? '#1e293b' : 'transparent',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{ws.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{ws.branding.tagline}</div>
                    </div>
                    {ws.id === currentWorkspace.id && <Check size={14} color="#6366f1" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="nav-tab-pills" id="nav-views-bar">
          <button
            className={`nav-tab-btn ${activeView === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveView('builder')}
            title="Interactive Visual Diagram Canvas (FR-06)"
          >
            <Layers size={15} />
            <span>Diagram Canvas</span>
            <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: 99, background: 'rgba(255,255,255,0.15)' }}>
              {objects.length}
            </span>
          </button>

          <button
            className={`nav-tab-btn ${activeView === 'records' ? 'active' : ''}`}
            onClick={() => setActiveView('records')}
            title="Data Records Manager &amp; Dynamic Entry (FR-08)"
          >
            <Database size={15} />
            <span>Data Records</span>
            <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: 99, background: 'rgba(255,255,255,0.15)' }}>
              {records.length}
            </span>
          </button>

          <button
            className={`nav-tab-btn ${activeView === 'access' ? 'active' : ''}`}
            onClick={() => setActiveView('access')}
            title="Access Governance &amp; Invitations (FR-01, FR-02)"
          >
            <Shield size={15} />
            <span>Access &amp; Roles</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Version Publish Button (FR-09, FR-14) */}
          <button
            className="btn-pill"
            onClick={() => setIsVersionModalOpen(true)}
            title="Manage Releases &amp; Publish Version Snapshot"
            style={{ color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}
          >
            <GitCommit size={14} /> v{currentProject.currentVersion}
          </button>

          {/* Comments Drawer Button */}
          <button
            className="btn-pill"
            onClick={() => setIsCommentsDrawerOpen(true)}
            title="Open Discussions Drawer"
          >
            <MessageSquare size={14} />
            <span>Comments</span>
            {comments.length > 0 && (
              <span className="field-type-chip" style={{ fontSize: '10px', padding: '0 4px' }}>
                {comments.length}
              </span>
            )}
          </button>

          {/* Audit Activity Log Button */}
          <button
            className="btn-pill"
            onClick={() => setIsActivityDrawerOpen(true)}
            title="View Audit Trail (FR-09)"
          >
            <History size={14} />
          </button>

          {/* Workspace Branding Button */}
          <button
            className="btn-pill"
            onClick={() => setIsBrandingModalOpen(true)}
            title="Configure Workspace Theme &amp; Logo"
          >
            <Palette size={14} />
          </button>

          {/* Export Dropdown Button (FR-10) */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-pill primary"
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              title="Export Schema &amp; Diagram (PNG, SVG, PDF, JSON)"
            >
              <Download size={14} /> Export <ChevronDown size={12} />
            </button>

            {isExportMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.45rem',
                  background: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '210px',
                  zIndex: 60,
                  overflow: 'hidden'
                }}
              >
                <button
                  className="toolbar-btn"
                  onClick={handleExportPNG}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                >
                  <FileImage size={15} color="#38bdf8" /> Export High-Res PNG
                </button>
                <button
                  className="toolbar-btn"
                  onClick={handleExportSVG}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                >
                  <FileCode size={15} color="#a855f7" /> Export Vector SVG
                </button>
                <button
                  className="toolbar-btn"
                  onClick={handleExportPDF}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                >
                  <Download size={15} color="#ef4444" /> Export Document PDF
                </button>
                <div style={{ height: 1, background: '#1e293b' }} />
                <button
                  className="toolbar-btn"
                  onClick={handleExportJSON}
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '0.65rem 0.85rem' }}
                >
                  <FileJson size={15} color="#10b981" /> Export Schema JSON (FR-10)
                </button>
              </div>
            )}
          </div>

          {/* User Role Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button
              className="user-role-badge-button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              title="Switch Active Simulated User (Test Permissions)"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="avatar-circle" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>
              <span className={`role-chip ${currentUser.role}`}>
                {currentUser.role.replace('_', ' ')}
              </span>
              <ChevronDown size={12} color="#94a3b8" />
            </button>

            {/* User Switcher Dropdown */}
            {isUserMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: '#111827',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  width: '280px',
                  zIndex: 60,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '0.6rem 0.85rem', fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  Simulate Role &amp; User (Permission Testing)
                </div>
                {allUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setIsUserMenuOpen(false);
                    }}
                    style={{
                      padding: '0.65rem 0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: user.id === currentUser.id ? '#1e293b' : 'transparent',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img src={user.avatar} alt={user.name} className="avatar-circle" style={{ width: 28, height: 28 }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{user.email}</div>
                      </div>
                    </div>
                    <span className={`role-chip ${user.role}`}>{user.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sub-navbar showing Project Status, Breadcrumbs and Live Active Users Presence */}
      <div className="sub-navbar">
        <div className="project-breadcrumbs">
          <span>{currentWorkspace.name}</span>
          <span>/</span>
          <strong style={{ color: '#f8fafc' }}>{currentProject.name}</strong>
          <span className={`badge-status ${currentProject.status}`}>
            {currentProject.status}
          </span>
          <span className="badge-version">v{currentProject.currentVersion}</span>
        </div>

        {/* Live Multiplayer Presence Indicator (SRS Section 13) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            Collaborating Now:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-0.3rem' }}>
            {allUsers.slice(0, 3).map((u, i) => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={`${u.name} (${u.role})`}
                className="avatar-circle"
                style={{
                  width: 24,
                  height: 24,
                  marginLeft: i > 0 ? -6 : 0,
                  border: '1.5px solid #111827'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
