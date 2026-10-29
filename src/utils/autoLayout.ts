import { ObjectDefinition, RelationshipDefinition } from '../types/schema';

/**
 * Automatically calculates aesthetically pleasing positions for nodes
 * using a topological / layered layout algorithm.
 */
export function calculateAutoLayout(
  objects: ObjectDefinition[],
  relationships: RelationshipDefinition[]
): ObjectDefinition[] {
  if (objects.length === 0) return [];

  // Build adjacency graph
  const inDegree: Record<string, number> = {};
  const childrenMap: Record<string, string[]> = {};

  objects.forEach(obj => {
    inDegree[obj.id] = 0;
    childrenMap[obj.id] = [];
  });

  relationships.forEach(rel => {
    if (inDegree[rel.toObjectId] !== undefined) {
      inDegree[rel.toObjectId] = (inDegree[rel.toObjectId] || 0) + 1;
    }
    if (childrenMap[rel.fromObjectId]) {
      childrenMap[rel.fromObjectId].push(rel.toObjectId);
    }
  });

  // Assign layers (rank)
  const layers: string[][] = [];
  const assigned = new Set<string>();

  // Layer 0: Root nodes (inDegree === 0)
  let currentLayer = objects
    .filter(obj => (inDegree[obj.id] || 0) === 0)
    .map(obj => obj.id);

  if (currentLayer.length === 0) {
    // If cycle, pick first node
    currentLayer = [objects[0].id];
  }

  currentLayer.forEach(id => assigned.add(id));
  layers.push(currentLayer);

  while (assigned.size < objects.length) {
    const nextLayer: string[] = [];
    const prevLayer = layers[layers.length - 1];

    prevLayer.forEach(parentId => {
      const children = childrenMap[parentId] || [];
      children.forEach(childId => {
        if (!assigned.has(childId) && !nextLayer.includes(childId)) {
          nextLayer.push(childId);
          assigned.add(childId);
        }
      });
    });

    // If no connected nodes left, add unassigned nodes
    if (nextLayer.length === 0) {
      const remaining = objects.find(o => !assigned.has(o.id));
      if (remaining) {
        nextLayer.push(remaining.id);
        assigned.add(remaining.id);
      } else {
        break;
      }
    }

    layers.push(nextLayer);
  }

  const HORIZONTAL_SPACING = 380;
  const VERTICAL_SPACING = 340;
  const START_X = 80;
  const START_Y = 100;

  const positions: Record<string, { x: number; y: number }> = {};

  layers.forEach((layer, layerIdx) => {
    const layerHeight = layer.length * VERTICAL_SPACING;
    const startY = Math.max(START_Y, 280 - layerHeight / 2 + START_Y);

    layer.forEach((nodeId, nodeIdx) => {
      positions[nodeId] = {
        x: START_X + layerIdx * HORIZONTAL_SPACING,
        y: startY + nodeIdx * VERTICAL_SPACING
      };
    });
  });

  return objects.map(obj => ({
    ...obj,
    position: positions[obj.id] || obj.position
  }));
}
