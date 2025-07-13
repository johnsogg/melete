import { DrawingSurface } from '../../lib/index';
import { Pt } from '../../lib/geom';
import { pointOnLine, createSolver, type AnyConstraint, DEFAULT_SOLVER_CONFIG } from '../../lib/constraints';
// Text utilities imported from graphics for potential future use

// Point data for the demo
interface DemoPoint {
  id: string;
  label: string;
  position: Pt;
  selected: boolean;
  highlighted: boolean;
}

// UI state for the demo
interface UIState {
  selectedPointIds: Set<string>;
  dragState: {
    isDragging: boolean;
    pointId: string | null;
    offset: Pt | null;
  };
}

// Solver statistics
interface SolverStats {
  lastSolveTime: number;
  iterations: number;
  converged: boolean;
  error: number;
}

// Runtime solver configuration for testing
interface RuntimeSolverConfig {
  maxIterations: number;
  convergenceTolerance: number;
  learningRate: number;
  minErrorReduction: number;
}

// Test result tracking
interface TestResult {
  testId: number;
  config: RuntimeSolverConfig;
  iterations: number;
  solveTime: number;
  converged: boolean;
  finalError: number;
}

// Comprehensive model for the constraints demo
interface ConstraintsModel {
  points: DemoPoint[];
  constraints: AnyConstraint[];
  uiState: UIState;
  solverStats: SolverStats | null;
  backgroundColor: string;
  runtimeConfig: RuntimeSolverConfig;
  testResults: TestResult[];
}

// Utility functions for point management

// Generate next point label (A, B, C...Z, AA, AB, etc.)
const generatePointLabel = (existingLabels: string[]): string => {
  const labelSet = new Set(existingLabels);
  
  // Single letters A-Z
  for (let i = 0; i < 26; i++) {
    const label = String.fromCharCode(65 + i); // A-Z
    if (!labelSet.has(label)) return label;
  }
  
  // Double letters AA, AB, AC, etc.
  for (let first = 0; first < 26; first++) {
    for (let second = 0; second < 26; second++) {
      const label = String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
      if (!labelSet.has(label)) return label;
    }
  }
  
  // Fallback (shouldn't reach here in practice)
  return `P${existingLabels.length}`;
};

// Generate random position within canvas bounds with margin
const generateRandomPosition = (canvasWidth: number, canvasHeight: number, margin: number = 50): Pt => {
  return {
    x: margin + Math.random() * (canvasWidth - 2 * margin),
    y: margin + Math.random() * (canvasHeight - 2 * margin),
  };
};

// Check if a point is within circle radius
const isPointInCircle = (clickPoint: Pt, center: Pt, radius: number): boolean => {
  const dx = clickPoint.x - center.x;
  const dy = clickPoint.y - center.y;
  return Math.sqrt(dx * dx + dy * dy) <= radius;
};

// Create a new point and add it to the model
const addNewPoint = (currentModel: ConstraintsModel, canvasWidth: number, canvasHeight: number): ConstraintsModel => {
  const existingLabels = currentModel.points.map(p => p.label);
  const newLabel = generatePointLabel(existingLabels);
  const newPosition = generateRandomPosition(canvasWidth, canvasHeight);
  
  const newPoint: DemoPoint = {
    id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label: newLabel,
    position: newPosition,
    selected: false,
    highlighted: false,
  };
  
  return {
    ...currentModel,
    points: [...currentModel.points, newPoint],
  };
};

// Constants for point rendering
const POINT_FONT = '14px Arial, sans-serif';
const POINT_MIN_RADIUS = 15; // Minimum radius to ensure 2-letter labels fit

// Calculate point radius based on label
const calculatePointRadius = (label: string, layer: any): number => {
  const bounds = layer.getTextBounds(label, POINT_FONT);
  // Add padding for the text, ensure minimum size
  const requiredRadius = Math.max(bounds.width / 2 + 4, bounds.height / 2 + 2, POINT_MIN_RADIUS);
  return requiredRadius;
};

// Draw a single point using Melete graphics API
const drawPoint = (point: DemoPoint, layer: any): void => {
  const radius = calculatePointRadius(point.label, layer);
  
  // Determine colors based on point state
  let backgroundColor: string;
  let borderColor: string;
  let textColor: string;
  
  if (point.highlighted) {
    backgroundColor = '#ffeb3b'; // yellow
    borderColor = '#f44336';     // red
    textColor = '#000000';       // black
  } else if (point.selected) {
    backgroundColor = '#e3f2fd'; // light blue
    borderColor = '#1976d2';     // dark blue
    textColor = '#1976d2';       // dark blue
  } else {
    backgroundColor = '#f5f5f5'; // light gray
    borderColor = '#9e9e9e';     // medium gray
    textColor = '#424242';       // dark gray
  }
  
  // Draw the circle background
  layer.drawCircle({
    center: point.position,
    radius: radius,
    fill: true,
    color: backgroundColor,
    stroke: true,
    strokeColor: borderColor,
    strokeThickness: 2,
  });
  
  // Calculate text position (centered in circle)
  const textBounds = layer.getTextBounds(point.label, POINT_FONT);
  const textPosition: Pt = {
    x: point.position.x - textBounds.width / 2,
    y: point.position.y + textBounds.height / 2 - 2, // Adjust for baseline
  };
  
  // Draw the text label
  layer.setStyle({
    font: POINT_FONT,
    textColor: textColor,
  });
  
  layer.drawText({
    text: point.label,
    position: textPosition,
  });
};

// Create layer schema - using a single layer for initial setup
const DEMO_LAYERS = {
  main: { cache: false, offscreen: false },
} as const;

type ConstraintsLayerSchema = typeof DEMO_LAYERS;

// Create the initial model
const model: ConstraintsModel = {
  points: [],
  constraints: [],
  uiState: {
    selectedPointIds: new Set<string>(),
    dragState: {
      isDragging: false,
      pointId: null,
      offset: null,
    },
  },
  solverStats: null,
  backgroundColor: '#ffffff',
  runtimeConfig: {
    maxIterations: 2000,
    convergenceTolerance: 0.000001,
    learningRate: 50.0,
    minErrorReduction: 1e-15,
  },
  testResults: [],
};

// Get container element
const container = document.getElementById('canvas-container');
if (!container) {
  throw new Error('Canvas container not found');
}

// Create DrawingSurface with our model and layer schema
const surface = new DrawingSurface<ConstraintsModel, ConstraintsLayerSchema>({
  model,
  layerSchema: DEMO_LAYERS,
  canvasOptions: { width: 600, height: 400 },
  container,
});

// Get the main layer and set up drawing callback
const mainLayer = surface.getLayer('main');

mainLayer.onDemand(({ model, layer }) => {
  // Clear with background color
  layer.clear(model.backgroundColor);

  // Draw all points
  model.points.forEach(point => {
    drawPoint(point, layer);
  });
  
  // Draw constraint visualization lines
  model.constraints.forEach(constraint => {
    if (constraint.type === 'point-on-line') {
      const [point, lineStart, lineEnd] = constraint.points;
      
      // Draw the line (start to end)
      layer.drawLine({
        from: lineStart,
        to: lineEnd,
        stroke: true,
        strokeColor: '#2196F3',
        strokeThickness: 2,
      });
      
      // Draw a dotted line from the constrained point to the line (if not on line)
      // For now, just draw a light line to show the relationship
      layer.drawLine({
        from: point,
        to: lineStart,
        stroke: true,
        strokeColor: '#cccccc',
        strokeThickness: 1,
      });
    }
  });
  
  // If no points exist, show instruction text
  if (model.points.length === 0) {
    layer.setStyle({
      font: '18px Arial, sans-serif',
      textColor: '#666666',
    });
    
    layer.drawText({
      text: 'Click "Add Point" to get started',
      position: { x: 200, y: 200 },
    });
  }
});

// Point selection and interaction logic
const findPointAt = (clickPos: Pt, points: DemoPoint[], layer: any): DemoPoint | null => {
  // Check from last to first (top to bottom) for proper z-order
  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i];
    const radius = calculatePointRadius(point.label, layer);
    if (isPointInCircle(clickPos, point.position, radius)) {
      return point;
    }
  }
  return null;
};

// Update point selection
const updatePointSelection = (currentModel: ConstraintsModel, pointId: string | null, shiftPressed: boolean): ConstraintsModel => {
  const newSelectedIds = new Set(currentModel.uiState.selectedPointIds);
  
  if (!pointId) {
    // Clicked empty space - clear selection
    newSelectedIds.clear();
  } else if (shiftPressed) {
    // Shift+click - toggle point in selection
    if (newSelectedIds.has(pointId)) {
      newSelectedIds.delete(pointId);
    } else {
      newSelectedIds.add(pointId);
    }
  } else {
    // Normal click - select only this point
    newSelectedIds.clear();
    newSelectedIds.add(pointId);
  }
  
  // Update points' selected state
  const updatedPoints = currentModel.points.map(point => ({
    ...point,
    selected: newSelectedIds.has(point.id),
  }));
  
  return {
    ...currentModel,
    points: updatedPoints,
    uiState: {
      ...currentModel.uiState,
      selectedPointIds: newSelectedIds,
    },
  };
};

// Set up click interaction
surface.onClick(event => {
  const currentModel = surface.getModel();
  
  // Find if we clicked on a point
  const clickedPoint = findPointAt({ x: event.canvasX, y: event.canvasY }, currentModel.points, mainLayer);
  
  // Update selection based on click
  const newModel = updatePointSelection(currentModel, clickedPoint?.id || null, event.shiftKey);
  
  surface.setModel(newModel);
  surface.rerender();
  
  // Update UI panels
  updateStatusPanel();
  if ((window as any).updateButtons) {
    (window as any).updateButtons();
  }
});

// Stochastic testing functions

// Create 3 random points and a point-on-line constraint
const setupRandomTest = (): ConstraintsModel => {
  const currentModel = surface.getModel();
  
  // Clear existing points and constraints
  const clearedModel: ConstraintsModel = {
    ...currentModel,
    points: [],
    constraints: [],
    uiState: {
      ...currentModel.uiState,
      selectedPointIds: new Set(),
    },
  };
  
  // Create 3 random points
  const labels = ['A', 'B', 'C'];
  const newPoints: DemoPoint[] = labels.map((label, index) => ({
    id: `point-${Date.now()}-${index}`,
    label,
    position: generateRandomPosition(600, 400),
    selected: false,
    highlighted: false,
  }));
  
  // Create point-on-line constraint: A constrained to line BC
  const constraintId = `test-constraint-${Date.now()}`;
  const baseConstraint = pointOnLine(constraintId, newPoints[0].position, newPoints[1].position, newPoints[2].position);
  
  // Wrapper constraint with larger maxExpectedError
  const constraint = {
    ...baseConstraint,
    calculateError: (_maxExpectedError: number) => {
      const canvasMaxError = 720;
      return baseConstraint.calculateError(canvasMaxError);
    },
    calculatePartialDerivative: (pointIndex: number, coordinate: 'x' | 'y', _maxExpectedError: number, stepSize: number) => {
      const canvasMaxError = 720;
      return baseConstraint.calculatePartialDerivative(pointIndex, coordinate, canvasMaxError, stepSize);
    }
  };
  
  return {
    ...clearedModel,
    points: newPoints,
    constraints: [constraint],
  };
};

// Run automated test with current parameters
const runAutomatedTest = async (): Promise<TestResult> => {
  const currentModel = surface.getModel();
  const testId = currentModel.testResults.length + 1;
  
  console.log(`\n=== Starting Test ${testId} ===`);
  console.log('Config:', currentModel.runtimeConfig);
  
  const solver = createSolver();
  const startTime = performance.now();
  
  const constraintSystem = {
    constraints: currentModel.constraints,
    points: [],
    config: {
      ...DEFAULT_SOLVER_CONFIG,
      ...currentModel.runtimeConfig,
    },
  };
  
  const result = await solver.solve(constraintSystem);
  const solveTime = performance.now() - startTime;
  
  const testResult: TestResult = {
    testId,
    config: { ...currentModel.runtimeConfig },
    iterations: result.iterations,
    solveTime,
    converged: result.success,
    finalError: result.finalError,
  };
  
  console.log(`Test ${testId} Result:`, {
    iterations: testResult.iterations,
    time: `${testResult.solveTime.toFixed(1)}ms`,
    converged: testResult.converged,
    finalError: testResult.finalError.toFixed(8)
  });
  
  return testResult;
};

// Note: Drag functionality would require additional mouse event handlers
// For now, we'll focus on point creation and constraint setup

// Constraint solving functions
const solveConstraints = async () => {
  const currentModel = surface.getModel();
  
  if (currentModel.constraints.length === 0) {
    console.log('No constraints to solve');
    return;
  }
  
  try {
    const solver = createSolver();
    const startTime = performance.now();
    
    // The solver expects the exact same point objects that the constraints reference
    // We need to extract unique points from the constraints themselves
    console.log(`Solving ${currentModel.constraints.length} constraints...`);
    
    // Create constraint system using runtime config
    const constraintSystem = {
      constraints: currentModel.constraints,
      points: [], // The solver will extract points from constraints
      config: {
        ...DEFAULT_SOLVER_CONFIG,
        ...currentModel.runtimeConfig, // Use runtime configurable parameters
      },
    };
    
    // Add iteration listener for progress tracking
    solver.onIteration((iterResult) => {
      if (iterResult.iteration % 100 === 0 || iterResult.iteration > 350) {
        console.log(`Iteration ${iterResult.iteration}: totalError=${iterResult.totalError.toFixed(6)}, constraintError=${iterResult.constraintErrors[0]?.toFixed(6)}`);
      }
    });
    
    const result = await solver.solve(constraintSystem);
    
    console.log('Solve result:', result);
    
    const solveTime = performance.now() - startTime;
    
    // Update the model with solver stats and potentially updated point positions
    // The solver modifies point objects in place, so we need to trigger a rerender
    const newModel: ConstraintsModel = {
      ...currentModel,
      solverStats: {
        lastSolveTime: solveTime,
        iterations: result.iterations,
        converged: result.terminationReason === 'converged',
        error: result.finalError,
      },
    };
    
    surface.setModel(newModel);
    surface.rerender();
    updateStatusPanel();
    
    if (result.success) {
      console.log(`Constraint solving completed in ${result.iterations} iterations (${solveTime.toFixed(2)}ms)`);
    } else {
      // Even if not fully converged, the solver may have made progress
      console.log(`Constraint solving stopped after ${result.iterations} iterations:`, {
        terminationReason: result.terminationReason,
        finalError: result.finalError,
        errorReduction: 'Points may have moved closer to constraint satisfaction'
      });
    }
  } catch (error) {
    console.error('Error during constraint solving:', error);
  }
};

// Throttled constraint solving (for future drag operations)
// const throttledSolveConstraints = (() => {
//   let lastCall = 0;
//   const delay = 100; // 100ms throttle
//   
//   return () => {
//     const now = Date.now();
//     if (now - lastCall >= delay) {
//       lastCall = now;
//       solveConstraints();
//     }
//   };
// })();

// Trigger initial render
surface.rerender();

console.log('Constraints demo initialized');

// Set up control panel buttons
const controlPanel = document.getElementById('control-panel');
if (controlPanel) {
  // Clear existing content
  controlPanel.innerHTML = '<h3 class="panel-title">Control Panel</h3>';
  
  // Add Point button
  const addPointButton = document.createElement('button');
  addPointButton.textContent = 'Add Point';
  addPointButton.style.cssText = `
    margin: 5px;
    padding: 8px 16px;
    font-size: 14px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  addPointButton.addEventListener('click', () => {
    const currentModel = surface.getModel();
    // Use fixed canvas dimensions (we know they're 600x400 from the surface creation)
    const newModel = addNewPoint(currentModel, 600, 400);
    surface.setModel(newModel);
    surface.rerender();
    updateStatusPanel();
  });
  
  controlPanel.appendChild(addPointButton);
  
  // Point-on-Line constraint button (initially disabled)
  const pointOnLineButton = document.createElement('button');
  pointOnLineButton.textContent = 'Point on Line';
  pointOnLineButton.style.cssText = `
    margin: 5px;
    padding: 8px 16px;
    font-size: 14px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  pointOnLineButton.disabled = true;
  
  pointOnLineButton.addEventListener('click', () => {
    const currentModel = surface.getModel();
    const selectedPoints = currentModel.points.filter(p => p.selected);
    
    if (selectedPoints.length === 3) {
      showPointRoleDialog(selectedPoints);
    }
  });
  
  controlPanel.appendChild(pointOnLineButton);
  
  // Solve constraints button
  const solveButton = document.createElement('button');
  solveButton.textContent = 'Solve Constraints';
  solveButton.style.cssText = `
    margin: 5px;
    padding: 8px 16px;
    font-size: 14px;
    background-color: #FF9800;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  solveButton.addEventListener('click', () => {
    solveConstraints();
  });
  
  controlPanel.appendChild(solveButton);
  
  // Testing section
  const testingSection = document.createElement('div');
  testingSection.innerHTML = '<h4 style="margin: 20px 0 10px 0; border-top: 1px solid #ddd; padding-top: 15px;">Parameter Testing</h4>';
  
  // Runtime parameter controls
  const parameterControls = document.createElement('div');
  parameterControls.style.cssText = 'margin: 10px 0; padding: 10px; background: #f9f9f9; border-radius: 4px;';
  
  const learningRateControl = document.createElement('div');
  learningRateControl.innerHTML = `
    <label style="display: block; margin: 5px 0;">Learning Rate: 
      <input type="number" id="learning-rate" value="50" step="1" min="1" max="1000" style="width: 80px; margin-left: 5px;">
    </label>
  `;
  
  const maxIterationsControl = document.createElement('div');
  maxIterationsControl.innerHTML = `
    <label style="display: block; margin: 5px 0;">Max Iterations: 
      <input type="number" id="max-iterations" value="2000" step="100" min="100" max="10000" style="width: 80px; margin-left: 5px;">
    </label>
  `;
  
  parameterControls.appendChild(learningRateControl);
  parameterControls.appendChild(maxIterationsControl);
  
  // Test buttons
  const setupTestButton = document.createElement('button');
  setupTestButton.textContent = 'Setup Random Test';
  setupTestButton.style.cssText = `
    margin: 5px;
    padding: 8px 16px;
    font-size: 14px;
    background-color: #9C27B0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  const runTestButton = document.createElement('button');
  runTestButton.textContent = 'Run Auto Test';
  runTestButton.style.cssText = `
    margin: 5px;
    padding: 8px 16px;
    font-size: 14px;
    background-color: #795548;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  // Event handlers for testing
  setupTestButton.addEventListener('click', () => {
    const newModel = setupRandomTest();
    surface.setModel(newModel);
    surface.rerender();
    updateStatusPanel();
    updateButtons();
    console.log('Random test setup complete - 3 points with constraint created');
  });
  
  runTestButton.addEventListener('click', async () => {
    const currentModel = surface.getModel();
    
    // Update runtime config from UI
    const learningRateInput = document.getElementById('learning-rate') as HTMLInputElement;
    const maxIterationsInput = document.getElementById('max-iterations') as HTMLInputElement;
    
    const updatedModel: ConstraintsModel = {
      ...currentModel,
      runtimeConfig: {
        ...currentModel.runtimeConfig,
        learningRate: parseFloat(learningRateInput.value),
        maxIterations: parseInt(maxIterationsInput.value),
      }
    };
    surface.setModel(updatedModel);
    
    if (updatedModel.constraints.length === 0) {
      alert('No constraints to test! Click "Setup Random Test" first.');
      return;
    }
    
    runTestButton.disabled = true;
    runTestButton.textContent = 'Testing...';
    
    try {
      const testResult = await runAutomatedTest();
      
      // Add result to model
      const finalModel: ConstraintsModel = {
        ...surface.getModel(),
        testResults: [...surface.getModel().testResults, testResult],
      };
      surface.setModel(finalModel);
      surface.rerender();
      updateStatusPanel();
      
    } finally {
      runTestButton.disabled = false;
      runTestButton.textContent = 'Run Auto Test';
    }
  });
  
  testingSection.appendChild(parameterControls);
  testingSection.appendChild(setupTestButton);
  testingSection.appendChild(runTestButton);
  controlPanel.appendChild(testingSection);
  
  // Constraint list container
  const constraintListContainer = document.createElement('div');
  constraintListContainer.innerHTML = '<h4 style="margin: 20px 0 10px 0;">Active Constraints</h4>';
  const constraintList = document.createElement('div');
  constraintList.id = 'constraint-list';
  constraintList.style.cssText = `
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 5px;
    background: white;
  `;
  constraintListContainer.appendChild(constraintList);
  controlPanel.appendChild(constraintListContainer);
  
  // Update constraint list display
  const updateConstraintList = () => {
    const currentModel = surface.getModel();
    const constraintList = document.getElementById('constraint-list');
    if (!constraintList) return;
    
    if (currentModel.constraints.length === 0) {
      constraintList.innerHTML = '<p style="color: #999; font-style: italic;">No constraints</p>';
      return;
    }
    
    constraintList.innerHTML = '';
    
    currentModel.constraints.forEach((constraint) => {
      const constraintDiv = document.createElement('div');
      constraintDiv.style.cssText = `
        padding: 8px;
        margin: 5px 0;
        border: 1px solid #eee;
        border-radius: 4px;
        background: #f9f9f9;
        cursor: pointer;
      `;
      
      if (constraint.type === 'point-on-line') {
        const [point, lineStart, lineEnd] = constraint.points;
        const pointLabel = currentModel.points.find(p => p.position === point)?.label || '?';
        const startLabel = currentModel.points.find(p => p.position === lineStart)?.label || '?';
        const endLabel = currentModel.points.find(p => p.position === lineEnd)?.label || '?';
        
        constraintDiv.innerHTML = `
          <strong>Point on Line</strong><br>
          <small>Point: ${pointLabel}, Line: ${startLabel} → ${endLabel}</small>
        `;
        
        // Add hover effect for highlighting
        constraintDiv.addEventListener('mouseenter', () => {
          // Highlight related points
          const newModel: ConstraintsModel = {
            ...surface.getModel(),
            points: surface.getModel().points.map(p => ({
              ...p,
              highlighted: p.position === point || p.position === lineStart || p.position === lineEnd,
            })),
          };
          surface.setModel(newModel);
          surface.rerender();
        });
        
        constraintDiv.addEventListener('mouseleave', () => {
          // Remove highlighting
          const newModel: ConstraintsModel = {
            ...surface.getModel(),
            points: surface.getModel().points.map(p => ({
              ...p,
              highlighted: false,
            })),
          };
          surface.setModel(newModel);
          surface.rerender();
        });
      }
      
      constraintList.appendChild(constraintDiv);
    });
  };
  
  // Update button states based on selection
  const updateButtons = () => {
    const currentModel = surface.getModel();
    const selectedCount = currentModel.uiState.selectedPointIds.size;
    
    // Enable point-on-line button only when exactly 3 points are selected
    pointOnLineButton.disabled = selectedCount !== 3;
    pointOnLineButton.style.backgroundColor = selectedCount === 3 ? '#2196F3' : '#cccccc';
    
    // Update constraint list
    updateConstraintList();
  };
  
  // Update buttons initially
  updateButtons();
  
  // Store reference to update function for use in click handler
  (window as any).updateButtons = updateButtons;
}

// Function to update status panel
const updateStatusPanel = () => {
  const outputPanel = document.getElementById('output-panel');
  if (!outputPanel) return;
  
  const currentModel = surface.getModel();
  
  // Clear and rebuild status panel
  outputPanel.innerHTML = '<h3 class="panel-title">Status</h3>';
  
  if (currentModel.uiState.selectedPointIds.size > 0) {
    // Show selection info
    const selectedPoints = currentModel.points.filter(p => p.selected);
    const pointLabels = selectedPoints.map(p => p.label).join(', ');
    
    const selectionDiv = document.createElement('div');
    selectionDiv.innerHTML = `
      <p><strong>Selected:</strong> ${pointLabels}</p>
      <p><strong>Count:</strong> ${selectedPoints.length} point(s)</p>
    `;
    outputPanel.appendChild(selectionDiv);
  } else {
    // Show general status
    const statusDiv = document.createElement('div');
    statusDiv.innerHTML = `
      <p><strong>Points:</strong> ${currentModel.points.length}</p>
      <p><strong>Constraints:</strong> ${currentModel.constraints.length}</p>
    `;
    
    if (currentModel.solverStats) {
      const stats = currentModel.solverStats;
      statusDiv.innerHTML += `
        <hr style="margin: 10px 0;">
        <p><strong>Last Solve:</strong></p>
        <p style="margin-left: 10px;">
          • ${stats.iterations} iterations<br>
          • ${stats.converged ? 'Converged' : 'Not converged'}<br>
          • Error: ${stats.error.toFixed(6)}<br>
          • Time: ${stats.lastSolveTime.toFixed(2)}ms
        </p>
      `;
    }
    
    // Show test results if any exist
    if (currentModel.testResults.length > 0) {
      statusDiv.innerHTML += `
        <hr style="margin: 10px 0;">
        <p><strong>Test Results:</strong></p>
      `;
      
      // Show last 3 test results
      const recentTests = currentModel.testResults.slice(-3);
      recentTests.forEach(test => {
        statusDiv.innerHTML += `
          <p style="margin-left: 10px; font-size: 12px;">
            Test ${test.testId}: ${test.iterations} iter, ${test.solveTime.toFixed(1)}ms, LR=${test.config.learningRate}
          </p>
        `;
      });
      
      if (currentModel.testResults.length > 3) {
        statusDiv.innerHTML += `<p style="margin-left: 10px; font-size: 12px; color: #666;">...and ${currentModel.testResults.length - 3} more</p>`;
      }
    }
    
    if (currentModel.constraints.length === 0) {
      statusDiv.innerHTML += `
        <p><strong>Tip:</strong> Use "Setup Random Test" for automated testing</p>
      `;
    }
    
    outputPanel.appendChild(statusDiv);
  }
};

// Role assignment dialog for point-on-line constraint
const showPointRoleDialog = (selectedPoints: DemoPoint[]) => {
  // Create dialog overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  // Create dialog
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
  `;
  
  dialog.innerHTML = `
    <h3>Assign Point Roles</h3>
    <p>Select the role for each point in the constraint:</p>
    
    <div style="margin: 10px 0;">
      <label>Free Point (will be constrained to line):</label>
      <select id="free-point" style="width: 100%; padding: 5px; margin: 5px 0;">
        ${selectedPoints.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
      </select>
    </div>
    
    <div style="margin: 10px 0;">
      <label>Line Start Point:</label>
      <select id="line-start" style="width: 100%; padding: 5px; margin: 5px 0;">
        ${selectedPoints.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
      </select>
    </div>
    
    <div style="margin: 10px 0;">
      <label>Line End Point:</label>
      <select id="line-end" style="width: 100%; padding: 5px; margin: 5px 0;">
        ${selectedPoints.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
      </select>
    </div>
    
    <div style="margin-top: 20px; text-align: right;">
      <button id="cancel-btn" style="margin-right: 10px; padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
      <button id="create-btn" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Create Constraint</button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Set different default selections
  const freeSelect = dialog.querySelector('#free-point') as HTMLSelectElement;
  const startSelect = dialog.querySelector('#line-start') as HTMLSelectElement;
  const endSelect = dialog.querySelector('#line-end') as HTMLSelectElement;
  
  freeSelect.selectedIndex = 0;
  startSelect.selectedIndex = 1;
  endSelect.selectedIndex = 2;
  
  // Handle cancel
  dialog.querySelector('#cancel-btn')?.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  // Handle create constraint
  dialog.querySelector('#create-btn')?.addEventListener('click', () => {
    const freePointId = freeSelect.value;
    const startPointId = startSelect.value;
    const endPointId = endSelect.value;
    
    // Validate that all points are different
    if (freePointId === startPointId || freePointId === endPointId || startPointId === endPointId) {
      alert('Please select different points for each role.');
      return;
    }
    
    createPointOnLineConstraint(freePointId, startPointId, endPointId);
    document.body.removeChild(overlay);
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
};

// Create point-on-line constraint
const createPointOnLineConstraint = (freePointId: string, startPointId: string, endPointId: string) => {
  const currentModel = surface.getModel();
  
  // Find the actual point objects
  const freePoint = currentModel.points.find(p => p.id === freePointId);
  const startPoint = currentModel.points.find(p => p.id === startPointId);
  const endPoint = currentModel.points.find(p => p.id === endPointId);
  
  if (!freePoint || !startPoint || !endPoint) {
    console.error('Could not find selected points');
    return;
  }
  
  console.log('Creating constraint with points:', {
    freePoint: { id: freePoint.id, label: freePoint.label, pos: freePoint.position },
    startPoint: { id: startPoint.id, label: startPoint.label, pos: startPoint.position },
    endPoint: { id: endPoint.id, label: endPoint.label, pos: endPoint.position }
  });
  
  // Create the constraint using the constraint system
  const constraintId = `point-on-line-${Date.now()}`;
  const baseConstraint = pointOnLine(constraintId, freePoint.position, startPoint.position, endPoint.position);
  
  // Create a wrapper constraint with a larger maxExpectedError for canvas-scale distances
  const constraint = {
    ...baseConstraint,
    calculateError: (_maxExpectedError: number) => {
      // Use canvas diagonal (~720 pixels) as max expected error instead of the default 100
      const canvasMaxError = 720;
      return baseConstraint.calculateError(canvasMaxError);
    },
    calculatePartialDerivative: (pointIndex: number, coordinate: 'x' | 'y', _maxExpectedError: number, stepSize: number) => {
      const canvasMaxError = 720;
      return baseConstraint.calculatePartialDerivative(pointIndex, coordinate, canvasMaxError, stepSize);
    }
  };
  
  console.log('Created constraint object:', {
    id: constraint.id,
    type: constraint.type,
    points: constraint.points.map(p => ({ x: p.x, y: p.y }))
  });
  
  // Test the constraint error calculation to understand the scale
  const testError = constraint.calculateError(720); // Using our custom larger maxExpectedError
  const [point, lineStart, lineEnd] = constraint.points;
  const rawDistance = Math.abs((lineEnd.y - lineStart.y) * point.x - (lineEnd.x - lineStart.x) * point.y + lineEnd.x * lineStart.y - lineStart.x * lineEnd.y) / Math.sqrt((lineEnd.y - lineStart.y) ** 2 + (lineEnd.x - lineStart.x) ** 2);
  console.log('Constraint analysis:', { 
    normalizedError: testError, 
    rawDistance: rawDistance.toFixed(2),
    maxExpectedError: 720,
    improvement: 'Should now detect progress properly'
  });
  
  // Update model with new constraint and clear selection
  const newModel: ConstraintsModel = {
    ...currentModel,
    constraints: [...currentModel.constraints, constraint],
    points: currentModel.points.map(p => ({ ...p, selected: false })),
    uiState: {
      ...currentModel.uiState,
      selectedPointIds: new Set(),
    },
  };
  
  surface.setModel(newModel);
  surface.rerender();
  updateStatusPanel();
  if ((window as any).updateButtons) {
    (window as any).updateButtons();
  }
  
  console.log('Created point-on-line constraint:', constraint);
};

// Initial status panel update
updateStatusPanel();
