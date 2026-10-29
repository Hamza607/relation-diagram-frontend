import React from 'react';
import { useApp } from '../../context/AppContext';
import { ObjectDefinition } from '../../types/schema';
import {
  Box,
  User,
  ShoppingCart,
  Package,
  CreditCard,
  Building,
  Home,
  FileText,
  Layers,
  Tag,
  Shield,
  Database,
  Plus,
  MessageSquare,
  Trash2,
  Key,
  Link2,
  ChevronUp,
  ChevronDown,
  ArrowRightCircle
} from 'lucide-react';

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Box,
  User,
  ShoppingCart,
  Package,
  CreditCard,
  Building,
  Home,
  FileText,
  Layers,
  Tag,
  Shield,
  Database
};

interface ObjectNodeProps {
  object: ObjectDefinition;
  isSelected: boolean;
  isConnectingSource: boolean;
  onMouseDown: (e: React.MouseEvent, objectId: string) => void;
}

export const ObjectNode: React.FC<ObjectNodeProps> = ({
  object,
  isSelected,
  isConnectingSource,
  onMouseDown
}) => {
  const {
    setSelectedObjectId,
    setIsFieldModalOpen,
    setFieldModalObjectId,
    setEditingField,
    setIsCommentsDrawerOpen,
    setCommentTarget,
    deleteObject,
    reorderFields,
    connectingSourceId,
    setConnectingSourceId,
    setIsRelationshipModalOpen,
    searchQuery,
    filterFieldType,
    canEdit
  } = useApp();

  const IconComp = ICON_COMPONENTS[object.icon] || Box;

  // Search query highlight check
  const isSearchMatch = searchQuery
    ? object.singularLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      object.fields.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.key.toLowerCase().includes(searchQuery.toLowerCase()))
    : true;

  const handleStartConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;

    if (connectingSourceId && connectingSourceId !== object.id) {
      // Connect source to this target
      setIsRelationshipModalOpen(true);
    } else {
      setConnectingSourceId(object.id);
    }
  };

  const handleAddField = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    setFieldModalObjectId(object.id);
    setEditingField(null);
    setIsFieldModalOpen(true);
  };

  const handleOpenComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCommentTarget({
      type: 'object',
      id: object.id,
      name: object.singularLabel
    });
    setIsCommentsDrawerOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    deleteObject(object.id);
  };

  return (
    <div
      id={`node-${object.id}`}
      className={`object-node-card ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${object.position.x}px`,
        top: `${object.position.y}px`,
        opacity: isSearchMatch ? 1 : 0.35,
        borderColor: isConnectingSource ? '#10b981' : isSelected ? object.color : undefined
      }}
      onClick={e => {
        e.stopPropagation();
        setSelectedObjectId(object.id);
        if (connectingSourceId && connectingSourceId !== object.id) {
          setIsRelationshipModalOpen(true);
        }
      }}
      onMouseDown={e => onMouseDown(e, object.id)}
    >
      {/* Left Connection Port */}
      <div
        className="node-port port-left"
        title="Click to connect relationship"
        onClick={handleStartConnection}
        style={{
          borderColor: isConnectingSource ? '#10b981' : 'white',
          backgroundColor: isConnectingSource ? '#10b981' : object.color
        }}
      />

      {/* Header */}
      <div className="object-node-header">
        <div className="node-header-left">
          <div className="node-icon-box" style={{ backgroundColor: object.color }}>
            <IconComp size={16} />
          </div>
          <div className="node-header-titles">
            <span className="node-title">{object.singularLabel}</span>
            <span className="node-key-badge">{object.key}</span>
          </div>
        </div>

        <div className="node-actions" onClick={e => e.stopPropagation()}>
          <button
            className="node-btn-icon"
            onClick={handleOpenComments}
            title="Object comments &amp; discussions"
          >
            <MessageSquare size={13} />
          </button>
          {canEdit && (
            <>
              <button
                className="node-btn-icon"
                onClick={handleAddField}
                title="Add Field to object"
                style={{ color: '#818cf8' }}
              >
                <Plus size={15} />
              </button>
              <button
                className="node-btn-icon"
                onClick={handleDelete}
                title="Delete object (Impact safe)"
                style={{ color: '#f87171' }}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description if present */}
      {object.description && (
        <div style={{
          padding: '0.35rem 0.75rem',
          fontSize: '0.72rem',
          color: '#94a3b8',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid var(--border-subtle)',
          lineHeight: 1.35
        }}>
          {object.description}
        </div>
      )}

      {/* Fields List */}
      <div className="node-fields-list">
        {object.fields.map(fld => {
          if (!fld.isActive) return null;
          const isTypeFiltered = filterFieldType ? fld.type === filterFieldType : true;

          return (
            <div
              key={fld.id}
              className="field-item-row"
              style={{
                opacity: isTypeFiltered ? 1 : 0.4,
                borderLeft: fld.isPrimary ? `3px solid ${object.color}` : undefined
              }}
              onClick={e => {
                e.stopPropagation();
                if (canEdit) {
                  setFieldModalObjectId(object.id);
                  setEditingField(fld);
                  setIsFieldModalOpen(true);
                }
              }}
              title="Click to edit field settings"
            >
              <div className="field-name-group">
                {fld.isPrimary && <Key size={11} color={object.color} style={{ flexShrink: 0 }} />}
                {fld.type === 'reference' && <Link2 size={11} color="#818cf8" style={{ flexShrink: 0 }} />}
                <span className="field-name-text">
                  {fld.name}
                  {fld.required && <span className="field-required-star">*</span>}
                </span>
                <span className="field-key-sub">({fld.key})</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className={`field-type-chip ${fld.type === 'reference' ? 'reference' : ''}`}>
                  {fld.type}
                </span>

                {canEdit && (
                  <div style={{ display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                    <button
                      style={{ padding: 0, lineHeight: 0.5, color: '#64748b' }}
                      onClick={() => reorderFields(object.id, fld.id, 'up')}
                      title="Move Up"
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button
                      style={{ padding: 0, lineHeight: 0.5, color: '#64748b' }}
                      onClick={() => reorderFields(object.id, fld.id, 'down')}
                      title="Move Down"
                    >
                      <ChevronDown size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Footer */}
      <div className="node-footer">
        <span>{object.fields.length} attributes</span>
        {canEdit && (
          <button
            className="node-footer-btn"
            onClick={handleStartConnection}
            title="Draw relation to another object"
          >
            <ArrowRightCircle size={13} /> Connect Edge
          </button>
        )}
      </div>

      {/* Right Connection Port */}
      <div
        className="node-port port-right"
        title="Click to connect relationship"
        onClick={handleStartConnection}
        style={{
          borderColor: isConnectingSource ? '#10b981' : 'white',
          backgroundColor: isConnectingSource ? '#10b981' : object.color
        }}
      />
    </div>
  );
};
