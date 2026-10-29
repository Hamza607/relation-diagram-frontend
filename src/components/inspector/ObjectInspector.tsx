import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Trash2,
  Key,
  Link2,
  Settings,
  MessageSquare,
  Eye,
  EyeOff,
  Check,
  ChevronUp,
  ChevronDown,
  Edit2
} from 'lucide-react';

export const ObjectInspector: React.FC = () => {
  const {
    selectedObjectId,
    setSelectedObjectId,
    objects,
    updateObject,
    deleteObject,
    setIsFieldModalOpen,
    setFieldModalObjectId,
    setEditingField,
    updateField,
    deleteField,
    reorderFields,
    setIsCommentsDrawerOpen,
    setCommentTarget,
    setActiveView,
    relationships,
    records,
    canEdit
  } = useApp();

  const selectedObject = objects.find(o => o.id === selectedObjectId);

  const [singularLabel, setSingularLabel] = useState(selectedObject?.singularLabel || '');
  const [pluralLabel, setPluralLabel] = useState(selectedObject?.pluralLabel || '');
  const [key, setKey] = useState(selectedObject?.key || '');
  const [description, setDescription] = useState(selectedObject?.description || '');
  const [color, setColor] = useState(selectedObject?.color || '#6366f1');

  // Sync state when selection changes
  React.useEffect(() => {
    if (selectedObject) {
      setSingularLabel(selectedObject.singularLabel);
      setPluralLabel(selectedObject.pluralLabel);
      setKey(selectedObject.key);
      setDescription(selectedObject.description || '');
      setColor(selectedObject.color);
    }
  }, [selectedObjectId, selectedObject]);

  if (!selectedObject) return null;

  const handleSaveObjectMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    updateObject(selectedObject.id, {
      singularLabel: singularLabel.trim(),
      pluralLabel: pluralLabel.trim(),
      key: key.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      description: description.trim(),
      color
    }, selectedObject.revision);
  };

  const handleAddField = () => {
    if (!canEdit) return;
    setFieldModalObjectId(selectedObject.id);
    setEditingField(null);
    setIsFieldModalOpen(true);
  };

  const handleEditField = (fld: any) => {
    if (!canEdit) return;
    setFieldModalObjectId(selectedObject.id);
    setEditingField(fld);
    setIsFieldModalOpen(true);
  };

  const handleToggleFieldActive = (fieldId: string, currentActive: boolean) => {
    if (!canEdit) return;
    updateField(selectedObject.id, fieldId, { isActive: !currentActive });
  };

  const handleOpenComments = () => {
    setCommentTarget({
      type: 'object',
      id: selectedObject.id,
      name: selectedObject.singularLabel
    });
    setIsCommentsDrawerOpen(true);
  };

  const relatedRelations = relationships.filter(
    r => r.fromObjectId === selectedObject.id || r.toObjectId === selectedObject.id
  );

  const objectRecords = records.filter(r => r.objectId === selectedObject.id);

  return (
    <div className="inspector-drawer" id="object-inspector-panel">
      {/* Header */}
      <div className="inspector-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: selectedObject.color }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            {selectedObject.singularLabel}
          </h3>
          <span className="field-type-chip">v{selectedObject.revision || 1}</span>
        </div>
        <button className="node-btn-icon" onClick={() => setSelectedObjectId(null)}>
          <X size={18} />
        </button>
      </div>

      <div className="inspector-body">
        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-pill"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={handleOpenComments}
          >
            <MessageSquare size={14} /> Comments
          </button>
          <button
            className="btn-pill"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setActiveView('records')}
          >
            <Eye size={14} /> View Data ({objectRecords.length})
          </button>
        </div>

        {/* Object Attributes Settings Form */}
        <form onSubmit={handleSaveObjectMeta} className="inspector-section">
          <div className="inspector-section-title">Object Meta Configuration</div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Singular Name</label>
              <input
                type="text"
                value={singularLabel}
                onChange={e => setSingularLabel(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Plural Label</label>
              <input
                type="text"
                value={pluralLabel}
                onChange={e => setPluralLabel(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Identifier Key</label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              disabled={!canEdit}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Entity Color Accent</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                disabled={!canEdit}
                style={{ width: 40, height: 32, padding: 0, cursor: 'pointer', background: 'transparent' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                {color}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Business Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={!canEdit}
            />
          </div>

          {canEdit && (
            <button type="submit" className="btn-pill primary" style={{ marginTop: '0.4rem', justifyContent: 'center' }}>
              Save Object Settings
            </button>
          )}
        </form>

        {/* Fields Designer Section */}
        <div className="inspector-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="inspector-section-title">Fields ({selectedObject.fields.length})</span>
            {canEdit && (
              <button
                className="btn-pill"
                onClick={handleAddField}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#818cf8' }}
              >
                <Plus size={13} /> Add Field
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {selectedObject.fields.map(fld => (
              <div
                key={fld.id}
                style={{
                  padding: '0.6rem 0.75rem',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  opacity: fld.isActive ? 1 : 0.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {fld.isPrimary && <span title="Primary Field" style={{ display: 'inline-flex' }}><Key size={12} color="#f59e0b" /></span>}
                    {fld.type === 'reference' && <span title="Foreign Reference" style={{ display: 'inline-flex' }}><Link2 size={12} color="#818cf8" /></span>}
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{fld.name}</span>
                    {fld.required && <span style={{ color: '#ef4444', fontWeight: 700 }}>*</span>}
                  </div>

                  <span className={`field-type-chip ${fld.type === 'reference' ? 'reference' : ''}`}>
                    {fld.type}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>key: {fld.key}</span>

                  {canEdit && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleToggleFieldActive(fld.id, fld.isActive)}
                        title={fld.isActive ? 'Deactivate field' : 'Activate field'}
                        style={{ color: fld.isActive ? '#10b981' : '#64748b' }}
                      >
                        {fld.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        onClick={() => handleEditField(fld)}
                        title="Configure field settings"
                        style={{ color: '#818cf8' }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteField(selectedObject.id, fld.id)}
                        title="Delete field"
                        style={{ color: '#f87171' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Relationships Section */}
        <div className="inspector-section">
          <div className="inspector-section-title">Relationships ({relatedRelations.length})</div>
          {relatedRelations.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
              No relationships connected yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {relatedRelations.map(rel => {
                const otherObjId = rel.fromObjectId === selectedObject.id ? rel.toObjectId : rel.fromObjectId;
                const otherObj = objects.find(o => o.id === otherObjId);
                const isSource = rel.fromObjectId === selectedObject.id;

                return (
                  <div
                    key={rel.id}
                    style={{
                      padding: '0.6rem 0.75rem',
                      background: '#162032',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {isSource ? `→ ${otherObj?.singularLabel}` : `← ${otherObj?.singularLabel}`}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{rel.label}</div>
                    </div>
                    <span className="field-type-chip">{rel.cardinality}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Object Action */}
        {canEdit && (
          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn-pill"
              onClick={() => deleteObject(selectedObject.id)}
              style={{
                width: '100%',
                justifyContent: 'center',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.08)'
              }}
            >
              <Trash2 size={14} /> Delete Custom Object (FR-11 Safe)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
