import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ObjectNode } from './ObjectNode';
import { ConnectorLine } from './ConnectorLine';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasSearchFilter } from './CanvasSearchFilter';
import { CanvasMinimap } from './CanvasMinimap';
import { ObjectInspector } from '../inspector/ObjectInspector';
import { ValidationIssuesModal } from './ValidationIssuesModal';

export const DiagramCanvas: React.FC = () => {
  const {
    objects,
    relationships,
    selectedObjectId,
    setSelectedObjectId,
    selectedRelationshipId,
    setSelectedRelationshipId,
    updateNodePosition,
    zoom,
    setZoom,
    pan,
    setPan,
    connectingSourceId,
    setConnectingSourceId,
    canEdit
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Validation modal state
  const [isValidationOpen, setIsValidationOpen] = useState(false);

  // Fit View calculation
  const handleFitView = useCallback(() => {
    if (objects.length === 0 || !containerRef.current) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    objects.forEach(obj => {
      minX = Math.min(minX, obj.position.x);
      minY = Math.min(minY, obj.position.y);
      maxX = Math.max(maxX, obj.position.x + 340);
      maxY = Math.max(maxY, obj.position.y + 280);
    });

    const containerRect = containerRef.current.getBoundingClientRect();
    const padding = 80;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const scaleX = containerRect.width / contentWidth;
    const scaleY = containerRect.height / contentHeight;
    const newZoom = Math.max(0.4, Math.min(1.2, Math.min(scaleX, scaleY)));

    const newPanX = (containerRect.width - (maxX + minX) * newZoom) / 2;
    const newPanY = (containerRect.height - (maxY + minY) * newZoom) / 2;

    setZoom(Number(newZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [objects, setZoom, setPan]);

  // Mouse Down on background -> start Pan
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary click
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setSelectedObjectId(null);
    setSelectedRelationshipId(null);
    if (connectingSourceId) setConnectingSourceId(null);
  };

  // Node Dragging Start
  const handleNodeMouseDown = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    if (!canEdit) return;
    const target = objects.find(o => o.id === objectId);
    if (!target) return;

    setDraggingNodeId(objectId);
    // Offset in zoomed canvas space
    setDragOffset({
      x: e.clientX / zoom - target.position.x,
      y: e.clientY / zoom - target.position.y
    });
  };

  // Global Mouse Move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggingNodeId) {
      const newX = Math.round(e.clientX / zoom - dragOffset.x);
      const newY = Math.round(e.clientY / zoom - dragOffset.y);
      updateNodePosition(draggingNodeId, { x: newX, y: newY });
    }
  }, [isPanning, panStart, draggingNodeId, zoom, dragOffset, setPan, updateNodePosition]);

  // Global Mouse Up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => {
      const next = prev * zoomFactor;
      return Math.min(2.0, Math.max(0.35, Number(next.toFixed(2))));
    });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const objMap = new Map(objects.map(o => [o.id, o]));

  return (
    <div
      ref={containerRef}
      className={`canvas-container ${isPanning ? 'grabbing' : ''}`}
      id="diagram-canvas-viewport"
      onMouseDown={handleContainerMouseDown}
      onWheel={handleWheel}
      style={{ display: 'flex', position: 'relative' }}
    >
      {/* Floating Toolbar & Search */}
      <CanvasToolbar
        onOpenValidation={() => setIsValidationOpen(true)}
        onFitView={handleFitView}
      />
      <CanvasSearchFilter />

      {/* Main Viewport Transform Group */}
      <div
        className="canvas-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* SVG Connector Edges Layer */}
        <svg
          className="connections-svg-layer"
          style={{ width: '4000px', height: '4000px' }}
        >
          {relationships.map(rel => {
            const fromObj = objMap.get(rel.fromObjectId);
            const toObj = objMap.get(rel.toObjectId);
            if (!fromObj || !toObj) return null;

            return (
              <ConnectorLine
                key={rel.id}
                relationship={rel}
                fromObj={fromObj}
                toObj={toObj}
                isSelected={selectedRelationshipId === rel.id}
              />
            );
          })}
        </svg>

        {/* Node Cards Layer */}
        {objects.map(obj => (
          <ObjectNode
            key={obj.id}
            object={obj}
            isSelected={selectedObjectId === obj.id}
            isConnectingSource={connectingSourceId === obj.id}
            onMouseDown={handleNodeMouseDown}
          />
        ))}
      </div>

      {/* Minimap */}
      <CanvasMinimap />

      {/* Object Inspector Drawer (if object selected) */}
      <ObjectInspector />

      {/* Validation Issues Modal */}
      <ValidationIssuesModal
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
      />
    </div>
  );
};
