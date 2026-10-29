import React from 'react';
import { useApp } from '../../context/AppContext';
import { RelationshipDefinition, ObjectDefinition } from '../../types/schema';

interface ConnectorLineProps {
  relationship: RelationshipDefinition;
  fromObj: ObjectDefinition;
  toObj: ObjectDefinition;
  isSelected: boolean;
}

export const ConnectorLine: React.FC<ConnectorLineProps> = ({
  relationship,
  fromObj,
  toObj,
  isSelected
}) => {
  const { setSelectedRelationshipId, setRelationshipToEdit, setIsRelationshipModalOpen } = useApp();

  const NODE_WIDTH = 320;
  // Estimate height based on fields count
  const fromHeight = 90 + fromObj.fields.length * 32;
  const toHeight = 90 + toObj.fields.length * 32;

  // Decide best ports (left or right)
  const isFromLeftOfTo = fromObj.position.x + NODE_WIDTH / 2 < toObj.position.x + NODE_WIDTH / 2;

  const startX = isFromLeftOfTo ? fromObj.position.x + NODE_WIDTH : fromObj.position.x;
  const startY = fromObj.position.y + fromHeight / 2;

  const endX = isFromLeftOfTo ? toObj.position.x : toObj.position.x + NODE_WIDTH;
  const endY = toObj.position.y + toHeight / 2;

  const dx = Math.abs(endX - startX) * 0.5;
  const cp1X = isFromLeftOfTo ? startX + Math.max(dx, 60) : startX - Math.max(dx, 60);
  const cp2X = isFromLeftOfTo ? endX - Math.max(dx, 60) : endX + Math.max(dx, 60);

  const pathData = `M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`;

  // Center coordinate for label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRelationshipId(relationship.id);
    setRelationshipToEdit(relationship);
    setIsRelationshipModalOpen(true);
  };

  const strokeColor = isSelected ? '#a5b4fc' : '#6366f1';
  const deletePolicyColor =
    relationship.deletePolicy === 'restrict'
      ? '#ef4444'
      : relationship.deletePolicy === 'cascade'
      ? '#f59e0b'
      : '#10b981';

  return (
    <g id={`edge-${relationship.id}`}>
      {/* Background wider invisible stroke for easier click target */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth={20}
        fill="none"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={handleClick}
      />

      {/* Visible Path */}
      <path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        strokeDasharray={relationship.cardinality === 'N:N' ? '6 4' : undefined}
        className="connection-edge"
        onClick={handleClick}
      />

      {/* Port connection dots */}
      <circle cx={startX} cy={startY} r={5} fill={fromObj.color} stroke="#0f172a" strokeWidth={1.5} />
      <circle cx={endX} cy={endY} r={5} fill={toObj.color} stroke="#0f172a" strokeWidth={1.5} />

      {/* Midpoint Label Tag Pill */}
      <g
        transform={`translate(${midX}, ${midY})`}
        className="edge-label-pill"
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={-60}
          y={-14}
          width={120}
          height={28}
          rx={14}
          fill="#111827"
          stroke={isSelected ? '#818cf8' : '#334155'}
          strokeWidth={isSelected ? 1.5 : 1}
          filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.6))"
        />
        <circle cx={-44} cy={0} r={4} fill={deletePolicyColor} />
        <text
          x={-34}
          y={4}
          fill="#f8fafc"
          fontSize={10}
          fontWeight={700}
          fontFamily="var(--font-mono)"
        >
          {relationship.cardinality}
        </text>
        <text
          x={-5}
          y={4}
          fill="#94a3b8"
          fontSize={10}
          fontWeight={600}
          fontFamily="var(--font-sans)"
        >
          {relationship.label.length > 14 ? `${relationship.label.substring(0, 12)}…` : relationship.label}
        </text>
      </g>
    </g>
  );
};
