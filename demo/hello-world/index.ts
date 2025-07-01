import { DrawingSurface, drawLine, drawPolygon } from '../../lib/index';

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
const surface = new DrawingSurface({
  model,
  layerSchema: DEMO_LAYERS,
  canvasOptions: { width: 600, height: 400 },
  container,
});

// Get the main layer and set up drawing callback
const mainLayer = surface.getLayer('main');

mainLayer.onDemand(({ model, layer }) => {
  const canvas = layer.getCanvas();

  // Clear with background color
  canvas.clear(model.backgroundColor);

  // Draw a colorful rectangle
  canvas.setFillColor('#ff6b6b');
  canvas.fillRect(50, 50, 200, 100);

  // Draw a circle if model says to show it
  if (model.showCircle) {
    canvas.setFillColor('#4ecdc4');
    canvas.fillCircle(400, 100, 60);
  }

  // Draw some text
  canvas.setFillColor('#2c3e50');
  canvas.setFont('32px Arial, sans-serif');
  canvas.fillText(model.title, 150, 250);

  // Draw subtitle
  canvas.setFont('18px Arial, sans-serif');
  canvas.setFillColor('#7f8c8d');
  canvas.fillText(model.subtitle, 150, 280);

  // Draw a line using the higher-level drawing functions
  drawLine(canvas, { x: 50, y: 320 }, { x: 550, y: 320 }, '#34495e');

  // Draw a triangle using polygon function
  drawPolygon(
    canvas,
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
  surface.setModel({
    ...currentModel,
    showCircle: !currentModel.showCircle,
  });

  // Trigger rerender
  surface.rerender();
});

// Trigger initial render now that callbacks are set up
surface.rerender();

console.log('Hello World demo initialized with DrawingSurface');
