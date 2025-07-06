import { Ray, normalize } from '../geom';
import { DrawingStyle } from './types';
import { applyStyleAndDraw } from './utils';

/**
 * Draw arrowhead path only
 */
export const drawArrowheadPath = ({
  ctx,
  ray,
  arrowStyle,
  size,
  beginPath,
}: {
  ctx: CanvasRenderingContext2D;
  ray: Ray;
  arrowStyle: 'v' | 'triangle';
  size: { width: number; length: number };
  beginPath: boolean;
}) => {
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
  } else if (arrowStyle === 'v') {
    ctx.moveTo(ray.origin.x, ray.origin.y);
    ctx.lineTo(p2.x, p2.y);
  } else {
    console.warn('Unsupported arrowhead type: ', arrowStyle);
  }
};

/**
 * Draw arrowhead with styling
 */
export const drawArrowheadStyled = ({
  ctx,
  ray,
  arrowStyle,
  size,
  style,
}: {
  ctx: CanvasRenderingContext2D;
  ray: Ray;
  arrowStyle: 'v' | 'triangle';
  size: { width: number; length: number };
  style: DrawingStyle;
}): void => {
  applyStyleAndDraw(ctx, style, () => {
    drawArrowheadPath({ ctx, ray, arrowStyle, size, beginPath: true });
  });
};
