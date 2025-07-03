import { DrawingSurface, drawPolygon } from '../../lib/index';
import { DebugPanel } from '../../lib/debug';

// Define a simple model for our demo
interface HelloWorldModel {
  title: string;
  subtitle: string;
  showCircle: boolean;
  backgroundColor: string;
}

// Create layer schema - using a single layer for this demo
const DEMO_LAYERS = {
  main: { cache: false, offscreen: false },
} as const;

type HelloWorldLayerSchema = typeof DEMO_LAYERS;

// Create the model
const model: HelloWorldModel = {
  title: 'Hello World!',
  subtitle: 'Welcome to Melete Graphics',
  showCircle: true,
  backgroundColor: '#f0f8ff',
};

// Get container element
const container = document.getElementById('canvas-container');
if (!container) {
  throw new Error('Canvas container not found');
}

// Create DrawingSurface with our model and layer schema
const surface = new DrawingSurface<HelloWorldModel, HelloWorldLayerSchema>({
  model,
  layerSchema: DEMO_LAYERS,
  canvasOptions: { width: 600, height: 400 },
  container,
});

// Get the main layer and set up drawing callback
const mainLayer = surface.getLayer('main');

mainLayer.onDemand(({ model, layer }) => {
  // Clear with background color using semantic API
  layer.clear(model.backgroundColor);

  // Draw a colorful rectangle using intersection types (geometry & style)
  layer.drawRect({
    topLeft: { x: 50, y: 50 },
    size: { width: 200, height: 100 },
    fill: true,
    color: '#ff6b6b',
  });

  // Draw a circle if model says to show it - with stroke styling
  if (model.showCircle) {
    layer.drawCircle({
      center: { x: 400, y: 100 },
      radius: 60,
      fill: true,
      color: '#4ecdc4',
      stroke: true,
      strokeColor: '#2c3e50',
      strokeThickness: 3,
    });
  }

  // Demonstrate stroke-only rectangle
  layer.drawRect({
    topLeft: { x: 300, y: 200 },
    size: { width: 150, height: 80 },
    stroke: true,
    strokeColor: '#9b59b6',
    strokeThickness: 2,
  });

  // Set persistent text styling
  layer.setStyle({
    font: '32px Arial, sans-serif',
    textColor: '#2c3e50',
  });

  // Draw main title using semantic text API
  layer.drawText({
    text: model.title,
    position: { x: 150, y: 250 },
  });

  // Update style for subtitle and draw
  layer.setStyle({
    font: '18px Arial, sans-serif',
    textColor: '#7f8c8d',
  });

  layer.drawText({
    text: model.subtitle,
    position: { x: 150, y: 280 },
  });

  // Draw a line using semantic line API
  layer.drawLine({
    from: { x: 50, y: 320 },
    to: { x: 550, y: 320 },
    stroke: true,
    strokeColor: '#34495e',
  });

  // Draw a triangle using polygon function (keep this as-is for now)
  drawPolygon(
    layer.getCanvas(),
    [
      { x: 300, y: 50 },
      { x: 280, y: 20 },
      { x: 320, y: 20 },
    ],
    true,
    '#e74c3c'
  );
});

// Set up click interaction to toggle the circle
surface.onClick(event => {
  console.log('Canvas clicked at:', event.canvasX, event.canvasY);

  // Toggle circle visibility
  const currentModel = surface.getModel();
  const newModel = {
    ...currentModel,
    showCircle: !currentModel.showCircle,
  };

  surface.setModel(newModel);

  // Trigger rerender
  surface.rerender();
});

// Trigger initial render now that callbacks are set up
surface.rerender();

console.log('Hello World demo initialized with DrawingSurface');

// Create debug panel
const debugContainer = document.getElementById('debug-info');
if (debugContainer) {
  // Clear existing debug content
  debugContainer.innerHTML = '';

  // Create the debug panel
  new DebugPanel<HelloWorldModel, HelloWorldLayerSchema>(
    surface,
    debugContainer,
    {
      maxEventHistory: 15,
      updateInterval: 200,
    }
  );
}
