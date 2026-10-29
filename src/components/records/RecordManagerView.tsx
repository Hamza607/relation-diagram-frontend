import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RecordItem, ObjectDefinition } from '../../types/schema';
import { RecordFormModal } from './RecordFormModal';
import { LinkedRecordsModal } from './LinkedRecordsModal';
import { Plus, Edit2, Trash2, Search, Link2, ExternalLink, Database } from 'lucide-react';

export const RecordManagerView: React.FC = () => {
  const {
    objects,
    records,
    deleteRecord,
    setIsRecordModalOpen,
    setRecordModalObjectId,
    setRecordToEdit,
    canEdit
  } = useApp();

  const [selectedObjectId, setSelectedObjectId] = useState<string>(
    objects.length > 0 ? objects[0].id : ''
  );
  const [recordSearch, setRecordSearch] = useState('');

  // Linked records modal state
  const [inspectRecord, setInspectRecord] = useState<RecordItem | null>(null);
  const [isLinkedOpen, setIsLinkedOpen] = useState(false);

  const currentObject = objects.find(o => o.id === selectedObjectId);
  const objectRecords = records.filter(r => r.objectId === selectedObjectId);

  const filteredRecords = objectRecords.filter(rec => {
    if (!recordSearch) return true;
    return Object.values(rec.values).some(val =>
      String(val).toLowerCase().includes(recordSearch.toLowerCase())
    );
  });

  const handleOpenCreateRecord = () => {
    if (!canEdit || !currentObject) return;
    setRecordModalObjectId(currentObject.id);
    setRecordToEdit(null);
    setIsRecordModalOpen(true);
  };

  const handleEditRecord = (rec: RecordItem) => {
    if (!canEdit || !currentObject) return;
    setRecordModalObjectId(currentObject.id);
    setRecordToEdit(rec);
    setIsRecordModalOpen(true);
  };

  const handleInspectLinked = (rec: RecordItem) => {
    setInspectRecord(rec);
    setIsLinkedOpen(true);
  };

  // Helper to format values in table
  const renderCellContent = (field: any, val: any) => {
    if (val === undefined || val === null || val === '') {
      return <span style={{ color: '#475569', fontStyle: 'italic' }}>—</span>;
    }

    if (field.type === 'reference') {
      const targetObj = objects.find(o => o.id === field.referenceTargetObjectId);
      const targetRec = records.find(r => r.id === val);
      const targetPrimary = targetObj?.fields.find(f => f.isPrimary) || targetObj?.fields[0];
      const displayLabel = targetRec && targetPrimary ? targetRec.values[targetPrimary.key] : val;

      return (
        <span
          className="field-type-chip reference"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
          onClick={() => {
            if (targetRec && targetObj) {
              setSelectedObjectId(targetObj.id);
            }
          }}
          title="Click to jump to referenced entity"
        >
          <Link2 size={11} /> {displayLabel}
        </span>
      );
    }

    if (field.type === 'boolean') {
      return (
        <span
          className="role-chip"
          style={{
            background: val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
            color: val ? '#34d399' : '#94a3b8'
          }}
        >
          {val ? 'TRUE' : 'FALSE'}
        </span>
      );
    }

    if (field.type === 'enum') {
      return (
        <span className="field-type-chip" style={{ color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}>
          {String(val)}
        </span>
      );
    }

    if (field.type === 'decimal') {
      return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${Number(val).toFixed(2)}</span>;
    }

    if (field.type === 'datetime') {
      return <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{new Date(val).toLocaleString()}</span>;
    }

    return <span>{String(val)}</span>;
  };

  return (
    <div className="records-view-container" id="records-manager-view">
      {/* Top Header Bar */}
      <div className="records-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: currentObject?.color || '#6366f1' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Data Records Manager</h2>
          <span className="field-type-chip">{records.length} Total Platform Records</span>
        </div>

        {canEdit && currentObject && (
          <button className="btn-pill primary" onClick={handleOpenCreateRecord}>
            <Plus size={15} /> Add {currentObject.singularLabel} Record
          </button>
        )}
      </div>

      {/* Object Selector Pills & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
          {objects.map(obj => {
            const count = records.filter(r => r.objectId === obj.id).length;
            const isSelected = obj.id === selectedObjectId;

            return (
              <button
                key={obj.id}
                onClick={() => setSelectedObjectId(obj.id)}
                className="btn-pill"
                style={{
                  background: isSelected ? `${obj.color}25` : '#111827',
                  borderColor: isSelected ? obj.color : '#1e293b',
                  color: isSelected ? '#f8fafc' : '#94a3b8'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: obj.color }} />
                <span>{obj.pluralLabel}</span>
                <span className="role-chip" style={{ background: '#1e293b', color: '#cbd5e1' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="search-input-wrapper" style={{ flexShrink: 0 }}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Search within records..."
            value={recordSearch}
            onChange={e => setRecordSearch(e.target.value)}
            style={{ width: '220px' }}
          />
        </div>
      </div>

      {/* Main Table */}
      {currentObject ? (
        <div className="records-table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                {currentObject.fields.filter(f => f.isActive).map(f => (
                  <th key={f.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{f.name}</span>
                      <span className="field-type-chip" style={{ fontSize: '9px', padding: '1px 4px' }}>
                        {f.type}
                      </span>
                    </div>
                  </th>
                ))}
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={currentObject.fields.filter(f => f.isActive).length + 2}
                    style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}
                  >
                    <Database size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No records stored for {currentObject.singularLabel}.</p>
                    <p style={{ fontSize: '0.78rem' }}>Click &ldquo;Add Record&rdquo; above to create sample domain data.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => (
                  <tr key={rec.id}>
                    <td style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {index + 1}
                    </td>

                    {currentObject.fields.filter(f => f.isActive).map(f => (
                      <td key={f.id}>
                        {renderCellContent(f, rec.values[f.key])}
                      </td>
                    ))}

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          className="node-btn-icon"
                          onClick={() => handleInspectLinked(rec)}
                          title="Inspect linked references and child collections"
                          style={{ color: '#818cf8' }}
                        >
                          <Link2 size={15} />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              className="node-btn-icon"
                              onClick={() => handleEditRecord(rec)}
                              title="Edit Record"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="node-btn-icon"
                              onClick={() => deleteRecord(rec.id)}
                              title="Delete Record"
                              style={{ color: '#f87171' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Select an object to inspect record data.
        </div>
      )}

      {/* Record Form Modal */}
      <RecordFormModal />

      {/* Linked Records Explorer Modal */}
      <LinkedRecordsModal
        record={inspectRecord}
        objectDef={currentObject || null}
        isOpen={isLinkedOpen}
        onClose={() => {
          setIsLinkedOpen(false);
          setInspectRecord(null);
        }}
      />
    </div>
  );
};
