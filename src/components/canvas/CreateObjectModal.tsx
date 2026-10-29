import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Box, User, ShoppingCart, Package, CreditCard, Building, Home, FileText, Layers, Tag, Shield, Database, X } from 'lucide-react';

const ICONS_LIST = [
  { name: 'Box', icon: Box },
  { name: 'User', icon: User },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Package', icon: Package },
  { name: 'CreditCard', icon: CreditCard },
  { name: 'Building', icon: Building },
  { name: 'Home', icon: Home },
  { name: 'FileText', icon: FileText },
  { name: 'Layers', icon: Layers },
  { name: 'Tag', icon: Tag },
  { name: 'Shield', icon: Shield },
  { name: 'Database', icon: Database }
];

const COLORS_LIST = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' }
];

export const CreateObjectModal: React.FC = () => {
  const { isCreateObjectOpen, setIsCreateObjectOpen, createObject } = useApp();

  const [singularLabel, setSingularLabel] = useState('');
  const [pluralLabel, setPluralLabel] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Box');
  const [selectedColor, setSelectedColor] = useState('#6366f1');

  if (!isCreateObjectOpen) return null;

  const handleSingularChange = (val: string) => {
    setSingularLabel(val);
    if (!key) {
      setKey(val.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    }
    if (!pluralLabel) {
      setPluralLabel(val ? `${val}s` : '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singularLabel.trim()) return;

    createObject({
      singularLabel: singularLabel.trim(),
      pluralLabel: pluralLabel.trim() || `${singularLabel}s`,
      key: key.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      description: description.trim(),
      icon: selectedIcon,
      color: selectedColor
    });

    setIsCreateObjectOpen(false);
    setSingularLabel('');
    setPluralLabel('');
    setKey('');
    setDescription('');
  };

  return (
    <div className="modal-overlay" id="create-object-modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge" style={{ background: `${selectedColor}25`, color: selectedColor }}>
              <Box size={20} />
            </div>
            <div>
              <h3 className="modal-title">Define New Custom Object (FR-03)</h3>
              <p className="form-hint">Create a dynamic schema entity with custom fields and relations</p>
            </div>
          </div>
          <button className="node-btn-icon" onClick={() => setIsCreateObjectOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Singular Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice, Property, Ticket"
                  value={singularLabel}
                  onChange={e => handleSingularChange(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Plural Label</label>
                <input
                  type="text"
                  placeholder="e.g. Invoices, Properties"
                  value={pluralLabel}
                  onChange={e => setPluralLabel(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Technical Key (API &amp; Database Identifier) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. invoice_record"
                value={key}
                onChange={e => setKey(e.target.value)}
                required
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <span className="form-hint">Unique key used in relationships and export payloads.</span>
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Entity Icon</label>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {ICONS_LIST.map(({ name, icon: IconComp }) => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setSelectedIcon(name)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: selectedIcon === name ? '2px solid #6366f1' : '1px solid #1e293b',
                      background: selectedIcon === name ? 'rgba(99, 102, 241, 0.2)' : '#0f172a',
                      color: selectedIcon === name ? '#818cf8' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconComp size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div className="form-group">
              <label className="form-label">Accent Theme Color</label>
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                {COLORS_LIST.map(c => (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => setSelectedColor(c.value)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: c.value,
                      border: selectedColor === c.value ? '3px solid white' : '2px solid transparent',
                      boxShadow: selectedColor === c.value ? `0 0 10px ${c.value}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description / Business Purpose</label>
              <textarea
                rows={2}
                placeholder="What business data does this object represent?"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-pill" onClick={() => setIsCreateObjectOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-pill primary">
              Create Object
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
