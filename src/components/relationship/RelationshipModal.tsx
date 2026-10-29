import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Cardinality, DeletePolicy } from '../../types/schema';
import { GitFork, ArrowRight, ShieldAlert, X, Trash2 } from 'lucide-react';

export const RelationshipModal: React.FC = () => {
  const {
    isRelationshipModalOpen,
    setIsRelationshipModalOpen,
    relationshipToEdit,
    setRelationshipToEdit,
    objects,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    connectingSourceId,
    setConnectingSourceId
  } = useApp();

  const [fromObjectId, setFromObjectId] = useState('');
  const [toObjectId, setToObjectId] = useState('');
  const [cardinality, setCardinality] = useState<Cardinality>('1:N');
  const [label, setLabel] = useState('');
  const [deletePolicy, setDeletePolicy] = useState<DeletePolicy>('restrict');

  useEffect(() => {
    if (relationshipToEdit) {
      setFromObjectId(relationshipToEdit.fromObjectId);
      setToObjectId(relationshipToEdit.toObjectId);
      setCardinality(relationshipToEdit.cardinality);
      setLabel(relationshipToEdit.label);
      setDeletePolicy(relationshipToEdit.deletePolicy);
    } else {
      const defaultFrom = connectingSourceId || (objects.length > 0 ? objects[0].id : '');
      const defaultTo = objects.length > 1 ? objects[1].id : defaultFrom;
      setFromObjectId(defaultFrom);
      setToObjectId(defaultTo);
      setCardinality('1:N');
      setLabel('');
      setDeletePolicy('restrict');
    }
  }, [relationshipToEdit, isRelationshipModalOpen, connectingSourceId, objects]);

  if (!isRelationshipModalOpen) return null;

  const fromObj = objects.find(o => o.id === fromObjectId);
  const toObj = objects.find(o => o.id === toObjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromObjectId || !toObjectId) return;

    const defaultLabel = label.trim() || `${fromObj?.singularLabel} to ${toObj?.pluralLabel}`;

    if (relationshipToEdit) {
      updateRelationship(relationshipToEdit.id, {
        fromObjectId,
        toObjectId,
        cardinality,
        label: defaultLabel,
        deletePolicy
      });
    } else {
      createRelationship(fromObjectId, toObjectId, cardinality, defaultLabel, deletePolicy);
    }

    setIsRelationshipModalOpen(false);
    setRelationshipToEdit(null);
    setConnectingSourceId(null);
  };

  const handleDelete = () => {
    if (relationshipToEdit) {
      deleteRelationship(relationshipToEdit.id);
      setIsRelationshipModalOpen(false);
      setRelationshipToEdit(null);
    }
  };

  return (
    <div className="modal-overlay" id="relationship-editor-modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <GitFork size={20} />
            </div>
            <div>
              <h3 className="modal-title">
                {relationshipToEdit ? 'Edit Relationship' : 'Configure New Relationship (FR-05)'}
              </h3>
              <p className="form-hint">Set cardinality and foreign delete integrity rules</p>
            </div>
          </div>
          <button
            className="node-btn-icon"
            onClick={() => {
              setIsRelationshipModalOpen(false);
              setRelationshipToEdit(null);
              setConnectingSourceId(null);
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            {/* Source & Target Dropdowns */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Source Object (Parent) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={fromObjectId}
                  onChange={e => setFromObjectId(e.target.value)}
                  required
                >
                  {objects.map(obj => (
                    <option key={obj.id} value={obj.id}>
                      {obj.singularLabel} ({obj.key})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Target Object (Child) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={toObjectId}
                  onChange={e => setToObjectId(e.target.value)}
                  required
                >
                  {objects.map(obj => (
                    <option key={obj.id} value={obj.id}>
                      {obj.singularLabel} ({obj.key})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visual Arrow Indicator */}
            {fromObj && toObj && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
                padding: '0.65rem',
                background: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                <span style={{ color: fromObj.color }}>{fromObj.singularLabel}</span>
                <span style={{ color: '#a5b4fc', fontFamily: 'var(--font-mono)' }}>[{cardinality}]</span>
                <ArrowRight size={16} color="#6366f1" />
                <span style={{ color: toObj.color }}>{toObj.pluralLabel}</span>
              </div>
            )}

            {/* Cardinality Selector */}
            <div className="form-group">
              <label className="form-label">Relationship Cardinality</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                {(['1:1', '1:N', 'N:N'] as Cardinality[]).map(card => (
                  <div
                    key={card}
                    onClick={() => setCardinality(card)}
                    style={{
                      padding: '0.75rem 0.5rem',
                      textAlign: 'center',
                      borderRadius: '8px',
                      border: cardinality === card ? '2px solid #6366f1' : '1px solid #1e293b',
                      background: cardinality === card ? 'rgba(99, 102, 241, 0.15)' : '#0f172a',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: cardinality === card ? '#818cf8' : '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
                      {card}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                      {card === '1:1' ? 'One-to-One' : card === '1:N' ? 'One-to-Many' : 'Many-to-Many'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Label / Meaning */}
            <div className="form-group">
              <label className="form-label">Relationship Verb / Label</label>
              <input
                type="text"
                placeholder={fromObj && toObj ? `e.g. Places, Contains, Belongs to` : 'e.g. Places Orders'}
                value={label}
                onChange={e => setLabel(e.target.value)}
              />
            </div>

            {/* Delete Policy (FR-11, SRS Section 9) */}
            <div className="form-group">
              <label className="form-label">
                Foreign Delete Policy
                <span className="field-type-chip" style={{ textTransform: 'uppercase' }}>{deletePolicy}</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  {
                    policy: 'restrict' as DeletePolicy,
                    title: 'RESTRICT (Default & Recommended)',
                    desc: 'Forbids deleting the parent object if child records exist. Enforces strict relational safety.'
                  },
                  {
                    policy: 'cascade' as DeletePolicy,
                    title: 'CASCADE',
                    desc: 'Deleting parent automatically wipes all child records (e.g. deleting Order deletes OrderItems).'
                  },
                  {
                    policy: 'nullify' as DeletePolicy,
                    title: 'NULLIFY / DETACH',
                    desc: 'Sets foreign key pointer to null on child records, keeping them intact without parent link.'
                  }
                ].map(p => (
                  <label
                    key={p.policy}
                    onClick={() => setDeletePolicy(p.policy)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: deletePolicy === p.policy ? '1.5px solid #6366f1' : '1px solid #1e293b',
                      background: deletePolicy === p.policy ? 'rgba(99, 102, 241, 0.1)' : '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="deletePolicy"
                      checked={deletePolicy === p.policy}
                      onChange={() => setDeletePolicy(p.policy)}
                      style={{ marginTop: 3, accentColor: '#6366f1' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: deletePolicy === p.policy ? '#a5b4fc' : '#f8fafc' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                        {p.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            {relationshipToEdit ? (
              <button
                type="button"
                className="btn-pill"
                onClick={handleDelete}
                style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <Trash2 size={14} /> Remove Relation
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-pill"
                onClick={() => {
                  setIsRelationshipModalOpen(false);
                  setRelationshipToEdit(null);
                  setConnectingSourceId(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-pill primary">
                {relationshipToEdit ? 'Save Changes' : 'Create Relationship'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
