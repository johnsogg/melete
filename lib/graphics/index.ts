import { Pt } from '../types';
import { AABB, getAABBSize, BezierQuad, Ray } from '../geom';

// Animation state interface
export interface AnimationState {
  isAnimating: boolean;
  startTime: number;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  startPositions: { [boxId: string]: Pt };
}

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
  const angle = Math.atan2(ray.direction.dy, ray.direction.dx);
  const perpAngle1 = angle + Math.PI - Math.PI / 6;
  const perpAngle2 = angle + Math.PI + Math.PI / 6;

  const p1 = {
    x: ray.origin.x + Math.cos(perpAngle1) * size.length,
    y: ray.origin.y + Math.sin(perpAngle1) * size.length,
  };

  const p2 = {
    x: ray.origin.x + Math.cos(perpAngle2) * size.length,
    y: ray.origin.y + Math.sin(perpAngle2) * size.length,
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
