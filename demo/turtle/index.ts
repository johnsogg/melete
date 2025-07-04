import {
  DrawingSurface,
  turtleMove,
  turtleLeft,
  turtleRight,
  turtleAngleUnits,
  turtlePush,
  turtlePop,
  TurtleState,
  TurtleCommand,
  DrawingLayer,
} from '../../lib/index';

// Define a simple model for our turtle demo
interface TurtleModel {
  backgroundColor: string;
  currentDrawing: string;
}

// Create layer schema
const TURTLE_LAYERS = {
  main: { cache: false, offscreen: false },
} as const;

type TurtleLayerSchema = typeof TURTLE_LAYERS;

// Create the model
const model: TurtleModel = {
  backgroundColor: '#ffffff',
  currentDrawing: 'none',
};

// Get container element
const container = document.getElementById('canvas-container');
if (!container) {
  throw new Error('Canvas container not found');
}

// Create DrawingSurface
const surface = new DrawingSurface<TurtleModel, TurtleLayerSchema>({
  model,
  layerSchema: TURTLE_LAYERS,
  canvasOptions: { width: 600, height: 400 },
  container,
});

// Get the main layer
const mainLayer = surface.getLayer('main');

// Drawing functions for different turtle graphics
function drawSquare() {
  model.currentDrawing = 'square';
  surface.setModel(model);
  surface.rerender();
}

function drawTriangle() {
  model.currentDrawing = 'triangle';
  surface.setModel(model);
  surface.rerender();
}

function drawSpiral() {
  model.currentDrawing = 'spiral';
  surface.setModel(model);
  surface.rerender();
}

function drawFlower() {
  model.currentDrawing = 'flower';
  surface.setModel(model);
  surface.rerender();
}

function drawTree() {
  model.currentDrawing = 'tree';
  surface.setModel(model);
  surface.rerender();
}

function drawFractalTree() {
  model.currentDrawing = 'fractal-tree';
  surface.setModel(model);
  surface.rerender();
}

function clearCanvas() {
  model.currentDrawing = 'none';
  surface.setModel(model);
  surface.rerender();
}

// Set up event listeners for buttons
document.getElementById('draw-square')?.addEventListener('click', drawSquare);
document
  .getElementById('draw-triangle')
  ?.addEventListener('click', drawTriangle);
document.getElementById('draw-spiral')?.addEventListener('click', drawSpiral);
document.getElementById('draw-flower')?.addEventListener('click', drawFlower);
document.getElementById('draw-tree')?.addEventListener('click', drawTree);
document
  .getElementById('draw-fractal-tree')
  ?.addEventListener('click', drawFractalTree);
document.getElementById('clear-canvas')?.addEventListener('click', clearCanvas);

// Set up the layer callback
mainLayer.onDemand(({ model, layer }) => {
  // Clear with background color
  layer.clear(model.backgroundColor);

  const centerX = 300;
  const centerY = 200;

  switch (model.currentDrawing) {
    case 'square':
      drawSquareTurtle(layer, centerX, centerY);
      break;
    case 'triangle':
      drawTriangleTurtle(layer, centerX, centerY);
      break;
    case 'spiral':
      drawSpiralTurtle(layer, centerX, centerY);
      break;
    case 'flower':
      drawFlowerTurtle(layer, centerX, centerY);
      break;
    case 'tree':
      drawTreeTurtle(layer, centerX, centerY);
      break;
    case 'fractal-tree':
      drawFractalTreeTurtle(layer, centerX, centerY);
      break;
  }
});

function drawSquareTurtle(layer: DrawingLayer, x: number, y: number): void {
  const initialState = new TurtleState({ x, y, z: 0 });

  layer.turtle(
    [
      turtleAngleUnits('degrees'),
      turtleMove({ forward: 50 }),
      turtleLeft(90),
      turtleMove({ forward: 50 }),
      turtleLeft(90),
      turtleMove({ forward: 50 }),
      turtleLeft(90),
      turtleMove({ forward: 50 }),
      turtleLeft(90),
    ],
    {
      initialState,
      strokeStyle: '#2196F3',
      lineWidth: 3,
      lineCap: 'round',
    }
  );
}

function drawTriangleTurtle(layer: DrawingLayer, x: number, y: number): void {
  const initialState = new TurtleState({ x, y, z: 0 });

  layer.turtle(
    [
      turtleAngleUnits('degrees'),
      turtleMove({ forward: 60 }),
      turtleLeft(120),
      turtleMove({ forward: 60 }),
      turtleLeft(120),
      turtleMove({ forward: 60 }),
      turtleLeft(120),
    ],
    {
      initialState,
      strokeStyle: '#FF5722',
      lineWidth: 3,
      lineCap: 'round',
    }
  );
}

function drawSpiralTurtle(layer: DrawingLayer, x: number, y: number): void {
  const initialState = new TurtleState({ x, y, z: 0 });
  const commands: TurtleCommand[] = [turtleAngleUnits('degrees')];

  let distance = 2;
  for (let i = 0; i < 50; i++) {
    commands.push(turtleMove({ forward: distance }));
    commands.push(turtleLeft(15));
    distance += 1;
  }

  layer.turtle(commands, {
    initialState,
    strokeStyle: '#9C27B0',
    lineWidth: 2,
    lineCap: 'round',
  });
}

function drawFlowerTurtle(layer: DrawingLayer, x: number, y: number): void {
  const initialState = new TurtleState({ x, y, z: 0 });

  // Draw 8 petals
  const commands: TurtleCommand[] = [turtleAngleUnits('degrees')];

  for (let petal = 0; petal < 8; petal++) {
    // Draw one petal (arc using small line segments)
    for (let i = 0; i < 12; i++) {
      commands.push(turtleMove({ forward: 3 }));
      commands.push(turtleLeft(15));
    }
    // Return to center and orient for next petal
    for (let i = 0; i < 12; i++) {
      commands.push(turtleMove({ backward: 3 }));
      commands.push(turtleRight(15));
    }
    commands.push(turtleLeft(45)); // Rotate for next petal
  }

  layer.turtle(commands, {
    initialState,
    strokeStyle: '#E91E63',
    lineWidth: 2,
    lineCap: 'round',
  });
}

function drawTreeTurtle(layer: DrawingLayer, x: number, y: number): void {
  const initialState = new TurtleState({ x, y, z: 0 });

  const commands = [
    turtleAngleUnits('degrees'),
    // Draw trunk
    turtleMove({ forward: 40 }),

    // Left branch
    turtleLeft(30),
    turtleMove({ forward: 25 }),
    // Sub-branches
    turtleLeft(20),
    turtleMove({ forward: 15 }),
    turtleMove({ backward: 15 }),
    turtleRight(40),
    turtleMove({ forward: 15 }),
    turtleMove({ backward: 15 }),
    turtleLeft(20),
    turtleMove({ backward: 25 }),

    // Right branch
    turtleRight(60),
    turtleMove({ forward: 30 }),
    // Sub-branches
    turtleLeft(25),
    turtleMove({ forward: 12 }),
    turtleMove({ backward: 12 }),
    turtleRight(50),
    turtleMove({ forward: 12 }),
    turtleMove({ backward: 12 }),
    turtleLeft(25),
    turtleMove({ backward: 30 }),
    turtleLeft(30),
  ];

  layer.turtle(commands, {
    initialState,
    strokeStyle: '#4CAF50',
    lineWidth: 3,
    lineCap: 'round',
  });
}

function drawFractalTreeTurtle(
  layer: DrawingLayer,
  x: number,
  y: number
): void {
  const initialState = new TurtleState({ x, y, z: 0 });

  // Recursive-style fractal tree using push/pop
  const commands = [
    turtleAngleUnits('degrees'),

    // Main trunk
    turtleMove({ forward: 60 }),

    // Left major branch
    turtlePush(),
    turtleLeft(30),
    turtleMove({ forward: 40 }),

    // Left sub-branches
    turtlePush(),
    turtleLeft(25),
    turtleMove({ forward: 25 }),

    // Tiny left branches
    turtlePush(),
    turtleLeft(20),
    turtleMove({ forward: 12 }),
    turtlePop(),

    turtlePush(),
    turtleRight(20),
    turtleMove({ forward: 12 }),
    turtlePop(),

    turtlePop(), // Back to left major branch

    turtlePush(),
    turtleRight(25),
    turtleMove({ forward: 25 }),

    // Tiny right branches on left side
    turtlePush(),
    turtleLeft(15),
    turtleMove({ forward: 10 }),
    turtlePop(),

    turtlePush(),
    turtleRight(15),
    turtleMove({ forward: 10 }),
    turtlePop(),

    turtlePop(), // Back to left major branch
    turtlePop(), // Back to trunk

    // Right major branch
    turtlePush(),
    turtleRight(25),
    turtleMove({ forward: 45 }),

    // Right sub-branches
    turtlePush(),
    turtleLeft(20),
    turtleMove({ forward: 30 }),

    // Tiny branches on right side
    turtlePush(),
    turtleLeft(25),
    turtleMove({ forward: 15 }),
    turtlePop(),

    turtlePush(),
    turtleRight(25),
    turtleMove({ forward: 15 }),
    turtlePop(),

    turtlePop(), // Back to right major branch

    turtlePush(),
    turtleRight(30),
    turtleMove({ forward: 20 }),

    // Final tiny branches
    turtlePush(),
    turtleLeft(20),
    turtleMove({ forward: 8 }),
    turtlePop(),

    turtlePush(),
    turtleRight(20),
    turtleMove({ forward: 8 }),
    turtlePop(),

    turtlePop(), // Back to right major branch
    turtlePop(), // Back to trunk
  ];

  layer.turtle(commands, {
    initialState,
    strokeStyle: '#2E7D32',
    lineWidth: 2,
    lineCap: 'round',
  });
}

// Trigger initial render
surface.rerender();

console.log('Turtle graphics demo initialized');
