import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  GitFork,
  LayoutGrid,
  CheckCheck,
  FolderOpen,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { validateSchema } from '../../utils/validation';

interface CanvasToolbarProps {
  onOpenValidation: () => void;
  onFitView: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onOpenValidation,
  onFitView
}) => {
  const {
    setIsCreateObjectOpen,
    setIsRelationshipModalOpen,
    applyAutoLayout,
    setIsTemplateModalOpen,
    objects,
    relationships,
    zoom,
    setZoom,
    setPan,
    canEdit
  } = useApp();

  const validationIssues = validateSchema(objects, relationships);
  const errorCount = validationIssues.filter(i => i.severity === 'error').length;
  const warningCount = validationIssues.filter(i => i.severity === 'warning').length;

  const handleZoomIn = () => setZoom(prev => Math.min(2.0, Number((prev + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom(prev => Math.max(0.35, Number((prev - 0.15).toFixed(2))));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      {/* Top Left Floating Action Bar */}
      <div className="canvas-floating-toolbar" id="canvas-main-toolbar">
        {canEdit && (
          <>
            <button
              className="toolbar-btn primary"
              onClick={() => setIsCreateObjectOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
              }}
              title="Define custom object (FR-03)"
            >
              <Plus size={15} /> Add Object
            </button>

            <button
              className="toolbar-btn"
              onClick={() => setIsRelationshipModalOpen(true)}
              title="Define 1:1, 1:N or N:N relationship (FR-05)"
            >
              <GitFork size={15} /> Add Relation
            </button>

            <div className="toolbar-divider" />
          </>
        )}

        <button
          className="toolbar-btn"
          onClick={applyAutoLayout}
          title="Auto-arrange objects using hierarchical DAG layout"
        >
          <LayoutGrid size={15} /> Auto Layout
        </button>

        <button
          className="toolbar-btn"
          onClick={onOpenValidation}
          title="Validate foreign keys and model rules"
          style={{ position: 'relative' }}
        >
          <CheckCheck size={15} color={errorCount > 0 ? '#ef4444' : warningCount > 0 ? '#f59e0b' : '#10b981'} />
          Validate
          {errorCount > 0 && (
            <span
              style={{
                marginLeft: 4,
                background: '#ef4444',
                color: 'white',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: 999,
                fontWeight: 800
              }}
            >
              {errorCount}
            </span>
          )}
        </button>

        <div className="toolbar-divider" />

        <button
          className="toolbar-btn"
          onClick={() => setIsTemplateModalOpen(true)}
          title="Load pre-built industry schema templates (E-Commerce, Real Estate, SaaS)"
        >
          <Sparkles size={15} color="#a855f7" /> Templates
        </button>
      </div>

      {/* Bottom Left Zoom Controls */}
      <div className="zoom-controls-widget" id="canvas-zoom-controls">
        <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut size={16} />
        </button>
        <div className="zoom-label" title="Current Zoom Scale">
          {Math.round(zoom * 100)}%
        </div>
        <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn size={16} />
        </button>
        <div className="toolbar-divider" style={{ height: 16 }} />
        <button className="zoom-btn" onClick={handleResetZoom} title="Reset Zoom to 100%">
          <RotateCcw size={14} />
        </button>
        <button className="zoom-btn" onClick={onFitView} title="Fit Entire Diagram into Viewport">
          <Maximize2 size={14} />
        </button>
      </div>
    </>
  );
};
