import { DrawingSurface, LayerSchema, Pt } from '../../lib/index';
import { DebugPanel } from '../../lib/debug';

// Define our animated space scene model
interface AnimatedSpaceSceneModel {
  stars: { position: Pt; baseIntensity: number; phase: number }[];
  shipPosition: Pt;
  asteroids: {
    position: Pt;
    centerX: number;
    centerY: number;
    orbitRadius: number;
    orbitSpeed: number;
    radius: number;
  }[];
}

// Define our layer schema with animated layers
interface AnimatedSpaceLayerSchema extends LayerSchema {
  background: { cache: boolean; offscreen: boolean; animated: boolean };
  spaceship: { cache: boolean; offscreen: boolean; animated: boolean };
  asteroids: { cache: boolean; offscreen: boolean; animated: boolean };
}

// Create the animated space scene model
function createAnimatedSpaceScene(): AnimatedSpaceSceneModel {
  // Generate random star positions with animation properties
  const stars: { position: Pt; baseIntensity: number; phase: number }[] = [];
  for (let i = 0; i < 50; i++) {
    stars.push({
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600,
      },
      baseIntensity: 0.3 + Math.random() * 0.7, // Random base brightness
      phase: Math.random() * Math.PI * 2, // Random phase offset for twinkling
    });
  }

  // Create asteroids with orbit properties
  const asteroids = [
    {
      position: { x: 150, y: 300 }, // This will be calculated based on tick
      centerX: 150,
      centerY: 300,
      orbitRadius: 50,
      orbitSpeed: 0.02,
      radius: 40,
    },
    {
      position: { x: 650, y: 300 }, // This will be calculated based on tick
      centerX: 650,
      centerY: 300,
      orbitRadius: 80,
      orbitSpeed: -0.015,
      radius: 35,
    },
  ];

  return {
    stars,
    shipPosition: { x: 400, y: 300 }, // Center of 800x600 canvas
    asteroids,
  };
}

// Initialize the animation demo
function init() {
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container not found');
    return;
  }

  // Create animated space scene model
  const model = createAnimatedSpaceScene();

  // Define layer schema with animated layers
  const layerSchema: AnimatedSpaceLayerSchema = {
    background: { cache: false, offscreen: false, animated: true },
    spaceship: { cache: true, offscreen: false, animated: false },
    asteroids: { cache: false, offscreen: false, animated: true },
  };

  // Create drawing surface with animation
  const surface = new DrawingSurface({
    model,
    layerSchema,
    container,
    canvasOptions: {
      width: 800,
      height: 600,
    },
  });

  // Set up animated background layer - twinkling stars
  const backgroundLayer = surface.getLayer('background');
  backgroundLayer.onTick(({ model, tick }) => {
    // Clear with black space background
    backgroundLayer.clear('#000011');

    // Draw twinkling stars
    model.stars.forEach(star => {
      // Calculate twinkling intensity using sine wave based on tick
      const time = (tick ?? 0) * 0.05; // Slow down the animation
      const intensity = star.baseIntensity + Math.sin(time + star.phase) * 0.3;

      // Convert intensity to alpha for twinkling effect
      const alpha = Math.max(0.1, Math.min(1.0, intensity));

      backgroundLayer.drawCircle({
        center: star.position,
        radius: 1,
        fill: true,
        color: `rgba(255, 255, 255, ${alpha})`,
      });
    });
  });

  // Set up static spaceship layer
  const spaceshipLayer = surface.getLayer('spaceship');
  spaceshipLayer.onDemand(({ model }) => {
    const ship = model.shipPosition;

    // Draw ship body (rectangle)
    spaceshipLayer.drawRect({
      topLeft: { x: ship.x - 20, y: ship.y - 10 },
      size: { width: 40, height: 20 },
      fill: true,
      color: 'hsl(0, 0%, 100%)', // White
      stroke: true,
      strokeColor: 'hsl(0, 0%, 80%)', // Light gray
      strokeThickness: 2,
    });

    // Draw ship cockpit (circle)
    spaceshipLayer.drawCircle({
      center: { x: ship.x, y: ship.y - 5 },
      radius: 8,
      fill: true,
      color: 'hsl(200, 100%, 85%)', // Light blue
      stroke: true,
      strokeColor: 'hsl(0, 0%, 80%)', // Light gray
      strokeThickness: 2,
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

  // Set up animated asteroids layer
  const asteroidsLayer = surface.getLayer('asteroids');
  asteroidsLayer.onTick(({ model, tick }) => {
    // Update asteroid positions using tick for circular motion
    model.asteroids.forEach(asteroid => {
      const angle = (tick ?? 0) * asteroid.orbitSpeed;
      asteroid.position.x =
        asteroid.centerX + Math.cos(angle) * asteroid.orbitRadius;
      asteroid.position.y =
        asteroid.centerY + Math.sin(angle) * asteroid.orbitRadius;
    });

    // Draw asteroids
    model.asteroids.forEach(asteroid => {
      asteroidsLayer.drawCircle({
        center: asteroid.position,
        radius: asteroid.radius,
        fill: true,
        color: 'hsl(0, 0%, 40%)', // Dark gray
        stroke: true,
        strokeColor: 'hsl(0, 0%, 60%)', // Medium gray
        strokeThickness: 2,
      });
    });
  });

  // Initial render (animation will continue automatically)
  surface.render();

  // Add debug panel
  const debugContainer = document.getElementById('debug-info');
  if (debugContainer) {
    new DebugPanel<AnimatedSpaceSceneModel, AnimatedSpaceLayerSchema>(
      surface,
      debugContainer,
      {
        maxEventHistory: 10,
        updateInterval: 300,
      }
    );
  }
}

// Start the demo when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
