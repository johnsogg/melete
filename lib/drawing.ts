import { Canvas } from './canvas';
import { Pt, Color } from './types';

export function drawLine(
  canvas: Canvas,
  start: Pt,
  end: Pt,
  color?: Color
): void {
  const ctx = canvas.getContext();
  if (color) {
    ctx.strokeStyle = color;
  }
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

export function drawPolygon(
  canvas: Canvas,
  points: Pt[],
  filled: boolean = false,
  color?: Color
): void {
  if (points.length < 3) return;

  const ctx = canvas.getContext();
  if (color) {
    if (filled) {
      ctx.fillStyle = color;
    } else {
      ctx.strokeStyle = color;
    }
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.closePath();

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}

export function drawTriangle(
  canvas: Canvas,
  p1: Pt,
  p2: Pt,
  p3: Pt,
  filled: boolean = false,
  color?: Color
): void {
  drawPolygon(canvas, [p1, p2, p3], filled, color);
}
