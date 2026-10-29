import React from 'react';
import { useApp } from '../../context/AppContext';

export const CanvasMinimap: React.FC = () => {
  const { objects, pan, zoom } = useApp();

  // Find canvas bounds
  let minX = 0, minY = 0, maxX = 1400, maxY = 900;
  if (objects.length > 0) {
    minX = Math.min(0, ...objects.map(o => o.position.x));
    minY = Math.min(0, ...objects.map(o => o.position.y));
    maxX = Math.max(1400, ...objects.map(o => o.position.x + 350));
    maxY = Math.max(900, ...objects.map(o => o.position.y + 350));
  }

  const mapWidth = 180;
  const mapHeight = 120;
  const scaleX = mapWidth / (maxX - minX || 1);
  const scaleY = mapHeight / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);

  // Viewport rectangle representation
  const vpWidth = (window.innerWidth / zoom) * scale;
  const vpHeight = (window.innerHeight / zoom) * scale;
  const vpX = (-pan.x / zoom - minX) * scale;
  const vpY = (-pan.y / zoom - minY) * scale;

  return (
    <div className="minimap-widget" title="Canvas Minimap">
      <svg width={mapWidth} height={mapHeight} style={{ display: 'block' }}>
        {/* Nodes representations */}
        {objects.map(obj => {
          const x = (obj.position.x - minX) * scale;
          const y = (obj.position.y - minY) * scale;
          const w = Math.max(8, 320 * scale);
          const h = Math.max(6, 180 * scale);

          return (
            <rect
              key={obj.id}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={2}
              fill={obj.color}
              opacity={0.7}
            />
          );
        })}

        {/* Viewport Box */}
        <rect
          x={vpX}
          y={vpY}
          width={vpWidth}
          height={vpHeight}
          fill="rgba(99, 102, 241, 0.12)"
          stroke="#818cf8"
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: 4,
        right: 6,
        fontSize: '9px',
        color: '#64748b',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Minimap
      </div>
    </div>
  );
};
