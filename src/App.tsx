import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  LayoutGrid,
  Eye,
  Edit3,
  Key,
  Link2,
  Search,
  Check,
  X,
  FileDown,
  Upload,
  ArrowRight,
  GitFork,
  Save,
  Database,
  FolderOpen
} from 'lucide-react';
import html2canvas from 'html2canvas';

export type Cardinality = '1:1' | '1:N' | 'N:N';

export interface Field {
  id: string;
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
}

export interface Table {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  fields: Field[];
}

export interface Relation {
  id: string;
  fromTableId: string;
  toTableId: string;
  cardinality: Cardinality;
  label?: string;
}

export interface DiagramRecord {
  _id: string;
  name: string;
  tables: Table[];
  relations: Relation[];
  createdAt?: string;
  updatedAt?: string;
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];
const FIELD_TYPES = ['INT', 'VARCHAR', 'TEXT', 'DECIMAL', 'DATE', 'BOOLEAN'];

const API_BASE_URL = 'http://localhost:5001/api';

export function App() {
  const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('My Database Schema');
  const [mode, setMode] = useState<'client' | 'user'>('client'); // client = edit, user = view
  
  // Real dynamic data from MongoDB (no hardcoded mock tables)
  const [tables, setTables] = useState<Table[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  
  // Database status
  const [dbStatus, setDbStatus] = useState<'connected' | 'saving' | 'saved' | 'error'>('connected');
  const [allDiagrams, setAllDiagrams] = useState<DiagramRecord[]>([]);
  const [isDiagramsModalOpen, setIsDiagramsModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Canvas Viewport Pan & Zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging Table
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connecting Table
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Add Relation Modal
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [modalSourceTableId, setModalSourceTableId] = useState('');
  const [modalTargetTableId, setModalTargetTableId] = useState('');
  const [modalCardinality, setModalCardinality] = useState<Cardinality>('1:N');

  // Field Input Row state per table
  const [newFieldName, setNewFieldName] = useState<Record<string, string>>({});
  const [newFieldType, setNewFieldType] = useState<Record<string, string>>({});

  // Selection
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // 1. Fetch Diagram from MongoDB on Mount
  const loadLatestDiagram = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/diagrams/latest`);
      if (!res.ok) throw new Error('Failed to fetch from MongoDB');
      const data: DiagramRecord | null = await res.json();

      if (data && data._id) {
        setCurrentDiagramId(data._id);
        setProjectName(data.name || 'My Database Schema');
        setTables(data.tables || []);
        setRelations(data.relations || []);
      } else {
        // No diagrams exist yet in MongoDB
        setCurrentDiagramId(null);
        setTables([]);
        setRelations([]);
      }
      setDbStatus('saved');
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error connecting to MongoDB backend:', err);
      setDbStatus('error');
    }
  }, []);

  const loadAllDiagrams = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/diagrams`);
      if (res.ok) {
        const data = await res.json();
        setAllDiagrams(data);
      }
    } catch (err) {
      console.error('Error loading diagrams list:', err);
    }
  };

  useEffect(() => {
    loadLatestDiagram();
  }, [loadLatestDiagram]);

  // 2. Save Diagram to MongoDB
  const handleSaveToMongoDB = async () => {
    setDbStatus('saving');
    try {
      const payload = {
        name: projectName.trim() || 'Untitled Schema',
        tables,
        relations
      };

      let res;
      if (currentDiagramId) {
        // Update existing
        res = await fetch(`${API_BASE_URL}/diagrams/${currentDiagramId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        res = await fetch(`${API_BASE_URL}/diagrams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Save failed');
      const savedDoc: DiagramRecord = await res.json();
      setCurrentDiagramId(savedDoc._id);
      setDbStatus('saved');
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save to MongoDB:', err);
      setDbStatus('error');
    }
  };

  // 3. Create New Blank Diagram
  const handleNewDiagram = async () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Discard and create a new diagram?')) {
        return;
      }
    }
    setCurrentDiagramId(null);
    setProjectName('New Relational Diagram');
    setTables([]);
    setRelations([]);
    setPan({ x: 0, y: 0 });
    setZoom(1);
    setHasUnsavedChanges(false);
    setDbStatus('saved');
  };

  // 4. Switch to a specific diagram
  const handleSelectDiagram = (diag: DiagramRecord) => {
    setCurrentDiagramId(diag._id);
    setProjectName(diag.name);
    setTables(diag.tables || []);
    setRelations(diag.relations || []);
    setIsDiagramsModalOpen(false);
    setHasUnsavedChanges(false);
    setDbStatus('saved');
  };

  // 5. Delete diagram from DB
  const handleDeleteDiagramDoc = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this diagram permanently from MongoDB?')) return;
    try {
      await fetch(`${API_BASE_URL}/diagrams/${id}`, { method: 'DELETE' });
      setAllDiagrams(prev => prev.filter(d => d._id !== id));
      if (currentDiagramId === id) {
        handleNewDiagram();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Add Table
  const handleAddTable = () => {
    const color = COLORS[tables.length % COLORS.length];
    const newTable: Table = {
      id: `tbl_${Date.now()}`,
      name: `Table_${tables.length + 1}`,
      color,
      position: { x: 100 + (tables.length % 3) * 320, y: 100 + Math.floor(tables.length / 3) * 260 },
      fields: [
        { id: `f_${Date.now()}_1`, name: 'id', type: 'INT', isPk: true },
        { id: `f_${Date.now()}_2`, name: 'name', type: 'VARCHAR' }
      ]
    };
    setTables(prev => [...prev, newTable]);
    setSelectedTableId(newTable.id);
    setHasUnsavedChanges(true);
  };

  // Delete Table
  const handleDeleteTable = (tableId: string) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    setRelations(prev => prev.filter(r => r.fromTableId !== tableId && r.toTableId !== tableId));
    if (selectedTableId === tableId) setSelectedTableId(null);
    if (connectingSourceId === tableId) setConnectingSourceId(null);
    setHasUnsavedChanges(true);
  };

  // Rename Table
  const handleRenameTable = (tableId: string, newName: string) => {
    setTables(prev => prev.map(t => (t.id === tableId ? { ...t, name: newName } : t)));
    setHasUnsavedChanges(true);
  };

  // Add Field
  const handleAddField = (tableId: string) => {
    const name = newFieldName[tableId]?.trim();
    if (!name) return;
    const type = newFieldType[tableId] || 'VARCHAR';
    const isFk = name.toLowerCase().endsWith('_id') || name.toLowerCase().endsWith('id');

    const newField: Field = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      type,
      isFk
    };

    setTables(prev =>
      prev.map(t => (t.id === tableId ? { ...t, fields: [...t.fields, newField] } : t))
    );
    setNewFieldName(prev => ({ ...prev, [tableId]: '' }));
    setHasUnsavedChanges(true);
  };

  // Delete Field
  const handleDeleteField = (tableId: string, fieldId: string) => {
    setTables(prev =>
      prev.map(t => (t.id === tableId ? { ...t, fields: t.fields.filter(f => f.id !== fieldId) } : t))
    );
    setHasUnsavedChanges(true);
  };

  // Toggle Field Primary Key
  const handleTogglePk = (tableId: string, fieldId: string) => {
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
              ...t,
              fields: t.fields.map(f => (f.id === fieldId ? { ...f, isPk: !f.isPk } : f))
            }
          : t
      )
    );
    setHasUnsavedChanges(true);
  };

  // Connect Two Tables (Click logic)
  const handleStartConnect = (tableId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (mode === 'user') return;
    setConnectingSourceId(tableId);
  };

  const handleTargetConnect = (targetTableId: string) => {
    if (!connectingSourceId || connectingSourceId === targetTableId) {
      setConnectingSourceId(null);
      return;
    }

    // Check if relationship already exists
    const exists = relations.some(
      r =>
        (r.fromTableId === connectingSourceId && r.toTableId === targetTableId) ||
        (r.fromTableId === targetTableId && r.toTableId === connectingSourceId)
    );

    if (!exists) {
      const sourceTable = tables.find(t => t.id === connectingSourceId);
      const targetTable = tables.find(t => t.id === targetTableId);

      const newRel: Relation = {
        id: `rel_${Date.now()}`,
        fromTableId: connectingSourceId,
        toTableId: targetTableId,
        cardinality: '1:N',
        label: `${sourceTable?.name || ''} to ${targetTable?.name || ''}`
      };
      setRelations(prev => [...prev, newRel]);
      setHasUnsavedChanges(true);
    }
    setConnectingSourceId(null);
  };

  // Modal Connect Action
  const handleModalCreateRelation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSourceTableId || !modalTargetTableId || modalSourceTableId === modalTargetTableId) {
      alert('Please select two different tables to connect.');
      return;
    }

    const sourceTable = tables.find(t => t.id === modalSourceTableId);
    const targetTable = tables.find(t => t.id === modalTargetTableId);

    const newRel: Relation = {
      id: `rel_${Date.now()}`,
      fromTableId: modalSourceTableId,
      toTableId: modalTargetTableId,
      cardinality: modalCardinality,
      label: `${sourceTable?.name || ''} to ${targetTable?.name || ''}`
    };

    setRelations(prev => [...prev, newRel]);
    setHasUnsavedChanges(true);
    setIsRelationModalOpen(false);
  };

  // Toggle Cardinality
  const handleCycleCardinality = (relationId: string) => {
    if (mode === 'user') return;
    setRelations(prev =>
      prev.map(r => {
        if (r.id !== relationId) return r;
        const next: Cardinality = r.cardinality === '1:N' ? '1:1' : r.cardinality === '1:1' ? 'N:N' : '1:N';
        return { ...r, cardinality: next };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Delete Relation
  const handleDeleteRelation = (relationId: string) => {
    setRelations(prev => prev.filter(r => r.id !== relationId));
    setHasUnsavedChanges(true);
  };

  // Auto Layout
  const handleAutoLayout = () => {
    const spacingX = 350;
    const spacingY = 280;
    const cols = Math.min(3, Math.max(2, Math.ceil(Math.sqrt(tables.length))));

    setTables(prev =>
      prev.map((t, index) => ({
        ...t,
        position: {
          x: 80 + (index % cols) * spacingX,
          y: 100 + Math.floor(index / cols) * spacingY
        }
      }))
    );
    setHasUnsavedChanges(true);
  };

  // Export as PNG
  const handleExportPNG = async () => {
    const canvasElement = document.getElementById('diagram-canvas-capture');
    if (!canvasElement) return;

    try {
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#080c14',
        scale: 2,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export PNG failed:', err);
    }
  };

  // Drag Handlers
  const handleMouseDownTable = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();

    if (connectingSourceId) {
      handleTargetConnect(tableId);
      return;
    }

    setSelectedTableId(tableId);
    const target = tables.find(t => t.id === tableId);
    if (!target) return;
    setDraggingTableId(tableId);
    setDragOffset({
      x: e.clientX / zoom - target.position.x,
      y: e.clientY / zoom - target.position.y
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
      } else if (draggingTableId) {
        const newX = Math.round(e.clientX / zoom - dragOffset.x);
        const newY = Math.round(e.clientY / zoom - dragOffset.y);
        setTables(prev =>
          prev.map(t => (t.id === draggingTableId ? { ...t, position: { x: newX, y: newY } } : t))
        );
        setHasUnsavedChanges(true);
      }
    },
    [isPanning, panStart, draggingTableId, zoom, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingTableId(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(2.0, Math.max(0.4, Number((prev * factor).toFixed(2)))));
  };

  const tableMap = new Map(tables.map(t => [t.id, t]));
  const connectingSourceTable = tables.find(t => t.id === connectingSourceId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Top Header */}
      <header className="simple-header">
        <div className="header-left">
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Database size={18} />
          </div>

          <input
            type="text"
            className="project-title-input"
            value={projectName}
            onChange={e => {
              setProjectName(e.target.value);
              setHasUnsavedChanges(true);
            }}
            title="Click to rename diagram"
          />

          {/* MongoDB Status Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            padding: '0.2rem 0.55rem',
            borderRadius: 999,
            background: dbStatus === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: dbStatus === 'error' ? '#f87171' : '#34d399',
            border: dbStatus === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: dbStatus === 'error' ? '#ef4444' : dbStatus === 'saving' ? '#f59e0b' : '#10b981'
            }} />
            <span>
              {dbStatus === 'saving' ? 'Saving to MongoDB...' : dbStatus === 'error' ? 'MongoDB Offline' : hasUnsavedChanges ? 'Unsaved Changes' : 'MongoDB Connected'}
            </span>
          </div>
        </div>

        {/* Center: Client Edit Mode vs User View Mode */}
        <div className="mode-toggle-pill">
          <button
            className={`mode-toggle-btn ${mode === 'client' ? 'active' : ''}`}
            onClick={() => {
              setMode('client');
              setConnectingSourceId(null);
            }}
            title="Client Mode: Build, edit tables, and connect relationships"
          >
            <Edit3 size={13} />
            <span>Client Edit Mode</span>
          </button>
          <button
            className={`mode-toggle-btn ${mode === 'user' ? 'active' : ''}`}
            onClick={() => {
              setMode('user');
              setConnectingSourceId(null);
            }}
            title="User View Mode: Clean read-only presentation for end-user"
          >
            <Eye size={13} />
            <span>User View Mode</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="header-actions">
          {mode === 'client' && (
            <>
              {/* Save to MongoDB Button */}
              <button
                className="action-btn primary"
                onClick={handleSaveToMongoDB}
                title="Save current diagram to MongoDB"
                style={{
                  background: hasUnsavedChanges ? '#10b981' : '#6366f1',
                  borderColor: hasUnsavedChanges ? '#059669' : '#4f46e5'
                }}
              >
                <Save size={15} /> Save to DB
              </button>

              <button className="action-btn" onClick={handleAddTable} title="Add new entity table">
                <Plus size={15} /> Add Table
              </button>

              <button
                className="action-btn"
                onClick={() => {
                  setModalSourceTableId(tables[0]?.id || '');
                  setModalTargetTableId(tables[1]?.id || '');
                  setIsRelationModalOpen(true);
                }}
                disabled={tables.length < 2}
                title="Connect two tables with a relationship line"
                style={{ opacity: tables.length < 2 ? 0.5 : 1 }}
              >
                <GitFork size={15} /> Add Relation
              </button>

              <button className="action-btn" onClick={handleAutoLayout} title="Rearrange tables automatically">
                <LayoutGrid size={15} /> Auto Layout
              </button>

              {/* Diagrams List Modal Button */}
              <button
                className="action-btn"
                onClick={() => {
                  loadAllDiagrams();
                  setIsDiagramsModalOpen(true);
                }}
                title="Open saved diagrams in MongoDB"
              >
                <FolderOpen size={14} /> My Diagrams
              </button>

              <button className="action-btn" onClick={handleNewDiagram} title="Start a fresh blank diagram">
                <Plus size={14} /> New
              </button>
            </>
          )}

          {/* Export PNG */}
          <button className="action-btn green" onClick={handleExportPNG} title="Download PNG image of diagram to share with user">
            <Download size={14} /> Download Diagram (PNG)
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div
        id="diagram-canvas-capture"
        className={`canvas-wrapper ${isPanning ? 'panning' : ''}`}
        onMouseDown={e => {
          if (e.button === 0) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            setSelectedTableId(null);
            if (connectingSourceId) setConnectingSourceId(null);
          }
        }}
        onWheel={handleWheel}
      >
        {/* Empty Canvas Prompt */}
        {tables.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            color: '#64748b',
            pointerEvents: 'none'
          }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: '#162032',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              border: '1px solid #24304f'
            }}>
              <Database size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
                MongoDB Connected &bull; Canvas is Empty
              </h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '380px', lineHeight: 1.5 }}>
                Click <strong>&ldquo;+ Add Table&rdquo;</strong> in the top header to define your first database entity and start drawing connections.
              </p>
            </div>
          </div>
        )}

        {/* Connecting Active Banner Indicator */}
        {connectingSourceId && connectingSourceTable && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(16, 185, 129, 0.95)',
              color: 'white',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 60,
              animation: 'pulse 1.5s infinite'
            }}
          >
            <span>🔗 Connecting from <strong>&ldquo;{connectingSourceTable.name}&rdquo;</strong> &rarr; Click any other table to connect!</span>
            <button
              onClick={e => {
                e.stopPropagation();
                setConnectingSourceId(null);
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900
              }}
              title="Cancel connection"
            >
              ×
            </button>
          </div>
        )}

        {/* User Mode Banner Alert */}
        {mode === 'user' && !connectingSourceId && (
          <div className="banner-user-mode">
            <Eye size={15} /> Viewing as User (Read-Only Interactive Presentation)
          </div>
        )}

        {/* Canvas Viewport (Scaled and Panned) */}
        <div
          className="canvas-viewport-layer"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* SVG Connector Lines */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: 4000, height: 4000, pointerEvents: 'none' }}>
            {relations.map(rel => {
              const fromTable = tableMap.get(rel.fromTableId);
              const toTable = tableMap.get(rel.toTableId);
              if (!fromTable || !toTable) return null;

              const TABLE_WIDTH = 280;
              const fromH = 45 + fromTable.fields.length * 30;
              const toH = 45 + toTable.fields.length * 30;

              const isFromLeft = fromTable.position.x + TABLE_WIDTH / 2 < toTable.position.x + TABLE_WIDTH / 2;

              const x1 = isFromLeft ? fromTable.position.x + TABLE_WIDTH : fromTable.position.x;
              const y1 = fromTable.position.y + fromH / 2;

              const x2 = isFromLeft ? toTable.position.x : toTable.position.x + TABLE_WIDTH;
              const y2 = toTable.position.y + toH / 2;

              const dx = Math.abs(x2 - x1) * 0.5;
              const cp1x = isFromLeft ? x1 + Math.max(dx, 50) : x1 - Math.max(dx, 50);
              const cp2x = isFromLeft ? x2 - Math.max(dx, 50) : x2 + Math.max(dx, 50);

              const path = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={rel.id}>
                  {/* Outer glow stroke */}
                  <path
                    d={path}
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="none"
                    strokeDasharray={rel.cardinality === 'N:N' ? '6 4' : undefined}
                  />

                  {/* Port Dots */}
                  <circle cx={x1} cy={y1} r={4.5} fill={fromTable.color} stroke="#0f172a" strokeWidth={1.5} />
                  <circle cx={x2} cy={y2} r={4.5} fill={toTable.color} stroke="#0f172a" strokeWidth={1.5} />

                  {/* Cardinality Badge on Line */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    style={{ pointerEvents: 'auto', cursor: mode === 'client' ? 'pointer' : 'default' }}
                    onClick={e => {
                      e.stopPropagation();
                      handleCycleCardinality(rel.id);
                    }}
                  >
                    <title>{mode === 'client' ? 'Click to change cardinality (1:N, 1:1, N:N)' : 'Cardinality'}</title>
                    <rect
                      x={-34}
                      y={-12}
                      width={68}
                      height={24}
                      rx={12}
                      fill="#111827"
                      stroke="#4f46e5"
                      strokeWidth={1.5}
                    />
                    <text
                      x={0}
                      y={4}
                      fill="#f8fafc"
                      fontSize={11}
                      fontWeight={700}
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {rel.cardinality}
                    </text>

                    {/* Delete Relation Button in Client Mode */}
                    {mode === 'client' && (
                      <g
                        transform="translate(40, -10)"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteRelation(rel.id);
                        }}
                      >
                        <title>Delete relationship</title>
                        <circle cx={0} cy={10} r={9} fill="#ef4444" />
                        <text x={0} y={13.5} fill="white" fontSize={11} fontWeight={900} textAnchor="middle">
                          ×
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Table Cards */}
          {tables.map(table => {
            const isSelected = selectedTableId === table.id;
            const isConnecting = connectingSourceId === table.id;

            return (
              <div
                key={table.id}
                id={`table-${table.id}`}
                className={`table-card ${isSelected ? 'selected' : ''}`}
                style={{
                  left: table.position.x,
                  top: table.position.y,
                  borderColor: isConnecting
                    ? '#10b981'
                    : connectingSourceId && connectingSourceId !== table.id
                    ? '#818cf8'
                    : isSelected
                    ? table.color
                    : undefined,
                  boxShadow: isConnecting
                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                    : undefined,
                  cursor: connectingSourceId ? 'pointer' : 'move'
                }}
                onMouseDown={e => handleMouseDownTable(e, table.id)}
              >
                {/* Left Connect Port (Client Mode) */}
                {mode === 'client' && (
                  <div
                    className="connect-port left"
                    style={{
                      backgroundColor: isConnecting ? '#10b981' : table.color,
                      transform: isConnecting ? 'translateY(-50%) scale(1.4)' : undefined
                    }}
                    title="Click to connect line to another table"
                    onClick={e => handleStartConnect(table.id, e)}
                  />
                )}

                {/* Table Header */}
                <div className="table-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: table.color }} />
                    {mode === 'client' ? (
                      <input
                        type="text"
                        className="table-name-input"
                        value={table.name}
                        onChange={e => handleRenameTable(table.id, e.target.value)}
                        onMouseDown={e => e.stopPropagation()}
                        title="Click to rename table"
                      />
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{table.name}</span>
                    )}
                  </div>

                  {mode === 'client' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* Direct Connect Icon Button */}
                      <button
                        onClick={e => handleStartConnect(table.id, e)}
                        style={{
                          background: isConnecting ? '#10b981' : 'rgba(99, 102, 241, 0.15)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: isConnecting ? 'white' : '#818cf8',
                          cursor: 'pointer',
                          padding: '3px 6px',
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                        title="Connect this table to another table"
                      >
                        <Link2 size={12} />
                        <span>{isConnecting ? 'Linking...' : 'Link'}</span>
                      </button>

                      {/* Delete Table Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteTable(table.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 2
                        }}
                        title="Delete Table"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Fields List */}
                <div className="table-fields-container">
                  {table.fields.map(field => (
                    <div key={field.id} className="field-row">
                      <div className="field-left">
                        {field.isPk && <Key size={12} color="#f59e0b" style={{ flexShrink: 0 }} />}
                        {field.isFk && <Link2 size={12} color="#818cf8" style={{ flexShrink: 0 }} />}
                        <span className="field-name">{field.name}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className={`field-type-tag ${field.isPk ? 'pk' : field.isFk ? 'fk' : ''}`}>
                          {field.type}
                        </span>

                        {mode === 'client' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <button
                              onClick={() => handleTogglePk(table.id, field.id)}
                              style={{ background: 'transparent', border: 'none', color: field.isPk ? '#f59e0b' : '#475569', cursor: 'pointer', padding: 1 }}
                              title="Toggle Primary Key"
                            >
                              <Key size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteField(table.id, field.id)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 1 }}
                              title="Delete Field"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Add Field Box (Client Mode) */}
                {mode === 'client' && (
                  <div className="add-field-box" onMouseDown={e => e.stopPropagation()}>
                    <input
                      type="text"
                      className="add-field-input"
                      placeholder="+ Add field..."
                      value={newFieldName[table.id] || ''}
                      onChange={e => setNewFieldName(prev => ({ ...prev, [table.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddField(table.id);
                      }}
                    />
                    <select
                      className="add-field-select"
                      value={newFieldType[table.id] || 'VARCHAR'}
                      onChange={e => setNewFieldType(prev => ({ ...prev, [table.id]: e.target.value }))}
                    >
                      {FIELD_TYPES.map(ft => (
                        <option key={ft} value={ft}>
                          {ft}
                        </option>
                      ))}
                    </select>
                    <button
                      className="action-btn"
                      style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                      onClick={() => handleAddField(table.id)}
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Right Connect Port (Client Mode) */}
                {mode === 'client' && (
                  <div
                    className="connect-port right"
                    style={{
                      backgroundColor: isConnecting ? '#10b981' : table.color,
                      transform: isConnecting ? 'translateY(-50%) scale(1.4)' : undefined
                    }}
                    title="Click to connect line to another table"
                    onClick={e => handleStartConnect(table.id, e)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Left Zoom Controls */}
        <div className="bottom-controls">
          <button className="ctrl-btn" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button className="ctrl-btn" onClick={() => setZoom(z => Math.min(2.0, z + 0.15))} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button
            className="ctrl-btn"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="Reset View"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Add Relation Modal Dialog */}
      {isRelationModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setIsRelationModalOpen(false)}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid #24304f',
              borderRadius: 14,
              padding: '1.5rem',
              width: '420px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitFork size={16} color="white" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Connect Two Tables</h3>
              </div>
              <button
                onClick={() => setIsRelationModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalCreateRelation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Source Table (From)
                </label>
                <select
                  value={modalSourceTableId}
                  onChange={e => setModalSourceTableId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: '#0b0f19', border: '1px solid #24304f', borderRadius: 6, color: 'white' }}
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Target Table (To)
                </label>
                <select
                  value={modalTargetTableId}
                  onChange={e => setModalTargetTableId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: '#0b0f19', border: '1px solid #24304f', borderRadius: 6, color: 'white' }}
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Cardinality / Relationship Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {(['1:N', '1:1', 'N:N'] as Cardinality[]).map(card => (
                    <button
                      type="button"
                      key={card}
                      onClick={() => setModalCardinality(card)}
                      style={{
                        padding: '0.6rem',
                        borderRadius: 6,
                        border: modalCardinality === card ? '2px solid #6366f1' : '1px solid #24304f',
                        background: modalCardinality === card ? 'rgba(99, 102, 241, 0.2)' : '#0b0f19',
                        color: modalCardinality === card ? '#818cf8' : '#94a3b8',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {card}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setIsRelationModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  <Check size={14} /> Create Relationship Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diagrams List Modal Dialog */}
      {isDiagramsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setIsDiagramsModalOpen(false)}
        >
          <div
            style={{
              background: '#111827',
              border: '1px solid #24304f',
              borderRadius: 14,
              padding: '1.5rem',
              width: '520px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderOpen size={20} color="#6366f1" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Saved MongoDB Diagrams</h3>
              </div>
              <button
                onClick={() => setIsDiagramsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {allDiagrams.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                  No diagrams saved in MongoDB yet. Click &ldquo;Save to DB&rdquo; to save your current work.
                </div>
              ) : (
                allDiagrams.map(diag => (
                  <div
                    key={diag._id}
                    onClick={() => handleSelectDiagram(diag)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 8,
                      background: diag._id === currentDiagramId ? 'rgba(99, 102, 241, 0.15)' : '#0b0f19',
                      border: diag._id === currentDiagramId ? '1.5px solid #6366f1' : '1px solid #24304f',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                        {diag.name}
                        {diag._id === currentDiagramId && (
                          <span style={{ fontSize: '0.72rem', color: '#818cf8', marginLeft: '0.5rem' }}>
                            (Active)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                        {diag.tables.length} Tables &bull; {diag.relations.length} Relations &bull; {new Date(diag.updatedAt || diag.createdAt || '').toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={e => handleDeleteDiagramDoc(diag._id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: 4
                        }}
                        title="Delete this diagram from MongoDB"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #24304f' }}>
              <button className="action-btn" onClick={() => setIsDiagramsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
