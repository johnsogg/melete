// Visualization utilities for BST demo
// Handles layout calculation and animation for BST nodes

import { BST, BSTNode } from './bst';
import { lerp } from '../../lib/graphics';

// Visualization constants
export const NODE_RADIUS = 25;
export const MIN_BOUNDARY_GAP = 20; // Gap between circle edges
export const MIN_NODE_GAP = NODE_RADIUS * 2 + MIN_BOUNDARY_GAP; // Center-to-center distance
export const LEVEL_HEIGHT = 80;

// Visualization data for each node
export interface VisualizationData {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isAnimating: boolean;
}

// Initialize visualization data for a new node
export const createVisualizationData = (
  x: number = 0,
  y: number = 0
): VisualizationData => ({
  x,
  y,
  targetX: x,
  targetY: y,
  isAnimating: false,
});

// Calculate positions using slot-based layout (like binary heap)
export const calculatePositions = (
  bst: BST,
  visualData: Map<string, VisualizationData>,
  canvasWidth: number,
  _canvasHeight: number
): void => {
  if (!bst.root) return;

  // Find tree depth to determine slot layout
  const treeDepth = bst.getTreeDepth();
  const maxSlotsInBottomLevel = Math.pow(2, treeDepth - 1);

  // Calculate total width needed for bottom level
  const totalWidth = maxSlotsInBottomLevel * MIN_NODE_GAP;
  const startX = canvasWidth / 2;
  const startY = 50;

  // Assign slot positions to all nodes
  assignSlotPositions(
    bst.root,
    visualData,
    0,
    0,
    maxSlotsInBottomLevel,
    startX - totalWidth / 2,
    startY
  );
};

// Assign slot positions recursively (binary heap style)
const assignSlotPositions = (
  node: BSTNode | null,
  visualData: Map<string, VisualizationData>,
  level: number,
  slotIndex: number,
  slotsInBottomLevel: number,
  leftmostX: number,
  topY: number
): void => {
  if (!node) return;

  // Calculate this level's slot spacing
  const slotsAtThisLevel = Math.pow(2, level);
  const slotSpacing = (slotsInBottomLevel * MIN_NODE_GAP) / slotsAtThisLevel;

  // Position this node in its slot
  const nodeX = leftmostX + (slotIndex + 0.5) * slotSpacing;
  const nodeY = topY + level * LEVEL_HEIGHT;

  // Get or create visualization data for this node
  let nodeVisData = visualData.get(node.id);
  if (!nodeVisData) {
    nodeVisData = createVisualizationData(nodeX, nodeY);
    visualData.set(node.id, nodeVisData);
  }

  nodeVisData.targetX = nodeX;
  nodeVisData.targetY = nodeY;

  // Recursively position children in their slots
  const nextLevel = level + 1;
  const leftChildSlot = slotIndex * 2;
  const rightChildSlot = slotIndex * 2 + 1;

  assignSlotPositions(
    node.left,
    visualData,
    nextLevel,
    leftChildSlot,
    slotsInBottomLevel,
    leftmostX,
    topY
  );
  assignSlotPositions(
    node.right,
    visualData,
    nextLevel,
    rightChildSlot,
    slotsInBottomLevel,
    leftmostX,
    topY
  );
};

// Animate nodes towards their target positions
export const animateNodes = (
  bst: BST,
  visualData: Map<string, VisualizationData>,
  animationSpeed: number
): boolean => {
  const nodes = bst.getAllNodes();
  let hasAnimating = false;

  nodes.forEach(node => {
    const nodeVisData = visualData.get(node.id);
    if (!nodeVisData) return;

    const dx = Math.abs(nodeVisData.targetX - nodeVisData.x);
    const dy = Math.abs(nodeVisData.targetY - nodeVisData.y);

    if (dx > 1 || dy > 1) {
      nodeVisData.x = lerp(nodeVisData.x, nodeVisData.targetX, animationSpeed);
      nodeVisData.y = lerp(nodeVisData.y, nodeVisData.targetY, animationSpeed);
      nodeVisData.isAnimating = true;
      hasAnimating = true;
    } else {
      nodeVisData.x = nodeVisData.targetX;
      nodeVisData.y = nodeVisData.targetY;
      nodeVisData.isAnimating = false;
    }
  });

  return hasAnimating;
};

// Clean up visualization data for nodes that no longer exist
export const cleanupVisualizationData = (
  bst: BST,
  visualData: Map<string, VisualizationData>
): void => {
  const existingNodeIds = new Set(bst.getAllNodes().map(node => node.id));

  for (const nodeId of visualData.keys()) {
    if (!existingNodeIds.has(nodeId)) {
      visualData.delete(nodeId);
    }
  }
};

// Find the most recently inserted node by finding the one without visualization data
export const findNewlyInsertedNode = (
  bst: BST,
  visualData: Map<string, VisualizationData>
): BSTNode | null => {
  const nodes = bst.getAllNodes();
  return nodes.find(node => !visualData.has(node.id)) || null;
};

// Find node at a specific position (for click detection)
export const findNodeAtPosition = (
  x: number,
  y: number,
  visualData: Map<string, VisualizationData>,
  nodes: BSTNode[]
): BSTNode | null => {
  for (const node of nodes) {
    const nodeVisData = visualData.get(node.id);
    if (!nodeVisData) continue;

    // Calculate distance from click to node center
    const dx = x - nodeVisData.x;
    const dy = y - nodeVisData.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if click is within the node's radius
    if (distance <= NODE_RADIUS) {
      return node;
    }
  }

  return null;
};
