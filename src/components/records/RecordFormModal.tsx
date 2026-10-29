import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ObjectDefinition, RecordItem } from '../../types/schema';
import { validateRecordValues } from '../../utils/validation';
import { Database, X, AlertCircle } from 'lucide-react';

export const RecordFormModal: React.FC = () => {
  const {
    isRecordModalOpen,
    setIsRecordModalOpen,
    recordModalObjectId,
    recordToEdit,
    setRecordToEdit,
    objects,
    records,
    createRecord,
    updateRecord
  } = useApp();

  const targetObject = objects.find(o => o.id === recordModalObjectId);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (recordToEdit) {
      setFormValues({ ...recordToEdit.values });
    } else if (targetObject) {
      const initial: Record<string, any> = {};
      targetObject.fields.forEach(f => {
        if (f.defaultValue !== undefined) {
          initial[f.key] = f.defaultValue;
        } else if (f.type === 'boolean') {
          initial[f.key] = false;
        } else if (f.type === 'enum' && f.enumOptions && f.enumOptions.length > 0) {
          initial[f.key] = f.enumOptions[0];
        } else {
          initial[f.key] = '';
        }
      });
      setFormValues(initial);
    }
    setFormErrors({});
  }, [recordToEdit, targetObject, isRecordModalOpen]);

  if (!isRecordModalOpen || !targetObject) return null;

  const handleInputChange = (key: string, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using utility
    const errors = validateRecordValues(targetObject, formValues, records, recordToEdit?.id);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (recordToEdit) {
      updateRecord(recordToEdit.id, formValues);
    } else {
      createRecord(targetObject.id, formValues);
    }

    setIsRecordModalOpen(false);
    setRecordToEdit(null);
  };

  // Helper to find candidate reference options
  const getReferenceOptions = (targetObjectId?: string) => {
    if (!targetObjectId) return [];
    const refObj = objects.find(o => o.id === targetObjectId);
    if (!refObj) return [];

    const refRecords = records.filter(r => r.objectId === targetObjectId);
    const primaryField = refObj.fields.find(f => f.isPrimary) || refObj.fields[0];

    return refRecords.map(r => ({
      id: r.id,
      label: primaryField ? String(r.values[primaryField.key] || r.id) : r.id,
      sublabel: `${refObj.singularLabel} (${r.id.substring(0, 8)})`
    }));
  };

  return (
    <div className="modal-overlay" id="record-form-modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ backgroundColor: `${targetObject.color}25`, color: targetObject.color }}>
              <Database size={20} />
            </div>
            <div>
              <h3 className="modal-title">
                {recordToEdit ? 'Edit Record' : `Create New ${targetObject.singularLabel}`}
              </h3>
              <p className="form-hint">Dynamic validated schema entry (FR-08, FR-15)</p>
            </div>
          </div>
          <button
            className="node-btn-icon"
            onClick={() => {
              setIsRecordModalOpen(false);
              setRecordToEdit(null);
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            {targetObject.fields.filter(f => f.isActive).map(field => {
              const fieldError = formErrors[field.key];
              const val = formValues[field.key] !== undefined ? formValues[field.key] : '';

              return (
                <div key={field.id} className="form-group">
                  <label className="form-label">
                    <span>
                      {field.name}
                      {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                    </span>
                    <span className="field-type-chip">{field.type}</span>
                  </label>

                  {/* Render input by type */}
                  {field.type === 'boolean' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', padding: '0.4rem 0' }}>
                      <input
                        type="checkbox"
                        checked={!!val}
                        onChange={e => handleInputChange(field.key, e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#6366f1' }}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{val ? 'True (Active)' : 'False (Inactive)'}</span>
                    </label>
                  ) : field.type === 'long_text' ? (
                    <textarea
                      rows={3}
                      value={val}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                    />
                  ) : field.type === 'enum' ? (
                    <select
                      value={val}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                    >
                      <option value="">Select option...</option>
                      {field.enumOptions?.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'reference' ? (
                    <select
                      value={val}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                    >
                      <option value="">Select referenced record...</option>
                      {getReferenceOptions(field.referenceTargetObjectId).map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label} ({opt.sublabel})
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'datetime' ? (
                    <input
                      type="datetime-local"
                      value={val ? String(val).substring(0, 16) : ''}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.type === 'number' || field.type === 'decimal' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                      step={field.type === 'decimal' ? '0.01' : '1'}
                      value={val}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.name.toLowerCase()}...`}
                    />
                  )}

                  {/* Validation Error Message */}
                  {fieldError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      <AlertCircle size={13} />
                      <span>{fieldError}</span>
                    </div>
                  )}

                  {field.description && !fieldError && (
                    <span className="form-hint">{field.description}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-pill"
              onClick={() => {
                setIsRecordModalOpen(false);
                setRecordToEdit(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-pill primary">
              {recordToEdit ? 'Save Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
