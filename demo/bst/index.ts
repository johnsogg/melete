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
  selectedNodes: Set<BSTNode>;
  animationSpeed: number;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragEnd: { x: number; y: number } | null;
  justFinishedDragging: boolean;
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
  selectedNodes: new Set<BSTNode>(),
  animationSpeed: 0.15,
  isDragging: false,
  dragStart: null,
  dragEnd: null,
  justFinishedDragging: false,
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
    const isSelected = model.selectedNodes.has(node);

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

  // Draw selection rectangle if dragging
  if (model.isDragging && model.dragStart && model.dragEnd) {
    const x1 = Math.min(model.dragStart.x, model.dragEnd.x);
    const y1 = Math.min(model.dragStart.y, model.dragEnd.y);
    const x2 = Math.max(model.dragStart.x, model.dragEnd.x);
    const y2 = Math.max(model.dragStart.y, model.dragEnd.y);

    // Draw selection rectangle
    layer.drawRect({
      topLeft: { x: x1, y: y1 },
      size: { width: x2 - x1, height: y2 - y1 },
      fill: true,
      color: 'rgba(0, 123, 255, 0.1)',
      stroke: true,
      strokeColor: '#007bff',
      strokeThickness: 1,
    });
  }

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
  deleteBtn.disabled = currentModel.selectedNodes.size === 0;
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

  if (currentModel.selectedNodes.size === 0) {
    showError(
      'Please select nodes to delete by clicking on them or using band selection'
    );
    return;
  }

  // Delete all selected nodes
  const nodesToDelete = Array.from(currentModel.selectedNodes);
  let deletedCount = 0;

  nodesToDelete.forEach(node => {
    const success = currentModel.bst.removeValue(node.value);
    if (success) {
      deletedCount++;
    }
  });

  if (deletedCount === 0) {
    showError('Failed to delete any nodes');
    return;
  }

  // Clean up visualization data for deleted nodes
  cleanupVisualizationData(currentModel.bst, currentModel.visualData);

  // Clear all selection state
  surface.setModel({
    ...currentModel,
    selectedNode: null,
    selectedNodes: new Set<BSTNode>(),
    lastInsertedNode: null,
  });

  updateTreeVisualization();
  updateDeleteButtonState();
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
    selectedNodes: new Set<BSTNode>(),
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
  console.log('Click handler called');
  const currentModel = surface.getModel();

  // Don't handle clicks if we just finished dragging
  if (currentModel.isDragging || currentModel.justFinishedDragging) {
    console.log('Ignoring click because of drag operation');
    // Clear the flag and return
    surface.setModel({
      ...currentModel,
      justFinishedDragging: false,
    });
    return;
  }

  // Use the new hit testing system
  const hitResult = surface.findFirstObjectAtMouseEvent(event);

  if (hitResult && hitResult.layerName === 'tree') {
    // Find the clicked node by ID
    const nodeId = hitResult.object.id;
    const clickedNode = currentModel.bst
      .getAllNodes()
      .find(node => node.id === nodeId);

    if (clickedNode) {
      // Toggle node selection using Set-based approach
      const newSelectedNodes = new Set(currentModel.selectedNodes);

      if (newSelectedNodes.has(clickedNode)) {
        newSelectedNodes.delete(clickedNode);
      } else {
        newSelectedNodes.add(clickedNode);
      }

      // Set primary selected node to the clicked node (if selected) or null
      const newSelectedNode = newSelectedNodes.has(clickedNode)
        ? clickedNode
        : null;

      surface.setModel({
        ...currentModel,
        selectedNode: newSelectedNode,
        selectedNodes: newSelectedNodes,
      });
    }
  } else {
    // Click on empty space - deselect all
    surface.setModel({
      ...currentModel,
      selectedNode: null,
      selectedNodes: new Set<BSTNode>(),
    });
  }

  updateDeleteButtonState();
});

// Get canvas element for direct event handling
const canvasElement = surface.getCanvas().getElement() as HTMLCanvasElement;

// Mouse down handler - start drag selection
canvasElement.addEventListener('mousedown', (event: Event) => {
  const mouseEvent = event as MouseEvent;
  const currentModel = surface.getModel();
  const rect = canvasElement.getBoundingClientRect();
  const mouseX = mouseEvent.clientX - rect.left;
  const mouseY = mouseEvent.clientY - rect.top;

  // Create a mock MeleteMouseEvent for hit testing
  const mockEvent = {
    canvasX: mouseX,
    canvasY: mouseY,
    button: mouseEvent.button,
    shiftKey: mouseEvent.shiftKey,
    ctrlKey: mouseEvent.ctrlKey,
    altKey: mouseEvent.altKey,
    metaKey: mouseEvent.metaKey,
    rawEvent: mouseEvent,
  };

  // Don't start drag if clicking on a node
  const hitResult = surface.findFirstObjectAtMouseEvent(mockEvent);
  if (hitResult && hitResult.layerName === 'tree') {
    return;
  }

  surface.setModel({
    ...currentModel,
    isDragging: true,
    dragStart: { x: mouseX, y: mouseY },
    dragEnd: { x: mouseX, y: mouseY },
  });
});

// Mouse move handler - update drag selection
canvasElement.addEventListener('mousemove', (event: Event) => {
  const mouseEvent = event as MouseEvent;
  const currentModel = surface.getModel();

  if (!currentModel.isDragging || !currentModel.dragStart) {
    return;
  }

  const rect = canvasElement.getBoundingClientRect();
  const mouseX = mouseEvent.clientX - rect.left;
  const mouseY = mouseEvent.clientY - rect.top;

  surface.setModel({
    ...currentModel,
    dragEnd: { x: mouseX, y: mouseY },
  });

  surface.rerender();
});

// Mouse up handler - complete drag selection
canvasElement.addEventListener('mouseup', (_event: Event) => {
  const currentModel = surface.getModel();

  if (
    !currentModel.isDragging ||
    !currentModel.dragStart ||
    !currentModel.dragEnd
  ) {
    return;
  }

  // Calculate selection rectangle
  const x1 = Math.min(currentModel.dragStart.x, currentModel.dragEnd.x);
  const y1 = Math.min(currentModel.dragStart.y, currentModel.dragEnd.y);
  const x2 = Math.max(currentModel.dragStart.x, currentModel.dragEnd.x);
  const y2 = Math.max(currentModel.dragStart.y, currentModel.dragEnd.y);

  // Find nodes that intersect with the selection rectangle
  const selectedNodes = new Set<BSTNode>();

  currentModel.bst.getAllNodes().forEach(node => {
    const nodeVisData = currentModel.visualData.get(node.id);
    if (!nodeVisData) return;

    // Check if node circle intersects with selection rectangle
    const nodeX = nodeVisData.x;
    const nodeY = nodeVisData.y;
    const radius = NODE_RADIUS;

    // Rectangle-circle intersection test
    const closestX = Math.max(x1, Math.min(nodeX, x2));
    const closestY = Math.max(y1, Math.min(nodeY, y2));
    const distanceX = nodeX - closestX;
    const distanceY = nodeY - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared <= radius * radius) {
      selectedNodes.add(node);
    }
  });

  // Set primary selected node to the first selected node or null
  const primarySelectedNode =
    selectedNodes.size > 0 ? Array.from(selectedNodes)[0] : null;

  console.log(
    'Setting model with selected nodes:',
    Array.from(selectedNodes).map(n => n.value)
  );

  surface.setModel({
    ...currentModel,
    isDragging: false,
    dragStart: null,
    dragEnd: null,
    selectedNodes,
    selectedNode: primarySelectedNode,
    justFinishedDragging: true,
  });

  console.log('Model after update:', surface.getModel().selectedNodes.size);
  updateDeleteButtonState();
  surface.rerender();
});

// Initialize with some nodes - create a fuller tree for testing with 5 levels
const initialValues = [
  50, 25, 75, 13, 37, 64, 98, 6, 19, 31, 42, 58, 69, 87, 106, 3, 8, 16, 22, 28,
  34, 39, 45, 55, 61, 67, 72, 82, 92, 102, 110,
];
initialValues.forEach(value => {
  model.bst.insert(value);
});

// Initial render
updateTreeVisualization();

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
