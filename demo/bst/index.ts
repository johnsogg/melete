import {
  DrawingSurface,
  calculateAabbFromCircle,
  pointInCircle,
} from '../../lib/index';
import { DebugPanel } from '../../lib/debug';
import { BST, BSTNode } from './bst';
import {
  VisualizationData,
  calculatePositions,
  animateNodes,
  findNewlyInsertedNode,
  cleanupVisualizationData,
  NODE_RADIUS,
} from './visualization';

// Demo model
interface BSTModel {
  bst: BST;
  visualData: Map<string, VisualizationData>;
  animationFrame: number;
  isAnimating: boolean;
  lastInsertedNode: BSTNode | null;
  selectedNode: BSTNode | null;
  animationSpeed: number;
}

// Layer schema
const BST_LAYERS = {
  background: { cache: false, offscreen: false },
  tree: { cache: false, offscreen: false, hittable: true },
  animation: { cache: false, offscreen: false },
} as const;

type BSTLayerSchema = typeof BST_LAYERS;

// Create the model
const model: BSTModel = {
  bst: new BST(),
  visualData: new Map<string, VisualizationData>(),
  animationFrame: 0,
  isAnimating: false,
  lastInsertedNode: null,
  selectedNode: null,
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

// Animation function
const runAnimation = (): void => {
  const currentModel = surface.getModel();
  const hasAnimating = animateNodes(
    currentModel.bst,
    currentModel.visualData,
    currentModel.animationSpeed
  );

  if (hasAnimating) {
    surface.rerender();
    requestAnimationFrame(runAnimation);
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

  // Clear previous hit test data
  layer.clearHitTestData();

  // Draw connections first
  nodes.forEach(node => {
    const nodeVisData = model.visualData.get(node.id);
    if (!nodeVisData) return;

    if (node.left) {
      const leftVisData = model.visualData.get(node.left.id);
      if (leftVisData) {
        layer.drawLine({
          from: { x: nodeVisData.x, y: nodeVisData.y },
          to: { x: leftVisData.x, y: leftVisData.y },
          stroke: true,
          strokeColor: '#6c757d',
          strokeThickness: 2,
        });
      }
    }
    if (node.right) {
      const rightVisData = model.visualData.get(node.right.id);
      if (rightVisData) {
        layer.drawLine({
          from: { x: nodeVisData.x, y: nodeVisData.y },
          to: { x: rightVisData.x, y: rightVisData.y },
          stroke: true,
          strokeColor: '#6c757d',
          strokeThickness: 2,
        });
      }
    }
  });

  // Draw nodes
  nodes.forEach(node => {
    const nodeVisData = model.visualData.get(node.id);
    if (!nodeVisData) return;

    const isHighlighted = node === model.lastInsertedNode;
    const isSelected = node === model.selectedNode;

    // Node circle
    layer.drawCircle({
      center: { x: nodeVisData.x, y: nodeVisData.y },
      radius: NODE_RADIUS,
      fill: true,
      color: isSelected ? '#dc3545' : isHighlighted ? '#28a745' : '#007bff',
      stroke: true,
      strokeColor: isSelected ? '#721c24' : '#333',
      strokeThickness: isSelected ? 3 : 2,
    });

    // Node value text - properly centered
    const text = node.value.toString();
    const font = '16px Arial, sans-serif';
    const textDimensions = layer.getTextDimensions(text, font);

    // Calculate centered position
    const textX = nodeVisData.x - textDimensions.width / 2;
    const textY = nodeVisData.y + textDimensions.baseline / 2;

    layer.setStyle({
      font,
      textColor: 'white',
    });

    layer.drawText({
      text,
      position: { x: textX, y: textY },
    });

    // Register node for hit testing
    const center = { x: nodeVisData.x, y: nodeVisData.y };
    const aabb = calculateAabbFromCircle(center, NODE_RADIUS);
    layer.addHitTestData({
      id: node.id,
      aabb,
      preciseTest: point => pointInCircle(point, center, NODE_RADIUS),
    });
  });

  // Placeholder indicators disabled - they were creating visual clutter
});

// UI Elements
const numberInput = document.getElementById('numberInput') as HTMLInputElement;
const insertBtn = document.getElementById('insertBtn') as HTMLButtonElement;
const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;
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
  calculatePositions(currentModel.bst, currentModel.visualData, 900, 600);

  surface.setModel({
    ...currentModel,
    isAnimating: true,
  });

  requestAnimationFrame(runAnimation);
};

const updateDeleteButtonState = (): void => {
  const currentModel = surface.getModel();
  deleteBtn.disabled = !currentModel.selectedNode;
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
  const newNode = findNewlyInsertedNode(
    currentModel.bst,
    currentModel.visualData
  );

  surface.setModel({
    ...currentModel,
    lastInsertedNode: newNode,
  });

  numberInput.value = '';
  updateTreeVisualization();
});

// Delete button handler
deleteBtn.addEventListener('click', () => {
  const currentModel = surface.getModel();

  if (!currentModel.selectedNode) {
    showError('Please select a node to delete by clicking on it');
    return;
  }

  const valueToDelete = currentModel.selectedNode.value;
  const success = currentModel.bst.removeValue(valueToDelete);

  if (!success) {
    showError('Failed to delete node - value not found');
    return;
  }

  // Clean up visualization data for deleted nodes
  cleanupVisualizationData(currentModel.bst, currentModel.visualData);

  surface.setModel({
    ...currentModel,
    selectedNode: null,
    lastInsertedNode: null,
  });

  updateTreeVisualization();
});

// Clear button handler
clearBtn.addEventListener('click', () => {
  const currentModel = surface.getModel();
  currentModel.bst.clear();
  currentModel.visualData.clear();

  surface.setModel({
    ...currentModel,
    lastInsertedNode: null,
    selectedNode: null,
  });

  surface.rerender();
});

// Enter key handler for input
numberInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    insertBtn.click();
  }
});

// Canvas click handler for node selection
surface.onClick(event => {
  const currentModel = surface.getModel();

  // Use the new hit testing system
  const hitResult = surface.findFirstObjectAtMouseEvent(event);

  if (hitResult && hitResult.layerName === 'tree') {
    // Find the clicked node by ID
    const nodeId = hitResult.object.id;
    const clickedNode = currentModel.bst
      .getAllNodes()
      .find(node => node.id === nodeId);

    if (clickedNode) {
      surface.setModel({
        ...currentModel,
        selectedNode:
          clickedNode === currentModel.selectedNode ? null : clickedNode,
      });
    }
  } else {
    // Click on empty space - deselect
    surface.setModel({
      ...currentModel,
      selectedNode: null,
    });
  }

  updateDeleteButtonState();
});

// Initial render
surface.rerender();

// Initial UI state
updateDeleteButtonState();

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
