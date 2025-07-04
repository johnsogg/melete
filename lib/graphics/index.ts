import { AABB, getAABBSize, BezierQuad, Ray, normalize, Pt } from '../geom';

// Re-export types for convenience
export type { Color, Font, DrawingStyle, AnimationState } from './types';
import { DrawingStyle } from './types';

// Easing functions
export const easingFunctions = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => 1 - (1 - t) * (1 - t),
  'ease-in-out': (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
};

// Draw rounded rectangle
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  aabb: AABB,
  radius: number
) => {
  const { minX, minY } = aabb;
  const { width, height } = getAABBSize(aabb);

  ctx.beginPath();
  ctx.moveTo(minX + radius, minY);
  ctx.lineTo(minX + width - radius, minY);
  ctx.quadraticCurveTo(minX + width, minY, minX + width, minY + radius);
  ctx.lineTo(minX + width, minY + height - radius);
  ctx.quadraticCurveTo(
    minX + width,
    minY + height,
    minX + width - radius,
    minY + height
  );
  ctx.lineTo(minX + radius, minY + height);
  ctx.quadraticCurveTo(minX, minY + height, minX, minY + height - radius);
  ctx.lineTo(minX, minY + radius);
  ctx.quadraticCurveTo(minX, minY, minX + radius, minY);
  ctx.closePath();
};

// Draw curved edge using quadratic Bezier curve
export const drawCurvedEdge = (
  ctx: CanvasRenderingContext2D,
  bezier: BezierQuad
) => {
  ctx.moveTo(bezier.start.x, bezier.start.y);
  ctx.quadraticCurveTo(
    bezier.control.x,
    bezier.control.y,
    bezier.end.x,
    bezier.end.y
  );
};

// Draw arrowhead
export const drawArrowhead = (
  ctx: CanvasRenderingContext2D,
  ray: Ray,
  style: 'v' | 'triangle',
  size: { width: number; length: number }
) => {
  // Normalize the direction vector
  const normalizedDir = normalize(ray.direction);

  // Calculate perpendicular vector for arrowhead wings
  const perpDir = { dx: -normalizedDir.dy, dy: normalizedDir.dx };

  // Calculate wing angle (about 30 degrees from main direction)
  const wingAngle = Math.PI / 6; // 30 degrees
  const cos30 = Math.cos(wingAngle);
  const sin30 = Math.sin(wingAngle);

  // Calculate wing directions by rotating the main direction
  const wing1 = {
    dx: -normalizedDir.dx * cos30 + perpDir.dx * sin30,
    dy: -normalizedDir.dy * cos30 + perpDir.dy * sin30,
  };

  const wing2 = {
    dx: -normalizedDir.dx * cos30 - perpDir.dx * sin30,
    dy: -normalizedDir.dy * cos30 - perpDir.dy * sin30,
  };

  const p1 = {
    x: ray.origin.x + wing1.dx * size.length,
    y: ray.origin.y + wing1.dy * size.length,
  };

  const p2 = {
    x: ray.origin.x + wing2.dx * size.length,
    y: ray.origin.y + wing2.dy * size.length,
  };

  ctx.beginPath();
  ctx.moveTo(ray.origin.x, ray.origin.y);
  ctx.lineTo(p1.x, p1.y);

  if (style === 'triangle') {
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.moveTo(ray.origin.x, ray.origin.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
};

// Apply drawing styles to canvas context
export const applyCanvasStyle = (
  ctx: CanvasRenderingContext2D,
  style: DrawingStyle
): void => {
  if (style.color) {
    ctx.fillStyle = style.color;
  }
  if (style.strokeColor) {
    ctx.strokeStyle = style.strokeColor;
  }
  if (style.strokeThickness !== undefined) {
    ctx.lineWidth = style.strokeThickness;
  }
  if (style.font) {
    ctx.font = style.font;
  }
  if (style.textColor) {
    ctx.fillStyle = style.textColor;
  }
};

// Apply styling and perform fill/stroke operations
export const applyStyleAndDraw = (
  ctx: CanvasRenderingContext2D,
  style: DrawingStyle,
  drawPath: () => void
): void => {
  ctx.beginPath();
  drawPath();

  if (style.fill) {
    applyCanvasStyle(ctx, style);
    ctx.fill();
  }

  if (style.stroke) {
    applyCanvasStyle(ctx, style);
    ctx.stroke();
  }
};

// Draw rectangle with semantic parameters and styling
export const drawRect = (
  ctx: CanvasRenderingContext2D,
  topLeft: Pt,
  width: number,
  height: number,
  style: DrawingStyle
): void => {
  applyStyleAndDraw(ctx, style, () => {
    ctx.rect(topLeft.x, topLeft.y, width, height);
  });
};

// Draw circle with semantic parameters and styling
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  center: Pt,
  radius: number,
  style: DrawingStyle
): void => {
  applyStyleAndDraw(ctx, style, () => {
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  });
};

// Draw line with semantic parameters and styling
export const drawStyledLine = (
  ctx: CanvasRenderingContext2D,
  from: Pt,
  to: Pt,
  style: DrawingStyle
): void => {
  applyStyleAndDraw(ctx, style, () => {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  });
};

// Draw text with semantic parameters and styling
export const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  position: Pt,
  style: DrawingStyle
): void => {
  applyCanvasStyle(ctx, style);
  ctx.fillText(text, position.x, position.y);
};

// Clear canvas with optional background color
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  color?: string
): void => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
};
