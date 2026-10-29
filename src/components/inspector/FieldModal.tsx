import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FieldType, FieldDefinition } from '../../types/schema';
import { X, Plus, Trash2, KeyRound, Type } from 'lucide-react';

const FIELD_TYPES: { type: FieldType; label: string; desc: string }[] = [
  { type: 'text', label: 'Single-line Text', desc: 'Short string e.g. names, titles, codes' },
  { type: 'long_text', label: 'Multi-line Text', desc: 'Paragraphs, notes, markdown content' },
  { type: 'number', label: 'Integer Number', desc: 'Whole counts, quantities, ratings' },
  { type: 'decimal', label: 'Decimal / Currency', desc: 'Prices, interest rates, percentages' },
  { type: 'datetime', label: 'Date & Time', desc: 'Timestamps, event schedules, birthdays' },
  { type: 'boolean', label: 'Boolean Toggle', desc: 'True / False or Yes / No flags' },
  { type: 'enum', label: 'Enum Select', desc: 'Restricted picklist of designated options' },
  { type: 'email', label: 'Email Address', desc: 'Validated RFC email string' },
  { type: 'url', label: 'Web URL', desc: 'Validated protocol web address' },
  { type: 'file', label: 'File Attachment', desc: 'Document, image, or media asset link' },
  { type: 'reference', label: 'Foreign Reference', desc: 'Foreign key to another custom object' }
];

export const FieldModal: React.FC = () => {
  const {
    isFieldModalOpen,
    setIsFieldModalOpen,
    fieldModalObjectId,
    editingField,
    setEditingField,
    objects,
    addField,
    updateField
  } = useApp();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [type, setType] = useState<FieldType>('text');
  const [required, setRequired] = useState(false);
  const [unique, setUnique] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [description, setDescription] = useState('');
  const [enumOptions, setEnumOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [newEnumOption, setNewEnumOption] = useState('');
  const [referenceTargetObjectId, setReferenceTargetObjectId] = useState('');

  const targetObject = objects.find(o => o.id === fieldModalObjectId);

  useEffect(() => {
    if (editingField) {
      setName(editingField.name);
      setKey(editingField.key);
      setType(editingField.type);
      setRequired(editingField.required);
      setUnique(editingField.unique);
      setIsPrimary(!!editingField.isPrimary);
      setDescription(editingField.description || '');
      setEnumOptions(editingField.enumOptions || ['Option 1', 'Option 2']);
      setReferenceTargetObjectId(editingField.referenceTargetObjectId || '');
    } else {
      setName('');
      setKey('');
      setType('text');
      setRequired(false);
      setUnique(false);
      setIsPrimary(false);
      setDescription('');
      setEnumOptions(['Pending', 'Active', 'Completed']);
      // Default reference target to first other object
      const otherObj = objects.find(o => o.id !== fieldModalObjectId);
      setReferenceTargetObjectId(otherObj ? otherObj.id : '');
    }
  }, [editingField, isFieldModalOpen, fieldModalObjectId, objects]);

  if (!isFieldModalOpen || !fieldModalObjectId || !targetObject) return null;

  // Auto-generate key from name if new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingField) {
      const generatedKey = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      setKey(generatedKey);
    }
  };

  const handleAddEnumOption = () => {
    if (!newEnumOption.trim()) return;
    if (enumOptions.includes(newEnumOption.trim())) return;
    setEnumOptions([...enumOptions, newEnumOption.trim()]);
    setNewEnumOption('');
  };

  const handleRemoveEnumOption = (index: number) => {
    setEnumOptions(enumOptions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sanitizedKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || `field_${Date.now()}`;

    if (editingField) {
      updateField(fieldModalObjectId, editingField.id, {
        name: name.trim(),
        key: sanitizedKey,
        type,
        required,
        unique,
        isPrimary,
        description: description.trim(),
        enumOptions: type === 'enum' ? enumOptions : undefined,
        referenceTargetObjectId: type === 'reference' ? referenceTargetObjectId : undefined
      });
    } else {
      addField(fieldModalObjectId, {
        name: name.trim(),
        key: sanitizedKey,
        type,
        required,
        unique,
        isPrimary,
        description: description.trim(),
        enumOptions: type === 'enum' ? enumOptions : undefined,
        referenceTargetObjectId: type === 'reference' ? referenceTargetObjectId : undefined,
        order: targetObject.fields.length + 1,
        isActive: true
      });
    }

    setIsFieldModalOpen(false);
    setEditingField(null);
  };

  return (
    <div className="modal-overlay" id="field-editor-modal">
      <div className="modal-dialog wide">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Type size={20} />
            </div>
            <div>
              <h3 className="modal-title">
                {editingField ? 'Edit Schema Field' : 'Add Field to'} {targetObject.singularLabel}
              </h3>
              <p className="form-hint">Configure field type, technical key, and foreign constraints</p>
            </div>
          </div>
          <button
            className="node-btn-icon"
            onClick={() => {
              setIsFieldModalOpen(false);
              setEditingField(null);
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="modal-content-area">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Field Display Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Total Amount"
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Technical Key (Immutable ID) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="total_amount"
                    value={key}
                    onChange={e => setKey(e.target.value)}
                    required
                    style={{ fontFamily: 'var(--font-mono)' }}
                  />
                  <KeyRound size={14} style={{ position: 'absolute', right: 10, top: 11, color: '#64748b' }} />
                </div>
              </div>
            </div>

            {/* Field Type Selector */}
            <div className="form-group">
              <label className="form-label">Field Data Type</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.6rem',
                maxHeight: '190px',
                overflowY: 'auto',
                padding: '0.35rem'
              }}>
                {FIELD_TYPES.map(ft => (
                  <div
                    key={ft.type}
                    onClick={() => setType(ft.type)}
                    style={{
                      padding: '0.65rem 0.8rem',
                      borderRadius: '8px',
                      border: type === ft.type ? '2px solid #6366f1' : '1px solid #1e293b',
                      background: type === ft.type ? 'rgba(99, 102, 241, 0.12)' : '#0f172a',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      color: type === ft.type ? '#818cf8' : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      {ft.label}
                      <span className="field-type-chip">{ft.type}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {ft.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Target Selector if type === 'reference' */}
            {type === 'reference' && (
              <div className="form-group" style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                <label className="form-label">
                  Target Referenced Object <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={referenceTargetObjectId}
                  onChange={e => setReferenceTargetObjectId(e.target.value)}
                  required
                >
                  <option value="">Select target object...</option>
                  {objects.map(obj => (
                    <option key={obj.id} value={obj.id}>
                      {obj.singularLabel} ({obj.key})
                    </option>
                  ))}
                </select>
                <p className="form-hint" style={{ marginTop: '0.35rem' }}>
                  This creates an explicit foreign reference pointer to the primary key of the selected object.
                </p>
              </div>
            )}

            {/* Enum Options if type === 'enum' */}
            {type === 'enum' && (
              <div className="form-group" style={{ background: '#0f172a', padding: '0.85rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <label className="form-label">Enum Permitted Values</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter value option..."
                    value={newEnumOption}
                    onChange={e => setNewEnumOption(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEnumOption();
                      }
                    }}
                  />
                  <button type="button" className="btn-pill primary" onClick={handleAddEnumOption}>
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {enumOptions.map((opt, i) => (
                    <span key={i} className="field-type-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {opt}
                      <button type="button" onClick={() => handleRemoveEnumOption(i)} style={{ color: '#ef4444' }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Checkboxes */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={required}
                  onChange={e => setRequired(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                />
                <span>Required Field (Not Null)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={unique}
                  onChange={e => setUnique(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                />
                <span>Unique Constraint</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={e => setIsPrimary(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                />
                <span>Primary Label in Records</span>
              </label>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Field Help &amp; Validation Notes</label>
              <textarea
                rows={2}
                placeholder="Optional description shown in forms and API schemas"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-pill"
              onClick={() => {
                setIsFieldModalOpen(false);
                setEditingField(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-pill primary">
              {editingField ? 'Save Changes' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
