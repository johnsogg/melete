import { DrawingSurface, Pt, Vec } from '../../lib/index';
import { AABB } from '../../lib/geom';
import {
  Box,
  Edge,
  BoxArrowModel,
  BoxArrowLayerSchema,
  hasBidirectionalEdges,
} from '../../lib/models/boxarrow';
import {
  easingFunctions,
  drawRoundedRect,
  drawCurvedEdge,
  drawArrowhead,
} from '../../lib/graphics';
import {
  getRandomPosition,
  getBoxEdgeIntersection,
  getQuadBezierBoxIntersection,
  calculateCurveControlPoint,
  getTangentAtQuadBezierEnd,
  magnitude,
  direction,
  normalize,
} from '../../lib/geom';

// Create initial model @demo
function createInitialModel(): BoxArrowModel {
  // Create boxes with random initial positions
  const boxes: Box[] = [
    {
      id: 'A',
      label: 'A',
      position: getRandomPosition(),
      targetPosition: getRandomPosition(),
      width: 80,
      height: 60,
      borderColor: '#2c3e50',
      borderThickness: 2,
      cornerRadius: 8,
      fillColor: '#ecf0f1',
      textColor: '#2c3e50',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
    },
    {
      id: 'B',
      label: 'B',
      position: getRandomPosition(),
      targetPosition: getRandomPosition(),
      width: 80,
      height: 60,
      borderColor: '#2c3e50',
      borderThickness: 2,
      cornerRadius: 8,
      fillColor: '#ecf0f1',
      textColor: '#2c3e50',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
    },
    {
      id: 'C',
      label: 'C',
      position: getRandomPosition(),
      targetPosition: getRandomPosition(),
      width: 80,
      height: 60,
      borderColor: '#2c3e50',
      borderThickness: 2,
      cornerRadius: 8,
      fillColor: '#ecf0f1',
      textColor: '#2c3e50',
      fontSize: 24,
      fontFamily: 'Arial, sans-serif',
    },
  ];

  // Set initial positions as target positions
  boxes.forEach(box => {
    box.targetPosition = { ...box.position };
  });

  // Create edges: A→B→C→A and C→B
  const edges: Edge[] = [
    {
      id: 'A-B',
      fromBoxId: 'A',
      toBoxId: 'B',
      strokeThickness: 2,
      strokeColor: '#3498db',
      arrowheadStyle: 'triangle',
      arrowheadSize: { width: 10, length: 15 },
    },
    {
      id: 'B-C',
      fromBoxId: 'B',
      toBoxId: 'C',
      strokeThickness: 2,
      strokeColor: '#3498db',
      arrowheadStyle: 'triangle',
      arrowheadSize: { width: 10, length: 15 },
    },
    {
      id: 'C-A',
      fromBoxId: 'C',
      toBoxId: 'A',
      strokeThickness: 2,
      strokeColor: '#3498db',
      arrowheadStyle: 'triangle',
      arrowheadSize: { width: 10, length: 15 },
    },
    {
      id: 'C-B',
      fromBoxId: 'C',
      toBoxId: 'B',
      strokeThickness: 2,
      strokeColor: '#e74c3c',
      arrowheadStyle: 'triangle',
      arrowheadSize: { width: 10, length: 15 },
    },
  ];

  return {
    boxes,
    edges,
    animation: {
      isAnimating: false,
      startTime: 0,
      duration: 180, // 180 frames at 60fps = 3 seconds
      easing: 'ease-in-out',
      startPositions: {},
    },
    currentTick: 0,
  };
}

// Initialize the demo @demo
function init() {
  const canvasElement = document.getElementById(
    'canvas-container'
  ) as HTMLCanvasElement;
  if (!canvasElement) {
    console.error('Canvas element not found');
    return;
  }

  const model = createInitialModel();

  const layerSchema: BoxArrowLayerSchema = {
    arrows: { cache: false, offscreen: false, animated: true },
    boxes: { cache: false, offscreen: false, animated: true },
  };

  const surface = new DrawingSurface({
    model,
    layerSchema,
    container: canvasElement.parentElement!,
    canvasOptions: {
      width: 800,
      height: 600,
    },
  });

  // Remove the canvas element since DrawingSurface creates its own
  canvasElement.remove();

  // Set up arrows layer
  const arrowsLayer = surface.getLayer('arrows');
  arrowsLayer.onTick(({ model }) => {
    const ctx = arrowsLayer.getCanvas().getContext();

    // Draw edges
    model.edges.forEach(edge => {
      const fromBox = model.boxes.find(b => b.id === edge.fromBoxId);
      const toBox = model.boxes.find(b => b.id === edge.toBoxId);

      if (!fromBox || !toBox) return;

      // Check if this is a bidirectional edge pair
      const isBidirectional = hasBidirectionalEdges(
        edge.fromBoxId,
        edge.toBoxId,
        model.edges
      );

      if (isBidirectional) {
        // For bidirectional edges, draw curved lines
        const fromCenter = fromBox.position;
        const toCenter = toBox.position;

        // Calculate control point for the curve (bends to the right)
        const controlPoint = calculateCurveControlPoint(
          { start: fromCenter, end: toCenter },
          0.25
        );

        // Use exact symbolic intersection for precise edge points
        const bezierCurve = {
          start: fromCenter,
          control: controlPoint,
          end: toCenter,
        };

        const fromEdge = getQuadBezierBoxIntersection(
          bezierCurve,
          fromCenter,
          fromBox.width,
          fromBox.height,
          true // from start
        );

        const toEdge = getQuadBezierBoxIntersection(
          bezierCurve,
          toCenter,
          toBox.width,
          toBox.height,
          false // to end
        );

        // Recalculate control point based on actual edge points
        const adjustedControlPoint = calculateCurveControlPoint(
          { start: fromEdge, end: toEdge },
          0.25
        );

        // Draw curved edge
        ctx.strokeStyle = edge.strokeColor;
        ctx.lineWidth = edge.strokeThickness;
        ctx.beginPath();
        drawCurvedEdge(ctx, {
          start: fromEdge,
          control: adjustedControlPoint,
          end: toEdge,
        });
        ctx.stroke();

        // Calculate direction at the end of the curve for arrowhead
        let arrowDirection: Vec = getTangentAtQuadBezierEnd(bezierCurve);

        // Safety check: if direction is zero or very small, fall back to straight line direction
        const directionMagnitude = magnitude(arrowDirection);
        if (directionMagnitude < 0.1) {
          const fallbackDirection: Vec = direction(fromEdge, toEdge);
          const fallbackMagnitude = magnitude(fallbackDirection);
          if (fallbackMagnitude > 0) {
            arrowDirection = normalize(fallbackDirection);
          } else {
            arrowDirection = { dx: 1, dy: 0 }; // Default direction
          }
        }

        // Draw arrowhead
        ctx.fillStyle = edge.strokeColor;
        drawArrowhead(
          ctx,
          { origin: toEdge, direction: arrowDirection },
          edge.arrowheadStyle,
          edge.arrowheadSize
        );
      } else {
        // For single-direction edges, draw straight lines
        const fromCenter = fromBox.position;
        const toCenter = toBox.position;

        const fromEdge = getBoxEdgeIntersection(
          { start: fromCenter, end: toCenter },
          fromCenter,
          fromBox.width,
          fromBox.height
        );

        const toEdge = getBoxEdgeIntersection(
          { start: fromCenter, end: toCenter },
          toCenter,
          toBox.width,
          toBox.height
        );

        // Draw straight edge line
        ctx.strokeStyle = edge.strokeColor;
        ctx.lineWidth = edge.strokeThickness;
        ctx.beginPath();
        ctx.moveTo(fromEdge.x, fromEdge.y);
        ctx.lineTo(toEdge.x, toEdge.y);
        ctx.stroke();

        // Draw arrowhead
        const arrowDirection: Vec = direction(fromEdge, toEdge);

        ctx.fillStyle = edge.strokeColor;
        drawArrowhead(
          ctx,
          { origin: toEdge, direction: arrowDirection },
          edge.arrowheadStyle,
          edge.arrowheadSize
        );
      }
    });
  });

  // Set up boxes layer
  const boxesLayer = surface.getLayer('boxes');
  boxesLayer.onTick(({ model, tick }) => {
    const ctx = boxesLayer.getCanvas().getContext();

    // Update current tick in model
    if (tick !== undefined) {
      model.currentTick = tick;
    }

    // Update animation if active
    if (model.animation.isAnimating && tick !== undefined) {
      const elapsed = tick - model.animation.startTime;
      const progress = Math.min(elapsed / model.animation.duration, 1);
      const easedProgress = easingFunctions[model.animation.easing](progress);

      // Update box positions
      model.boxes.forEach(box => {
        const startPos = model.animation.startPositions[box.id];
        if (startPos) {
          box.position = {
            x: startPos.x + (box.targetPosition.x - startPos.x) * easedProgress,
            y: startPos.y + (box.targetPosition.y - startPos.y) * easedProgress,
          };
        }
      });

      // Check if animation is complete
      if (progress >= 1) {
        model.animation.isAnimating = false;
        model.boxes.forEach(box => {
          box.position = { ...box.targetPosition };
        });
      }
    }

    // Draw boxes
    model.boxes.forEach(box => {
      const x = box.position.x - box.width / 2;
      const y = box.position.y - box.height / 2;
      const aabb: AABB = {
        minX: x,
        minY: y,
        maxX: x + box.width,
        maxY: y + box.height,
      };

      // Draw box background
      ctx.fillStyle = box.fillColor;
      drawRoundedRect(ctx, aabb, box.cornerRadius);
      ctx.fill();

      // Draw box border
      ctx.strokeStyle = box.borderColor;
      ctx.lineWidth = box.borderThickness;
      drawRoundedRect(ctx, aabb, box.cornerRadius);
      ctx.stroke();

      // Draw text
      ctx.fillStyle = box.textColor;
      ctx.font = `${box.fontSize}px ${box.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(box.label, box.position.x, box.position.y);
    });
  });

  // Handle click events
  surface.onClick(() => {
    // Generate new random target positions
    model.boxes.forEach(box => {
      box.targetPosition = getRandomPosition();
    });

    // Start new animation
    model.animation = {
      isAnimating: true,
      startTime: model.currentTick,
      duration: 180,
      easing: 'ease-in-out',
      startPositions: model.boxes.reduce(
        (acc, box) => {
          acc[box.id] = { ...box.position };
          return acc;
        },
        {} as { [boxId: string]: Pt }
      ),
    };
  });

  // Initial render
  surface.render();
}

// Start the demo when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
