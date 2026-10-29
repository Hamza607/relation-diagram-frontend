import React from 'react';
import { useApp } from '../../context/AppContext';
import { SCHEMA_TEMPLATES } from '../../mockData/templates';
import { INITIAL_OBJECTS, INITIAL_RELATIONSHIPS } from '../../mockData/initialData';
import { Sparkles, X, ShoppingCart, Building, Layers, FileCode, Check } from 'lucide-react';

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  ShoppingCart,
  Building,
  Layers,
  FileCode
};

export const TemplateModal: React.FC = () => {
  const {
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    loadTemplate
  } = useApp();

  if (!isTemplateModalOpen) return null;

  const handleSelectTemplate = (tpl: any) => {
    if (tpl.id === 'tpl_ecommerce') {
      loadTemplate(INITIAL_OBJECTS, INITIAL_RELATIONSHIPS, tpl.name);
    } else if (tpl.id === 'tpl_blank') {
      loadTemplate([], [], 'Blank Canvas');
    } else {
      loadTemplate(tpl.objects, tpl.relationships, tpl.name);
    }
    setIsTemplateModalOpen(false);
  };

  return (
    <div className="modal-overlay" id="templates-modal">
      <div className="modal-dialog wide">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="modal-title">Industry Schema Templates</h3>
              <p className="form-hint">Load pre-configured data models with entities, fields, and 1:N relations</p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={() => setIsTemplateModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-area">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {SCHEMA_TEMPLATES.map(tpl => {
              const IconComp = TEMPLATE_ICONS[tpl.icon] || FileCode;

              return (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  style={{
                    padding: '1.2rem',
                    borderRadius: '10px',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1e293b';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComp size={18} />
                    </div>
                    <span className="field-type-chip">{tpl.category}</span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                      {tpl.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem', lineHeight: 1.4 }}>
                      {tpl.description}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {tpl.id === 'tpl_ecommerce' ? '5 Entities • 4 Relations' : `${tpl.objects.length} Entities • ${tpl.relationships.length} Relations`}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8' }}>
                      Load &rarr;
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Blank Slate Option */}
            <div
              onClick={() => handleSelectTemplate({ id: 'tpl_blank', name: 'Blank Slate' })}
              style={{
                padding: '1.2rem',
                borderRadius: '10px',
                background: '#0f172a',
                border: '1px dashed #334155',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#334155';
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#1e293b',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileCode size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                  Blank Canvas
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Start completely from scratch with an empty data modeling board.
                </div>
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
                0 Entities
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-pill" onClick={() => setIsTemplateModalOpen(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
