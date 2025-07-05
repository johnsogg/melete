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

// Draw rounded rectangle path only
export const drawRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  {
    bounds,
    radius,
    beginPath,
  }: { bounds: AABB; radius: number; beginPath: boolean }
) => {
  const { minX, minY } = bounds;
  const { width, height } = getAABBSize(bounds);

  if (beginPath) {
    ctx.beginPath();
  }
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

// Draw rounded rectangle with semantic parameters and styling
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  {
    bounds,
    radius,
    style,
  }: { bounds: AABB; radius: number; style: DrawingStyle }
): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawRoundedRectPath(ctx, { bounds, radius, beginPath: true });
  });
};

// Draw curved edge path only using quadratic Bezier curve
export const drawCurvedEdgePath = (
  ctx: CanvasRenderingContext2D,
  { bezier, beginPath }: { bezier: BezierQuad; beginPath: boolean }
) => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(bezier.start.x, bezier.start.y);
  ctx.quadraticCurveTo(
    bezier.control.x,
    bezier.control.y,
    bezier.end.x,
    bezier.end.y
  );
};

// Draw curved edge with styling using quadratic Bezier curve
export const drawCurvedEdge = (
  ctx: CanvasRenderingContext2D,
  { bezier, style }: { bezier: BezierQuad; style: DrawingStyle }
): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawCurvedEdgePath(ctx, { bezier, beginPath: true });
  });
};

// Draw arrowhead path only
export const drawArrowheadPath = (
  ctx: CanvasRenderingContext2D,
  {
    ray,
    arrowStyle,
    size,
    beginPath,
  }: {
    ray: Ray;
    arrowStyle: 'v' | 'triangle';
    size: { width: number; length: number };
    beginPath: boolean;
  }
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

  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(ray.origin.x, ray.origin.y);
  ctx.lineTo(p1.x, p1.y);

  if (arrowStyle === 'triangle') {
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
  } else {
    ctx.moveTo(ray.origin.x, ray.origin.y);
    ctx.lineTo(p2.x, p2.y);
  }
};

// Draw arrowhead with styling
export const drawArrowhead = (
  ctx: CanvasRenderingContext2D,
  {
    ray,
    arrowStyle,
    size,
    style,
  }: {
    ray: Ray;
    arrowStyle: 'v' | 'triangle';
    size: { width: number; length: number };
    style: DrawingStyle;
  }
): void => {
  if (arrowStyle === 'triangle') {
    applyStyleAndDraw(ctx, style, () => {
      drawArrowheadPath(ctx, { ray, arrowStyle, size, beginPath: true });
    });
  } else {
    applyStyleAndDraw(ctx, style, () => {
      drawArrowheadPath(ctx, { ray, arrowStyle, size, beginPath: true });
    });
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

// Draw rectangle path only
export const drawRectPath = (
  ctx: CanvasRenderingContext2D,
  {
    topLeft,
    width,
    height,
    beginPath,
  }: { topLeft: Pt; width: number; height: number; beginPath: boolean }
): void => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.rect(topLeft.x, topLeft.y, width, height);
};

// Draw rectangle with semantic parameters and styling
export const drawRect = (
  ctx: CanvasRenderingContext2D,
  {
    topLeft,
    width,
    height,
    style,
  }: { topLeft: Pt; width: number; height: number; style: DrawingStyle }
): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawRectPath(ctx, { topLeft, width, height, beginPath: true });
  });
};

// Draw circle path only
export const drawCirclePath = (
  ctx: CanvasRenderingContext2D,
  {
    center,
    radius,
    beginPath,
  }: { center: Pt; radius: number; beginPath: boolean }
): void => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
};

// Draw circle with semantic parameters and styling
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  { center, radius, style }: { center: Pt; radius: number; style: DrawingStyle }
): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawCirclePath(ctx, { center, radius, beginPath: true });
  });
};

// Draw line path only
export const drawLinePath = (
  ctx: CanvasRenderingContext2D,
  { start, end, beginPath }: { start: Pt; end: Pt; beginPath: boolean }
): void => {
  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
};

// Draw line with semantic parameters and styling
export const drawLine = (
  ctx: CanvasRenderingContext2D,
  { start, end, style }: { start: Pt; end: Pt; style: DrawingStyle }
): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawLinePath(ctx, { start, end, beginPath: true });
  });
};

// Draw polygon path only
export const drawPolygonPath = (
  ctx: CanvasRenderingContext2D,
  { points, beginPath }: { points: Pt[]; beginPath: boolean }
): void => {
  if (points.length < 3) return;

  if (beginPath) {
    ctx.beginPath();
  }
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
};

// Draw polygon with semantic parameters and styling
export const drawPolygon = (
  ctx: CanvasRenderingContext2D,
  { points, style }: { points: Pt[]; style: DrawingStyle }
): void => {
  if (points.length < 3) return;

  applyStyleAndDraw(ctx, style, () => {
    drawPolygonPath(ctx, { points, beginPath: true });
  });
};

// Draw triangle path only
export const drawTrianglePath = (
  ctx: CanvasRenderingContext2D,
  { p1, p2, p3, beginPath }: { p1: Pt; p2: Pt; p3: Pt; beginPath: boolean }
): void => {
  drawPolygonPath(ctx, { points: [p1, p2, p3], beginPath });
};

// Draw triangle with semantic parameters and styling
export const drawTriangle = (
  ctx: CanvasRenderingContext2D,
  { p1, p2, p3, style }: { p1: Pt; p2: Pt; p3: Pt; style: DrawingStyle }
): void => {
  drawPolygon(ctx, { points: [p1, p2, p3], style });
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

// Text measurement utilities

// Measure text with optional font setting
export const measureText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font?: string
): TextMetrics => {
  const originalFont = ctx.font;
  if (font) {
    ctx.font = font;
  }
  const metrics = ctx.measureText(text);
  if (font) {
    ctx.font = originalFont;
  }
  return metrics;
};

// Get text bounds (width and height)
export const getTextBounds = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font?: string
): { width: number; height: number } => {
  const metrics = measureText(ctx, text, font);
  const height =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  return {
    width: metrics.width,
    height: height || 12, // fallback for browsers that don't support actualBoundingBox
  };
};

// Get comprehensive text dimensions
export const getTextDimensions = (
  ctx: CanvasRenderingContext2D,
  text: string,
  font?: string
): {
  width: number;
  height: number;
  baseline: number;
  ascent: number;
  descent: number;
} => {
  const metrics = measureText(ctx, text, font);
  const ascent =
    metrics.actualBoundingBoxAscent || metrics.fontBoundingBoxAscent || 10;
  const descent =
    metrics.actualBoundingBoxDescent || metrics.fontBoundingBoxDescent || 2;

  return {
    width: metrics.width,
    height: ascent + descent,
    baseline: ascent,
    ascent,
    descent,
  };
};

// Center text in a rectangle
export const centerTextInRect = (
  ctx: CanvasRenderingContext2D,
  text: string,
  rect: AABB,
  font?: string
): Pt => {
  const dimensions = getTextDimensions(ctx, text, font);
  const centerX = (rect.minX + rect.maxX) / 2 - dimensions.width / 2;
  const centerY = (rect.minY + rect.maxY) / 2 + dimensions.baseline / 2;
  return { x: centerX, y: centerY };
};

// Align text in a box with different alignment options
export const alignTextInBox = (
  ctx: CanvasRenderingContext2D,
  text: string,
  box: { position: Pt; width: number; height: number },
  alignment: 'left' | 'center' | 'right',
  font?: string
): Pt => {
  const dimensions = getTextDimensions(ctx, text, font);
  let x = box.position.x;

  switch (alignment) {
    case 'left':
      x = box.position.x;
      break;
    case 'center':
      x = box.position.x + (box.width - dimensions.width) / 2;
      break;
    case 'right':
      x = box.position.x + box.width - dimensions.width;
      break;
  }

  // Center vertically
  const y = box.position.y + box.height / 2 + dimensions.baseline / 2;

  return { x, y };
};
