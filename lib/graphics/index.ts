import { Pt } from '../types';

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
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
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
};

// Draw curved edge using quadratic Bezier curve
export const drawCurvedEdge = (
  ctx: CanvasRenderingContext2D,
  start: Pt,
  end: Pt,
  controlPoint: Pt,
  strokeColor: string,
  strokeThickness: number
) => {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeThickness;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, end.x, end.y);
  ctx.stroke();
};

// Draw arrowhead
export const drawArrowhead = (
  ctx: CanvasRenderingContext2D,
  tip: Pt,
  direction: Pt,
  style: 'v' | 'triangle',
  size: { width: number; length: number }
) => {
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
};
