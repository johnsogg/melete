import { DrawingSurface, LayerSchema, Pt } from '../../lib/index';

// Box entity interface
interface Box {
  id: string;
  label: string;
  position: Pt;
  targetPosition: Pt;
  width: number;
  height: number;
  borderColor: string;
  borderThickness: number;
  cornerRadius: number;
  fillColor: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
}

// Edge entity interface
interface Edge {
  id: string;
  fromBoxId: string;
  toBoxId: string;
  strokeThickness: number;
  strokeColor: string;
  arrowheadStyle: 'v' | 'triangle';
  arrowheadSize: { width: number; length: number };
}

// Animation state interface
interface AnimationState {
  isAnimating: boolean;
  startTime: number;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  startPositions: { [boxId: string]: Pt };
}

// Main model interface
interface BoxArrowModel {
  boxes: Box[];
  edges: Edge[];
  animation: AnimationState;
  currentTick: number;
}

// Layer schema
interface BoxArrowLayerSchema extends LayerSchema {
  boxes: { cache: boolean; offscreen: boolean; animated: boolean };
  arrows: { cache: boolean; offscreen: boolean; animated: boolean };
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => 1 - (1 - t) * (1 - t),
  'ease-in-out': (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

// Create initial model
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

// Generate random position within canvas bounds with box margin
function getRandomPosition(): Pt {
  const margin = 60; // Half box size plus padding
  const canvasWidth = 800;
  const canvasHeight = 600;

  return {
    x: margin + Math.random() * (canvasWidth - 2 * margin),
    y: margin + Math.random() * (canvasHeight - 2 * margin),
  };
}

// Calculate intersection point between line and rectangle
function getBoxEdgeIntersection(
  lineStart: Pt,
  lineEnd: Pt,
  boxCenter: Pt,
  boxWidth: number,
  boxHeight: number
): Pt {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  const halfWidth = boxWidth / 2;
  const halfHeight = boxHeight / 2;

  // Calculate intersection with each edge of the box
  const intersections: Pt[] = [];

  // Top edge
  if (dy !== 0) {
    const t = (boxCenter.y - halfHeight - lineStart.y) / dy;
    if (t >= 0 && t <= 1) {
      const x = lineStart.x + t * dx;
      if (x >= boxCenter.x - halfWidth && x <= boxCenter.x + halfWidth) {
        intersections.push({ x, y: boxCenter.y - halfHeight });
      }
    }
  }

  // Bottom edge
  if (dy !== 0) {
    const t = (boxCenter.y + halfHeight - lineStart.y) / dy;
    if (t >= 0 && t <= 1) {
      const x = lineStart.x + t * dx;
      if (x >= boxCenter.x - halfWidth && x <= boxCenter.x + halfWidth) {
        intersections.push({ x, y: boxCenter.y + halfHeight });
      }
    }
  }

  // Left edge
  if (dx !== 0) {
    const t = (boxCenter.x - halfWidth - lineStart.x) / dx;
    if (t >= 0 && t <= 1) {
      const y = lineStart.y + t * dy;
      if (y >= boxCenter.y - halfHeight && y <= boxCenter.y + halfHeight) {
        intersections.push({ x: boxCenter.x - halfWidth, y });
      }
    }
  }

  // Right edge
  if (dx !== 0) {
    const t = (boxCenter.x + halfWidth - lineStart.x) / dx;
    if (t >= 0 && t <= 1) {
      const y = lineStart.y + t * dy;
      if (y >= boxCenter.y - halfHeight && y <= boxCenter.y + halfHeight) {
        intersections.push({ x: boxCenter.x + halfWidth, y });
      }
    }
  }

  // Return the closest intersection to the line end
  if (intersections.length === 0) {
    return boxCenter; // Fallback to center if no intersection found
  }

  return intersections.reduce((closest, current) => {
    const closestDist = Math.sqrt(
      Math.pow(closest.x - lineEnd.x, 2) + Math.pow(closest.y - lineEnd.y, 2)
    );
    const currentDist = Math.sqrt(
      Math.pow(current.x - lineEnd.x, 2) + Math.pow(current.y - lineEnd.y, 2)
    );
    return currentDist < closestDist ? current : closest;
  });
}

// Solve quadratic equation ax² + bx + c = 0
function solveQuadratic(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < 1e-10) {
    // Linear equation: bx + c = 0
    if (Math.abs(b) < 1e-10) return [];
    return [-c / b];
  }
  
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return [];
  
  const sqrtD = Math.sqrt(discriminant);
  return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)];
}

// Find intersection between quadratic Bezier curve and horizontal line
function intersectBezierWithHorizontalLine(
  start: Pt,
  control: Pt,
  end: Pt,
  y: number
): number[] {
  // Bezier curve: B(t) = (1-t)²P₀ + 2t(1-t)P₁ + t²P₂
  // For y-coordinate: By(t) = (1-t)²y₀ + 2t(1-t)y₁ + t²y₂
  // Expand: By(t) = y₀ - 2y₀t + y₀t² + 2y₁t - 2y₁t² + y₂t²
  // Rearrange: By(t) = (y₀ - 2y₁ + y₂)t² + (-2y₀ + 2y₁)t + y₀
  
  const a = start.y - 2 * control.y + end.y;
  const b = -2 * start.y + 2 * control.y;
  const c = start.y - y;
  
  return solveQuadratic(a, b, c).filter(t => t >= 0 && t <= 1);
}

// Find intersection between quadratic Bezier curve and vertical line
function intersectBezierWithVerticalLine(
  start: Pt,
  control: Pt,
  end: Pt,
  x: number
): number[] {
  // Same as horizontal, but for x-coordinate
  const a = start.x - 2 * control.x + end.x;
  const b = -2 * start.x + 2 * control.x;
  const c = start.x - x;
  
  return solveQuadratic(a, b, c).filter(t => t >= 0 && t <= 1);
}

// Find exact intersection between quadratic Bezier curve and rectangle
function getBezierBoxIntersection(
  start: Pt,
  control: Pt,
  end: Pt,
  boxCenter: Pt,
  boxWidth: number,
  boxHeight: number,
  fromStart: boolean = true
): Pt {
  const halfWidth = boxWidth / 2;
  const halfHeight = boxHeight / 2;
  
  const intersections: { t: number; point: Pt }[] = [];
  
  // Top edge (y = boxCenter.y - halfHeight)
  const topTs = intersectBezierWithHorizontalLine(start, control, end, boxCenter.y - halfHeight);
  for (const t of topTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
    if (point.x >= boxCenter.x - halfWidth && point.x <= boxCenter.x + halfWidth) {
      intersections.push({ t, point });
    }
  }
  
  // Bottom edge (y = boxCenter.y + halfHeight)
  const bottomTs = intersectBezierWithHorizontalLine(start, control, end, boxCenter.y + halfHeight);
  for (const t of bottomTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
    if (point.x >= boxCenter.x - halfWidth && point.x <= boxCenter.x + halfWidth) {
      intersections.push({ t, point });
    }
  }
  
  // Left edge (x = boxCenter.x - halfWidth)
  const leftTs = intersectBezierWithVerticalLine(start, control, end, boxCenter.x - halfWidth);
  for (const t of leftTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
    if (point.y >= boxCenter.y - halfHeight && point.y <= boxCenter.y + halfHeight) {
      intersections.push({ t, point });
    }
  }
  
  // Right edge (x = boxCenter.x + halfWidth)
  const rightTs = intersectBezierWithVerticalLine(start, control, end, boxCenter.x + halfWidth);
  for (const t of rightTs) {
    const point = getPointOnQuadraticBezier(start, control, end, t);
    if (point.y >= boxCenter.y - halfHeight && point.y <= boxCenter.y + halfHeight) {
      intersections.push({ t, point });
    }
  }
  
  if (intersections.length === 0) {
    return boxCenter; // Fallback
  }
  
  // Sort by t parameter and return appropriate intersection
  intersections.sort((a, b) => a.t - b.t);
  
  if (fromStart) {
    // Find first intersection when coming from start (t > 0)
    const validIntersections = intersections.filter(i => i.t > 1e-6);
    return validIntersections.length > 0 ? validIntersections[0].point : intersections[0].point;
  } else {
    // Find last intersection when going to end (t < 1)
    const validIntersections = intersections.filter(i => i.t < 1 - 1e-6);
    return validIntersections.length > 0 ? 
      validIntersections[validIntersections.length - 1].point : 
      intersections[intersections.length - 1].point;
  }
}

// Draw rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Check if two boxes have bidirectional edges
function hasBidirectionalEdges(
  fromBoxId: string,
  toBoxId: string,
  edges: Edge[]
): boolean {
  const forwardEdge = edges.find(
    e => e.fromBoxId === fromBoxId && e.toBoxId === toBoxId
  );
  const reverseEdge = edges.find(
    e => e.fromBoxId === toBoxId && e.toBoxId === fromBoxId
  );
  return !!(forwardEdge && reverseEdge);
}

// Calculate control point for curved edge (bends to the right)
function calculateCurveControlPoint(
  start: Pt,
  end: Pt,
  curvature: number = 0.3
): Pt {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  // Calculate perpendicular vector (rotated 90 degrees to the right)
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const perpX = dy; // 90 degree rotation: (x,y) -> (y,-x)
  const perpY = -dx;
  
  // Normalize perpendicular vector
  const length = Math.sqrt(perpX * perpX + perpY * perpY);
  if (length === 0) return { x: midX, y: midY };
  
  const normalizedPerpX = perpX / length;
  const normalizedPerpY = perpY / length;
  
  // Calculate control point offset
  const offset = length * curvature;
  
  return {
    x: midX + normalizedPerpX * offset,
    y: midY + normalizedPerpY * offset,
  };
}

// Draw curved edge using quadratic Bezier curve
function drawCurvedEdge(
  ctx: CanvasRenderingContext2D,
  start: Pt,
  end: Pt,
  controlPoint: Pt,
  strokeColor: string,
  strokeThickness: number
) {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeThickness;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, end.x, end.y);
  ctx.stroke();
}

// Calculate point on quadratic Bezier curve at parameter t (0 to 1)
function getPointOnQuadraticBezier(
  start: Pt,
  control: Pt,
  end: Pt,
  t: number
): Pt {
  const u = 1 - t;
  return {
    x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
    y: u * u * start.y + 2 * u * t * control.y + t * t * end.y,
  };
}

// Calculate tangent direction at end of quadratic Bezier curve
function getTangentAtQuadraticBezierEnd(
  start: Pt,
  control: Pt,
  end: Pt
): Pt {
  // Tangent at t=1 is 2(control - start) + 2(end - control) = 2(end - start)
  // But we want the actual tangent direction at the end
  const tangentX = 2 * (end.x - control.x);
  const tangentY = 2 * (end.y - control.y);
  
  // Normalize
  const length = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
  if (length === 0) return { x: 1, y: 0 };
  
  return {
    x: tangentX / length,
    y: tangentY / length,
  };
}

// Draw arrowhead
function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  tip: Pt,
  direction: Pt,
  style: 'v' | 'triangle',
  size: { width: number; length: number }
) {
  const angle = Math.atan2(direction.y, direction.x);
  const perpAngle1 = angle + Math.PI - Math.PI / 6;
  const perpAngle2 = angle + Math.PI + Math.PI / 6;

  const p1 = {
    x: tip.x + Math.cos(perpAngle1) * size.length,
    y: tip.y + Math.sin(perpAngle1) * size.length,
  };

  const p2 = {
    x: tip.x + Math.cos(perpAngle2) * size.length,
    y: tip.y + Math.sin(perpAngle2) * size.length,
  };

  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(p1.x, p1.y);

  if (style === 'triangle') {
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

// Initialize the demo
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
        const controlPoint = calculateCurveControlPoint(fromCenter, toCenter, 0.25);

        // Use exact symbolic intersection for precise edge points
        const fromEdge = getBezierBoxIntersection(
          fromCenter,
          controlPoint,
          toCenter,
          fromCenter,
          fromBox.width,
          fromBox.height,
          true // from start
        );
        
        const toEdge = getBezierBoxIntersection(
          fromCenter,
          controlPoint,
          toCenter,
          toCenter,
          toBox.width,
          toBox.height,
          false // to end
        );

        // Recalculate control point based on actual edge points
        const adjustedControlPoint = calculateCurveControlPoint(fromEdge, toEdge, 0.25);

        // Draw curved edge
        drawCurvedEdge(
          ctx,
          fromEdge,
          toEdge,
          adjustedControlPoint,
          edge.strokeColor,
          edge.strokeThickness
        );

        // Calculate direction at the end of the curve for arrowhead
        let direction = getTangentAtQuadraticBezierEnd(
          fromEdge,
          adjustedControlPoint,
          toEdge
        );
        
        // Safety check: if direction is zero or very small, fall back to straight line direction
        const directionMagnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (directionMagnitude < 0.1) {
          const fallbackDirection = {
            x: toEdge.x - fromEdge.x,
            y: toEdge.y - fromEdge.y,
          };
          const fallbackMagnitude = Math.sqrt(
            fallbackDirection.x * fallbackDirection.x + fallbackDirection.y * fallbackDirection.y
          );
          if (fallbackMagnitude > 0) {
            direction = {
              x: fallbackDirection.x / fallbackMagnitude,
              y: fallbackDirection.y / fallbackMagnitude,
            };
          } else {
            direction = { x: 1, y: 0 }; // Default direction
          }
        }

        // Draw arrowhead
        ctx.fillStyle = edge.strokeColor;
        drawArrowhead(
          ctx,
          toEdge,
          direction,
          edge.arrowheadStyle,
          edge.arrowheadSize
        );
      } else {
        // For single-direction edges, draw straight lines
        const fromCenter = fromBox.position;
        const toCenter = toBox.position;

        const fromEdge = getBoxEdgeIntersection(
          toCenter,
          fromCenter,
          fromCenter,
          fromBox.width,
          fromBox.height
        );

        const toEdge = getBoxEdgeIntersection(
          fromCenter,
          toCenter,
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
        const direction = {
          x: toEdge.x - fromEdge.x,
          y: toEdge.y - fromEdge.y,
        };

        ctx.fillStyle = edge.strokeColor;
        drawArrowhead(
          ctx,
          toEdge,
          direction,
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

      // Draw box background
      ctx.fillStyle = box.fillColor;
      drawRoundedRect(ctx, x, y, box.width, box.height, box.cornerRadius);
      ctx.fill();

      // Draw box border
      ctx.strokeStyle = box.borderColor;
      ctx.lineWidth = box.borderThickness;
      drawRoundedRect(ctx, x, y, box.width, box.height, box.cornerRadius);
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
