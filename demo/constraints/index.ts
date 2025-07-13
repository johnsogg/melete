import { DrawingSurface } from '../../lib/index';

// Define a simple model for the constraints demo
interface ConstraintsModel {
  title: string;
  backgroundColor: string;
}

// Create layer schema - using a single layer for initial setup
const DEMO_LAYERS = {
  main: { cache: false, offscreen: false },
} as const;

type ConstraintsLayerSchema = typeof DEMO_LAYERS;

// Create the model
const model: ConstraintsModel = {
  title: 'Constraints Demo',
  backgroundColor: '#ffffff',
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

  // Draw a simple placeholder
  layer.setStyle({
    font: '24px Arial, sans-serif',
    textColor: '#2c3e50',
  });

  layer.drawText({
    text: model.title,
    position: { x: 300, y: 200 },
  });

  // Draw a simple rectangle as a placeholder
  layer.drawRect({
    topLeft: { x: 250, y: 150 },
    size: { width: 100, height: 50 },
    stroke: true,
    strokeColor: '#3498db',
    strokeThickness: 2,
  });
});

// Trigger initial render
surface.rerender();

console.log('Constraints demo initialized');

// Add some basic output to the output panel
const outputPanel = document.getElementById('output-panel');
if (outputPanel) {
  const statusDiv = document.createElement('div');
  statusDiv.innerHTML =
    '<p><strong>Status:</strong> Demo initialized successfully</p>';
  outputPanel.appendChild(statusDiv);
}
