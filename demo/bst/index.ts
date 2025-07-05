import { DrawingSurface } from '../../lib/index';
import { DebugPanel } from '../../lib/debug';

// BST Node structure
class BSTNode {
  value: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  x: number = 0;
  y: number = 0;
  targetX: number = 0;
  targetY: number = 0;
  isAnimating: boolean = false;

  constructor(value: number) {
    this.value = value;
  }
}

// Binary Search Tree class
class BST {
  root: BSTNode | null = null;

  insert(value: number): boolean {
    if (this.search(value)) {
      return false; // Value already exists
    }

    if (!this.root) {
      this.root = new BSTNode(value);
      return true;
    }

    this.insertNode(this.root, value);
    return true;
  }

  private insertNode(node: BSTNode, value: number): BSTNode {
    if (value < node.value) {
      if (!node.left) {
        node.left = new BSTNode(value);
        return node.left;
      } else {
        return this.insertNode(node.left, value);
      }
    } else {
      if (!node.right) {
        node.right = new BSTNode(value);
        return node.right;
      } else {
        return this.insertNode(node.right, value);
      }
    }
  }

  search(value: number): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: BSTNode | null, value: number): boolean {
    if (!node) return false;
    if (value === node.value) return true;
    if (value < node.value) return this.searchNode(node.left, value);
    return this.searchNode(node.right, value);
  }

  clear(): void {
    this.root = null;
  }

  // Layout configuration
  private static readonly NODE_RADIUS = 25;
  private static readonly MIN_BOUNDARY_GAP = 20; // Gap between circle edges
  private static readonly MIN_NODE_GAP =
    BST.NODE_RADIUS * 2 + BST.MIN_BOUNDARY_GAP; // Center-to-center distance
  private static readonly LEVEL_HEIGHT = 80;

  // Calculate positions using slot-based layout (like binary heap)
  calculatePositions(canvasWidth: number, _canvasHeight: number): void {
    if (!this.root) return;

    // Find tree depth to determine slot layout
    const treeDepth = this.getTreeDepth(this.root);
    const maxSlotsInBottomLevel = Math.pow(2, treeDepth - 1);

    // Calculate total width needed for bottom level
    const totalWidth = maxSlotsInBottomLevel * BST.MIN_NODE_GAP;
    const startX = canvasWidth / 2;
    const startY = 50;

    // Assign slot positions to all nodes
    this.assignSlotPositions(
      this.root,
      0,
      0,
      maxSlotsInBottomLevel,
      startX - totalWidth / 2,
      startY
    );
  }

  // Get maximum depth of tree
  private getTreeDepth(node: BSTNode | null): number {
    if (!node) return 0;
    return (
      1 + Math.max(this.getTreeDepth(node.left), this.getTreeDepth(node.right))
    );
  }

  // Assign slot positions recursively (binary heap style)
  private assignSlotPositions(
    node: BSTNode | null,
    level: number,
    slotIndex: number,
    slotsInBottomLevel: number,
    leftmostX: number,
    topY: number
  ): void {
    if (!node) return;

    // Calculate this level's slot spacing
    const slotsAtThisLevel = Math.pow(2, level);
    const slotSpacing =
      (slotsInBottomLevel * BST.MIN_NODE_GAP) / slotsAtThisLevel;

    // Position this node in its slot
    const nodeX = leftmostX + (slotIndex + 0.5) * slotSpacing;
    const nodeY = topY + level * BST.LEVEL_HEIGHT;

    node.targetX = nodeX;
    node.targetY = nodeY;

    // Initialize position for new nodes
    if (node.x === 0 && node.y === 0) {
      node.x = nodeX;
      node.y = nodeY;
    }

    // Recursively position children in their slots
    const nextLevel = level + 1;
    const leftChildSlot = slotIndex * 2;
    const rightChildSlot = slotIndex * 2 + 1;

    this.assignSlotPositions(
      node.left,
      nextLevel,
      leftChildSlot,
      slotsInBottomLevel,
      leftmostX,
      topY
    );
    this.assignSlotPositions(
      node.right,
      nextLevel,
      rightChildSlot,
      slotsInBottomLevel,
      leftmostX,
      topY
    );
  }

  // Get all nodes for rendering
  getAllNodes(): BSTNode[] {
    const nodes: BSTNode[] = [];
    this.traverseNodes(this.root, nodes);
    return nodes;
  }

  private traverseNodes(node: BSTNode | null, nodes: BSTNode[]): void {
    if (!node) return;
    nodes.push(node);
    this.traverseNodes(node.left, nodes);
    this.traverseNodes(node.right, nodes);
  }
}

// Demo model
interface BSTModel {
  bst: BST;
  animationFrame: number;
  isAnimating: boolean;
  lastInsertedNode: BSTNode | null;
  animationSpeed: number;
}

// Layer schema
const BST_LAYERS = {
  background: { cache: false, offscreen: false },
  tree: { cache: false, offscreen: false },
  animation: { cache: false, offscreen: false },
} as const;

type BSTLayerSchema = typeof BST_LAYERS;

// Create the model
const model: BSTModel = {
  bst: new BST(),
  animationFrame: 0,
  isAnimating: false,
  lastInsertedNode: null,
  animationSpeed: 0.15,
};

// Get container element
const container = document.getElementById('canvas-container');
if (!container) {
  throw new Error('Canvas container not found');
}

// Create DrawingSurface
const surface = new DrawingSurface<BSTModel, BSTLayerSchema>({
  model,
  layerSchema: BST_LAYERS,
  canvasOptions: { width: 900, height: 600 },
  container,
});

// Animation functions
const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

const animateNodes = (): void => {
  const currentModel = surface.getModel();
  const nodes = currentModel.bst.getAllNodes();
  let hasAnimating = false;

  nodes.forEach(node => {
    const dx = Math.abs(node.targetX - node.x);
    const dy = Math.abs(node.targetY - node.y);

    if (dx > 1 || dy > 1) {
      node.x = lerp(node.x, node.targetX, currentModel.animationSpeed);
      node.y = lerp(node.y, node.targetY, currentModel.animationSpeed);
      node.isAnimating = true;
      hasAnimating = true;
    } else {
      node.x = node.targetX;
      node.y = node.targetY;
      node.isAnimating = false;
    }
  });

  if (hasAnimating) {
    surface.rerender();
    requestAnimationFrame(animateNodes);
  } else {
    surface.setModel({
      ...currentModel,
      isAnimating: false,
    });
  }
};

// Background layer
const backgroundLayer = surface.getLayer('background');
backgroundLayer.onDemand(({ layer }) => {
  layer.clear('#f8f9fa');
});

// Tree layer - draw BST structure
const treeLayer = surface.getLayer('tree');
treeLayer.onDemand(({ model, layer }) => {
  const nodes = model.bst.getAllNodes();

  // Draw connections first
  nodes.forEach(node => {
    if (node.left) {
      layer.drawLine({
        from: { x: node.x, y: node.y },
        to: { x: node.left.x, y: node.left.y },
        stroke: true,
        strokeColor: '#6c757d',
        strokeThickness: 2,
      });
    }
    if (node.right) {
      layer.drawLine({
        from: { x: node.x, y: node.y },
        to: { x: node.right.x, y: node.right.y },
        stroke: true,
        strokeColor: '#6c757d',
        strokeThickness: 2,
      });
    }
  });

  // Draw nodes
  nodes.forEach(node => {
    const isHighlighted = node === model.lastInsertedNode;

    // Node circle
    layer.drawCircle({
      center: { x: node.x, y: node.y },
      radius: 25,
      fill: true,
      color: isHighlighted ? '#28a745' : '#007bff',
      stroke: true,
      strokeColor: '#333',
      strokeThickness: 2,
    });

    // Node value text - properly centered
    const text = node.value.toString();
    const font = '16px Arial, sans-serif';
    const textDimensions = layer.getTextDimensions(text, font);

    // Calculate centered position
    const textX = node.x - textDimensions.width / 2;
    const textY = node.y + textDimensions.baseline / 2;

    layer.setStyle({
      font,
      textColor: 'white',
    });

    layer.drawText({
      text,
      position: { x: textX, y: textY },
    });
  });

  // Placeholder indicators disabled - they were creating visual clutter
});

// UI Elements
const numberInput = document.getElementById('numberInput') as HTMLInputElement;
const insertBtn = document.getElementById('insertBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const errorMsg = document.getElementById('errorMsg') as HTMLSpanElement;

const showError = (message: string): void => {
  errorMsg.textContent = message;
  setTimeout(() => {
    errorMsg.textContent = '';
  }, 3000);
};

const updateTreeVisualization = (): void => {
  const currentModel = surface.getModel();
  currentModel.bst.calculatePositions(900, 600);

  surface.setModel({
    ...currentModel,
    isAnimating: true,
  });

  requestAnimationFrame(animateNodes);
};

// Insert button handler
insertBtn.addEventListener('click', () => {
  const value = parseInt(numberInput.value);

  if (isNaN(value)) {
    showError('Please enter a valid number');
    return;
  }

  if (value < -999 || value > 999) {
    showError('Number must be between -999 and 999');
    return;
  }

  const currentModel = surface.getModel();
  const success = currentModel.bst.insert(value);

  if (!success) {
    showError('Number already exists in the tree');
    return;
  }

  // Find the newly inserted node
  const nodes = currentModel.bst.getAllNodes();
  const newNode = nodes.find(node => node.value === value);

  surface.setModel({
    ...currentModel,
    lastInsertedNode: newNode || null,
  });

  numberInput.value = '';
  updateTreeVisualization();
});

// Clear button handler
clearBtn.addEventListener('click', () => {
  const currentModel = surface.getModel();
  currentModel.bst.clear();

  surface.setModel({
    ...currentModel,
    lastInsertedNode: null,
  });

  surface.rerender();
});

// Enter key handler for input
numberInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    insertBtn.click();
  }
});

// Initial render
surface.rerender();

// Create debug panel
const debugContainer = document.getElementById('debug-info');
if (debugContainer) {
  debugContainer.innerHTML = '';

  new DebugPanel<BSTModel, BSTLayerSchema>(surface, debugContainer, {
    maxEventHistory: 10,
    updateInterval: 300,
  });
}

console.log('BST demo initialized');
