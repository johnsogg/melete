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

// Calculate positions using tree-structure-based layout algorithm
export const calculatePositions = (
  bst: BST,
  visualData: Map<string, VisualizationData>,
  canvasWidth: number,
  _canvasHeight: number
): void => {
  if (!bst.root) return;

  const startY = 50;
  const canvasMargin = 40;
  const availableWidth = canvasWidth - 2 * canvasMargin;

  // Step 1: Calculate subtree widths for each node
  const subtreeWidths = new Map<string, number>();
  calculateSubtreeWidths(bst.root, subtreeWidths);

  // Step 2: Position nodes using tree structure
  const nodePositions = new Map<string, { x: number; y: number }>();
  const rootWidth = subtreeWidths.get(bst.root.id) || MIN_NODE_GAP;
  const rootX = canvasMargin + availableWidth / 2;

  // Calculate initial positions
  positionNodesRecursively(
    bst.root,
    rootX,
    startY,
    rootWidth,
    nodePositions,
    subtreeWidths
  );

  // Step 3: Check if layout exceeds canvas bounds and scale if necessary
  scaleLayoutToFitCanvas(nodePositions, availableWidth, canvasMargin);

  // Step 4: Apply positions to visualization data
  applyPositionsToVisualizationData(bst.root, visualData, nodePositions);
};

// Calculate the minimum width required for each subtree
const calculateSubtreeWidths = (
  node: BSTNode | null,
  subtreeWidths: Map<string, number>
): number => {
  if (!node) return 0;

  // Calculate widths of child subtrees
  const leftWidth = calculateSubtreeWidths(node.left, subtreeWidths);
  const rightWidth = calculateSubtreeWidths(node.right, subtreeWidths);

  // Calculate minimum width needed for this subtree
  let subtreeWidth: number;
  const minChildOffset = MIN_NODE_GAP * 0.6; // Reduce spacing for single children

  if (!node.left && !node.right) {
    // Leaf node - just needs space for itself
    subtreeWidth = MIN_NODE_GAP;
  } else if (!node.left) {
    // Only right child - needs space for right subtree plus smaller offset
    subtreeWidth = Math.max(MIN_NODE_GAP, rightWidth + minChildOffset);
  } else if (!node.right) {
    // Only left child - needs space for left subtree plus smaller offset
    subtreeWidth = Math.max(MIN_NODE_GAP, leftWidth + minChildOffset);
  } else {
    // Both children - needs space for both subtrees plus gap
    subtreeWidth = leftWidth + rightWidth + MIN_NODE_GAP * 0.8;
  }

  subtreeWidths.set(node.id, subtreeWidth);
  return subtreeWidth;
};

// Position nodes recursively using tree structure
const positionNodesRecursively = (
  node: BSTNode | null,
  centerX: number,
  y: number,
  availableWidth: number,
  nodePositions: Map<string, { x: number; y: number }>,
  subtreeWidths: Map<string, number>
): void => {
  if (!node) return;

  // Position this node at the center of its available space
  nodePositions.set(node.id, { x: centerX, y });

  // Calculate positions for children
  const leftWidth = node.left
    ? subtreeWidths.get(node.left.id) || MIN_NODE_GAP
    : 0;
  const rightWidth = node.right
    ? subtreeWidths.get(node.right.id) || MIN_NODE_GAP
    : 0;

  if (node.left && node.right) {
    // Both children exist - position them symmetrically with compact spacing
    const totalChildWidth = leftWidth + rightWidth;
    const childSpacing = Math.max(
      MIN_NODE_GAP * 0.8,
      Math.min(availableWidth - totalChildWidth, MIN_NODE_GAP * 1.2)
    );

    const leftCenterX = centerX - (rightWidth + childSpacing) / 2;
    const rightCenterX = centerX + (leftWidth + childSpacing) / 2;

    positionNodesRecursively(
      node.left,
      leftCenterX,
      y + LEVEL_HEIGHT,
      leftWidth,
      nodePositions,
      subtreeWidths
    );

    positionNodesRecursively(
      node.right,
      rightCenterX,
      y + LEVEL_HEIGHT,
      rightWidth,
      nodePositions,
      subtreeWidths
    );
  } else if (node.left) {
    // Only left child - position it to the left of parent with smaller offset
    const leftCenterX = centerX - MIN_NODE_GAP * 0.4;
    positionNodesRecursively(
      node.left,
      leftCenterX,
      y + LEVEL_HEIGHT,
      leftWidth,
      nodePositions,
      subtreeWidths
    );
  } else if (node.right) {
    // Only right child - position it to the right of parent with smaller offset
    const rightCenterX = centerX + MIN_NODE_GAP * 0.4;
    positionNodesRecursively(
      node.right,
      rightCenterX,
      y + LEVEL_HEIGHT,
      rightWidth,
      nodePositions,
      subtreeWidths
    );
  }
};

// Scale layout to fit within canvas bounds
const scaleLayoutToFitCanvas = (
  nodePositions: Map<string, { x: number; y: number }>,
  availableWidth: number,
  canvasMargin: number
): void => {
  if (nodePositions.size === 0) return;

  // Find the bounds of the current layout
  const positions = Array.from(nodePositions.values());
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const layoutWidth = maxX - minX;

  // If layout exceeds available width, scale it down
  if (layoutWidth > availableWidth) {
    const scaleFactor = availableWidth / layoutWidth;
    const centerX = canvasMargin + availableWidth / 2;
    const layoutCenterX = (minX + maxX) / 2;

    // Scale all positions
    for (const position of positions) {
      const offsetFromCenter = position.x - layoutCenterX;
      position.x = centerX + offsetFromCenter * scaleFactor;
    }
  } else {
    // Center the layout if it fits
    const centerX = canvasMargin + availableWidth / 2;
    const layoutCenterX = (minX + maxX) / 2;
    const offsetToCenter = centerX - layoutCenterX;

    for (const position of positions) {
      position.x += offsetToCenter;
    }
  }
};

// Apply calculated positions to visualization data
const applyPositionsToVisualizationData = (
  node: BSTNode | null,
  visualData: Map<string, VisualizationData>,
  nodePositions: Map<string, { x: number; y: number }>
): void => {
  if (!node) return;

  const position = nodePositions.get(node.id);
  if (!position) return;

  // Get or create visualization data for this node
  let nodeVisData = visualData.get(node.id);
  if (!nodeVisData) {
    nodeVisData = createVisualizationData(position.x, position.y);
    visualData.set(node.id, nodeVisData);
  }

  nodeVisData.targetX = position.x;
  nodeVisData.targetY = position.y;

  // Recursively apply positions to children
  if (node.left) {
    applyPositionsToVisualizationData(node.left, visualData, nodePositions);
  }

  if (node.right) {
    applyPositionsToVisualizationData(node.right, visualData, nodePositions);
  }
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
