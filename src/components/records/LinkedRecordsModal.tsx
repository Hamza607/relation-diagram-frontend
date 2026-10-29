import React from 'react';
import { useApp } from '../../context/AppContext';
import { RecordItem, ObjectDefinition } from '../../types/schema';
import { Link2, X, ArrowRight, ExternalLink } from 'lucide-react';

interface LinkedRecordsModalProps {
  record: RecordItem | null;
  objectDef: ObjectDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LinkedRecordsModal: React.FC<LinkedRecordsModalProps> = ({
  record,
  objectDef,
  isOpen,
  onClose
}) => {
  const { objects, relationships, records } = useApp();

  if (!isOpen || !record || !objectDef) return null;

  // 1. Outgoing references from this record (Parent records this record points to)
  const outgoingLinks: { fieldName: string; targetObj: ObjectDefinition; targetRecord?: RecordItem }[] = [];
  objectDef.fields.forEach(fld => {
    if (fld.type === 'reference' && fld.referenceTargetObjectId) {
      const targetObj = objects.find(o => o.id === fld.referenceTargetObjectId);
      if (targetObj) {
        const targetRecId = record.values[fld.key];
        const targetRec = records.find(r => r.id === targetRecId);
        outgoingLinks.push({
          fieldName: fld.name,
          targetObj,
          targetRecord: targetRec
        });
      }
    }
  });

  // 2. Incoming references to this record (Child records pointing to this record)
  const incomingLinks: { fromObj: ObjectDefinition; relation: any; childRecords: RecordItem[] }[] = [];
  const relatedIncomingRels = relationships.filter(r => r.toObjectId === objectDef.id);

  relatedIncomingRels.forEach(rel => {
    const fromObj = objects.find(o => o.id === rel.fromObjectId);
    if (fromObj) {
      const childRecs = records.filter(r => {
        if (r.objectId !== fromObj.id) return false;
        return Object.values(r.values).includes(record.id);
      });
      incomingLinks.push({
        fromObj,
        relation: rel,
        childRecords: childRecs
      });
    }
  });

  const getRecordLabel = (obj: ObjectDefinition, r: RecordItem) => {
    const primary = obj.fields.find(f => f.isPrimary) || obj.fields[0];
    return primary ? String(r.values[primary.key] || r.id) : r.id;
  };

  return (
    <div className="modal-overlay" id="linked-records-modal">
      <div className="modal-dialog wide">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ backgroundColor: `${objectDef.color}25`, color: objectDef.color }}>
              <Link2 size={20} />
            </div>
            <div>
              <h3 className="modal-title">
                Linked Records Explorer: {getRecordLabel(objectDef, record)}
              </h3>
              <p className="form-hint">Inspect relational foreign key links and child collections</p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-area">
          {/* Outgoing References (Parents) */}
          <div className="form-group">
            <label className="form-label">
              Outgoing Parent References ({outgoingLinks.length})
            </label>
            {outgoingLinks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                This record does not reference any parent records.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {outgoingLinks.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid #1e293b'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Field: {item.fieldName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <span style={{ color: item.targetObj.color, fontWeight: 700, fontSize: '0.9rem' }}>
                        {item.targetObj.singularLabel}
                      </span>
                      <ArrowRight size={13} color="#64748b" />
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {item.targetRecord ? getRecordLabel(item.targetObj, item.targetRecord) : '(None / Unlinked)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Collections (Children) */}
          <div className="form-group">
            <label className="form-label">
              Incoming Child Collections ({incomingLinks.reduce((acc, i) => acc + i.childRecords.length, 0)} linked records)
            </label>
            {incomingLinks.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                No child collections point to this object.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingLinks.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid #1e293b'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.fromObj.color }} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.fromObj.pluralLabel}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({item.relation.label})</span>
                      </div>
                      <span className="field-type-chip">{item.childRecords.length} records</span>
                    </div>

                    {item.childRecords.length === 0 ? (
                      <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                        No records in this collection reference this entity.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {item.childRecords.map(child => (
                          <div
                            key={child.id}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              background: '#162032',
                              border: '1px solid #334155',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#cbd5e1'
                            }}
                          >
                            {getRecordLabel(item.fromObj, child)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-pill primary" onClick={onClose}>
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
