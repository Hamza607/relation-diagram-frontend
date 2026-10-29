import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, X } from 'lucide-react';
import { FieldType } from '../../types/schema';

export const CanvasSearchFilter: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterFieldType,
    setFilterFieldType,
    objects
  } = useApp();

  const FILTER_TYPES: { type: FieldType | 'all'; label: string }[] = [
    { type: 'all', label: 'All Field Types' },
    { type: 'reference', label: 'References Only' },
    { type: 'enum', label: 'Enum Lists' },
    { type: 'decimal', label: 'Decimals / Currency' },
    { type: 'datetime', label: 'Date & Times' }
  ];

  return (
    <div className="canvas-search-widget" id="canvas-search-widget">
      <div className="search-input-wrapper">
        <Search size={15} />
        <input
          type="text"
          placeholder={`Search ${objects.length} objects or fields...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: 8, color: '#94a3b8' }}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <select
          value={filterFieldType || 'all'}
          onChange={e => setFilterFieldType(e.target.value === 'all' ? null : e.target.value)}
          style={{
            background: 'rgba(17, 24, 39, 0.88)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.8rem',
            paddingRight: '1.8rem'
          }}
        >
          {FILTER_TYPES.map(ft => (
            <option key={ft.type} value={ft.type}>
              {ft.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
