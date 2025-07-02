import { DrawingSurface, LayerSchema, Pt } from '../../lib/index';
import { DebugPanel } from '../../lib/debug';

// Define our space scene model
interface SpaceSceneModel {
  stars: Pt[];
  shipPosition: Pt;
  asteroidPositions: [Pt, Pt];
}

// Define our layer schema
interface SpaceLayerSchema extends LayerSchema {
  background: { cache: boolean; offscreen: boolean };
  spaceship: { cache: boolean; offscreen: boolean };
  asteroids: { cache: boolean; offscreen: boolean };
}

// Create the space scene model
function createSpaceScene(): SpaceSceneModel {
  // Generate random star positions
  const stars: Pt[] = [];
  for (let i = 0; i < 50; i++) {
    stars.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
    });
  }

  return {
    stars,
    shipPosition: { x: 400, y: 300 }, // Center of 800x600 canvas
    asteroidPositions: [
      { x: 150, y: 300 }, // Left asteroid
      { x: 650, y: 300 }, // Right asteroid
    ],
  };
}

// Initialize the demo
function init() {
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container not found');
    return;
  }

  // Create space scene model
  const model = createSpaceScene();

  // Define layer schema
  const layerSchema: SpaceLayerSchema = {
    background: { cache: true, offscreen: false },
    spaceship: { cache: true, offscreen: false },
    asteroids: { cache: true, offscreen: false },
  };

  // Create drawing surface
  const surface = new DrawingSurface({
    model,
    layerSchema,
    container,
    canvasOptions: {
      width: 800,
      height: 600,
    },
  });

  // Set up background layer - stars
  const backgroundLayer = surface.getLayer('background');
  backgroundLayer.onDemand(({ model }) => {
    // Clear with black space background
    backgroundLayer.clear('#000011');

    // Draw stars as small white circles
    model.stars.forEach(star => {
      backgroundLayer.drawCircle({
        center: star,
        radius: 1,
        fill: true,
        color: '#ffffff',
      });
    });
  });

  // Set up spaceship layer
  const spaceshipLayer = surface.getLayer('spaceship');
  spaceshipLayer.onDemand(({ model }) => {
    const ship = model.shipPosition;

    // Draw ship body (rectangle)
    spaceshipLayer.drawRect({
      topLeft: { x: ship.x - 20, y: ship.y - 10 },
      size: { width: 40, height: 20 },
      fill: true,
      color: 'hsl(0, 0%, 75%)', // Silver
      stroke: true,
      strokeColor: 'hsl(0, 0%, 100%)', // White
      strokeThickness: 1,
    });

    // Draw ship cockpit (circle)
    spaceshipLayer.drawCircle({
      center: { x: ship.x, y: ship.y - 5 },
      radius: 8,
      fill: true,
      color: 'hsl(200, 100%, 85%)', // Light blue
      stroke: true,
      strokeColor: 'hsl(0, 0%, 100%)', // White
      strokeThickness: 1,
    });

    // Draw engine flames (small circles)
    spaceshipLayer.drawCircle({
      center: { x: ship.x - 25, y: ship.y },
      radius: 3,
      fill: true,
      color: 'hsl(30, 100%, 50%)', // Orange
    });
    spaceshipLayer.drawCircle({
      center: { x: ship.x - 28, y: ship.y },
      radius: 2,
      fill: true,
      color: 'hsl(0, 100%, 50%)', // Red
    });
  });

  // Set up asteroids layer
  const asteroidsLayer = surface.getLayer('asteroids');
  asteroidsLayer.onDemand(({ model }) => {
    model.asteroidPositions.forEach(asteroid => {
      asteroidsLayer.drawCircle({
        center: asteroid,
        radius: 40,
        fill: true,
        color: 'hsl(0, 0%, 40%)', // Dark gray
        stroke: true,
        strokeColor: 'hsl(0, 0%, 60%)', // Medium gray
        strokeThickness: 2,
      });
    });
  });

  // Render the scene
  surface.render();

  // Add debug panel
  const debugContainer = document.getElementById('debug-info');
  if (debugContainer) {
    new DebugPanel<SpaceSceneModel, SpaceLayerSchema>(surface, debugContainer, {
      maxEventHistory: 10,
      updateInterval: 300,
      expandedByDefault: true,
    });
  }
}

// Start the demo when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
